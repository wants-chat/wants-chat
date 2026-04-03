'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  CheckSquare,
  User,
  Calendar,
  Clock,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  Eye,
  AlertCircle,
  Shield,
  CheckCircle,
  XCircle,
  Printer,
  Send,
  PenTool,
  History,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ConsentFormToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ConsentStatus = 'pending' | 'signed' | 'expired' | 'revoked' | 'incomplete';
type FormType = 'tattoo' | 'piercing' | 'touch_up' | 'minor' | 'medical_disclosure';

interface ConsentForm {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientDOB: string;
  clientAddress: string;
  formType: FormType;
  appointmentId: string;
  artistId: string;
  artistName: string;
  procedureDescription: string;
  bodyPlacement: string;
  status: ConsentStatus;
  signedAt: string | null;
  signatureData: string | null;
  witnessName: string;
  witnessSignature: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  // Medical disclosures
  hasAllergies: boolean;
  allergiesDescription: string;
  hasMedicalConditions: boolean;
  medicalConditionsDescription: string;
  isTakingMedications: boolean;
  medicationsDescription: string;
  isPregnant: boolean;
  hasBleedingDisorder: boolean;
  hasSkinConditions: boolean;
  skinConditionsDescription: string;
  isOver18: boolean;
  hasGuardianConsent: boolean;
  guardianName: string;
  guardianSignature: string | null;
  // Acknowledgments
  acknowledgedRisks: boolean;
  acknowledgedAftercare: boolean;
  acknowledgedNoRefund: boolean;
  acknowledgedPhotography: boolean;
  validUntil: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const FORM_TYPES: { id: FormType; label: string; description: string }[] = [
  { id: 'tattoo', label: 'Tattoo Consent', description: 'Standard tattoo procedure consent' },
  { id: 'piercing', label: 'Piercing Consent', description: 'Body piercing consent form' },
  { id: 'touch_up', label: 'Touch-Up Consent', description: 'Tattoo touch-up/revision consent' },
  { id: 'minor', label: 'Minor Consent', description: 'Consent for clients under 18 with guardian' },
  { id: 'medical_disclosure', label: 'Medical Disclosure', description: 'Detailed medical history form' },
];

const STATUS_OPTIONS: { id: ConsentStatus; label: string; color: string }[] = [
  { id: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { id: 'signed', label: 'Signed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { id: 'expired', label: 'Expired', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  { id: 'revoked', label: 'Revoked', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { id: 'incomplete', label: 'Incomplete', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
];

const ARTISTS = [
  { id: 'artist-1', name: 'Jake Morrison' },
  { id: 'artist-2', name: 'Maya Chen' },
  { id: 'artist-3', name: 'Alex Rivera' },
  { id: 'artist-4', name: 'Sam Williams' },
];

// Column configuration for exports
const CONSENT_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client Name', type: 'string' },
  { key: 'clientEmail', header: 'Email', type: 'string' },
  { key: 'clientPhone', header: 'Phone', type: 'string' },
  { key: 'formType', header: 'Form Type', type: 'string' },
  { key: 'artistName', header: 'Artist', type: 'string' },
  { key: 'procedureDescription', header: 'Procedure', type: 'string' },
  { key: 'bodyPlacement', header: 'Placement', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'signedAt', header: 'Signed At', type: 'date' },
  { key: 'validUntil', header: 'Valid Until', type: 'date' },
  { key: 'isOver18', header: 'Over 18', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isExpired = (validUntil: string) => {
  return new Date(validUntil) < new Date();
};

// Main Component
export const ConsentFormTool: React.FC<ConsentFormToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hook for backend sync
  const {
    data: consentForms,
    addItem: addFormToBackend,
    updateItem: updateFormBackend,
    deleteItem: deleteFormBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ConsentForm>('consent-forms', [], CONSENT_COLUMNS);

  // Local UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFormType, setFilterFormType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingForm, setEditingForm] = useState<ConsentForm | null>(null);
  const [viewingForm, setViewingForm] = useState<ConsentForm | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Confirm dialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // New consent form state
  const [newConsent, setNewConsent] = useState<Partial<ConsentForm>>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientDOB: '',
    clientAddress: '',
    formType: 'tattoo',
    appointmentId: '',
    artistId: '',
    artistName: '',
    procedureDescription: '',
    bodyPlacement: '',
    status: 'pending',
    signedAt: null,
    signatureData: null,
    witnessName: '',
    witnessSignature: null,
    emergencyContactName: '',
    emergencyContactPhone: '',
    hasAllergies: false,
    allergiesDescription: '',
    hasMedicalConditions: false,
    medicalConditionsDescription: '',
    isTakingMedications: false,
    medicationsDescription: '',
    isPregnant: false,
    hasBleedingDisorder: false,
    hasSkinConditions: false,
    skinConditionsDescription: '',
    isOver18: true,
    hasGuardianConsent: false,
    guardianName: '',
    guardianSignature: null,
    acknowledgedRisks: false,
    acknowledgedAftercare: false,
    acknowledgedNoRefund: false,
    acknowledgedPhotography: false,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  // Filtered forms
  const filteredForms = useMemo(() => {
    return consentForms.filter(form => {
      const matchesSearch =
        form.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.artistName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
      const matchesType = filterFormType === 'all' || form.formType === filterFormType;
      return matchesSearch && matchesStatus && matchesType;
    }).map(form => ({
      ...form,
      status: isExpired(form.validUntil) && form.status === 'signed' ? 'expired' as ConsentStatus : form.status,
    }));
  }, [consentForms, searchTerm, filterStatus, filterFormType]);

  // Stats
  const stats = useMemo(() => {
    const signedCount = consentForms.filter(f => f.status === 'signed' && !isExpired(f.validUntil)).length;
    const pendingCount = consentForms.filter(f => f.status === 'pending').length;
    const expiredCount = consentForms.filter(f => isExpired(f.validUntil) || f.status === 'expired').length;
    const incompleteCount = consentForms.filter(f => f.status === 'incomplete').length;

    return {
      signedCount,
      pendingCount,
      expiredCount,
      incompleteCount,
      totalForms: consentForms.length,
    };
  }, [consentForms]);

  // Handle artist selection
  const handleArtistChange = (artistId: string) => {
    const artist = ARTISTS.find(a => a.id === artistId);
    if (artist) {
      setNewConsent(prev => ({
        ...prev,
        artistId,
        artistName: artist.name,
      }));
    }
  };

  // Save consent form
  const handleSaveForm = async () => {
    if (!newConsent.clientName || !newConsent.artistId) {
      return;
    }

    const now = new Date().toISOString();

    // Check if all acknowledgments are complete
    const isComplete =
      newConsent.acknowledgedRisks &&
      newConsent.acknowledgedAftercare &&
      newConsent.acknowledgedNoRefund;

    if (editingForm) {
      const updated: ConsentForm = {
        ...editingForm,
        ...newConsent as ConsentForm,
        status: isComplete ? (newConsent.signatureData ? 'signed' : 'pending') : 'incomplete',
        updatedAt: now,
      };
      await updateFormBackend(updated);
      setEditingForm(null);
    } else {
      const form: ConsentForm = {
        id: generateId(),
        clientId: generateId(),
        ...newConsent as ConsentForm,
        status: isComplete ? 'pending' : 'incomplete',
        createdAt: now,
        updatedAt: now,
      };
      await addFormToBackend(form);
    }

    setShowForm(false);
    resetForm();
    setCurrentStep(1);
  };

  // Reset form
  const resetForm = () => {
    setNewConsent({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientDOB: '',
      clientAddress: '',
      formType: 'tattoo',
      appointmentId: '',
      artistId: '',
      artistName: '',
      procedureDescription: '',
      bodyPlacement: '',
      status: 'pending',
      signedAt: null,
      signatureData: null,
      witnessName: '',
      witnessSignature: null,
      emergencyContactName: '',
      emergencyContactPhone: '',
      hasAllergies: false,
      allergiesDescription: '',
      hasMedicalConditions: false,
      medicalConditionsDescription: '',
      isTakingMedications: false,
      medicationsDescription: '',
      isPregnant: false,
      hasBleedingDisorder: false,
      hasSkinConditions: false,
      skinConditionsDescription: '',
      isOver18: true,
      hasGuardianConsent: false,
      guardianName: '',
      guardianSignature: null,
      acknowledgedRisks: false,
      acknowledgedAftercare: false,
      acknowledgedNoRefund: false,
      acknowledgedPhotography: false,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
  };

  // Edit form
  const handleEditForm = (form: ConsentForm) => {
    setEditingForm(form);
    setNewConsent(form);
    setShowForm(true);
    setCurrentStep(1);
  };

  // Delete form
  const handleDeleteForm = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Consent Form',
      message: 'Are you sure you want to delete this consent form?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteFormBackend(id);
    }
  };

  // Mark as signed
  const handleMarkAsSigned = async (form: ConsentForm) => {
    const updated = {
      ...form,
      status: 'signed' as ConsentStatus,
      signedAt: new Date().toISOString(),
      signatureData: 'electronic-signature',
      updatedAt: new Date().toISOString(),
    };
    await updateFormBackend(updated);
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = filteredForms.map(form => ({
      ...form,
      isOver18: form.isOver18 ? 'Yes' : 'No',
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, CONSENT_COLUMNS, 'consent-forms');
        break;
      case 'excel':
        exportToExcel(exportData, CONSENT_COLUMNS, 'consent-forms');
        break;
      case 'json':
        exportToJSON(exportData, 'consent-forms');
        break;
      case 'pdf':
        exportToPDF(exportData, CONSENT_COLUMNS, 'Consent Forms');
        break;
    }
  };

  const getStatusBadge = (status: ConsentStatus) => {
    const statusOption = STATUS_OPTIONS.find(s => s.id === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOption?.color}`}>
        {statusOption?.label}
      </span>
    );
  };

  const getFormTypeLabel = (type: FormType) => {
    const formType = FORM_TYPES.find(f => f.id === type);
    return formType?.label || type;
  };

  return (
    <>
      <ConfirmDialog />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              {t('tools.consentForm.consentFormTracker', 'Consent Form Tracker')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.consentForm.manageClientConsentFormsAnd', 'Manage client consent forms and medical disclosures')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="consent-form" toolName="Consent Form" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
            <button
              onClick={() => { setShowForm(true); setEditingForm(null); resetForm(); setCurrentStep(1); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.consentForm.newConsentForm', 'New Consent Form')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.consentForm.totalForms', 'Total Forms')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalForms}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.consentForm.signed', 'Signed')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.signedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.consentForm.pending', 'Pending')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.consentForm.expired', 'Expired')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expiredCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.consentForm.incomplete', 'Incomplete')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.incompleteCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-orange-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.consentForm.searchByClientNameEmail', 'Search by client name, email, or artist...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('tools.consentForm.allStatus', 'All Status')}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterFormType}
                onChange={(e) => setFilterFormType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('tools.consentForm.allFormTypes', 'All Form Types')}</option>
                {FORM_TYPES.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Consent Forms List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.consentForm.client', 'Client')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.consentForm.formType', 'Form Type')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.consentForm.artist', 'Artist')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.consentForm.procedure', 'Procedure')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.consentForm.status', 'Status')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.consentForm.validUntil', 'Valid Until')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.consentForm.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredForms.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        {t('tools.consentForm.noConsentFormsFoundCreate', 'No consent forms found. Create your first form!')}
                      </td>
                    </tr>
                  ) : (
                    filteredForms.map(form => (
                      <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{form.clientName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{form.clientEmail}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">{getFormTypeLabel(form.formType)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white">{form.artistName}</td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-gray-900 dark:text-white truncate max-w-[200px]">{form.procedureDescription || 'N/A'}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{form.bodyPlacement}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(form.status)}</td>
                        <td className="px-4 py-4">
                          <div>
                            <div className={`text-sm ${isExpired(form.validUntil) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                              {formatDate(form.validUntil)}
                            </div>
                            {form.signedAt && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Signed: {formatDate(form.signedAt)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingForm(form)}
                              className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title={t('tools.consentForm.view', 'View')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {form.status === 'pending' && (
                              <button
                                onClick={() => handleMarkAsSigned(form)}
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                                title={t('tools.consentForm.markAsSigned', 'Mark as Signed')}
                              >
                                <PenTool className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditForm(form)}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                              title={t('tools.consentForm.edit', 'Edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteForm(form.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingForm ? t('tools.consentForm.editConsentForm', 'Edit Consent Form') : t('tools.consentForm.newConsentForm2', 'New Consent Form')}
                </h2>
                {/* Step indicator */}
                <div className="flex items-center gap-2 mt-4">
                  {[1, 2, 3, 4].map(step => (
                    <React.Fragment key={step}>
                      <button
                        onClick={() => setCurrentStep(step)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          currentStep === step
                            ? 'bg-blue-600 text-white'
                            : currentStep > step
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                      </button>
                      {step < 4 && <div className={`flex-1 h-1 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{t('tools.consentForm.clientInfo', 'Client Info')}</span>
                  <span>{t('tools.consentForm.medical', 'Medical')}</span>
                  <span>{t('tools.consentForm.procedure2', 'Procedure')}</span>
                  <span>{t('tools.consentForm.consent', 'Consent')}</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Step 1: Client Info */}
                {currentStep === 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.clientName', 'Client Name *')}</label>
                        <input
                          type="text"
                          value={newConsent.clientName || ''}
                          onChange={(e) => setNewConsent({ ...newConsent, clientName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder={t('tools.consentForm.fullLegalName', 'Full legal name')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.dateOfBirth', 'Date of Birth *')}</label>
                        <input
                          type="date"
                          value={newConsent.clientDOB || ''}
                          onChange={(e) => setNewConsent({ ...newConsent, clientDOB: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.email', 'Email')}</label>
                        <input
                          type="email"
                          value={newConsent.clientEmail || ''}
                          onChange={(e) => setNewConsent({ ...newConsent, clientEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder={t('tools.consentForm.emailExampleCom', 'email@example.com')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.phone', 'Phone')}</label>
                        <input
                          type="tel"
                          value={newConsent.clientPhone || ''}
                          onChange={(e) => setNewConsent({ ...newConsent, clientPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.address', 'Address')}</label>
                      <input
                        type="text"
                        value={newConsent.clientAddress || ''}
                        onChange={(e) => setNewConsent({ ...newConsent, clientAddress: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={t('tools.consentForm.streetCityStateZip', 'Street, City, State, ZIP')}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.emergencyContactName', 'Emergency Contact Name')}</label>
                        <input
                          type="text"
                          value={newConsent.emergencyContactName || ''}
                          onChange={(e) => setNewConsent({ ...newConsent, emergencyContactName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.emergencyContactPhone', 'Emergency Contact Phone')}</label>
                        <input
                          type="tel"
                          value={newConsent.emergencyContactPhone || ''}
                          onChange={(e) => setNewConsent({ ...newConsent, emergencyContactPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isOver18"
                        checked={newConsent.isOver18 || false}
                        onChange={(e) => setNewConsent({ ...newConsent, isOver18: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <label htmlFor="isOver18" className="text-sm text-gray-700 dark:text-gray-300">
                        {t('tools.consentForm.clientIs18YearsOf', 'Client is 18 years of age or older')}
                      </label>
                    </div>
                    {!newConsent.isOver18 && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                          {t('tools.consentForm.guardianParentConsentRequiredFor', 'Guardian/Parent consent required for minors')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.guardianName', 'Guardian Name')}</label>
                            <input
                              type="text"
                              value={newConsent.guardianName || ''}
                              onChange={(e) => setNewConsent({ ...newConsent, guardianName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Step 2: Medical */}
                {currentStep === 2 && (
                  <>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          {t('tools.consentForm.pleaseDiscloseAnyMedicalConditions', 'Please disclose any medical conditions that may affect the procedure or healing process.')}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newConsent.hasAllergies || false}
                            onChange={(e) => setNewConsent({ ...newConsent, hasAllergies: e.target.checked })}
                            className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{t('tools.consentForm.doYouHaveAnyAllergies', 'Do you have any allergies?')}</span>
                            <p className="text-xs text-gray-500">{t('tools.consentForm.includingLatexMetalsInksOr', 'Including latex, metals, inks, or medications')}</p>
                          </div>
                        </label>
                        {newConsent.hasAllergies && (
                          <textarea
                            value={newConsent.allergiesDescription || ''}
                            onChange={(e) => setNewConsent({ ...newConsent, allergiesDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder={t('tools.consentForm.pleaseDescribeYourAllergies', 'Please describe your allergies...')}
                            rows={2}
                          />
                        )}

                        <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newConsent.hasMedicalConditions || false}
                            onChange={(e) => setNewConsent({ ...newConsent, hasMedicalConditions: e.target.checked })}
                            className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{t('tools.consentForm.anyMedicalConditions', 'Any medical conditions?')}</span>
                            <p className="text-xs text-gray-500">{t('tools.consentForm.heartConditionsDiabetesEpilepsyEtc', 'Heart conditions, diabetes, epilepsy, etc.')}</p>
                          </div>
                        </label>
                        {newConsent.hasMedicalConditions && (
                          <textarea
                            value={newConsent.medicalConditionsDescription || ''}
                            onChange={(e) => setNewConsent({ ...newConsent, medicalConditionsDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder={t('tools.consentForm.pleaseDescribeYourMedicalConditions', 'Please describe your medical conditions...')}
                            rows={2}
                          />
                        )}

                        <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newConsent.isTakingMedications || false}
                            onChange={(e) => setNewConsent({ ...newConsent, isTakingMedications: e.target.checked })}
                            className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{t('tools.consentForm.takingAnyMedications', 'Taking any medications?')}</span>
                            <p className="text-xs text-gray-500">{t('tools.consentForm.includingBloodThinnersAntibioticsEtc', 'Including blood thinners, antibiotics, etc.')}</p>
                          </div>
                        </label>
                        {newConsent.isTakingMedications && (
                          <textarea
                            value={newConsent.medicationsDescription || ''}
                            onChange={(e) => setNewConsent({ ...newConsent, medicationsDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder={t('tools.consentForm.pleaseListYourMedications', 'Please list your medications...')}
                            rows={2}
                          />
                        )}

                        <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newConsent.hasBleedingDisorder || false}
                            onChange={(e) => setNewConsent({ ...newConsent, hasBleedingDisorder: e.target.checked })}
                            className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{t('tools.consentForm.bleedingDisorder', 'Bleeding disorder?')}</span>
                            <p className="text-xs text-gray-500">{t('tools.consentForm.hemophiliaOrAnyConditionAffecting', 'Hemophilia or any condition affecting blood clotting')}</p>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newConsent.hasSkinConditions || false}
                            onChange={(e) => setNewConsent({ ...newConsent, hasSkinConditions: e.target.checked })}
                            className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{t('tools.consentForm.skinConditions', 'Skin conditions?')}</span>
                            <p className="text-xs text-gray-500">{t('tools.consentForm.eczemaPsoriasisKeloidScarringEtc', 'Eczema, psoriasis, keloid scarring, etc.')}</p>
                          </div>
                        </label>
                        {newConsent.hasSkinConditions && (
                          <textarea
                            value={newConsent.skinConditionsDescription || ''}
                            onChange={(e) => setNewConsent({ ...newConsent, skinConditionsDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder={t('tools.consentForm.pleaseDescribeYourSkinConditions', 'Please describe your skin conditions...')}
                            rows={2}
                          />
                        )}

                        <label className="flex items-start gap-3 p-3 border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newConsent.isPregnant || false}
                            onChange={(e) => setNewConsent({ ...newConsent, isPregnant: e.target.checked })}
                            className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{t('tools.consentForm.areYouPregnantOrNursing', 'Are you pregnant or nursing?')}</span>
                            <p className="text-xs text-yellow-700 dark:text-yellow-400">{t('tools.consentForm.tattooingIsNotRecommendedDuring', 'Tattooing is not recommended during pregnancy')}</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3: Procedure */}
                {currentStep === 3 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.formType2', 'Form Type')}</label>
                        <select
                          value={newConsent.formType || 'tattoo'}
                          onChange={(e) => setNewConsent({ ...newConsent, formType: e.target.value as FormType })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {FORM_TYPES.map(f => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.artist2', 'Artist *')}</label>
                        <select
                          value={newConsent.artistId || ''}
                          onChange={(e) => handleArtistChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="">{t('tools.consentForm.selectArtist', 'Select artist...')}</option>
                          {ARTISTS.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.bodyPlacement', 'Body Placement')}</label>
                      <input
                        type="text"
                        value={newConsent.bodyPlacement || ''}
                        onChange={(e) => setNewConsent({ ...newConsent, bodyPlacement: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={t('tools.consentForm.eGLeftForearmInner', 'e.g., Left forearm, inner side')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.procedureDescription', 'Procedure Description')}</label>
                      <textarea
                        value={newConsent.procedureDescription || ''}
                        onChange={(e) => setNewConsent({ ...newConsent, procedureDescription: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={t('tools.consentForm.describeTheTattooPiercingDesign', 'Describe the tattoo/piercing design...')}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.witnessName', 'Witness Name')}</label>
                        <input
                          type="text"
                          value={newConsent.witnessName || ''}
                          onChange={(e) => setNewConsent({ ...newConsent, witnessName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.validUntil2', 'Valid Until')}</label>
                        <input
                          type="date"
                          value={newConsent.validUntil || ''}
                          onChange={(e) => setNewConsent({ ...newConsent, validUntil: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 4: Consent */}
                {currentStep === 4 && (
                  <>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">{t('tools.consentForm.importantAcknowledgments', 'Important Acknowledgments')}</h4>
                        <p className="text-sm text-red-700 dark:text-red-400">
                          {t('tools.consentForm.pleaseReadAndAcknowledgeThe', 'Please read and acknowledge the following statements carefully.')}
                        </p>
                      </div>

                      <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newConsent.acknowledgedRisks || false}
                          onChange={(e) => setNewConsent({ ...newConsent, acknowledgedRisks: e.target.checked })}
                          className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{t('tools.consentForm.riskAcknowledgment', 'Risk Acknowledgment *')}</span>
                          <p className="text-xs text-gray-500 mt-1">
                            I understand that getting a tattoo/piercing involves inherent risks including but not limited to:
                            infection, allergic reactions, scarring, and keloid formation. I acknowledge that I have been
                            informed of these risks and voluntarily consent to the procedure.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newConsent.acknowledgedAftercare || false}
                          onChange={(e) => setNewConsent({ ...newConsent, acknowledgedAftercare: e.target.checked })}
                          className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{t('tools.consentForm.aftercareAgreement', 'Aftercare Agreement *')}</span>
                          <p className="text-xs text-gray-500 mt-1">
                            I have received and understand the aftercare instructions provided. I agree to follow these
                            instructions and understand that failure to do so may result in complications or poor healing.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newConsent.acknowledgedNoRefund || false}
                          onChange={(e) => setNewConsent({ ...newConsent, acknowledgedNoRefund: e.target.checked })}
                          className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{t('tools.consentForm.depositRefundPolicy', 'Deposit & Refund Policy *')}</span>
                          <p className="text-xs text-gray-500 mt-1">
                            I understand that deposits are non-refundable and that once the procedure has begun,
                            no refunds will be issued. I acknowledge that dissatisfaction with the final result
                            due to personal preference is not grounds for a refund.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newConsent.acknowledgedPhotography || false}
                          onChange={(e) => setNewConsent({ ...newConsent, acknowledgedPhotography: e.target.checked })}
                          className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{t('tools.consentForm.photographyConsentOptional', 'Photography Consent (Optional)')}</span>
                          <p className="text-xs text-gray-500 mt-1">
                            I consent to the studio taking photographs of my tattoo/piercing for use in their
                            portfolio, social media, and promotional materials. I understand that my identity
                            may be visible in these photographs.
                          </p>
                        </div>
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.consentForm.additionalNotes', 'Additional Notes')}</label>
                        <textarea
                          value={newConsent.notes || ''}
                          onChange={(e) => setNewConsent({ ...newConsent, notes: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder={t('tools.consentForm.anyAdditionalNotesOrSpecial', 'Any additional notes or special requests...')}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <div>
                  {currentStep > 1 && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {t('tools.consentForm.previous', 'Previous')}
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowForm(false); setEditingForm(null); resetForm(); setCurrentStep(1); }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {t('tools.consentForm.cancel', 'Cancel')}
                  </button>
                  {currentStep < 4 ? (
                    <button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('tools.consentForm.next', 'Next')}
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveForm}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingForm ? t('tools.consentForm.updateForm', 'Update Form') : t('tools.consentForm.createForm', 'Create Form')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewingForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('tools.consentForm.consentFormDetails', 'Consent Form Details')}</h2>
                <button onClick={() => setViewingForm(null)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{viewingForm.clientName}</h3>
                    <p className="text-sm text-gray-500">{viewingForm.clientEmail}</p>
                  </div>
                  {getStatusBadge(viewingForm.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">{t('tools.consentForm.formType3', 'Form Type:')}</span>
                    <p className="font-medium text-gray-900 dark:text-white">{getFormTypeLabel(viewingForm.formType)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('tools.consentForm.artist3', 'Artist:')}</span>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingForm.artistName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('tools.consentForm.bodyPlacement2', 'Body Placement:')}</span>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingForm.bodyPlacement || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('tools.consentForm.validUntil3', 'Valid Until:')}</span>
                    <p className={`font-medium ${isExpired(viewingForm.validUntil) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                      {formatDate(viewingForm.validUntil)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.consentForm.medicalDisclosures', 'Medical Disclosures')}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {viewingForm.hasAllergies ? <AlertCircle className="w-4 h-4 text-yellow-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                      <span>Allergies: {viewingForm.hasAllergies ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingForm.hasMedicalConditions ? <AlertCircle className="w-4 h-4 text-yellow-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                      <span>Medical Conditions: {viewingForm.hasMedicalConditions ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingForm.hasBleedingDisorder ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                      <span>Bleeding Disorder: {viewingForm.hasBleedingDisorder ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingForm.isPregnant ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                      <span>Pregnant: {viewingForm.isPregnant ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('tools.consentForm.acknowledgments', 'Acknowledgments')}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {viewingForm.acknowledgedRisks ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span>{t('tools.consentForm.riskAcknowledgment2', 'Risk Acknowledgment')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingForm.acknowledgedAftercare ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span>{t('tools.consentForm.aftercareAgreement2', 'Aftercare Agreement')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingForm.acknowledgedNoRefund ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span>{t('tools.consentForm.refundPolicy', 'Refund Policy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingForm.acknowledgedPhotography ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                      <span>{t('tools.consentForm.photographyConsent', 'Photography Consent')}</span>
                    </div>
                  </div>
                </div>

                {viewingForm.signedAt && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-500">
                      Signed on: {formatDateTime(viewingForm.signedAt)}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setViewingForm(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {t('tools.consentForm.close', 'Close')}
                </button>
                <button
                  onClick={() => { handleEditForm(viewingForm); setViewingForm(null); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('tools.consentForm.editForm', 'Edit Form')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ConsentFormTool;
