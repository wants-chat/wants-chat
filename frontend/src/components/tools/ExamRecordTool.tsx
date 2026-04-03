'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  Plus,
  Trash2,
  Save,
  Search,
  Filter,
  FileText,
  Calendar,
  User,
  Glasses,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit2,
  X,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface ExamRecordToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  insuranceProvider: string;
  insuranceId: string;
  medicalHistory: string[];
  allergies: string[];
  createdAt: string;
}

interface Prescription {
  sphere: { od: string; os: string };
  cylinder: { od: string; os: string };
  axis: { od: string; os: string };
  add: { od: string; os: string };
  pd: string;
  prism?: { od: string; os: string };
  base?: { od: string; os: string };
}

interface ExamRecord {
  id: string;
  patientId: string;
  examDate: string;
  examType: 'comprehensive' | 'contact-lens' | 'pediatric' | 'medical' | 'follow-up';
  chiefComplaint: string;
  visualAcuity: {
    distanceOD: string;
    distanceOS: string;
    nearOD: string;
    nearOS: string;
  };
  intraocularPressure: { od: string; os: string };
  pupilResponse: string;
  slitLampFindings: string;
  fundusExam: string;
  prescription: Prescription;
  diagnosis: string[];
  recommendations: string[];
  nextExamDate: string;
  doctorNotes: string;
  doctorName: string;
  status: 'completed' | 'pending-review' | 'requires-followup';
  createdAt: string;
  updatedAt: string;
}

// Constants
const EXAM_TYPES = [
  { value: 'comprehensive', label: 'Comprehensive Eye Exam' },
  { value: 'contact-lens', label: 'Contact Lens Fitting' },
  { value: 'pediatric', label: 'Pediatric Eye Exam' },
  { value: 'medical', label: 'Medical Eye Exam' },
  { value: 'follow-up', label: 'Follow-up Visit' },
];

const COMMON_DIAGNOSES = [
  'Myopia',
  'Hyperopia',
  'Astigmatism',
  'Presbyopia',
  'Dry Eye Syndrome',
  'Conjunctivitis',
  'Glaucoma Suspect',
  'Cataracts',
  'Macular Degeneration',
  'Diabetic Retinopathy',
  'Blepharitis',
  'Allergic Conjunctivitis',
];

const STORAGE_KEY = 'exam-record-tool-data';

// Column configuration for exports
const EXAM_COLUMNS: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'examDate', header: 'Exam Date', type: 'date' },
  { key: 'examType', header: 'Exam Type', type: 'string' },
  { key: 'chiefComplaint', header: 'Chief Complaint', type: 'string' },
  { key: 'diagnosis', header: 'Diagnosis', type: 'string' },
  { key: 'doctorName', header: 'Doctor', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'nextExamDate', header: 'Next Exam', type: 'date' },
];

const PATIENT_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'dateOfBirth', header: 'DOB', type: 'date' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'insuranceProvider', header: 'Insurance', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const ExamRecordTool: React.FC<ExamRecordToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: patients,
    addItem: addPatientToBackend,
    updateItem: updatePatientBackend,
    deleteItem: deletePatientBackend,
    isSynced: patientsSynced,
    isSaving: patientsSaving,
    lastSaved: patientsLastSaved,
    syncError: patientsSyncError,
    forceSync: forcePatientsSync,
  } = useToolData<Patient>('exam-patients', [], PATIENT_COLUMNS);

  const {
    data: exams,
    addItem: addExamToBackend,
    updateItem: updateExamBackend,
    deleteItem: deleteExamBackend,
    isSynced: examsSynced,
    isSaving: examsSaving,
    lastSaved: examsLastSaved,
    syncError: examsSyncError,
    forceSync: forceExamsSync,
  } = useToolData<ExamRecord>('exam-records', [], EXAM_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'exams' | 'patients' | 'analytics'>('exams');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExamType, setFilterExamType] = useState<string>('all');
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // New patient form state
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    insuranceProvider: '',
    insuranceId: '',
    medicalHistory: [],
    allergies: [],
  });

  // New exam form state
  const [newExam, setNewExam] = useState<Partial<ExamRecord>>({
    examType: 'comprehensive',
    chiefComplaint: '',
    visualAcuity: { distanceOD: '', distanceOS: '', nearOD: '', nearOS: '' },
    intraocularPressure: { od: '', os: '' },
    pupilResponse: 'Normal, round, reactive to light',
    slitLampFindings: '',
    fundusExam: '',
    prescription: {
      sphere: { od: '', os: '' },
      cylinder: { od: '', os: '' },
      axis: { od: '', os: '' },
      add: { od: '', os: '' },
      pd: '',
    },
    diagnosis: [],
    recommendations: [],
    nextExamDate: '',
    doctorNotes: '',
    doctorName: '',
    status: 'completed',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.patient || params.firstName || params.lastName) {
        setNewPatient({
          ...newPatient,
          firstName: params.firstName || '',
          lastName: params.lastName || params.patient?.split(' ').pop() || '',
          email: params.email || '',
          phone: params.phone || '',
        });
        setShowPatientForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add patient
  const addPatient = () => {
    if (!newPatient.firstName || !newPatient.lastName) {
      setValidationMessage('Please fill in required fields (First Name, Last Name)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const patient: Patient = {
      id: generateId(),
      firstName: newPatient.firstName || '',
      lastName: newPatient.lastName || '',
      dateOfBirth: newPatient.dateOfBirth || '',
      email: newPatient.email || '',
      phone: newPatient.phone || '',
      address: newPatient.address || '',
      insuranceProvider: newPatient.insuranceProvider || '',
      insuranceId: newPatient.insuranceId || '',
      medicalHistory: newPatient.medicalHistory || [],
      allergies: newPatient.allergies || [],
      createdAt: new Date().toISOString(),
    };

    addPatientToBackend(patient);
    setSelectedPatientId(patient.id);
    setShowPatientForm(false);
    setNewPatient({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      address: '',
      insuranceProvider: '',
      insuranceId: '',
      medicalHistory: [],
      allergies: [],
    });
  };

  // Add exam
  const addExam = () => {
    if (!selectedPatientId) {
      setValidationMessage('Please select a patient first');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const exam: ExamRecord = {
      id: generateId(),
      patientId: selectedPatientId,
      examDate: new Date().toISOString(),
      examType: (newExam.examType as ExamRecord['examType']) || 'comprehensive',
      chiefComplaint: newExam.chiefComplaint || '',
      visualAcuity: newExam.visualAcuity || { distanceOD: '', distanceOS: '', nearOD: '', nearOS: '' },
      intraocularPressure: newExam.intraocularPressure || { od: '', os: '' },
      pupilResponse: newExam.pupilResponse || '',
      slitLampFindings: newExam.slitLampFindings || '',
      fundusExam: newExam.fundusExam || '',
      prescription: newExam.prescription || {
        sphere: { od: '', os: '' },
        cylinder: { od: '', os: '' },
        axis: { od: '', os: '' },
        add: { od: '', os: '' },
        pd: '',
      },
      diagnosis: newExam.diagnosis || [],
      recommendations: newExam.recommendations || [],
      nextExamDate: newExam.nextExamDate || '',
      doctorNotes: newExam.doctorNotes || '',
      doctorName: newExam.doctorName || '',
      status: (newExam.status as ExamRecord['status']) || 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addExamToBackend(exam);
    setShowExamForm(false);
    resetExamForm();
  };

  const resetExamForm = () => {
    setNewExam({
      examType: 'comprehensive',
      chiefComplaint: '',
      visualAcuity: { distanceOD: '', distanceOS: '', nearOD: '', nearOS: '' },
      intraocularPressure: { od: '', os: '' },
      pupilResponse: 'Normal, round, reactive to light',
      slitLampFindings: '',
      fundusExam: '',
      prescription: {
        sphere: { od: '', os: '' },
        cylinder: { od: '', os: '' },
        axis: { od: '', os: '' },
        add: { od: '', os: '' },
        pd: '',
      },
      diagnosis: [],
      recommendations: [],
      nextExamDate: '',
      doctorNotes: '',
      doctorName: '',
      status: 'completed',
    });
  };

  // Delete patient
  const deletePatient = async (patientId: string) => {
    const confirmed = await confirm('Are you sure? This will also delete all exam records for this patient.');
    if (confirmed) {
      deletePatientBackend(patientId);
      exams.forEach((e) => {
        if (e.patientId === patientId) deleteExamBackend(e.id);
      });
      if (selectedPatientId === patientId) setSelectedPatientId('');
    }
  };

  // Delete exam
  const deleteExam = async (examId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this exam record?');
    if (confirmed) {
      deleteExamBackend(examId);
    }
  };

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const patient = patients.find((p) => p.id === exam.patientId);
      const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
      const matchesSearch =
        searchTerm === '' ||
        patientName.includes(searchTerm.toLowerCase()) ||
        exam.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
      const matchesType = filterExamType === 'all' || exam.examType === filterExamType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [exams, patients, searchTerm, filterStatus, filterExamType]);

  // Analytics
  const analytics = useMemo(() => {
    const today = new Date();
    const thisMonth = exams.filter((e) => {
      const examDate = new Date(e.examDate);
      return examDate.getMonth() === today.getMonth() && examDate.getFullYear() === today.getFullYear();
    });

    const examsByType = exams.reduce((acc, e) => {
      acc[e.examType] = (acc[e.examType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const diagnosisCounts = exams.reduce((acc, e) => {
      e.diagnosis.forEach((d) => {
        acc[d] = (acc[d] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPatients: patients.length,
      totalExams: exams.length,
      examsThisMonth: thisMonth.length,
      pendingReviews: exams.filter((e) => e.status === 'pending-review').length,
      requiresFollowup: exams.filter((e) => e.status === 'requires-followup').length,
      examsByType,
      topDiagnoses: Object.entries(diagnosisCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }, [patients, exams]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.examRecord.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.examRecord.eyeExamRecords', 'Eye Exam Records')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.examRecord.managePatientExamsPrescriptionsAnd', 'Manage patient exams, prescriptions, and clinical notes')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="exam-record" toolName="Exam Record" />

              <SyncStatus
                isSynced={examsSynced}
                isSaving={examsSaving}
                lastSaved={examsLastSaved}
                syncError={examsSyncError}
                onForceSync={forceExamsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = exams.map((e) => {
                    const patient = patients.find((p) => p.id === e.patientId);
                    return {
                      ...e,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                      diagnosis: e.diagnosis.join(', '),
                    };
                  });
                  exportToCSV(exportData, EXAM_COLUMNS, { filename: 'exam-records' });
                }}
                onExportExcel={() => {
                  const exportData = exams.map((e) => {
                    const patient = patients.find((p) => p.id === e.patientId);
                    return {
                      ...e,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                      diagnosis: e.diagnosis.join(', '),
                    };
                  });
                  exportToExcel(exportData, EXAM_COLUMNS, { filename: 'exam-records' });
                }}
                onExportJSON={() => {
                  const exportData = exams.map((e) => {
                    const patient = patients.find((p) => p.id === e.patientId);
                    return {
                      ...e,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                    };
                  });
                  exportToJSON(exportData, { filename: 'exam-records' });
                }}
                onExportPDF={async () => {
                  const exportData = exams.map((e) => {
                    const patient = patients.find((p) => p.id === e.patientId);
                    return {
                      ...e,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                      diagnosis: e.diagnosis.join(', '),
                    };
                  });
                  await exportToPDF(exportData, EXAM_COLUMNS, {
                    filename: 'exam-records',
                    title: 'Eye Exam Records Report',
                    subtitle: `${exams.length} exams | ${patients.length} patients`,
                  });
                }}
                onPrint={() => {
                  const exportData = exams.map((e) => {
                    const patient = patients.find((p) => p.id === e.patientId);
                    return {
                      ...e,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                      diagnosis: e.diagnosis.join(', '),
                    };
                  });
                  printData(exportData, EXAM_COLUMNS, { title: 'Eye Exam Records' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = exams.map((e) => {
                    const patient = patients.find((p) => p.id === e.patientId);
                    return {
                      ...e,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
                      diagnosis: e.diagnosis.join(', '),
                    };
                  });
                  return await copyUtil(exportData, EXAM_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'exams', label: 'Exam Records', icon: <FileText className="w-4 h-4" /> },
              { id: 'patients', label: 'Patients', icon: <User className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <Activity className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.examRecord.searchExams', 'Search exams...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.examRecord.allStatuses', 'All Statuses')}</option>
                  <option value="completed">{t('tools.examRecord.completed', 'Completed')}</option>
                  <option value="pending-review">{t('tools.examRecord.pendingReview', 'Pending Review')}</option>
                  <option value="requires-followup">{t('tools.examRecord.requiresFollowUp', 'Requires Follow-up')}</option>
                </select>
                <select
                  value={filterExamType}
                  onChange={(e) => setFilterExamType(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.examRecord.allExamTypes', 'All Exam Types')}</option>
                  {EXAM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowExamForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.examRecord.newExam', 'New Exam')}
                </button>
              </div>
            </div>

            {/* Exam List */}
            <div className="space-y-4">
              {filteredExams.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                  <Eye className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.examRecord.noExamRecordsFoundAdd', 'No exam records found. Add a patient and create their first exam.')}
                  </p>
                </div>
              ) : (
                filteredExams.map((exam) => {
                  const patient = patients.find((p) => p.id === exam.patientId);
                  const isExpanded = expandedExamId === exam.id;

                  return (
                    <div
                      key={exam.id}
                      className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-opacity-80"
                        onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                              exam.status === 'completed' ? 'bg-green-100 text-green-600' :
                              exam.status === 'pending-review' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {exam.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                               exam.status === 'pending-review' ? <Clock className="w-5 h-5" /> :
                               <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div>
                              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                              </h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {EXAM_TYPES.find((t) => t.value === exam.examType)?.label} - {formatDate(exam.examDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Dr. {exam.doctorName || 'N/A'}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                {exam.diagnosis.slice(0, 2).join(', ')}
                                {exam.diagnosis.length > 2 && ` +${exam.diagnosis.length - 2} more`}
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                            ) : (
                              <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Visual Acuity */}
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {t('tools.examRecord.visualAcuity', 'Visual Acuity')}
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.distanceOd', 'Distance OD:')}</span>
                                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {exam.visualAcuity.distanceOD || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.distanceOs', 'Distance OS:')}</span>
                                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {exam.visualAcuity.distanceOS || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.nearOd', 'Near OD:')}</span>
                                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {exam.visualAcuity.nearOD || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.nearOs', 'Near OS:')}</span>
                                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {exam.visualAcuity.nearOS || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Prescription */}
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {t('tools.examRecord.prescriptionRx', 'Prescription (Rx)')}
                              </h4>
                              <div className="text-sm">
                                <div className="grid grid-cols-4 gap-1 mb-1 font-medium">
                                  <span></span>
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.sph', 'Sph')}</span>
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.cyl', 'Cyl')}</span>
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.axis', 'Axis')}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.od', 'OD:')}</span>
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{exam.prescription.sphere.od || '-'}</span>
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{exam.prescription.cylinder.od || '-'}</span>
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{exam.prescription.axis.od || '-'}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.os', 'OS:')}</span>
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{exam.prescription.sphere.os || '-'}</span>
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{exam.prescription.cylinder.os || '-'}</span>
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{exam.prescription.axis.os || '-'}</span>
                                </div>
                                <div className="mt-2">
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.pd', 'PD:')}</span>
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{exam.prescription.pd || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            {/* IOP */}
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {t('tools.examRecord.intraocularPressure', 'Intraocular Pressure')}
                              </h4>
                              <div className="text-sm">
                                <div>
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.od2', 'OD:')}</span>
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                    {exam.intraocularPressure.od || 'N/A'} mmHg
                                  </span>
                                </div>
                                <div>
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.examRecord.os2', 'OS:')}</span>
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                    {exam.intraocularPressure.os || 'N/A'} mmHg
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Notes and Actions */}
                          <div className="mt-4 flex justify-between items-start">
                            <div className="flex-1">
                              {exam.doctorNotes && (
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <strong>{t('tools.examRecord.notes', 'Notes:')}</strong> {exam.doctorNotes}
                                </div>
                              )}
                              {exam.nextExamDate && (
                                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <strong>{t('tools.examRecord.nextExam', 'Next Exam:')}</strong> {formatDate(exam.nextExamDate)}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteExam(exam.id);
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.examRecord.patientDatabase', 'Patient Database')}
              </h2>
              <button
                onClick={() => setShowPatientForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.examRecord.addPatient', 'Add Patient')}
              </button>
            </div>

            <div className="grid gap-4">
              {patients.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
                  <User className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.examRecord.noPatientsYetAddYour', 'No patients yet. Add your first patient to get started.')}
                  </p>
                </div>
              ) : (
                patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                          <User className="w-5 h-5 text-[#0D9488]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            DOB: {formatDate(patient.dateOfBirth)} | {patient.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {patient.insuranceProvider || 'No Insurance'}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {exams.filter((e) => e.patientId === patient.id).length} exam(s)
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setShowExamForm(true);
                          }}
                          className="p-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePatient(patient.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-[#0D9488]" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.examRecord.totalPatients', 'Total Patients')}</h3>
              </div>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalPatients}
              </p>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-[#0D9488]" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.examRecord.totalExams', 'Total Exams')}</h3>
              </div>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalExams}
              </p>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-[#0D9488]" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.examRecord.thisMonth', 'This Month')}</h3>
              </div>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.examsThisMonth}
              </p>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.examRecord.pendingReview2', 'Pending Review')}</h3>
              </div>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.pendingReviews}
              </p>
            </div>

            {/* Top Diagnoses */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 md:col-span-2`}>
              <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.examRecord.topDiagnoses', 'Top Diagnoses')}
              </h3>
              <div className="space-y-3">
                {analytics.topDiagnoses.map(([diagnosis, count], index) => (
                  <div key={diagnosis} className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{diagnosis}</span>
                    <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Types Distribution */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 md:col-span-2`}>
              <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.examRecord.examTypesDistribution', 'Exam Types Distribution')}
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.examsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {EXAM_TYPES.find((t) => t.value === type)?.label || type}
                    </span>
                    <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Patient Form Modal */}
        {showPatientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.examRecord.addNewPatient', 'Add New Patient')}
                  </h2>
                  <button
                    onClick={() => setShowPatientForm(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.firstName', 'First Name *')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.lastName', 'Last Name *')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.examRecord.dateOfBirth', 'Date of Birth')}
                    </label>
                    <input
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.email', 'Email')}
                      </label>
                      <input
                        type="email"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.phone', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={newPatient.phone}
                        onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.insuranceProvider', 'Insurance Provider')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.insuranceProvider}
                        onChange={(e) => setNewPatient({ ...newPatient, insuranceProvider: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.insuranceId', 'Insurance ID')}
                      </label>
                      <input
                        type="text"
                        value={newPatient.insuranceId}
                        onChange={(e) => setNewPatient({ ...newPatient, insuranceId: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowPatientForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.examRecord.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addPatient}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278]"
                  >
                    {t('tools.examRecord.addPatient2', 'Add Patient')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exam Form Modal */}
        {showExamForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.examRecord.newEyeExamRecord', 'New Eye Exam Record')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowExamForm(false);
                      resetExamForm();
                    }}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Patient Selection */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.examRecord.selectPatient', 'Select Patient *')}
                    </label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      <option value="">{t('tools.examRecord.selectAPatient', 'Select a patient...')}</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} - {formatDate(p.dateOfBirth)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Exam Type and Chief Complaint */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.examType', 'Exam Type')}
                      </label>
                      <select
                        value={newExam.examType}
                        onChange={(e) => setNewExam({ ...newExam, examType: e.target.value as ExamRecord['examType'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {EXAM_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.doctorName', 'Doctor Name')}
                      </label>
                      <input
                        type="text"
                        value={newExam.doctorName}
                        onChange={(e) => setNewExam({ ...newExam, doctorName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.examRecord.chiefComplaint', 'Chief Complaint')}
                    </label>
                    <textarea
                      value={newExam.chiefComplaint}
                      onChange={(e) => setNewExam({ ...newExam, chiefComplaint: e.target.value })}
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Visual Acuity */}
                  <div>
                    <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.examRecord.visualAcuity2', 'Visual Acuity')}
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.examRecord.distanceOd2', 'Distance OD')}
                        </label>
                        <input
                          type="text"
                          placeholder="20/20"
                          value={newExam.visualAcuity?.distanceOD || ''}
                          onChange={(e) =>
                            setNewExam({
                              ...newExam,
                              visualAcuity: { ...newExam.visualAcuity!, distanceOD: e.target.value },
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.examRecord.distanceOs2', 'Distance OS')}
                        </label>
                        <input
                          type="text"
                          placeholder="20/20"
                          value={newExam.visualAcuity?.distanceOS || ''}
                          onChange={(e) =>
                            setNewExam({
                              ...newExam,
                              visualAcuity: { ...newExam.visualAcuity!, distanceOS: e.target.value },
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.examRecord.nearOd2', 'Near OD')}
                        </label>
                        <input
                          type="text"
                          placeholder="20/20"
                          value={newExam.visualAcuity?.nearOD || ''}
                          onChange={(e) =>
                            setNewExam({
                              ...newExam,
                              visualAcuity: { ...newExam.visualAcuity!, nearOD: e.target.value },
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.examRecord.nearOs2', 'Near OS')}
                        </label>
                        <input
                          type="text"
                          placeholder="20/20"
                          value={newExam.visualAcuity?.nearOS || ''}
                          onChange={(e) =>
                            setNewExam({
                              ...newExam,
                              visualAcuity: { ...newExam.visualAcuity!, nearOS: e.target.value },
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* IOP */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.iopOdMmhg', 'IOP OD (mmHg)')}
                      </label>
                      <input
                        type="text"
                        placeholder="15"
                        value={newExam.intraocularPressure?.od || ''}
                        onChange={(e) =>
                          setNewExam({
                            ...newExam,
                            intraocularPressure: { ...newExam.intraocularPressure!, od: e.target.value },
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.iopOsMmhg', 'IOP OS (mmHg)')}
                      </label>
                      <input
                        type="text"
                        placeholder="15"
                        value={newExam.intraocularPressure?.os || ''}
                        onChange={(e) =>
                          setNewExam({
                            ...newExam,
                            intraocularPressure: { ...newExam.intraocularPressure!, os: e.target.value },
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>

                  {/* Doctor Notes */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.examRecord.doctorNotes', 'Doctor Notes')}
                    </label>
                    <textarea
                      value={newExam.doctorNotes}
                      onChange={(e) => setNewExam({ ...newExam, doctorNotes: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Status and Next Exam */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.status', 'Status')}
                      </label>
                      <select
                        value={newExam.status}
                        onChange={(e) => setNewExam({ ...newExam, status: e.target.value as ExamRecord['status'] })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="completed">{t('tools.examRecord.completed2', 'Completed')}</option>
                        <option value="pending-review">{t('tools.examRecord.pendingReview3', 'Pending Review')}</option>
                        <option value="requires-followup">{t('tools.examRecord.requiresFollowUp2', 'Requires Follow-up')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.examRecord.nextExamDate', 'Next Exam Date')}
                      </label>
                      <input
                        type="date"
                        value={newExam.nextExamDate}
                        onChange={(e) => setNewExam({ ...newExam, nextExamDate: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowExamForm(false);
                      resetExamForm();
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.examRecord.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addExam}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8278]"
                  >
                    {t('tools.examRecord.saveExamRecord', 'Save Exam Record')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamRecordTool;
