'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileCheck,
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
  Building,
  Phone,
  FileText,
  Send,
  AlertCircle,
  Calendar,
  Shield,
  XCircle,
  RefreshCw,
  Upload,
  Download,
  MessageSquare,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface PriorAuth {
  id: string;
  // Patient Info
  patientName: string;
  patientDob: string;
  patientPhone: string;
  memberId: string;
  groupNumber: string;

  // Insurance Info
  insuranceName: string;
  insurancePhone: string;
  insuranceFax: string;
  binNumber: string;
  pcnNumber: string;

  // Medication Info
  rxNumber: string;
  drugName: string;
  strength: string;
  quantity: number;
  daysSupply: number;
  directions: string;
  daw: boolean;

  // Prescriber Info
  prescriberName: string;
  prescriberNpi: string;
  prescriberPhone: string;
  prescriberFax: string;

  // Diagnosis & Justification
  icdCodes: string[];
  diagnosis: string;
  clinicalJustification: string;
  triedAndFailed: string[];
  contraindications: string;

  // PA Details
  paType: 'new' | 'renewal' | 'appeal';
  urgency: 'standard' | 'urgent' | 'emergency';
  requestDate: string;
  submittedDate?: string;
  responseDate?: string;
  expirationDate?: string;
  authNumber?: string;
  approvedQuantity?: number;
  approvedDays?: number;

  // Status
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'denied' | 'appealed' | 'expired';
  denialReason?: string;

  // Tracking
  submittedBy: string;
  notes: string;
  attachments: string[];
  followUpDate?: string;

  createdAt: string;
  updatedAt: string;
}

interface PriorAuthorizationToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'prior-authorization';

// Column configuration for export
const PA_COLUMNS: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'drugName', header: 'Drug', type: 'string' },
  { key: 'insuranceName', header: 'Insurance', type: 'string' },
  { key: 'paType', header: 'Type', type: 'string' },
  { key: 'urgency', header: 'Urgency', type: 'string' },
  { key: 'requestDate', header: 'Request Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'authNumber', header: 'Auth #', type: 'string' },
];

const PriorAuthorizationTool: React.FC<PriorAuthorizationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: priorAuths,
    setData: setPriorAuths,
    syncStatus,
    lastSynced,
    sync,
  } = useToolData<PriorAuth>(TOOL_ID, [], PA_COLUMNS);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'denied' | 'new'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInsurance, setFilterInsurance] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPA, setEditingPA] = useState<PriorAuth | null>(null);
  const [selectedPA, setSelectedPA] = useState<PriorAuth | null>(null);

  const [formData, setFormData] = useState<Partial<PriorAuth>>({
    patientName: '',
    patientDob: '',
    patientPhone: '',
    memberId: '',
    groupNumber: '',
    insuranceName: '',
    insurancePhone: '',
    insuranceFax: '',
    binNumber: '',
    pcnNumber: '',
    rxNumber: '',
    drugName: '',
    strength: '',
    quantity: 0,
    daysSupply: 30,
    directions: '',
    daw: false,
    prescriberName: '',
    prescriberNpi: '',
    prescriberPhone: '',
    prescriberFax: '',
    icdCodes: [],
    diagnosis: '',
    clinicalJustification: '',
    triedAndFailed: [],
    contraindications: '',
    paType: 'new',
    urgency: 'standard',
    requestDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    submittedBy: '',
    notes: '',
    attachments: [],
  });

  const [newIcdCode, setNewIcdCode] = useState('');
  const [newTriedMed, setNewTriedMed] = useState('');

  // Filter PAs
  const filteredPAs = useMemo(() => {
    return priorAuths.filter(pa => {
      const matchesSearch = !searchTerm ||
        pa.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pa.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pa.memberId.includes(searchTerm) ||
        (pa.authNumber && pa.authNumber.includes(searchTerm));
      const matchesTab = activeTab === 'all' ||
        (activeTab === 'pending' && ['submitted', 'pending', 'appealed'].includes(pa.status)) ||
        (activeTab === 'approved' && pa.status === 'approved') ||
        (activeTab === 'denied' && pa.status === 'denied');
      const matchesInsurance = filterInsurance === 'all' || pa.insuranceName === filterInsurance;
      return matchesSearch && matchesTab && matchesInsurance;
    }).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [priorAuths, searchTerm, activeTab, filterInsurance]);

  // Unique insurances for filter
  const insurances = useMemo(() => {
    return [...new Set(priorAuths.map(pa => pa.insuranceName))].filter(Boolean);
  }, [priorAuths]);

  // Stats
  const stats = useMemo(() => {
    const pending = priorAuths.filter(pa => ['submitted', 'pending', 'appealed'].includes(pa.status)).length;
    const approved = priorAuths.filter(pa => pa.status === 'approved').length;
    const denied = priorAuths.filter(pa => pa.status === 'denied').length;
    const expiringSoon = priorAuths.filter(pa => {
      if (!pa.expirationDate || pa.status !== 'approved') return false;
      const daysUntil = Math.ceil((new Date(pa.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil > 0 && daysUntil <= 30;
    }).length;

    return { pending, approved, denied, expiringSoon };
  }, [priorAuths]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPA) {
      setPriorAuths(priorAuths.map(pa =>
        pa.id === editingPA.id
          ? { ...pa, ...formData, updatedAt: new Date().toISOString() }
          : pa
      ));
    } else {
      const newPA: PriorAuth = {
        ...formData as PriorAuth,
        id: `PA-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPriorAuths([...priorAuths, newPA]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      patientDob: '',
      patientPhone: '',
      memberId: '',
      groupNumber: '',
      insuranceName: '',
      insurancePhone: '',
      insuranceFax: '',
      binNumber: '',
      pcnNumber: '',
      rxNumber: '',
      drugName: '',
      strength: '',
      quantity: 0,
      daysSupply: 30,
      directions: '',
      daw: false,
      prescriberName: '',
      prescriberNpi: '',
      prescriberPhone: '',
      prescriberFax: '',
      icdCodes: [],
      diagnosis: '',
      clinicalJustification: '',
      triedAndFailed: [],
      contraindications: '',
      paType: 'new',
      urgency: 'standard',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      submittedBy: '',
      notes: '',
      attachments: [],
    });
    setEditingPA(null);
    setShowForm(false);
    setActiveTab('all');
    setNewIcdCode('');
    setNewTriedMed('');
  };

  const handleEdit = (pa: PriorAuth) => {
    setEditingPA(pa);
    setFormData(pa);
    setShowForm(true);
    setActiveTab('new');
  };

  const handleDelete = (id: string) => {
    setPriorAuths(priorAuths.filter(pa => pa.id !== id));
    if (selectedPA?.id === id) setSelectedPA(null);
  };

  const handleStatusUpdate = (id: string, newStatus: PriorAuth['status'], updates?: Partial<PriorAuth>) => {
    setPriorAuths(priorAuths.map(pa =>
      pa.id === id
        ? { ...pa, status: newStatus, ...updates, updatedAt: new Date().toISOString() }
        : pa
    ));
  };

  const handleSubmitPA = (id: string) => {
    handleStatusUpdate(id, 'submitted', { submittedDate: new Date().toISOString() });
  };

  const addIcdCode = () => {
    if (newIcdCode.trim()) {
      setFormData({
        ...formData,
        icdCodes: [...(formData.icdCodes || []), newIcdCode.trim()],
      });
      setNewIcdCode('');
    }
  };

  const addTriedMed = () => {
    if (newTriedMed.trim()) {
      setFormData({
        ...formData,
        triedAndFailed: [...(formData.triedAndFailed || []), newTriedMed.trim()],
      });
      setNewTriedMed('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending':
      case 'submitted': return 'bg-yellow-100 text-yellow-700';
      case 'denied': return 'bg-red-100 text-red-700';
      case 'appealed': return 'bg-orange-100 text-orange-700';
      case 'expired': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-amber-500" />
            {t('tools.priorAuthorization.priorAuthorization', 'Prior Authorization')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.priorAuthorization.manageInsurancePriorAuthorizationRequests', 'Manage insurance prior authorization requests')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="prior-authorization" toolName="Prior Authorization" />

          <SyncStatus status={syncStatus} lastSynced={lastSynced} onSync={sync} />
          <ExportDropdown data={filteredPAs} columns={PA_COLUMNS} filename="prior-authorizations" />
          <button
            onClick={() => { resetForm(); setShowForm(true); setActiveTab('new'); }}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tools.priorAuthorization.newPaRequest', 'New PA Request')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>{t('tools.priorAuthorization.pending', 'Pending')}</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'}`}>{t('tools.priorAuthorization.approved', 'Approved')}</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>{t('tools.priorAuthorization.denied', 'Denied')}</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.denied}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-orange-900/30 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>{t('tools.priorAuthorization.expiringSoon', 'Expiring Soon')}</span>
          </div>
          <p className="text-2xl font-bold text-orange-500">{stats.expiringSoon}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 mb-6 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        {[
          { id: 'all', label: 'All Requests', icon: FileText },
          { id: 'pending', label: 'Pending', icon: Clock },
          { id: 'approved', label: 'Approved', icon: CheckCircle },
          { id: 'denied', label: 'Denied', icon: XCircle },
          { id: 'new', label: showForm ? (editingPA ? t('tools.priorAuthorization.edit', 'Edit') : t('tools.priorAuthorization.newRequest', 'New Request')) : 'New Request', icon: Plus },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'new') {
                setShowForm(true);
              } else {
                setShowForm(false);
              }
              setActiveTab(tab.id as any);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* PA List */}
      {!showForm && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={t('tools.priorAuthorization.searchByPatientDrugMember', 'Search by patient, drug, member ID, or auth#...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <select
              value={filterInsurance}
              onChange={(e) => setFilterInsurance(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">{t('tools.priorAuthorization.allInsurance', 'All Insurance')}</option>
              {insurances.map(ins => (
                <option key={ins} value={ins}>{ins}</option>
              ))}
            </select>
          </div>

          {/* PA Cards */}
          <div className="grid gap-4">
            {filteredPAs.map(pa => (
              <div
                key={pa.id}
                className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{pa.patientName}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(pa.status)}`}>
                        {pa.status}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getUrgencyColor(pa.urgency)}`}>
                        {pa.urgency}
                      </span>
                      {pa.paType !== 'new' && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                          {pa.paType}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span className="flex items-center gap-1">
                        <Pill className="w-4 h-4 text-gray-400" />
                        {pa.drugName} {pa.strength}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-gray-400" />
                        {pa.insuranceName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(pa.requestDate).toLocaleDateString()}
                      </span>
                      {pa.authNumber && (
                        <span className={`flex items-center gap-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          <FileCheck className="w-4 h-4" />
                          Auth: {pa.authNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pa.status === 'draft' && (
                      <button
                        onClick={() => handleSubmitPA(pa.id)}
                        className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-1"
                      >
                        <Send className="w-4 h-4" />
                        {t('tools.priorAuthorization.submit', 'Submit')}
                      </button>
                    )}
                    {pa.status === 'denied' && (
                      <button
                        onClick={() => handleStatusUpdate(pa.id, 'appealed')}
                        className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        {t('tools.priorAuthorization.appeal', 'Appeal')}
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedPA(pa)}
                      className="p-1.5 text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(pa)}
                      className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pa.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPAs.length === 0 && (
              <div className={`p-12 text-center rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <FileCheck className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.priorAuthorization.noPriorAuthorizationsFound', 'No prior authorizations found')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PA Type & Urgency */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">{t('tools.priorAuthorization.requestType', 'Request Type')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('tools.priorAuthorization.paType', 'PA Type')}</label>
                <div className="flex gap-2">
                  {['new', 'renewal', 'appeal'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, paType: type as any })}
                      className={`flex-1 px-4 py-2 rounded-lg border capitalize ${
                        formData.paType === type
                          ? 'bg-amber-600 text-white border-amber-600'
                          : isDark ? 'border-gray-600 hover:border-amber-500' : 'border-gray-300 hover:border-amber-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('tools.priorAuthorization.urgency', 'Urgency')}</label>
                <div className="flex gap-2">
                  {['standard', 'urgent', 'emergency'].map(urgency => (
                    <button
                      key={urgency}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: urgency as any })}
                      className={`flex-1 px-4 py-2 rounded-lg border capitalize ${
                        formData.urgency === urgency
                          ? urgency === 'emergency' ? 'bg-red-600 text-white border-red-600' :
                            urgency === 'urgent' ? 'bg-orange-600 text-white border-orange-600' :
                            'bg-gray-600 text-white border-gray-600'
                          : isDark ? 'border-gray-600 hover:border-amber-500' : 'border-gray-300 hover:border-amber-500'
                      }`}
                    >
                      {urgency}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              {t('tools.priorAuthorization.patientInformation', 'Patient Information')}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.patientName', 'Patient Name *')}</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.dateOfBirth', 'Date of Birth *')}</label>
                <input
                  type="date"
                  value={formData.patientDob}
                  onChange={(e) => setFormData({ ...formData, patientDob: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.phone', 'Phone')}</label>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.memberId', 'Member ID *')}</label>
                <input
                  type="text"
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.groupNumber', 'Group Number')}</label>
                <input
                  type="text"
                  value={formData.groupNumber}
                  onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Insurance Info */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              {t('tools.priorAuthorization.insuranceInformation', 'Insurance Information')}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.insuranceName', 'Insurance Name *')}</label>
                <input
                  type="text"
                  value={formData.insuranceName}
                  onChange={(e) => setFormData({ ...formData, insuranceName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.phone2', 'Phone')}</label>
                <input
                  type="tel"
                  value={formData.insurancePhone}
                  onChange={(e) => setFormData({ ...formData, insurancePhone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.fax', 'Fax')}</label>
                <input
                  type="tel"
                  value={formData.insuranceFax}
                  onChange={(e) => setFormData({ ...formData, insuranceFax: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.bin', 'BIN')}</label>
                <input
                  type="text"
                  value={formData.binNumber}
                  onChange={(e) => setFormData({ ...formData, binNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.pcn', 'PCN')}</label>
                <input
                  type="text"
                  value={formData.pcnNumber}
                  onChange={(e) => setFormData({ ...formData, pcnNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Medication Info */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-amber-500" />
              {t('tools.priorAuthorization.medicationInformation', 'Medication Information')}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.rxNumber', 'Rx Number')}</label>
                <input
                  type="text"
                  value={formData.rxNumber}
                  onChange={(e) => setFormData({ ...formData, rxNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.drugName', 'Drug Name *')}</label>
                <input
                  type="text"
                  value={formData.drugName}
                  onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.strength', 'Strength *')}</label>
                <input
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.quantity', 'Quantity *')}</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.daysSupply', 'Days Supply *')}</label>
                <input
                  type="number"
                  value={formData.daysSupply}
                  onChange={(e) => setFormData({ ...formData, daysSupply: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.daw}
                    onChange={(e) => setFormData({ ...formData, daw: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-amber-600"
                  />
                  <span className="text-sm">{t('tools.priorAuthorization.dawDispenseAsWritten', 'DAW (Dispense as Written)')}</span>
                </label>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.directions', 'Directions *')}</label>
                <input
                  type="text"
                  value={formData.directions}
                  onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Clinical Justification */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              {t('tools.priorAuthorization.clinicalJustification3', 'Clinical Justification')}
            </h3>

            {/* ICD Codes */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('tools.priorAuthorization.icd10Codes', 'ICD-10 Codes *')}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newIcdCode}
                  onChange={(e) => setNewIcdCode(e.target.value)}
                  placeholder={t('tools.priorAuthorization.enterIcd10Code', 'Enter ICD-10 code...')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={addIcdCode}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  {t('tools.priorAuthorization.add', 'Add')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.icdCodes?.map((code, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    {code}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        icdCodes: formData.icdCodes?.filter((_, i) => i !== idx),
                      })}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.diagnosis', 'Diagnosis *')}</label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                rows={2}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.clinicalJustification', 'Clinical Justification *')}</label>
              <textarea
                value={formData.clinicalJustification}
                onChange={(e) => setFormData({ ...formData, clinicalJustification: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                rows={3}
                placeholder={t('tools.priorAuthorization.explainWhyThisMedicationIs', 'Explain why this medication is medically necessary...')}
                required
              />
            </div>

            {/* Tried and Failed */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('tools.priorAuthorization.medicationsTriedAndFailed', 'Medications Tried and Failed')}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTriedMed}
                  onChange={(e) => setNewTriedMed(e.target.value)}
                  placeholder={t('tools.priorAuthorization.enterMedicationName', 'Enter medication name...')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={addTriedMed}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  {t('tools.priorAuthorization.add2', 'Add')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.triedAndFailed?.map((med, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}
                  >
                    {med}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        triedAndFailed: formData.triedAndFailed?.filter((_, i) => i !== idx),
                      })}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.contraindicationsToAlternatives', 'Contraindications to Alternatives')}</label>
              <textarea
                value={formData.contraindications}
                onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                rows={2}
                placeholder={t('tools.priorAuthorization.listAnyContraindicationsToAlternative', 'List any contraindications to alternative medications...')}
              />
            </div>
          </div>

          {/* Prescriber Info */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              {t('tools.priorAuthorization.prescriberInformation', 'Prescriber Information')}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.prescriberName', 'Prescriber Name *')}</label>
                <input
                  type="text"
                  value={formData.prescriberName}
                  onChange={(e) => setFormData({ ...formData, prescriberName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.npi', 'NPI *')}</label>
                <input
                  type="text"
                  value={formData.prescriberNpi}
                  onChange={(e) => setFormData({ ...formData, prescriberNpi: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.phone3', 'Phone *')}</label>
                <input
                  type="tel"
                  value={formData.prescriberPhone}
                  onChange={(e) => setFormData({ ...formData, prescriberPhone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.fax2', 'Fax')}</label>
                <input
                  type="tel"
                  value={formData.prescriberFax}
                  onChange={(e) => setFormData({ ...formData, prescriberFax: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">{t('tools.priorAuthorization.additionalInformation', 'Additional Information')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.requestDate', 'Request Date')}</label>
                <input
                  type="date"
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.submittedBy', 'Submitted By')}</label>
                <input
                  type="text"
                  value={formData.submittedBy}
                  onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t('tools.priorAuthorization.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              {t('tools.priorAuthorization.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingPA ? t('tools.priorAuthorization.update', 'Update') : t('tools.priorAuthorization.saveAsDraft', 'Save as Draft')}
            </button>
            {!editingPA && (
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, status: 'submitted', submittedDate: new Date().toISOString() });
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t('tools.priorAuthorization.saveSubmit', 'Save & Submit')}
              </button>
            )}
          </div>
        </form>
      )}

      {/* PA Details Modal */}
      {selectedPA && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{t('tools.priorAuthorization.paDetails', 'PA Details')}</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPA.status)}`}>
                  {selectedPA.status}
                </span>
              </div>
              <button onClick={() => setSelectedPA(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient & Drug */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.priorAuthorization.patient', 'Patient')}</h3>
                  <p className="font-medium">{selectedPA.patientName}</p>
                  <p className="text-sm">Member ID: {selectedPA.memberId}</p>
                  <p className="text-sm">DOB: {new Date(selectedPA.patientDob).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.priorAuthorization.medication', 'Medication')}</h3>
                  <p className="font-medium">{selectedPA.drugName} {selectedPA.strength}</p>
                  <p className="text-sm">Qty: {selectedPA.quantity} • {selectedPA.daysSupply} days</p>
                  <p className="text-sm">{selectedPA.directions}</p>
                </div>
              </div>

              {/* Insurance & Prescriber */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.priorAuthorization.insurance', 'Insurance')}</h3>
                  <p className="font-medium">{selectedPA.insuranceName}</p>
                  <p className="text-sm">BIN: {selectedPA.binNumber} PCN: {selectedPA.pcnNumber}</p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.priorAuthorization.prescriber', 'Prescriber')}</h3>
                  <p className="font-medium">{selectedPA.prescriberName}</p>
                  <p className="text-sm">NPI: {selectedPA.prescriberNpi}</p>
                </div>
              </div>

              {/* Clinical Info */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.priorAuthorization.clinicalJustification2', 'Clinical Justification')}</h3>
                <p className="text-sm mb-2">ICD-10: {selectedPA.icdCodes.join(', ')}</p>
                <p className="text-sm mb-2">{selectedPA.diagnosis}</p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{selectedPA.clinicalJustification}</p>
              </div>

              {/* Auth Details (if approved) */}
              {selectedPA.status === 'approved' && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <h3 className="font-medium text-green-600 mb-2">{t('tools.priorAuthorization.approved2', 'Approved')}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.priorAuthorization.authNumber', 'Auth Number:')}</span>
                      <span className="ml-2 font-medium">{selectedPA.authNumber}</span>
                    </div>
                    <div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.priorAuthorization.expires', 'Expires:')}</span>
                      <span className="ml-2 font-medium">
                        {selectedPA.expirationDate ? new Date(selectedPA.expirationDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Denial Reason (if denied) */}
              {selectedPA.status === 'denied' && selectedPA.denialReason && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <h3 className="font-medium text-red-600 mb-2">{t('tools.priorAuthorization.denialReason', 'Denial Reason')}</h3>
                  <p className="text-sm">{selectedPA.denialReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700">
                {selectedPA.status === 'denied' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedPA.id, 'appealed');
                      setSelectedPA({ ...selectedPA, status: 'appealed' });
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('tools.priorAuthorization.fileAppeal', 'File Appeal')}
                  </button>
                )}
                {['submitted', 'pending'].includes(selectedPA.status) && (
                  <>
                    <button
                      onClick={() => {
                        const authNum = prompt('Enter Authorization Number:');
                        if (authNum) {
                          handleStatusUpdate(selectedPA.id, 'approved', {
                            authNumber: authNum,
                            responseDate: new Date().toISOString(),
                            approvedQuantity: selectedPA.quantity,
                            approvedDays: selectedPA.daysSupply,
                          });
                          setSelectedPA({ ...selectedPA, status: 'approved', authNumber: authNum });
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {t('tools.priorAuthorization.markApproved', 'Mark Approved')}
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter denial reason:');
                        handleStatusUpdate(selectedPA.id, 'denied', {
                          denialReason: reason || undefined,
                          responseDate: new Date().toISOString(),
                        });
                        setSelectedPA({ ...selectedPA, status: 'denied', denialReason: reason || undefined });
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      {t('tools.priorAuthorization.markDenied', 'Mark Denied')}
                    </button>
                  </>
                )}
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {t('tools.priorAuthorization.exportPdf', 'Export PDF')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorAuthorizationTool;
export { PriorAuthorizationTool };
