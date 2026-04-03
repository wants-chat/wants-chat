'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageCircle,
  User,
  Pill,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  FileText,
  Phone,
  Calendar,
  ClipboardCheck,
  Heart,
  AlertCircle,
  BookOpen,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface CounselingSession {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  rxNumber: string;
  drugName: string;
  strength: string;
  isNewMedication: boolean;
  counselorName: string;
  counselingDate: string;
  counselingType: 'new-rx' | 'refill' | 'modification' | 'adherence' | 'disease-state' | 'otc';
  topics: string[];
  sideEffectsDiscussed: string[];
  drugInteractionsDiscussed: string[];
  patientQuestions: string[];
  patientUnderstanding: 'excellent' | 'good' | 'fair' | 'needs-followup';
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  duration: number; // in minutes
  notes: string;
  signature: boolean;
  signatureDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface CounselingTemplate {
  id: string;
  drugClass: string;
  topics: string[];
  commonSideEffects: string[];
  importantWarnings: string[];
  patientEducation: string[];
}

interface PatientCounselingToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'patient-counseling';

// Column configuration for export
const SESSION_COLUMNS: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'drugName', header: 'Medication', type: 'string' },
  { key: 'counselingDate', header: 'Date', type: 'date' },
  { key: 'counselingType', header: 'Type', type: 'string' },
  { key: 'counselorName', header: 'Counselor', type: 'string' },
  { key: 'patientUnderstanding', header: 'Understanding', type: 'string' },
  { key: 'followUpRequired', header: 'Follow-up Required', type: 'boolean' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
];

// Common counseling topics
const COUNSELING_TOPICS = [
  'Indication/Purpose',
  'Dosage Instructions',
  'Administration Route',
  'Timing of Doses',
  'Food/Drug Interactions',
  'Storage Requirements',
  'Missed Dose Instructions',
  'Duration of Therapy',
  'Expected Outcomes',
  'Monitoring Parameters',
  'Refill Information',
  'Generic Substitution',
  'Cost/Insurance',
  'Disposal Instructions',
];

// Common side effects categories
const SIDE_EFFECT_CATEGORIES = [
  'GI Effects (nausea, diarrhea)',
  'CNS Effects (drowsiness, dizziness)',
  'Cardiovascular Effects',
  'Allergic Reactions (rash, itching)',
  'Metabolic Effects',
  'Hematologic Effects',
  'Hepatic/Renal Effects',
  'Photosensitivity',
  'Other',
];

const PatientCounselingTool: React.FC<PatientCounselingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: sessions,
    setData: setSessions,
    syncStatus,
    lastSynced,
    sync,
  } = useToolData<CounselingSession>(TOOL_ID, [], SESSION_COLUMNS);

  const [activeTab, setActiveTab] = useState<'sessions' | 'new' | 'templates' | 'followup'>('sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingSession, setEditingSession] = useState<CounselingSession | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CounselingSession>>({
    patientId: '',
    patientName: '',
    dateOfBirth: '',
    rxNumber: '',
    drugName: '',
    strength: '',
    isNewMedication: true,
    counselorName: '',
    counselingDate: new Date().toISOString().split('T')[0],
    counselingType: 'new-rx',
    topics: [],
    sideEffectsDiscussed: [],
    drugInteractionsDiscussed: [],
    patientQuestions: [],
    patientUnderstanding: 'good',
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: '',
    duration: 5,
    notes: '',
    signature: false,
  });

  const [newQuestion, setNewQuestion] = useState('');
  const [newInteraction, setNewInteraction] = useState('');

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = !searchTerm ||
        session.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.rxNumber.includes(searchTerm);
      const matchesType = filterType === 'all' || session.counselingType === filterType;
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.counselingDate).getTime() - new Date(a.counselingDate).getTime());
  }, [sessions, searchTerm, filterType]);

  // Follow-up sessions
  const followUpSessions = useMemo(() => {
    return sessions.filter(s => s.followUpRequired && s.followUpDate).sort((a, b) =>
      new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime()
    );
  }, [sessions]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => s.counselingDate === today).length;
    const newRx = sessions.filter(s => s.isNewMedication).length;
    const pendingFollowups = followUpSessions.filter(s => new Date(s.followUpDate!) <= new Date()).length;
    const avgDuration = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length)
      : 0;

    return { todaySessions, newRx, pendingFollowups, avgDuration };
  }, [sessions, followUpSessions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSession) {
      setSessions(sessions.map(session =>
        session.id === editingSession.id
          ? { ...session, ...formData, updatedAt: new Date().toISOString() }
          : session
      ));
    } else {
      const newSession: CounselingSession = {
        ...formData as CounselingSession,
        id: `COUNS-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSessions([...sessions, newSession]);
    }

    resetForm();
    setActiveTab('sessions');
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      patientName: '',
      dateOfBirth: '',
      rxNumber: '',
      drugName: '',
      strength: '',
      isNewMedication: true,
      counselorName: '',
      counselingDate: new Date().toISOString().split('T')[0],
      counselingType: 'new-rx',
      topics: [],
      sideEffectsDiscussed: [],
      drugInteractionsDiscussed: [],
      patientQuestions: [],
      patientUnderstanding: 'good',
      followUpRequired: false,
      followUpDate: '',
      followUpNotes: '',
      duration: 5,
      notes: '',
      signature: false,
    });
    setEditingSession(null);
    setNewQuestion('');
    setNewInteraction('');
  };

  const handleEdit = (session: CounselingSession) => {
    setEditingSession(session);
    setFormData(session);
    setActiveTab('new');
  };

  const handleDelete = (id: string) => {
    setSessions(sessions.filter(session => session.id !== id));
  };

  const toggleTopic = (topic: string) => {
    const topics = formData.topics || [];
    if (topics.includes(topic)) {
      setFormData({ ...formData, topics: topics.filter(t => t !== topic) });
    } else {
      setFormData({ ...formData, topics: [...topics, topic] });
    }
  };

  const toggleSideEffect = (effect: string) => {
    const effects = formData.sideEffectsDiscussed || [];
    if (effects.includes(effect)) {
      setFormData({ ...formData, sideEffectsDiscussed: effects.filter(e => e !== effect) });
    } else {
      setFormData({ ...formData, sideEffectsDiscussed: [...effects, effect] });
    }
  };

  const addPatientQuestion = () => {
    if (newQuestion.trim()) {
      setFormData({
        ...formData,
        patientQuestions: [...(formData.patientQuestions || []), newQuestion.trim()],
      });
      setNewQuestion('');
    }
  };

  const addInteraction = () => {
    if (newInteraction.trim()) {
      setFormData({
        ...formData,
        drugInteractionsDiscussed: [...(formData.drugInteractionsDiscussed || []), newInteraction.trim()],
      });
      setNewInteraction('');
    }
  };

  const getUnderstandingColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-500 bg-green-100';
      case 'good': return 'text-blue-500 bg-blue-100';
      case 'fair': return 'text-yellow-500 bg-yellow-100';
      case 'needs-followup': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-teal-500" />
            {t('tools.patientCounseling.patientCounseling', 'Patient Counseling')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.patientCounseling.documentAndTrackPatientMedication', 'Document and track patient medication counseling sessions')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="patient-counseling" toolName="Patient Counseling" />

          <SyncStatus status={syncStatus} lastSynced={lastSynced} onSync={sync} />
          <ExportDropdown data={filteredSessions} columns={SESSION_COLUMNS} filename="patient-counseling" />
          <button
            onClick={() => { resetForm(); setActiveTab('new'); }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tools.patientCounseling.newSession', 'New Session')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-teal-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.patientCounseling.today', 'Today')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.todaySessions}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.patientCounseling.newRx', 'New Rx')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.newRx}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.patientCounseling.followUpsDue', 'Follow-ups Due')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.pendingFollowups}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.patientCounseling.avgDuration', 'Avg Duration')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.avgDuration} min</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 mb-6 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        {[
          { id: 'sessions', label: 'Sessions', icon: FileText },
          { id: 'new', label: editingSession ? t('tools.patientCounseling.editSession', 'Edit Session') : t('tools.patientCounseling.newSession2', 'New Session'), icon: Plus },
          { id: 'followup', label: 'Follow-ups', icon: Phone },
          { id: 'templates', label: 'Templates', icon: BookOpen },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={t('tools.patientCounseling.searchByPatientMedicationOr', 'Search by patient, medication, or Rx#...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">{t('tools.patientCounseling.allTypes', 'All Types')}</option>
              <option value="new-rx">{t('tools.patientCounseling.newRx2', 'New Rx')}</option>
              <option value="refill">{t('tools.patientCounseling.refill', 'Refill')}</option>
              <option value="modification">{t('tools.patientCounseling.modification', 'Modification')}</option>
              <option value="adherence">{t('tools.patientCounseling.adherence', 'Adherence')}</option>
              <option value="disease-state">{t('tools.patientCounseling.diseaseState', 'Disease State')}</option>
              <option value="otc">{t('tools.patientCounseling.otc', 'OTC')}</option>
            </select>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{session.patientName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          session.isNewMedication ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {session.isNewMedication ? t('tools.patientCounseling.newRx4', 'New Rx') : t('tools.patientCounseling.refill3', 'Refill')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getUnderstandingColor(session.patientUnderstanding)}`}>
                          {session.patientUnderstanding}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Pill className="w-4 h-4 text-gray-400" />
                          {session.drugName} {session.strength}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(session.counselingDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {session.duration} min
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <User className="w-4 h-4" />
                          {session.counselorName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.followUpRequired && (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                      {expandedSession === session.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedSession === session.id && (
                  <div className={`px-4 pb-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="grid md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <ClipboardCheck className="w-4 h-4 text-teal-500" />
                          {t('tools.patientCounseling.topicsDiscussed2', 'Topics Discussed')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {session.topics.map((topic, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          {t('tools.patientCounseling.sideEffectsDiscussed2', 'Side Effects Discussed')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {session.sideEffectsDiscussed.map((effect, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                            >
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                      {session.patientQuestions.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-medium mb-2">{t('tools.patientCounseling.patientQuestions', 'Patient Questions')}</h4>
                          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {session.patientQuestions.map((q, idx) => (
                              <li key={idx}>• {q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {session.notes && (
                        <div className="md:col-span-2">
                          <h4 className="font-medium mb-2">{t('tools.patientCounseling.notes', 'Notes')}</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{session.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                      <button
                        onClick={() => handleEdit(session)}
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('tools.patientCounseling.edit', 'Edit')}
                      </button>
                      <button
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
                      >
                        <Printer className="w-4 h-4" />
                        {t('tools.patientCounseling.print', 'Print')}
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredSessions.length === 0 && (
              <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <MessageCircle className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.patientCounseling.noCounselingSessionsFound', 'No counseling sessions found')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New/Edit Session Tab */}
      {activeTab === 'new' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient & Medication Info */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-500" />
              {t('tools.patientCounseling.patientMedicationInformation', 'Patient & Medication Information')}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.patientName', 'Patient Name *')}</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.dateOfBirth', 'Date of Birth')}</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.rxNumber', 'Rx Number')}</label>
                <input
                  type="text"
                  value={formData.rxNumber}
                  onChange={(e) => setFormData({ ...formData, rxNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.drugName', 'Drug Name *')}</label>
                <input
                  type="text"
                  value={formData.drugName}
                  onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.strength', 'Strength')}</label>
                <input
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewMedication}
                    onChange={(e) => setFormData({ ...formData, isNewMedication: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600"
                  />
                  <span className="text-sm">{t('tools.patientCounseling.newMedication', 'New Medication')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Counseling Details */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-500" />
              {t('tools.patientCounseling.counselingDetails', 'Counseling Details')}
            </h3>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.counselorName', 'Counselor Name *')}</label>
                <input
                  type="text"
                  value={formData.counselorName}
                  onChange={(e) => setFormData({ ...formData, counselorName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.date', 'Date *')}</label>
                <input
                  type="date"
                  value={formData.counselingDate}
                  onChange={(e) => setFormData({ ...formData, counselingDate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.type', 'Type')}</label>
                <select
                  value={formData.counselingType}
                  onChange={(e) => setFormData({ ...formData, counselingType: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="new-rx">{t('tools.patientCounseling.newRx3', 'New Rx')}</option>
                  <option value="refill">{t('tools.patientCounseling.refill2', 'Refill')}</option>
                  <option value="modification">{t('tools.patientCounseling.modification2', 'Modification')}</option>
                  <option value="adherence">{t('tools.patientCounseling.adherence2', 'Adherence')}</option>
                  <option value="disease-state">{t('tools.patientCounseling.diseaseState2', 'Disease State')}</option>
                  <option value="otc">{t('tools.patientCounseling.otc2', 'OTC')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.durationMin', 'Duration (min)')}</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  min="1"
                />
              </div>
            </div>

            {/* Topics */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('tools.patientCounseling.topicsDiscussed', 'Topics Discussed')}</label>
              <div className="flex flex-wrap gap-2">
                {COUNSELING_TOPICS.map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      formData.topics?.includes(topic)
                        ? 'bg-teal-600 text-white border-teal-600'
                        : isDark ? 'border-gray-600 hover:border-teal-500' : 'border-gray-300 hover:border-teal-500'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Side Effects */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('tools.patientCounseling.sideEffectsDiscussed', 'Side Effects Discussed')}</label>
              <div className="flex flex-wrap gap-2">
                {SIDE_EFFECT_CATEGORIES.map(effect => (
                  <button
                    key={effect}
                    type="button"
                    onClick={() => toggleSideEffect(effect)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      formData.sideEffectsDiscussed?.includes(effect)
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : isDark ? 'border-gray-600 hover:border-yellow-500' : 'border-gray-300 hover:border-yellow-500'
                    }`}
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>

            {/* Drug Interactions */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('tools.patientCounseling.drugInteractionsDiscussed', 'Drug Interactions Discussed')}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newInteraction}
                  onChange={(e) => setNewInteraction(e.target.value)}
                  placeholder={t('tools.patientCounseling.addInteraction', 'Add interaction...')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={addInteraction}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {t('tools.patientCounseling.add', 'Add')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.drugInteractionsDiscussed?.map((interaction, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    {interaction}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        drugInteractionsDiscussed: formData.drugInteractionsDiscussed?.filter((_, i) => i !== idx),
                      })}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Patient Questions */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('tools.patientCounseling.patientQuestions2', 'Patient Questions')}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder={t('tools.patientCounseling.addQuestion', 'Add question...')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={addPatientQuestion}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {t('tools.patientCounseling.add2', 'Add')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.patientQuestions?.map((q, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    {q}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        patientQuestions: formData.patientQuestions?.filter((_, i) => i !== idx),
                      })}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Assessment & Follow-up */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-teal-500" />
              {t('tools.patientCounseling.assessmentFollowUp', 'Assessment & Follow-up')}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.patientUnderstanding', 'Patient Understanding')}</label>
                <select
                  value={formData.patientUnderstanding}
                  onChange={(e) => setFormData({ ...formData, patientUnderstanding: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="excellent">{t('tools.patientCounseling.excellentFullComprehension', 'Excellent - Full comprehension')}</option>
                  <option value="good">{t('tools.patientCounseling.goodAdequateUnderstanding', 'Good - Adequate understanding')}</option>
                  <option value="fair">{t('tools.patientCounseling.fairSomeClarificationNeeded', 'Fair - Some clarification needed')}</option>
                  <option value="needs-followup">{t('tools.patientCounseling.needsFollowUpSignificantGaps', 'Needs Follow-up - Significant gaps')}</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.followUpRequired}
                    onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600"
                  />
                  <span className="text-sm">{t('tools.patientCounseling.followUpRequired', 'Follow-up Required')}</span>
                </label>
              </div>
              {formData.followUpRequired && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.followUpDate', 'Follow-up Date')}</label>
                    <input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.followUpNotes', 'Follow-up Notes')}</label>
                    <input
                      type="text"
                      value={formData.followUpNotes}
                      onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.patientCounseling.reasonForFollowUp', 'Reason for follow-up...')}
                    />
                  </div>
                </>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t('tools.patientCounseling.additionalNotes', 'Additional Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.signature}
                    onChange={(e) => setFormData({
                      ...formData,
                      signature: e.target.checked,
                      signatureDate: e.target.checked ? new Date().toISOString() : undefined,
                    })}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600"
                  />
                  <span className="text-sm">{t('tools.patientCounseling.patientAcknowledgesReceiptOfCounseling', 'Patient acknowledges receipt of counseling')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { resetForm(); setActiveTab('sessions'); }}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              {t('tools.patientCounseling.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingSession ? t('tools.patientCounseling.updateSession', 'Update Session') : t('tools.patientCounseling.saveSession', 'Save Session')}
            </button>
          </div>
        </form>
      )}

      {/* Follow-up Tab */}
      {activeTab === 'followup' && (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.patientCounseling.patient', 'Patient')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.patientCounseling.medication', 'Medication')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.patientCounseling.followUpDate2', 'Follow-up Date')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.patientCounseling.reason', 'Reason')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.patientCounseling.status', 'Status')}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t('tools.patientCounseling.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {followUpSessions.map(session => {
                  const isOverdue = new Date(session.followUpDate!) < new Date();
                  return (
                    <tr key={session.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 font-medium">{session.patientName}</td>
                      <td className="px-4 py-3 text-sm">{session.drugName}</td>
                      <td className="px-4 py-3 text-sm">{new Date(session.followUpDate!).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">{session.followUpNotes || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {isOverdue ? t('tools.patientCounseling.overdue', 'Overdue') : t('tools.patientCounseling.pending', 'Pending')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(session)}
                            className="px-3 py-1 text-sm bg-teal-100 text-teal-700 rounded hover:bg-teal-200"
                          >
                            {t('tools.patientCounseling.complete', 'Complete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {followUpSessions.length === 0 && (
            <div className="p-8 text-center">
              <Phone className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.patientCounseling.noFollowUpsScheduled', 'No follow-ups scheduled')}</p>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { class: 'Antibiotics', topics: ['Duration of therapy', 'Complete full course', 'Food interactions', 'Storage'], sideEffects: ['GI effects', 'Allergic reactions'] },
            { class: 'Antihypertensives', topics: ['Regular dosing', 'BP monitoring', 'Lifestyle modifications'], sideEffects: ['Dizziness', 'Fatigue'] },
            { class: 'Diabetes Medications', topics: ['Blood glucose monitoring', 'Hypoglycemia signs', 'Timing with meals'], sideEffects: ['GI effects', 'Weight changes'] },
            { class: 'Statins', topics: ['Evening dosing', 'Muscle pain reporting', 'Lab monitoring'], sideEffects: ['Muscle pain', 'Liver effects'] },
            { class: 'Opioids', topics: ['Constipation prevention', 'Drowsiness caution', 'Storage/disposal'], sideEffects: ['CNS depression', 'Constipation'] },
            { class: 'Inhalers', topics: ['Proper technique', 'Priming/cleaning', 'Rescue vs maintenance'], sideEffects: ['Oral thrush', 'Hoarseness'] },
          ].map(template => (
            <div
              key={template.class}
              className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-500" />
                {template.class}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientCounseling.keyTopics', 'Key Topics')}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.topics.map(t => (
                      <span key={t} className={`px-2 py-0.5 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientCounseling.commonSideEffects', 'Common Side Effects')}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.sideEffects.map(s => (
                      <span key={s} className={`px-2 py-0.5 text-xs rounded ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    topics: template.topics,
                    sideEffectsDiscussed: template.sideEffects,
                  });
                  setActiveTab('new');
                }}
                className="mt-3 w-full px-3 py-1.5 text-sm bg-teal-100 text-teal-700 rounded hover:bg-teal-200"
              >
                {t('tools.patientCounseling.useTemplate', 'Use Template')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientCounselingTool;
export { PatientCounselingTool };
