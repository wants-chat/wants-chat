'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HeartPulse,
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
  FileText,
  Calendar,
  ClipboardList,
  Target,
  Activity,
  Phone,
  DollarSign,
  TrendingUp,
  ListChecks,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface MTMPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  insuranceName: string;
  memberId: string;
  enrollmentDate: string;
  eligibilityReason: 'multiple-chronic' | 'multiple-meds' | 'high-cost' | 'targeted';
  chronicConditions: string[];
  status: 'eligible' | 'enrolled' | 'active' | 'completed' | 'declined';
  preferredContactMethod: 'phone' | 'email' | 'in-person';
  preferredContactTime: string;
  notes: string;
}

interface CMR {
  id: string;
  patientId: string;
  patientName: string;
  cmrDate: string;
  pharmacistName: string;
  duration: number; // minutes
  cmrType: 'annual' | 'targeted' | 'follow-up';
  deliveryMethod: 'phone' | 'video' | 'in-person';

  // Medication List
  medicationList: {
    drugName: string;
    strength: string;
    directions: string;
    prescriber: string;
    indication: string;
    adherence: 'good' | 'moderate' | 'poor';
    issues: string[];
  }[];

  // Drug Related Problems
  drps: {
    category: string;
    description: string;
    recommendation: string;
    status: 'identified' | 'addressed' | 'resolved';
    priority: 'high' | 'medium' | 'low';
  }[];

  // Action Plan
  actionPlan: {
    goal: string;
    actions: string[];
    timeline: string;
    responsible: 'patient' | 'pharmacist' | 'prescriber';
    status: 'pending' | 'in-progress' | 'completed';
  }[];

  mapProvided: boolean;
  pmcProvided: boolean;
  billingCode: string;
  billingAmount: number;
  notes: string;

  createdAt: string;
  updatedAt: string;
}

interface MTMServiceToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'mtm-service';

// Column configuration for export
const CMR_COLUMNS: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'cmrDate', header: 'CMR Date', type: 'date' },
  { key: 'cmrType', header: 'Type', type: 'string' },
  { key: 'pharmacistName', header: 'Pharmacist', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'billingCode', header: 'Billing Code', type: 'string' },
  { key: 'billingAmount', header: 'Amount', type: 'currency' },
];

// Common DRP Categories
const DRP_CATEGORIES = [
  'Drug-drug interaction',
  'Drug-disease contraindication',
  'Duplicate therapy',
  'No indication for drug',
  'Untreated condition',
  'Suboptimal dose',
  'Adverse drug reaction',
  'Non-adherence',
  'Cost optimization',
  'Therapy simplification',
];

const MTMServiceTool: React.FC<MTMServiceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: cmrs,
    setData: setCmrs,
    syncStatus,
    lastSynced,
    sync,
  } = useToolData<CMR>(TOOL_ID, [], CMR_COLUMNS);

  const [patients, setPatients] = useState<MTMPatient[]>([]);
  const [activeTab, setActiveTab] = useState<'patients' | 'cmrs' | 'new-cmr' | 'analytics'>('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<MTMPatient | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingCMR, setEditingCMR] = useState<CMR | null>(null);

  const [patientForm, setPatientForm] = useState<Partial<MTMPatient>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    insuranceName: '',
    memberId: '',
    eligibilityReason: 'multiple-meds',
    chronicConditions: [],
    status: 'eligible',
    preferredContactMethod: 'phone',
    preferredContactTime: '',
    notes: '',
  });

  const [cmrForm, setCmrForm] = useState<Partial<CMR>>({
    cmrDate: new Date().toISOString().split('T')[0],
    pharmacistName: '',
    duration: 30,
    cmrType: 'annual',
    deliveryMethod: 'phone',
    medicationList: [],
    drps: [],
    actionPlan: [],
    mapProvided: false,
    pmcProvided: false,
    billingCode: '99605',
    billingAmount: 0,
    notes: '',
  });

  const [newCondition, setNewCondition] = useState('');
  const [showMedForm, setShowMedForm] = useState(false);
  const [showDRPForm, setShowDRPForm] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);

  const [medForm, setMedForm] = useState({
    drugName: '',
    strength: '',
    directions: '',
    prescriber: '',
    indication: '',
    adherence: 'good' as const,
    issues: [] as string[],
  });

  const [drpForm, setDrpForm] = useState({
    category: '',
    description: '',
    recommendation: '',
    priority: 'medium' as const,
  });

  const [actionForm, setActionForm] = useState({
    goal: '',
    actions: [] as string[],
    timeline: '',
    responsible: 'patient' as const,
  });

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = !searchTerm ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.memberId.includes(searchTerm);
      return matchesSearch;
    });
  }, [patients, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const eligiblePatients = patients.filter(p => p.status === 'eligible').length;
    const activeMTM = patients.filter(p => ['enrolled', 'active'].includes(p.status)).length;
    const completedCMRs = cmrs.length;
    const totalBilling = cmrs.reduce((sum, c) => sum + c.billingAmount, 0);
    const drpsResolved = cmrs.reduce((sum, c) =>
      sum + c.drps.filter(d => d.status === 'resolved').length, 0);

    return { eligiblePatients, activeMTM, completedCMRs, totalBilling, drpsResolved };
  }, [patients, cmrs]);

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: MTMPatient = {
      ...patientForm as MTMPatient,
      id: `MTM-PAT-${Date.now()}`,
      enrollmentDate: new Date().toISOString().split('T')[0],
    };
    setPatients([...patients, newPatient]);
    resetPatientForm();
  };

  const resetPatientForm = () => {
    setPatientForm({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      insuranceName: '',
      memberId: '',
      eligibilityReason: 'multiple-meds',
      chronicConditions: [],
      status: 'eligible',
      preferredContactMethod: 'phone',
      preferredContactTime: '',
      notes: '',
    });
    setShowPatientForm(false);
    setNewCondition('');
  };

  const handleSaveCMR = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) return;

    if (editingCMR) {
      setCmrs(cmrs.map(c =>
        c.id === editingCMR.id
          ? { ...c, ...cmrForm, updatedAt: new Date().toISOString() }
          : c
      ));
    } else {
      const newCMR: CMR = {
        ...cmrForm as CMR,
        id: `CMR-${Date.now()}`,
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCmrs([...cmrs, newCMR]);

      // Update patient status
      setPatients(patients.map(p =>
        p.id === selectedPatient.id ? { ...p, status: 'active' as const } : p
      ));
    }

    resetCMRForm();
  };

  const resetCMRForm = () => {
    setCmrForm({
      cmrDate: new Date().toISOString().split('T')[0],
      pharmacistName: '',
      duration: 30,
      cmrType: 'annual',
      deliveryMethod: 'phone',
      medicationList: [],
      drps: [],
      actionPlan: [],
      mapProvided: false,
      pmcProvided: false,
      billingCode: '99605',
      billingAmount: 0,
      notes: '',
    });
    setEditingCMR(null);
    setActiveTab('patients');
  };

  const addMedication = () => {
    setCmrForm({
      ...cmrForm,
      medicationList: [...(cmrForm.medicationList || []), { ...medForm }],
    });
    setMedForm({
      drugName: '',
      strength: '',
      directions: '',
      prescriber: '',
      indication: '',
      adherence: 'good',
      issues: [],
    });
    setShowMedForm(false);
  };

  const addDRP = () => {
    setCmrForm({
      ...cmrForm,
      drps: [...(cmrForm.drps || []), { ...drpForm, status: 'identified' as const }],
    });
    setDrpForm({
      category: '',
      description: '',
      recommendation: '',
      priority: 'medium',
    });
    setShowDRPForm(false);
  };

  const addAction = () => {
    setCmrForm({
      ...cmrForm,
      actionPlan: [...(cmrForm.actionPlan || []), { ...actionForm, status: 'pending' as const }],
    });
    setActionForm({
      goal: '',
      actions: [],
      timeline: '',
      responsible: 'patient',
    });
    setShowActionForm(false);
  };

  const handleDeletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
    if (selectedPatient?.id === id) setSelectedPatient(null);
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HeartPulse className="w-7 h-7 text-rose-500" />
            {t('tools.mTMService.mtmServices', 'MTM Services')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.mTMService.medicationTherapyManagementCmrDocumentation', 'Medication Therapy Management - CMR Documentation & Billing')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="m-t-m-service" toolName="M T M Service" />

          <SyncStatus status={syncStatus} lastSynced={lastSynced} onSync={sync} />
          <ExportDropdown data={cmrs} columns={CMR_COLUMNS} filename="mtm-services" />
          <button
            onClick={() => setShowPatientForm(true)}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tools.mTMService.addPatient', 'Add Patient')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mTMService.eligible', 'Eligible')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.eligiblePatients}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mTMService.activeMtm', 'Active MTM')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.activeMTM}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mTMService.cmrs', 'CMRs')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.completedCMRs}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mTMService.drpsResolved', 'DRPs Resolved')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.drpsResolved}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mTMService.revenue', 'Revenue')}</span>
          </div>
          <p className="text-2xl font-bold">${stats.totalBilling.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 mb-6 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        {[
          { id: 'patients', label: 'Patients', icon: User },
          { id: 'cmrs', label: 'CMR Records', icon: FileText },
          { id: 'new-cmr', label: 'New CMR', icon: Plus },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={t('tools.mTMService.searchPatients', 'Search patients...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id
                      ? isDark ? 'bg-rose-900/30 border-rose-600' : 'bg-rose-50 border-rose-300'
                      : isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{patient.firstName} {patient.lastName}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {patient.chronicConditions.length} conditions
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      patient.status === 'active' ? 'bg-green-100 text-green-700' :
                      patient.status === 'eligible' ? 'bg-yellow-100 text-yellow-700' :
                      patient.status === 'enrolled' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              ))}

              {filteredPatients.length === 0 && (
                <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <User className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.mTMService.noMtmPatients', 'No MTM patients')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Patient Details */}
          <div className="md:col-span-2">
            {selectedPatient ? (
              <div className="space-y-4">
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {selectedPatient.insuranceName} • {selectedPatient.memberId}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCmrForm({ ...cmrForm, patientId: selectedPatient.id });
                          setActiveTab('new-cmr');
                        }}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.mTMService.newCmr', 'New CMR')}
                      </button>
                      <button
                        onClick={() => handleDeletePatient(selectedPatient.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.dob', 'DOB')}</p>
                      <p className="font-medium">{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.phone', 'Phone')}</p>
                      <p className="font-medium">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.eligibilityReason', 'Eligibility Reason')}</p>
                      <p className="font-medium capitalize">{selectedPatient.eligibilityReason.replace(/-/g, ' ')}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.preferredContact', 'Preferred Contact')}</p>
                      <p className="font-medium capitalize">{selectedPatient.preferredContactMethod}</p>
                    </div>
                  </div>

                  <div>
                    <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.chronicConditions', 'Chronic Conditions')}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.chronicConditions.map((condition, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 text-sm rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CMR History */}
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-rose-500" />
                    {t('tools.mTMService.cmrHistory', 'CMR History')}
                  </h3>
                  {cmrs.filter(c => c.patientId === selectedPatient.id).length > 0 ? (
                    <div className="space-y-3">
                      {cmrs
                        .filter(c => c.patientId === selectedPatient.id)
                        .sort((a, b) => new Date(b.cmrDate).getTime() - new Date(a.cmrDate).getTime())
                        .map(cmr => (
                          <div
                            key={cmr.id}
                            className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{new Date(cmr.cmrDate).toLocaleDateString()} - {cmr.cmrType}</p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {cmr.pharmacistName} • {cmr.duration} min • {cmr.deliveryMethod}
                                </p>
                                <div className="flex gap-4 mt-2 text-sm">
                                  <span>{cmr.medicationList.length} meds</span>
                                  <span className="text-orange-500">{cmr.drps.length} DRPs</span>
                                  <span className="text-green-500">${cmr.billingAmount}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {cmr.mapProvided && (
                                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">{t('tools.mTMService.map', 'MAP')}</span>
                                )}
                                {cmr.pmcProvided && (
                                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">{t('tools.mTMService.pmc', 'PMC')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.mTMService.noCmrRecordsForThis', 'No CMR records for this patient')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className={`p-12 text-center rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <User className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.selectAPatientToView', 'Select a patient to view details')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CMR Records Tab */}
      {activeTab === 'cmrs' && (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.mTMService.patient', 'Patient')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.mTMService.date', 'Date')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.mTMService.type', 'Type')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.mTMService.pharmacist', 'Pharmacist')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.mTMService.drps', 'DRPs')}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.mTMService.billing', 'Billing')}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t('tools.mTMService.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {cmrs.map(cmr => (
                  <tr key={cmr.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 font-medium">{cmr.patientName}</td>
                    <td className="px-4 py-3 text-sm">{new Date(cmr.cmrDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 capitalize">
                        {cmr.cmrType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{cmr.pharmacistName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${cmr.drps.length > 0 ? 'text-orange-500' : ''}`}>
                        {cmr.drps.length} identified
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium">${cmr.billingAmount}</span>
                      <span className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({cmr.billingCode})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cmrs.length === 0 && (
            <div className="p-8 text-center">
              <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.mTMService.noCmrRecords', 'No CMR records')}</p>
            </div>
          )}
        </div>
      )}

      {/* New CMR Tab */}
      {activeTab === 'new-cmr' && (
        <form onSubmit={handleSaveCMR} className="space-y-6">
          {!selectedPatient && (
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className="text-yellow-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t('tools.mTMService.pleaseSelectAPatientFrom', 'Please select a patient from the Patients tab first')}
              </p>
            </div>
          )}

          {selectedPatient && (
            <>
              {/* Patient Info */}
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-500" />
                  Patient: {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.mTMService.cmrDate', 'CMR Date *')}</label>
                    <input
                      type="date"
                      value={cmrForm.cmrDate}
                      onChange={(e) => setCmrForm({ ...cmrForm, cmrDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.mTMService.pharmacist2', 'Pharmacist *')}</label>
                    <input
                      type="text"
                      value={cmrForm.pharmacistName}
                      onChange={(e) => setCmrForm({ ...cmrForm, pharmacistName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.mTMService.cmrType', 'CMR Type')}</label>
                    <select
                      value={cmrForm.cmrType}
                      onChange={(e) => setCmrForm({ ...cmrForm, cmrType: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    >
                      <option value="annual">{t('tools.mTMService.annualCmr', 'Annual CMR')}</option>
                      <option value="targeted">{t('tools.mTMService.targetedReview', 'Targeted Review')}</option>
                      <option value="follow-up">{t('tools.mTMService.followUp', 'Follow-up')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.mTMService.deliveryMethod', 'Delivery Method')}</label>
                    <select
                      value={cmrForm.deliveryMethod}
                      onChange={(e) => setCmrForm({ ...cmrForm, deliveryMethod: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    >
                      <option value="phone">{t('tools.mTMService.phone2', 'Phone')}</option>
                      <option value="video">{t('tools.mTMService.video', 'Video')}</option>
                      <option value="in-person">{t('tools.mTMService.inPerson', 'In-Person')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Medication List */}
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Pill className="w-5 h-5 text-rose-500" />
                    Medication List ({cmrForm.medicationList?.length || 0})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowMedForm(true)}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.mTMService.addMedication2', 'Add Medication')}
                  </button>
                </div>

                {cmrForm.medicationList && cmrForm.medicationList.length > 0 ? (
                  <div className="space-y-2">
                    {cmrForm.medicationList.map((med, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div>
                          <p className="font-medium">{med.drugName} {med.strength}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {med.directions} • {med.indication}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            med.adherence === 'good' ? 'bg-green-100 text-green-700' :
                            med.adherence === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {med.adherence}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCmrForm({
                              ...cmrForm,
                              medicationList: cmrForm.medicationList?.filter((_, i) => i !== idx),
                            })}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.mTMService.noMedicationsAdded', 'No medications added')}
                  </p>
                )}
              </div>

              {/* Drug Related Problems */}
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Drug Related Problems ({cmrForm.drps?.length || 0})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowDRPForm(true)}
                    className="px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.mTMService.addDrp', 'Add DRP')}
                  </button>
                </div>

                {cmrForm.drps && cmrForm.drps.length > 0 ? (
                  <div className="space-y-2">
                    {cmrForm.drps.map((drp, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                drp.priority === 'high' ? 'bg-red-100 text-red-700' :
                                drp.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {drp.priority}
                              </span>
                              <span className="font-medium">{drp.category}</span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{drp.description}</p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                              → {drp.recommendation}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCmrForm({
                              ...cmrForm,
                              drps: cmrForm.drps?.filter((_, i) => i !== idx),
                            })}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.mTMService.noDrpsIdentified', 'No DRPs identified')}
                  </p>
                )}
              </div>

              {/* Billing & Documentation */}
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  {t('tools.mTMService.billingDocumentation', 'Billing & Documentation')}
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.mTMService.durationMin', 'Duration (min)')}</label>
                    <input
                      type="number"
                      value={cmrForm.duration}
                      onChange={(e) => setCmrForm({ ...cmrForm, duration: Number(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.mTMService.billingCode', 'Billing Code')}</label>
                    <select
                      value={cmrForm.billingCode}
                      onChange={(e) => setCmrForm({ ...cmrForm, billingCode: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    >
                      <option value="99605">99605 - Initial CMR (15 min)</option>
                      <option value="99606">99606 - CMR Follow-up (15 min)</option>
                      <option value="99607">99607 - Each additional 15 min</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.mTMService.billingAmount', 'Billing Amount ($)')}</label>
                    <input
                      type="number"
                      value={cmrForm.billingAmount}
                      onChange={(e) => setCmrForm({ ...cmrForm, billingAmount: Number(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cmrForm.mapProvided}
                        onChange={(e) => setCmrForm({ ...cmrForm, mapProvided: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-rose-600"
                      />
                      <span className="text-sm">{t('tools.mTMService.mapProvided', 'MAP Provided')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cmrForm.pmcProvided}
                        onChange={(e) => setCmrForm({ ...cmrForm, pmcProvided: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-rose-600"
                      />
                      <span className="text-sm">{t('tools.mTMService.pmcProvided', 'PMC Provided')}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetCMRForm}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {t('tools.mTMService.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.mTMService.saveCmr', 'Save CMR')}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">{t('tools.mTMService.cmrCompletionRate', 'CMR Completion Rate')}</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="8"
                    strokeDasharray={`${(stats.activeMTM / (stats.eligiblePatients + stats.activeMTM || 1)) * 251.2} 251.2`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {Math.round((stats.activeMTM / (stats.eligiblePatients + stats.activeMTM || 1)) * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeMTM}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  of {stats.eligiblePatients + stats.activeMTM} eligible patients
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">{t('tools.mTMService.revenueSummary', 'Revenue Summary')}</h3>
            <div className="space-y-4">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.totalRevenue', 'Total Revenue')}</p>
                <p className="text-3xl font-bold text-green-500">${stats.totalBilling.toLocaleString()}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.averagePerCmr', 'Average per CMR')}</p>
                <p className="text-xl font-bold">
                  ${cmrs.length > 0 ? (stats.totalBilling / cmrs.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">{t('tools.mTMService.drpCategories', 'DRP Categories')}</h3>
            <div className="space-y-2">
              {DRP_CATEGORIES.slice(0, 5).map((cat, idx) => {
                const count = cmrs.reduce((sum, c) =>
                  sum + c.drps.filter(d => d.category === cat).length, 0);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{cat}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">{t('tools.mTMService.programMetrics', 'Program Metrics')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.totalDrps', 'Total DRPs')}</p>
                <p className="text-2xl font-bold">{cmrs.reduce((sum, c) => sum + c.drps.length, 0)}</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.drpsResolved2', 'DRPs Resolved')}</p>
                <p className="text-2xl font-bold text-green-500">{stats.drpsResolved}</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.avgDuration', 'Avg Duration')}</p>
                <p className="text-2xl font-bold">
                  {cmrs.length > 0 ? Math.round(cmrs.reduce((sum, c) => sum + c.duration, 0) / cmrs.length) : 0} min
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mTMService.mapsGiven', 'MAPs Given')}</p>
                <p className="text-2xl font-bold">{cmrs.filter(c => c.mapProvided).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className="text-xl font-semibold">{t('tools.mTMService.addMtmPatient', 'Add MTM Patient')}</h2>
              <button onClick={resetPatientForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.mTMService.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={patientForm.firstName}
                    onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.mTMService.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={patientForm.lastName}
                    onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.mTMService.dateOfBirth', 'Date of Birth *')}</label>
                  <input
                    type="date"
                    value={patientForm.dateOfBirth}
                    onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.mTMService.phone3', 'Phone *')}</label>
                  <input
                    type="tel"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.mTMService.insurance', 'Insurance')}</label>
                  <input
                    type="text"
                    value={patientForm.insuranceName}
                    onChange={(e) => setPatientForm({ ...patientForm, insuranceName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.mTMService.memberId', 'Member ID')}</label>
                  <input
                    type="text"
                    value={patientForm.memberId}
                    onChange={(e) => setPatientForm({ ...patientForm, memberId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.mTMService.eligibilityReason2', 'Eligibility Reason')}</label>
                <select
                  value={patientForm.eligibilityReason}
                  onChange={(e) => setPatientForm({ ...patientForm, eligibilityReason: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="multiple-meds">{t('tools.mTMService.multipleMedications8', 'Multiple Medications (8+)')}</option>
                  <option value="multiple-chronic">{t('tools.mTMService.multipleChronicConditions', 'Multiple Chronic Conditions')}</option>
                  <option value="high-cost">{t('tools.mTMService.highCostDrugs', 'High Cost Drugs')}</option>
                  <option value="targeted">{t('tools.mTMService.targetedIntervention', 'Targeted Intervention')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('tools.mTMService.chronicConditions2', 'Chronic Conditions')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder={t('tools.mTMService.addCondition', 'Add condition...')}
                    className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCondition.trim()) {
                        setPatientForm({
                          ...patientForm,
                          chronicConditions: [...(patientForm.chronicConditions || []), newCondition.trim()],
                        });
                        setNewCondition('');
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                  >
                    {t('tools.mTMService.add', 'Add')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patientForm.chronicConditions?.map((c, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => setPatientForm({
                          ...patientForm,
                          chronicConditions: patientForm.chronicConditions?.filter((_, i) => i !== idx),
                        })}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetPatientForm}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {t('tools.mTMService.cancel2', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  {t('tools.mTMService.addPatient2', 'Add Patient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showMedForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-lg font-semibold">{t('tools.mTMService.addMedication', 'Add Medication')}</h2>
              <button onClick={() => setShowMedForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.mTMService.drugName', 'Drug Name *')}</label>
                  <input
                    type="text"
                    value={medForm.drugName}
                    onChange={(e) => setMedForm({ ...medForm, drugName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.mTMService.strength', 'Strength')}</label>
                  <input
                    type="text"
                    value={medForm.strength}
                    onChange={(e) => setMedForm({ ...medForm, strength: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.mTMService.directions', 'Directions')}</label>
                <input
                  type="text"
                  value={medForm.directions}
                  onChange={(e) => setMedForm({ ...medForm, directions: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.mTMService.indication', 'Indication')}</label>
                  <input
                    type="text"
                    value={medForm.indication}
                    onChange={(e) => setMedForm({ ...medForm, indication: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.mTMService.adherence', 'Adherence')}</label>
                  <select
                    value={medForm.adherence}
                    onChange={(e) => setMedForm({ ...medForm, adherence: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="good">{t('tools.mTMService.good', 'Good')}</option>
                    <option value="moderate">{t('tools.mTMService.moderate', 'Moderate')}</option>
                    <option value="poor">{t('tools.mTMService.poor', 'Poor')}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMedForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {t('tools.mTMService.cancel3', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  {t('tools.mTMService.add2', 'Add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add DRP Modal */}
      {showDRPForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-lg font-semibold">{t('tools.mTMService.addDrugRelatedProblem', 'Add Drug Related Problem')}</h2>
              <button onClick={() => setShowDRPForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.mTMService.category', 'Category *')}</label>
                <select
                  value={drpForm.category}
                  onChange={(e) => setDrpForm({ ...drpForm, category: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="">{t('tools.mTMService.selectCategory', 'Select category...')}</option>
                  {DRP_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.mTMService.description', 'Description *')}</label>
                <textarea
                  value={drpForm.description}
                  onChange={(e) => setDrpForm({ ...drpForm, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.mTMService.recommendation', 'Recommendation *')}</label>
                <textarea
                  value={drpForm.recommendation}
                  onChange={(e) => setDrpForm({ ...drpForm, recommendation: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.mTMService.priority', 'Priority')}</label>
                <select
                  value={drpForm.priority}
                  onChange={(e) => setDrpForm({ ...drpForm, priority: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="low">{t('tools.mTMService.low', 'Low')}</option>
                  <option value="medium">{t('tools.mTMService.medium', 'Medium')}</option>
                  <option value="high">{t('tools.mTMService.high', 'High')}</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDRPForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {t('tools.mTMService.cancel4', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={addDRP}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {t('tools.mTMService.addDrp2', 'Add DRP')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MTMServiceTool;
export { MTMServiceTool };
