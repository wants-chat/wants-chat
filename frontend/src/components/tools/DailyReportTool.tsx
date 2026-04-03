'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
  FileText,
  Baby,
  Clock,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Utensils,
  Moon,
  Droplets,
  Activity,
  Heart,
  MessageSquare,
  Camera,
  Sun,
  CloudRain,
  Smile,
  Meh,
  Frown,
  Send,
  Eye,
  Sparkles,
} from 'lucide-react';

interface DailyReportToolProps {
  uiConfig?: UIConfig;
}

// Types
interface MealEntry {
  id: string;
  type: 'breakfast' | 'morning-snack' | 'lunch' | 'afternoon-snack' | 'dinner';
  time: string;
  description: string;
  amountEaten: 'none' | 'some' | 'most' | 'all';
  notes?: string;
}

interface NapEntry {
  id: string;
  startTime: string;
  endTime: string;
  quality: 'restless' | 'fair' | 'good' | 'excellent';
  notes?: string;
}

interface DiaperEntry {
  id: string;
  time: string;
  type: 'wet' | 'dirty' | 'both' | 'dry';
  notes?: string;
}

interface ActivityEntry {
  id: string;
  time: string;
  type: 'outdoor-play' | 'indoor-play' | 'arts-crafts' | 'music' | 'reading' | 'learning' | 'sensory' | 'free-play';
  description: string;
  duration: number; // minutes
  notes?: string;
}

interface MilestoneEntry {
  id: string;
  time: string;
  category: 'motor' | 'language' | 'social' | 'cognitive' | 'self-care';
  description: string;
}

interface DailyReport {
  id: string;
  childId: string;
  childName: string;
  date: string;
  arrivalTime: string;
  departureTime?: string;
  mood: 'happy' | 'content' | 'fussy' | 'tired' | 'unwell';
  overallDay: 'great' | 'good' | 'fair' | 'challenging';
  meals: MealEntry[];
  naps: NapEntry[];
  diapers: DiaperEntry[];
  activities: ActivityEntry[];
  milestones: MilestoneEntry[];
  suppliesNeeded: string[];
  teacherNotes: string;
  photos: string[];
  sentToParent: boolean;
  sentAt?: string;
  parentViewed: boolean;
  parentViewedAt?: string;
  parentResponse?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Column configurations for export
const reportColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'childName', header: 'Child Name', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'arrivalTime', header: 'Arrival', type: 'string' },
  { key: 'departureTime', header: 'Departure', type: 'string' },
  { key: 'mood', header: 'Mood', type: 'string' },
  { key: 'overallDay', header: 'Overall Day', type: 'string' },
  { key: 'sentToParent', header: 'Sent to Parent', type: 'boolean' },
];

// Constants
const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: Sun },
  { value: 'morning-snack', label: 'Morning Snack', icon: Utensils },
  { value: 'lunch', label: 'Lunch', icon: Utensils },
  { value: 'afternoon-snack', label: 'Afternoon Snack', icon: Utensils },
  { value: 'dinner', label: 'Dinner', icon: Moon },
];

const AMOUNT_EATEN_OPTIONS = [
  { value: 'none', label: 'None', color: 'red' },
  { value: 'some', label: 'Some', color: 'yellow' },
  { value: 'most', label: 'Most', color: 'blue' },
  { value: 'all', label: 'All', color: 'green' },
];

const MOOD_OPTIONS = [
  { value: 'happy', label: 'Happy', icon: Smile, color: 'green' },
  { value: 'content', label: 'Content', icon: Smile, color: 'blue' },
  { value: 'fussy', label: 'Fussy', icon: Meh, color: 'yellow' },
  { value: 'tired', label: 'Tired', icon: Moon, color: 'orange' },
  { value: 'unwell', label: 'Unwell', icon: Frown, color: 'red' },
];

const ACTIVITY_TYPES = [
  { value: 'outdoor-play', label: 'Outdoor Play' },
  { value: 'indoor-play', label: 'Indoor Play' },
  { value: 'arts-crafts', label: 'Arts & Crafts' },
  { value: 'music', label: 'Music & Movement' },
  { value: 'reading', label: 'Reading/Stories' },
  { value: 'learning', label: 'Learning Activity' },
  { value: 'sensory', label: 'Sensory Play' },
  { value: 'free-play', label: 'Free Play' },
];

const NAP_QUALITY_OPTIONS = [
  { value: 'restless', label: 'Restless', color: 'red' },
  { value: 'fair', label: 'Fair', color: 'yellow' },
  { value: 'good', label: 'Good', color: 'blue' },
  { value: 'excellent', label: 'Excellent', color: 'green' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const calculateNapDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return '0 min';
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const duration = endMinutes - startMinutes;
  if (duration < 60) return `${duration} min`;
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const DailyReportTool: React.FC<DailyReportToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('meals');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hook for backend sync
  const {
    data: reports,
    addItem: addReport,
    updateItem: updateReport,
    deleteItem: deleteReport,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<DailyReport>('daycare-daily-reports', [], reportColumns);

  // Form state
  const [formData, setFormData] = useState<Partial<DailyReport>>({
    childName: '',
    date: selectedDate,
    arrivalTime: '',
    departureTime: '',
    mood: 'happy',
    overallDay: 'good',
    meals: [],
    naps: [],
    diapers: [],
    activities: [],
    milestones: [],
    suppliesNeeded: [],
    teacherNotes: '',
    photos: [],
    sentToParent: false,
  });

  // Entry forms
  const [mealForm, setMealForm] = useState<Partial<MealEntry>>({});
  const [napForm, setNapForm] = useState<Partial<NapEntry>>({});
  const [diaperForm, setDiaperForm] = useState<Partial<DiaperEntry>>({});
  const [activityForm, setActivityForm] = useState<Partial<ActivityEntry>>({});

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery edit mode
      if (params.isEditFromGallery) {
        if (params.childName) setFormData(prev => ({ ...prev, childName: params.childName }));
        if (params.date) setFormData(prev => ({ ...prev, date: params.date }));
        if (params.arrivalTime) setFormData(prev => ({ ...prev, arrivalTime: params.arrivalTime }));
        if (params.departureTime) setFormData(prev => ({ ...prev, departureTime: params.departureTime }));
        if (params.mood) setFormData(prev => ({ ...prev, mood: params.mood }));
        if (params.overallDay) setFormData(prev => ({ ...prev, overallDay: params.overallDay }));
        if (params.meals) setFormData(prev => ({ ...prev, meals: params.meals }));
        if (params.naps) setFormData(prev => ({ ...prev, naps: params.naps }));
        if (params.diapers) setFormData(prev => ({ ...prev, diapers: params.diapers }));
        if (params.activities) setFormData(prev => ({ ...prev, activities: params.activities }));
        if (params.milestones) setFormData(prev => ({ ...prev, milestones: params.milestones }));
        if (params.suppliesNeeded) setFormData(prev => ({ ...prev, suppliesNeeded: params.suppliesNeeded }));
        if (params.teacherNotes) setFormData(prev => ({ ...prev, teacherNotes: params.teacherNotes }));
        if (params.photos) setFormData(prev => ({ ...prev, photos: params.photos }));
        setShowReportForm(true);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Regular prefill from AI
        if (params.childName) setFormData(prev => ({ ...prev, childName: params.childName }));
        if (params.date) setFormData(prev => ({ ...prev, date: params.date }));
        setShowReportForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesDate = report.date === selectedDate;
      const matchesSearch =
        searchTerm === '' ||
        report.childName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [reports, selectedDate, searchTerm]);

  // Stats for today
  const todayStats = useMemo(() => {
    const todayReports = reports.filter(r => r.date === selectedDate);
    return {
      total: todayReports.length,
      sent: todayReports.filter(r => r.sentToParent).length,
      pending: todayReports.filter(r => !r.sentToParent).length,
      viewed: todayReports.filter(r => r.parentViewed).length,
    };
  }, [reports, selectedDate]);

  // Add meal entry
  const addMealEntry = () => {
    if (!mealForm.type || !mealForm.time) {
      setValidationMessage('Please select meal type and time');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const newMeal: MealEntry = {
      id: generateId(),
      type: mealForm.type as MealEntry['type'],
      time: mealForm.time || '',
      description: mealForm.description || '',
      amountEaten: mealForm.amountEaten as MealEntry['amountEaten'] || 'some',
      notes: mealForm.notes,
    };
    setFormData(prev => ({
      ...prev,
      meals: [...(prev.meals || []), newMeal],
    }));
    setMealForm({});
  };

  // Add nap entry
  const addNapEntry = () => {
    if (!napForm.startTime || !napForm.endTime) {
      setValidationMessage('Please enter start and end times');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const newNap: NapEntry = {
      id: generateId(),
      startTime: napForm.startTime || '',
      endTime: napForm.endTime || '',
      quality: napForm.quality as NapEntry['quality'] || 'good',
      notes: napForm.notes,
    };
    setFormData(prev => ({
      ...prev,
      naps: [...(prev.naps || []), newNap],
    }));
    setNapForm({});
  };

  // Add diaper entry
  const addDiaperEntry = () => {
    if (!diaperForm.time || !diaperForm.type) {
      setValidationMessage('Please enter time and type');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const newDiaper: DiaperEntry = {
      id: generateId(),
      time: diaperForm.time || '',
      type: diaperForm.type as DiaperEntry['type'],
      notes: diaperForm.notes,
    };
    setFormData(prev => ({
      ...prev,
      diapers: [...(prev.diapers || []), newDiaper],
    }));
    setDiaperForm({});
  };

  // Add activity entry
  const addActivityEntry = () => {
    if (!activityForm.type || !activityForm.description) {
      setValidationMessage('Please select activity type and add description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const newActivity: ActivityEntry = {
      id: generateId(),
      time: activityForm.time || new Date().toTimeString().slice(0, 5),
      type: activityForm.type as ActivityEntry['type'],
      description: activityForm.description || '',
      duration: activityForm.duration || 30,
      notes: activityForm.notes,
    };
    setFormData(prev => ({
      ...prev,
      activities: [...(prev.activities || []), newActivity],
    }));
    setActivityForm({});
  };

  // Remove entries
  const removeMeal = (id: string) => setFormData(prev => ({ ...prev, meals: (prev.meals || []).filter(m => m.id !== id) }));
  const removeNap = (id: string) => setFormData(prev => ({ ...prev, naps: (prev.naps || []).filter(n => n.id !== id) }));
  const removeDiaper = (id: string) => setFormData(prev => ({ ...prev, diapers: (prev.diapers || []).filter(d => d.id !== id) }));
  const removeActivity = (id: string) => setFormData(prev => ({ ...prev, activities: (prev.activities || []).filter(a => a.id !== id) }));

  // Submit report
  const submitReport = () => {
    if (!formData.childName) {
      setValidationMessage('Please enter child name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const report: DailyReport = {
      id: editingReport?.id || generateId(),
      childId: editingReport?.childId || generateId(),
      childName: formData.childName || '',
      date: formData.date || selectedDate,
      arrivalTime: formData.arrivalTime || '',
      departureTime: formData.departureTime,
      mood: formData.mood || 'happy',
      overallDay: formData.overallDay || 'good',
      meals: formData.meals || [],
      naps: formData.naps || [],
      diapers: formData.diapers || [],
      activities: formData.activities || [],
      milestones: formData.milestones || [],
      suppliesNeeded: formData.suppliesNeeded || [],
      teacherNotes: formData.teacherNotes || '',
      photos: formData.photos || [],
      sentToParent: formData.sentToParent || false,
      parentViewed: editingReport?.parentViewed || false,
      createdBy: 'Teacher',
      createdAt: editingReport?.createdAt || now,
      updatedAt: now,
    };

    if (editingReport) {
      updateReport(editingReport.id, report);
    } else {
      addReport(report);
    }

    // Call onSaveCallback if provided (for gallery edit mode)
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }

    resetForm();
  };

  // Send report to parent
  const sendToParent = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      updateReport(reportId, {
        ...report,
        sentToParent: true,
        sentAt: new Date().toISOString(),
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      childName: '',
      date: selectedDate,
      arrivalTime: '',
      departureTime: '',
      mood: 'happy',
      overallDay: 'good',
      meals: [],
      naps: [],
      diapers: [],
      activities: [],
      milestones: [],
      suppliesNeeded: [],
      teacherNotes: '',
      photos: [],
      sentToParent: false,
    });
    setEditingReport(null);
    setShowReportForm(false);
  };

  // Edit report
  const handleEdit = (report: DailyReport) => {
    setFormData(report);
    setEditingReport(report);
    setShowReportForm(true);
  };

  // Delete report
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this report?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteReport(id);
    }
  };

  // Get mood icon and color
  const getMoodDisplay = (mood: string) => {
    const option = MOOD_OPTIONS.find(m => m.value === mood);
    if (!option) return { icon: Smile, color: 'gray' };
    return { icon: option.icon, color: option.color };
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  const tabClass = (active: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    active
      ? 'bg-[#0D9488] text-white'
      : theme === 'dark'
        ? 'text-gray-400 hover:bg-gray-700'
        : 'text-gray-600 hover:bg-gray-100'
  }`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.dailyReport.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dailyReport.dailyActivityReports', 'Daily Activity Reports')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.dailyReport.trackAndShareDailyActivities', 'Track and share daily activities with parents')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="daily-report" toolName="Daily Report" />

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
                onExportCSV={() => exportToCSV(reports, reportColumns, 'daily-reports')}
                onExportExcel={() => exportToExcel(reports, reportColumns, 'daily-reports')}
                onExportJSON={() => exportToJSON(reports, 'daily-reports')}
                onExportPDF={() => exportToPDF(reports, reportColumns, 'Daily Reports')}
                onCopy={() => copyUtil(reports, reportColumns)}
                onPrint={() => printData(reports, reportColumns, 'Daily Reports')}
                theme={theme}
              />
              <button
                onClick={() => setShowReportForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.dailyReport.newReport', 'New Report')}
              </button>
            </div>
          </div>

          {/* Date Selection and Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={inputClass}
                  style={{ width: 'auto' }}
                />
              </div>
              <div className="relative flex-1 min-w-[200px]">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.dailyReport.searchByChildName', 'Search by child name...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dailyReport.total', 'Total:')}</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{todayStats.total}</span>
              </div>
              <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <span className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{t('tools.dailyReport.sent', 'Sent:')}</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{todayStats.sent}</span>
              </div>
              <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                <span className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.dailyReport.pending', 'Pending:')}</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{todayStats.pending}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No Reports for {formatDate(selectedDate)}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.dailyReport.createADailyReportTo', 'Create a daily report to track activities.')}
              </p>
              <button
                onClick={() => setShowReportForm(true)}
                className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                {t('tools.dailyReport.createReport', 'Create Report')}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.map((report) => {
                const moodDisplay = getMoodDisplay(report.mood);
                const MoodIcon = moodDisplay.icon;

                return (
                  <div key={report.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${moodDisplay.color}-100 dark:bg-${moodDisplay.color}-900/30`}>
                          <MoodIcon className={`w-6 h-6 text-${moodDisplay.color}-500`} />
                        </div>
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {report.childName}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatTime(report.arrivalTime)} - {report.departureTime ? formatTime(report.departureTime) : 'Present'}
                            </span>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {report.meals.length} meals | {report.naps.length} naps | {report.activities.length} activities
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {report.sentToParent ? (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            {t('tools.dailyReport.sent2', 'Sent')}
                          </span>
                        ) : (
                          <button
                            onClick={() => sendToParent(report.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          >
                            <Send className="w-3 h-3" />
                            {t('tools.dailyReport.sendToParent', 'Send to Parent')}
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          {expandedId === report.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(report)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === report.id && (
                      <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Meals */}
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Utensils className="w-4 h-4" /> Meals
                            </h4>
                            {report.meals.length > 0 ? (
                              <div className="space-y-2">
                                {report.meals.map((meal) => (
                                  <div key={meal.id} className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <p className="font-medium">{MEAL_TYPES.find(m => m.value === meal.type)?.label} ({formatTime(meal.time)})</p>
                                    <p>{meal.description}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      meal.amountEaten === 'all' ? 'bg-green-100 text-green-800' :
                                      meal.amountEaten === 'most' ? 'bg-blue-100 text-blue-800' :
                                      meal.amountEaten === 'some' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      Ate: {meal.amountEaten}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dailyReport.noMealsRecorded', 'No meals recorded')}</p>
                            )}
                          </div>

                          {/* Naps */}
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Moon className="w-4 h-4" /> Naps
                            </h4>
                            {report.naps.length > 0 ? (
                              <div className="space-y-2">
                                {report.naps.map((nap) => (
                                  <div key={nap.id} className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <p>{formatTime(nap.startTime)} - {formatTime(nap.endTime)}</p>
                                    <p>Duration: {calculateNapDuration(nap.startTime, nap.endTime)}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      nap.quality === 'excellent' ? 'bg-green-100 text-green-800' :
                                      nap.quality === 'good' ? 'bg-blue-100 text-blue-800' :
                                      nap.quality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      Quality: {nap.quality}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dailyReport.noNapsRecorded', 'No naps recorded')}</p>
                            )}
                          </div>

                          {/* Diapers */}
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Droplets className="w-4 h-4" /> Diaper Changes
                            </h4>
                            {report.diapers.length > 0 ? (
                              <div className="space-y-1">
                                {report.diapers.map((diaper) => (
                                  <div key={diaper.id} className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {formatTime(diaper.time)} - {diaper.type}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dailyReport.noChangesRecorded', 'No changes recorded')}</p>
                            )}
                          </div>

                          {/* Activities */}
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Activity className="w-4 h-4" /> Activities
                            </h4>
                            {report.activities.length > 0 ? (
                              <div className="space-y-2">
                                {report.activities.map((activity) => (
                                  <div key={activity.id} className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <p className="font-medium">{ACTIVITY_TYPES.find(a => a.value === activity.type)?.label}</p>
                                    <p>{activity.description}</p>
                                    <p className="text-xs">{activity.duration} min</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dailyReport.noActivitiesRecorded', 'No activities recorded')}</p>
                            )}
                          </div>
                        </div>

                        {/* Teacher Notes */}
                        {report.teacherNotes && (
                          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <h4 className={`font-medium mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <MessageSquare className="w-4 h-4" /> Teacher Notes
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {report.teacherNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Report Form Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingReport ? t('tools.dailyReport.editDailyReport', 'Edit Daily Report') : t('tools.dailyReport.newDailyReport', 'New Daily Report')}
                </h2>
                <button
                  onClick={resetForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.dailyReport.childName', 'Child Name *')}</label>
                    <input
                      type="text"
                      value={formData.childName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, childName: e.target.value }))}
                      className={inputClass}
                      placeholder={t('tools.dailyReport.childSName', 'Child\'s name')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dailyReport.date', 'Date')}</label>
                    <input
                      type="date"
                      value={formData.date || selectedDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dailyReport.arrivalTime', 'Arrival Time')}</label>
                    <input
                      type="time"
                      value={formData.arrivalTime || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, arrivalTime: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dailyReport.departureTime', 'Departure Time')}</label>
                    <input
                      type="time"
                      value={formData.departureTime || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Mood and Overall Day */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.dailyReport.mood', 'Mood')}</label>
                    <div className="flex flex-wrap gap-2">
                      {MOOD_OPTIONS.map((mood) => (
                        <button
                          key={mood.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, mood: mood.value as any }))}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                            formData.mood === mood.value
                              ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                              : theme === 'dark'
                                ? 'border-gray-600 hover:border-gray-500'
                                : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <mood.icon className="w-4 h-4" />
                          {mood.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.dailyReport.overallDay', 'Overall Day')}</label>
                    <select
                      value={formData.overallDay || 'good'}
                      onChange={(e) => setFormData(prev => ({ ...prev, overallDay: e.target.value as any }))}
                      className={inputClass}
                    >
                      <option value="great">{t('tools.dailyReport.greatDay', 'Great Day!')}</option>
                      <option value="good">{t('tools.dailyReport.goodDay', 'Good Day')}</option>
                      <option value="fair">{t('tools.dailyReport.fairDay', 'Fair Day')}</option>
                      <option value="challenging">{t('tools.dailyReport.challengingDay', 'Challenging Day')}</option>
                    </select>
                  </div>
                </div>

                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setActiveSection('meals')} className={tabClass(activeSection === 'meals')}>
                    <Utensils className="w-4 h-4 inline mr-2" />Meals
                  </button>
                  <button type="button" onClick={() => setActiveSection('naps')} className={tabClass(activeSection === 'naps')}>
                    <Moon className="w-4 h-4 inline mr-2" />Naps
                  </button>
                  <button type="button" onClick={() => setActiveSection('diapers')} className={tabClass(activeSection === 'diapers')}>
                    <Droplets className="w-4 h-4 inline mr-2" />Diapers
                  </button>
                  <button type="button" onClick={() => setActiveSection('activities')} className={tabClass(activeSection === 'activities')}>
                    <Activity className="w-4 h-4 inline mr-2" />Activities
                  </button>
                </div>

                {/* Meals Section */}
                {activeSection === 'meals' && (
                  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.dailyReport.meals', 'Meals')}</h4>

                    {/* Existing Meals */}
                    {(formData.meals || []).length > 0 && (
                      <div className="space-y-2 mb-4">
                        {formData.meals?.map((meal) => (
                          <div key={meal.id} className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {MEAL_TYPES.find(m => m.value === meal.type)?.label} - {formatTime(meal.time)}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {meal.description} (Ate: {meal.amountEaten})
                              </p>
                            </div>
                            <button
                              onClick={() => removeMeal(meal.id)}
                              className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Meal Form */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <select
                        value={mealForm.type || ''}
                        onChange={(e) => setMealForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className={inputClass}
                      >
                        <option value="">{t('tools.dailyReport.selectMeal', 'Select Meal')}</option>
                        {MEAL_TYPES.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={mealForm.time || ''}
                        onChange={(e) => setMealForm(prev => ({ ...prev, time: e.target.value }))}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.dailyReport.whatDidTheyEat', 'What did they eat?')}
                        value={mealForm.description || ''}
                        onChange={(e) => setMealForm(prev => ({ ...prev, description: e.target.value }))}
                        className={inputClass}
                      />
                      <select
                        value={mealForm.amountEaten || ''}
                        onChange={(e) => setMealForm(prev => ({ ...prev, amountEaten: e.target.value as any }))}
                        className={inputClass}
                      >
                        <option value="">{t('tools.dailyReport.amountEaten', 'Amount Eaten')}</option>
                        {AMOUNT_EATEN_OPTIONS.map(a => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addMealEntry}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E]"
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.dailyReport.add', 'Add')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Naps Section */}
                {activeSection === 'naps' && (
                  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.dailyReport.naps', 'Naps')}</h4>

                    {/* Existing Naps */}
                    {(formData.naps || []).length > 0 && (
                      <div className="space-y-2 mb-4">
                        {formData.naps?.map((nap) => (
                          <div key={nap.id} className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatTime(nap.startTime)} - {formatTime(nap.endTime)} ({calculateNapDuration(nap.startTime, nap.endTime)})
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Quality: {nap.quality}
                              </p>
                            </div>
                            <button
                              onClick={() => removeNap(nap.id)}
                              className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Nap Form */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.dailyReport.startTime', 'Start Time')}</label>
                        <input
                          type="time"
                          value={napForm.startTime || ''}
                          onChange={(e) => setNapForm(prev => ({ ...prev, startTime: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dailyReport.endTime', 'End Time')}</label>
                        <input
                          type="time"
                          value={napForm.endTime || ''}
                          onChange={(e) => setNapForm(prev => ({ ...prev, endTime: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.dailyReport.quality', 'Quality')}</label>
                        <select
                          value={napForm.quality || ''}
                          onChange={(e) => setNapForm(prev => ({ ...prev, quality: e.target.value as any }))}
                          className={inputClass}
                        >
                          <option value="">{t('tools.dailyReport.selectQuality', 'Select Quality')}</option>
                          {NAP_QUALITY_OPTIONS.map(q => (
                            <option key={q.value} value={q.value}>{q.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={addNapEntry}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E]"
                        >
                          <Plus className="w-4 h-4" />
                          {t('tools.dailyReport.addNap', 'Add Nap')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Diapers Section */}
                {activeSection === 'diapers' && (
                  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.dailyReport.diaperChanges', 'Diaper Changes')}</h4>

                    {/* Existing Diapers */}
                    {(formData.diapers || []).length > 0 && (
                      <div className="space-y-2 mb-4">
                        {formData.diapers?.map((diaper) => (
                          <div key={diaper.id} className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatTime(diaper.time)} - {diaper.type}
                            </p>
                            <button
                              onClick={() => removeDiaper(diaper.id)}
                              className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Diaper Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="time"
                        value={diaperForm.time || ''}
                        onChange={(e) => setDiaperForm(prev => ({ ...prev, time: e.target.value }))}
                        className={inputClass}
                      />
                      <select
                        value={diaperForm.type || ''}
                        onChange={(e) => setDiaperForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className={inputClass}
                      >
                        <option value="">{t('tools.dailyReport.selectType', 'Select Type')}</option>
                        <option value="wet">{t('tools.dailyReport.wet', 'Wet')}</option>
                        <option value="dirty">{t('tools.dailyReport.dirty', 'Dirty')}</option>
                        <option value="both">{t('tools.dailyReport.both', 'Both')}</option>
                        <option value="dry">{t('tools.dailyReport.dryCheck', 'Dry Check')}</option>
                      </select>
                      <button
                        type="button"
                        onClick={addDiaperEntry}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E]"
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.dailyReport.add2', 'Add')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Activities Section */}
                {activeSection === 'activities' && (
                  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.dailyReport.activities', 'Activities')}</h4>

                    {/* Existing Activities */}
                    {(formData.activities || []).length > 0 && (
                      <div className="space-y-2 mb-4">
                        {formData.activities?.map((activity) => (
                          <div key={activity.id} className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {ACTIVITY_TYPES.find(a => a.value === activity.type)?.label}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {activity.description} ({activity.duration} min)
                              </p>
                            </div>
                            <button
                              onClick={() => removeActivity(activity.id)}
                              className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Activity Form */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select
                        value={activityForm.type || ''}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className={inputClass}
                      >
                        <option value="">{t('tools.dailyReport.selectActivity', 'Select Activity')}</option>
                        {ACTIVITY_TYPES.map(a => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder={t('tools.dailyReport.description', 'Description')}
                        value={activityForm.description || ''}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                        className={inputClass}
                      />
                      <input
                        type="number"
                        placeholder={t('tools.dailyReport.durationMin', 'Duration (min)')}
                        value={activityForm.duration || ''}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={addActivityEntry}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E]"
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.dailyReport.add3', 'Add')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Teacher Notes */}
                <div>
                  <label className={labelClass}>{t('tools.dailyReport.teacherNotes', 'Teacher Notes')}</label>
                  <textarea
                    value={formData.teacherNotes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, teacherNotes: e.target.value }))}
                    rows={4}
                    className={inputClass}
                    placeholder={t('tools.dailyReport.addNotesAboutTheChild', 'Add notes about the child\'s day...')}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={resetForm}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.dailyReport.cancel', 'Cancel')}
                </button>
                <button
                  onClick={submitReport}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingReport ? t('tools.dailyReport.updateReport', 'Update Report') : t('tools.dailyReport.saveReport', 'Save Report')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
            <p className="font-medium">{validationMessage}</p>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default DailyReportTool;
