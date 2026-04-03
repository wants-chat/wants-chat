'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Save,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  ClipboardList,
  Activity,
  Pill,
  BookOpen,
  Lock,
  Unlock,
  FileSignature,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface Vital {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
}

interface ClinicalNote {
  id: string;
  patientName: string;
  patientId: string;
  dateOfBirth: string;
  encounterDate: string;
  encounterTime: string;
  encounterType: 'office-visit' | 'telehealth' | 'urgent-care' | 'follow-up' | 'procedure' | 'consultation' | 'admission' | 'discharge';
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems: string[];
  physicalExam: string;
  vitals: Vital;
  soapNote: SOAPNote;
  diagnosisCodes: { code: string; description: string }[];
  procedureCodes: { code: string; description: string }[];
  medications: Medication[];
  allergies: string[];
  labsOrdered: string[];
  imagingOrdered: string[];
  referrals: string[];
  followUpInstructions: string;
  patientEducation: string;
  provider: string;
  providerId: string;
  specialty: string;
  facility: string;
  status: 'draft' | 'in-progress' | 'pending-review' | 'pending-signature' | 'signed' | 'amended' | 'locked';
  signedAt: string;
  signedBy: string;
  coSignRequired: boolean;
  coSignedAt: string;
  coSignedBy: string;
  amendments: { date: string; note: string; by: string }[];
  createdAt: string;
  updatedAt: string;
}

interface ClinicalNotesToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'clinical-notes';

const noteColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'encounterDate', header: 'Date', type: 'date' },
  { key: 'encounterType', header: 'Type', type: 'string' },
  { key: 'provider', header: 'Provider', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

const createNewNote = (): ClinicalNote => ({
  id: crypto.randomUUID(),
  patientName: '',
  patientId: '',
  dateOfBirth: '',
  encounterDate: new Date().toISOString().split('T')[0],
  encounterTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
  encounterType: 'office-visit',
  chiefComplaint: '',
  historyOfPresentIllness: '',
  reviewOfSystems: [],
  physicalExam: '',
  vitals: {
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
  },
  soapNote: {
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  },
  diagnosisCodes: [],
  procedureCodes: [],
  medications: [],
  allergies: [],
  labsOrdered: [],
  imagingOrdered: [],
  referrals: [],
  followUpInstructions: '',
  patientEducation: '',
  provider: '',
  providerId: '',
  specialty: '',
  facility: '',
  status: 'draft',
  signedAt: '',
  signedBy: '',
  coSignRequired: false,
  coSignedAt: '',
  coSignedBy: '',
  amendments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const ENCOUNTER_TYPES = [
  { value: 'office-visit', label: 'Office Visit' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'urgent-care', label: 'Urgent Care' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'admission', label: 'Hospital Admission' },
  { value: 'discharge', label: 'Discharge Summary' },
];

const REVIEW_OF_SYSTEMS = [
  'Constitutional',
  'Eyes',
  'ENT',
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Genitourinary',
  'Musculoskeletal',
  'Integumentary',
  'Neurological',
  'Psychiatric',
  'Endocrine',
  'Hematologic/Lymphatic',
  'Allergic/Immunologic',
];

export const ClinicalNotesTool: React.FC<ClinicalNotesToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  const {
    data: notes,
    add: addNote,
    update: updateNote,
    remove: removeNote,
    isLoading,
    isSyncing,
    lastSynced,
    error,
  } = useToolData<ClinicalNote>(TOOL_ID);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [activeTab, setActiveTab] = useState<'encounter' | 'soap' | 'vitals' | 'orders' | 'summary'>('encounter');
  const [newDiagnosis, setNewDiagnosis] = useState({ code: '', description: '' });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', route: '' });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.encounterType && ENCOUNTER_TYPES.find(et => et.value === params.encounterType)) {
        setTypeFilter(params.encounterType);
        hasChanges = true;
      }
      if (params.status && ['draft', 'in-progress', 'pending-review', 'pending-signature', 'signed', 'amended', 'locked'].includes(params.status)) {
        setStatusFilter(params.status);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch =
        note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
      const matchesType = typeFilter === 'all' || note.encounterType === typeFilter;
      const matchesDate = !dateFilter || note.encounterDate === dateFilter;
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [notes, searchTerm, statusFilter, typeFilter, dateFilter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayNotes = notes.filter(n => n.encounterDate === today);
    const pendingSignature = notes.filter(n => n.status === 'pending-signature');
    const drafts = notes.filter(n => n.status === 'draft' || n.status === 'in-progress');

    return {
      totalNotes: notes.length,
      todayEncounters: todayNotes.length,
      pendingSignature: pendingSignature.length,
      drafts: drafts.length,
      signedToday: todayNotes.filter(n => n.status === 'signed').length,
    };
  }, [notes]);

  const handleSaveNote = () => {
    if (!editingNote) return;

    const noteToSave = {
      ...editingNote,
      updatedAt: new Date().toISOString(),
    };

    if (notes.find(n => n.id === noteToSave.id)) {
      updateNote(noteToSave);
    } else {
      addNote(noteToSave);
    }
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleSignNote = (note: ClinicalNote) => {
    const updatedNote = {
      ...note,
      status: 'signed' as const,
      signedAt: new Date().toISOString(),
      signedBy: note.provider,
      updatedAt: new Date().toISOString(),
    };
    updateNote(updatedNote);
    if (selectedNote?.id === note.id) {
      setSelectedNote(updatedNote);
    }
  };

  const handleLockNote = (note: ClinicalNote) => {
    const updatedNote = {
      ...note,
      status: 'locked' as const,
      updatedAt: new Date().toISOString(),
    };
    updateNote(updatedNote);
    if (selectedNote?.id === note.id) {
      setSelectedNote(updatedNote);
    }
  };

  const handleDeleteNote = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Clinical Note',
      message: 'Are you sure you want to delete this clinical note? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      removeNote(id);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    }
  };

  const addDiagnosis = () => {
    if (!editingNote || !newDiagnosis.code) return;
    setEditingNote({
      ...editingNote,
      diagnosisCodes: [...editingNote.diagnosisCodes, { ...newDiagnosis }],
    });
    setNewDiagnosis({ code: '', description: '' });
  };

  const removeDiagnosis = (index: number) => {
    if (!editingNote) return;
    setEditingNote({
      ...editingNote,
      diagnosisCodes: editingNote.diagnosisCodes.filter((_, i) => i !== index),
    });
  };

  const addMedication = () => {
    if (!editingNote || !newMedication.name) return;
    setEditingNote({
      ...editingNote,
      medications: [...editingNote.medications, { ...newMedication }],
    });
    setNewMedication({ name: '', dosage: '', frequency: '', route: '' });
  };

  const removeMedication = (index: number) => {
    if (!editingNote) return;
    setEditingNote({
      ...editingNote,
      medications: editingNote.medications.filter((_, i) => i !== index),
    });
  };

  const getStatusColor = (status: ClinicalNote['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending-review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending-signature': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'signed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'amended': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'locked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: ClinicalNote['status']) => {
    switch (status) {
      case 'signed': return <CheckCircle className="h-4 w-4" />;
      case 'locked': return <Lock className="h-4 w-4" />;
      case 'pending-signature': return <FileSignature className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.clinicalNotes.clinicalNotes', 'Clinical Notes')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.clinicalNotes.documentPatientEncountersAndClinical', 'Document patient encounters and clinical findings')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="clinical-notes" toolName="Clinical Notes" />

            <SyncStatus isSyncing={isSyncing} lastSynced={lastSynced} error={error} />
            <ExportDropdown
              data={notes}
              columns={noteColumns}
              filename="clinical-notes"
            />
            <button
              onClick={() => {
                setEditingNote(createNewNote());
                setActiveTab('encounter');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('tools.clinicalNotes.newNote', 'New Note')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.totalNotes', 'Total Notes')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalNotes}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.todaySEncounters', 'Today\'s Encounters')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayEncounters}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-orange-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.pendingSignature', 'Pending Signature')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pendingSignature}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-yellow-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.drafts', 'Drafts')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.drafts}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.signedToday', 'Signed Today')}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.signedToday}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-3`}>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={t('tools.clinicalNotes.searchNotes', 'Search notes...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('tools.clinicalNotes.allTypes', 'All Types')}</option>
            {ENCOUNTER_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('tools.clinicalNotes.allStatus', 'All Status')}</option>
            <option value="draft">{t('tools.clinicalNotes.draft', 'Draft')}</option>
            <option value="in-progress">{t('tools.clinicalNotes.inProgress', 'In Progress')}</option>
            <option value="pending-review">{t('tools.clinicalNotes.pendingReview', 'Pending Review')}</option>
            <option value="pending-signature">{t('tools.clinicalNotes.pendingSignature2', 'Pending Signature')}</option>
            <option value="signed">{t('tools.clinicalNotes.signed', 'Signed')}</option>
            <option value="amended">{t('tools.clinicalNotes.amended', 'Amended')}</option>
            <option value="locked">{t('tools.clinicalNotes.locked', 'Locked')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-280px)]">
        {/* Notes List */}
        <div className={`w-1/3 border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto`}>
          {filteredNotes.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.clinicalNotes.noClinicalNotesFound', 'No clinical notes found')}</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                } ${
                  selectedNote?.id === note.id
                    ? isDark ? 'bg-gray-700' : 'bg-indigo-50'
                    : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                      {getStatusIcon(note.status)}
                    </div>
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {note.patientName || 'Unnamed Patient'}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {note.chiefComplaint || 'No chief complaint'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(note.status)}`}>
                    {note.status.replace('-', ' ')}
                  </span>
                </div>
                <div className={`mt-3 flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(note.encounterDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {note.encounterTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-4 w-4" />
                    {note.provider || 'No provider'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Note Detail */}
        <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {selectedNote ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <FileText className={`h-8 w-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedNote.patientName}
                    </h2>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {ENCOUNTER_TYPES.find(t => t.value === selectedNote.encounterType)?.label} - {new Date(selectedNote.encounterDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedNote.status === 'pending-signature' && (
                    <button
                      onClick={() => handleSignNote(selectedNote)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <FileSignature className="h-4 w-4" />
                      {t('tools.clinicalNotes.signNote', 'Sign Note')}
                    </button>
                  )}
                  {selectedNote.status === 'signed' && (
                    <button
                      onClick={() => handleLockNote(selectedNote)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Lock className="h-4 w-4" />
                      {t('tools.clinicalNotes.lockNote', 'Lock Note')}
                    </button>
                  )}
                  {!['signed', 'locked'].includes(selectedNote.status) && (
                    <button
                      onClick={() => {
                        setEditingNote(selectedNote);
                        setActiveTab('encounter');
                        setIsModalOpen(true);
                      }}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    >
                      <Edit2 className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                  )}
                  {selectedNote.status === 'draft' && (
                    <button
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Patient Info */}
              <div className={`grid grid-cols-4 gap-4 mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.patientId', 'Patient ID')}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedNote.patientId || 'N/A'}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.dateOfBirth', 'Date of Birth')}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedNote.dateOfBirth ? new Date(selectedNote.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.provider', 'Provider')}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedNote.provider || 'N/A'}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.facility', 'Facility')}</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedNote.facility || 'N/A'}</p>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.clinicalNotes.chiefComplaint', 'Chief Complaint')}</h3>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{selectedNote.chiefComplaint || 'No chief complaint documented'}</p>
              </div>

              {/* HPI */}
              {selectedNote.historyOfPresentIllness && (
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.clinicalNotes.historyOfPresentIllness', 'History of Present Illness')}</h3>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{selectedNote.historyOfPresentIllness}</p>
                </div>
              )}

              {/* Vitals */}
              <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.clinicalNotes.vitalSigns', 'Vital Signs')}</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.bloodPressure', 'Blood Pressure')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedNote.vitals.bloodPressure || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.heartRate', 'Heart Rate')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedNote.vitals.heartRate || 'N/A'} bpm</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.temperature', 'Temperature')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedNote.vitals.temperature || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clinicalNotes.spo2', 'SpO2')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedNote.vitals.oxygenSaturation || 'N/A'}%</p>
                  </div>
                </div>
              </div>

              {/* SOAP Note */}
              <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.clinicalNotes.soapNote', 'SOAP Note')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{t('tools.clinicalNotes.subjective', 'Subjective')}</h4>
                    <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedNote.soapNote.subjective || 'No subjective findings documented'}</p>
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{t('tools.clinicalNotes.objective', 'Objective')}</h4>
                    <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedNote.soapNote.objective || 'No objective findings documented'}</p>
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{t('tools.clinicalNotes.assessment', 'Assessment')}</h4>
                    <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedNote.soapNote.assessment || 'No assessment documented'}</p>
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{t('tools.clinicalNotes.plan', 'Plan')}</h4>
                    <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedNote.soapNote.plan || 'No plan documented'}</p>
                  </div>
                </div>
              </div>

              {/* Diagnoses */}
              {selectedNote.diagnosisCodes.length > 0 && (
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.clinicalNotes.diagnoses', 'Diagnoses')}</h3>
                  <div className="space-y-2">
                    {selectedNote.diagnosisCodes.map((dx, index) => (
                      <div key={index} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <span className={`px-2 py-1 rounded text-sm font-mono ${isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                          {dx.code}
                        </span>
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{dx.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {selectedNote.medications.length > 0 && (
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.clinicalNotes.medications', 'Medications')}</h3>
                  <div className="space-y-2">
                    {selectedNote.medications.map((med, index) => (
                      <div key={index} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <Pill className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{med.name}</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{med.dosage}</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{med.frequency}</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{med.route}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signature Info */}
              {selectedNote.signedAt && (
                <div className={`mt-6 p-4 rounded-lg border-2 ${isDark ? 'bg-gray-800 border-green-700' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                      Signed by {selectedNote.signedBy} on {new Date(selectedNote.signedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`flex items-center justify-center h-full ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>{t('tools.clinicalNotes.selectANoteToView', 'Select a note to view details')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {isModalOpen && editingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {notes.find(n => n.id === editingNote.id) ? t('tools.clinicalNotes.editClinicalNote', 'Edit Clinical Note') : t('tools.clinicalNotes.createClinicalNote', 'Create Clinical Note')}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* Tabs */}
            <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {[
                { id: 'encounter', label: 'Encounter', icon: ClipboardList },
                { id: 'soap', label: 'SOAP Note', icon: FileText },
                { id: 'vitals', label: 'Vitals', icon: Activity },
                { id: 'orders', label: 'Orders & Dx', icon: Pill },
                { id: 'summary', label: 'Summary', icon: BookOpen },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? isDark
                        ? 'text-indigo-400 border-b-2 border-indigo-400'
                        : 'text-indigo-600 border-b-2 border-indigo-600'
                      : isDark
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Encounter Tab */}
              {activeTab === 'encounter' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.patientName', 'Patient Name *')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.patientName}
                        onChange={(e) => setEditingNote({ ...editingNote, patientName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.clinicalNotes.johnDoe', 'John Doe')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.patientId2', 'Patient ID')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.patientId}
                        onChange={(e) => setEditingNote({ ...editingNote, patientId: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.clinicalNotes.pat001', 'PAT-001')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.dateOfBirth2', 'Date of Birth')}
                      </label>
                      <input
                        type="date"
                        value={editingNote.dateOfBirth}
                        onChange={(e) => setEditingNote({ ...editingNote, dateOfBirth: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.encounterDate', 'Encounter Date')}
                      </label>
                      <input
                        type="date"
                        value={editingNote.encounterDate}
                        onChange={(e) => setEditingNote({ ...editingNote, encounterDate: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.encounterType', 'Encounter Type')}
                      </label>
                      <select
                        value={editingNote.encounterType}
                        onChange={(e) => setEditingNote({ ...editingNote, encounterType: e.target.value as ClinicalNote['encounterType'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {ENCOUNTER_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.provider2', 'Provider')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.provider}
                        onChange={(e) => setEditingNote({ ...editingNote, provider: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.clinicalNotes.drSmith', 'Dr. Smith')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.facility2', 'Facility')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.facility}
                        onChange={(e) => setEditingNote({ ...editingNote, facility: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.clinicalNotes.mainHospital', 'Main Hospital')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clinicalNotes.chiefComplaint2', 'Chief Complaint *')}
                    </label>
                    <textarea
                      value={editingNote.chiefComplaint}
                      onChange={(e) => setEditingNote({ ...editingNote, chiefComplaint: e.target.value })}
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.clinicalNotes.patientPresentsWith', 'Patient presents with...')}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clinicalNotes.historyOfPresentIllness2', 'History of Present Illness')}
                    </label>
                    <textarea
                      value={editingNote.historyOfPresentIllness}
                      onChange={(e) => setEditingNote({ ...editingNote, historyOfPresentIllness: e.target.value })}
                      rows={4}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.clinicalNotes.detailedHistory', 'Detailed history...')}
                    />
                  </div>
                </div>
              )}

              {/* SOAP Tab */}
              {activeTab === 'soap' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clinicalNotes.subjective2', 'Subjective')}
                    </label>
                    <textarea
                      value={editingNote.soapNote.subjective}
                      onChange={(e) => setEditingNote({
                        ...editingNote,
                        soapNote: { ...editingNote.soapNote, subjective: e.target.value }
                      })}
                      rows={4}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.clinicalNotes.patientSDescriptionOfSymptoms', 'Patient\'s description of symptoms, concerns...')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clinicalNotes.objective2', 'Objective')}
                    </label>
                    <textarea
                      value={editingNote.soapNote.objective}
                      onChange={(e) => setEditingNote({
                        ...editingNote,
                        soapNote: { ...editingNote.soapNote, objective: e.target.value }
                      })}
                      rows={4}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.clinicalNotes.physicalExamFindingsVitalSigns', 'Physical exam findings, vital signs, test results...')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clinicalNotes.assessment2', 'Assessment')}
                    </label>
                    <textarea
                      value={editingNote.soapNote.assessment}
                      onChange={(e) => setEditingNote({
                        ...editingNote,
                        soapNote: { ...editingNote.soapNote, assessment: e.target.value }
                      })}
                      rows={4}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.clinicalNotes.diagnosisDifferentialDiagnosis', 'Diagnosis, differential diagnosis...')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clinicalNotes.plan2', 'Plan')}
                    </label>
                    <textarea
                      value={editingNote.soapNote.plan}
                      onChange={(e) => setEditingNote({
                        ...editingNote,
                        soapNote: { ...editingNote.soapNote, plan: e.target.value }
                      })}
                      rows={4}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.clinicalNotes.treatmentPlanMedicationsFollowUp', 'Treatment plan, medications, follow-up...')}
                    />
                  </div>
                </div>
              )}

              {/* Vitals Tab */}
              {activeTab === 'vitals' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.bloodPressure2', 'Blood Pressure')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.vitals.bloodPressure}
                        onChange={(e) => setEditingNote({
                          ...editingNote,
                          vitals: { ...editingNote.vitals, bloodPressure: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.clinicalNotes.12080Mmhg', '120/80 mmHg')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.heartRate2', 'Heart Rate')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.vitals.heartRate}
                        onChange={(e) => setEditingNote({
                          ...editingNote,
                          vitals: { ...editingNote.vitals, heartRate: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.clinicalNotes.72Bpm', '72 bpm')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.temperature2', 'Temperature')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.vitals.temperature}
                        onChange={(e) => setEditingNote({
                          ...editingNote,
                          vitals: { ...editingNote.vitals, temperature: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="98.6 F"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.respiratoryRate', 'Respiratory Rate')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.vitals.respiratoryRate}
                        onChange={(e) => setEditingNote({
                          ...editingNote,
                          vitals: { ...editingNote.vitals, respiratoryRate: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.clinicalNotes.16Min', '16 /min')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.oxygenSaturation', 'Oxygen Saturation')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.vitals.oxygenSaturation}
                        onChange={(e) => setEditingNote({
                          ...editingNote,
                          vitals: { ...editingNote.vitals, oxygenSaturation: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="98%"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.weight', 'Weight')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.vitals.weight}
                        onChange={(e) => setEditingNote({
                          ...editingNote,
                          vitals: { ...editingNote.vitals, weight: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.clinicalNotes.150Lbs', '150 lbs')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clinicalNotes.height', 'Height')}
                      </label>
                      <input
                        type="text"
                        value={editingNote.vitals.height}
                        onChange={(e) => setEditingNote({
                          ...editingNote,
                          vitals: { ...editingNote.vitals, height: e.target.value }
                        })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.clinicalNotes.510Quot', '5\'10&quot;')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clinicalNotes.physicalExamination', 'Physical Examination')}
                    </label>
                    <textarea
                      value={editingNote.physicalExam}
                      onChange={(e) => setEditingNote({ ...editingNote, physicalExam: e.target.value })}
                      rows={4}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.clinicalNotes.physicalExaminationFindings', 'Physical examination findings...')}
                    />
                  </div>
                </div>
              )}

              {/* Orders & Dx Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {/* Diagnoses */}
                  <div>
                    <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.clinicalNotes.diagnosisCodesIcd10', 'Diagnosis Codes (ICD-10)')}</h4>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newDiagnosis.code}
                        onChange={(e) => setNewDiagnosis({ ...newDiagnosis, code: e.target.value })}
                        placeholder={t('tools.clinicalNotes.icd10Code', 'ICD-10 Code')}
                        className={`w-32 px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <input
                        type="text"
                        value={newDiagnosis.description}
                        onChange={(e) => setNewDiagnosis({ ...newDiagnosis, description: e.target.value })}
                        placeholder={t('tools.clinicalNotes.description', 'Description')}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <button
                        onClick={addDiagnosis}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {editingNote.diagnosisCodes.length > 0 && (
                      <div className="space-y-2">
                        {editingNote.diagnosisCodes.map((dx, index) => (
                          <div key={index} className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-sm font-mono ${isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                                {dx.code}
                              </span>
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{dx.description}</span>
                            </div>
                            <button onClick={() => removeDiagnosis(index)} className="text-red-500 hover:text-red-700">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Medications */}
                  <div>
                    <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.clinicalNotes.medications2', 'Medications')}</h4>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                        placeholder={t('tools.clinicalNotes.medication', 'Medication')}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <input
                        type="text"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                        placeholder={t('tools.clinicalNotes.dosage', 'Dosage')}
                        className={`w-24 px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <input
                        type="text"
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                        placeholder={t('tools.clinicalNotes.frequency', 'Frequency')}
                        className={`w-24 px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <select
                        value={newMedication.route}
                        onChange={(e) => setNewMedication({ ...newMedication, route: e.target.value })}
                        className={`w-24 px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">{t('tools.clinicalNotes.route', 'Route')}</option>
                        <option value="PO">PO</option>
                        <option value="IV">IV</option>
                        <option value="IM">IM</option>
                        <option value="SC">SC</option>
                        <option value="Topical">{t('tools.clinicalNotes.topical', 'Topical')}</option>
                      </select>
                      <button
                        onClick={addMedication}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {editingNote.medications.length > 0 && (
                      <div className="space-y-2">
                        {editingNote.medications.map((med, index) => (
                          <div key={index} className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                              <Pill className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{med.name}</span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{med.dosage}</span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{med.frequency}</span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{med.route}</span>
                            </div>
                            <button onClick={() => removeMedication(index)} className="text-red-500 hover:text-red-700">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clinicalNotes.followUpInstructions', 'Follow-up Instructions')}
                    </label>
                    <textarea
                      value={editingNote.followUpInstructions}
                      onChange={(e) => setEditingNote({ ...editingNote, followUpInstructions: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.clinicalNotes.returnIn2WeeksCall', 'Return in 2 weeks, call if symptoms worsen...')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clinicalNotes.patientEducation', 'Patient Education')}
                    </label>
                    <textarea
                      value={editingNote.patientEducation}
                      onChange={(e) => setEditingNote({ ...editingNote, patientEducation: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('tools.clinicalNotes.patientEducationProvidedRegarding', 'Patient education provided regarding...')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clinicalNotes.noteStatus', 'Note Status')}
                    </label>
                    <select
                      value={editingNote.status}
                      onChange={(e) => setEditingNote({ ...editingNote, status: e.target.value as ClinicalNote['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="draft">{t('tools.clinicalNotes.draft2', 'Draft')}</option>
                      <option value="in-progress">{t('tools.clinicalNotes.inProgress2', 'In Progress')}</option>
                      <option value="pending-review">{t('tools.clinicalNotes.pendingReview2', 'Pending Review')}</option>
                      <option value="pending-signature">{t('tools.clinicalNotes.readyForSignature', 'Ready for Signature')}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.clinicalNotes.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!editingNote.patientName || !editingNote.chiefComplaint}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {t('tools.clinicalNotes.saveNote', 'Save Note')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default ClinicalNotesTool;
