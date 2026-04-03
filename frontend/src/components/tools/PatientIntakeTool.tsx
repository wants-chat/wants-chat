'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Save,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Heart,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface IntakeForm {
  id: string;
  // Patient Info
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  ssn: string;
  // Contact Info
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  // Emergency Contact
  emergencyContact: EmergencyContact;
  // Medical Info
  reasonForVisit: string;
  symptoms: string[];
  currentMedications: string;
  allergies: string;
  primaryPhysician: string;
  // Insurance
  hasInsurance: boolean;
  insuranceProvider: string;
  policyNumber: string;
  groupNumber: string;
  // Consent
  consentSigned: boolean;
  hipaaAcknowledged: boolean;
  // Status
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  intakeDate: string;
  completedDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientIntakeToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'patient-intake';

const intakeColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
  { key: 'gender', header: 'Gender', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'reasonForVisit', header: 'Reason for Visit', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'intakeDate', header: 'Intake Date', type: 'date' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const createNewIntake = (): IntakeForm => ({
  id: crypto.randomUUID(),
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'prefer-not-to-say',
  ssn: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  emergencyContact: { name: '', relationship: '', phone: '' },
  reasonForVisit: '',
  symptoms: [],
  currentMedications: '',
  allergies: '',
  primaryPhysician: '',
  hasInsurance: false,
  insuranceProvider: '',
  policyNumber: '',
  groupNumber: '',
  consentSigned: false,
  hipaaAcknowledged: false,
  status: 'pending',
  intakeDate: new Date().toISOString().split('T')[0],
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const PatientIntakeTool: React.FC<PatientIntakeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: intakes,
    addItem: addIntake,
    updateItem: updateIntake,
    deleteItem: deleteIntake,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<IntakeForm>(TOOL_ID, [], intakeColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingIntake, setEditingIntake] = useState<IntakeForm | null>(null);
  const [formData, setFormData] = useState<IntakeForm>(createNewIntake());
  const [formStep, setFormStep] = useState(1);
  const [newSymptom, setNewSymptom] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: intakes.length,
      pending: intakes.filter(i => i.status === 'pending').length,
      inProgress: intakes.filter(i => i.status === 'in-progress').length,
      completedToday: intakes.filter(i => i.status === 'completed' && i.completedDate === today).length,
    };
  }, [intakes]);

  // Filtered intakes
  const filteredIntakes = useMemo(() => {
    return intakes.filter(intake => {
      const matchesSearch = searchQuery === '' ||
        `${intake.firstName} ${intake.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intake.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intake.phone.includes(searchQuery);

      const matchesStatus = filterStatus === '' || intake.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [intakes, searchQuery, filterStatus]);

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (editingIntake) {
      updateIntake(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addIntake({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingIntake(null);
    setFormData(createNewIntake());
    setFormStep(1);
    setFormErrors({});
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this intake form?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteIntake(id);
    }
  };

  const openEditModal = (intake: IntakeForm) => {
    setEditingIntake(intake);
    setFormData(intake);
    setFormStep(1);
    setShowModal(true);
  };

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setFormData({ ...formData, symptoms: [...formData.symptoms, newSymptom.trim()] });
      setNewSymptom('');
    }
  };

  const removeSymptom = (index: number) => {
    setFormData({ ...formData, symptoms: formData.symptoms.filter((_, i) => i !== index) });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <ClipboardList className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.patientIntake.patientIntake', 'Patient Intake')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.patientIntake.patientRegistrationAndIntakeForms', 'Patient registration and intake forms')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="patient-intake" toolName="Patient Intake" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme as 'light' | 'dark'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'patient-intake' })}
            onExportExcel={() => exportExcel({ filename: 'patient-intake' })}
            onExportJSON={() => exportJSON({ filename: 'patient-intake' })}
            onExportPDF={() => exportPDF({ filename: 'patient-intake', title: 'Patient Intake Forms' })}
            onPrint={() => print('Patient Intake Forms')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={intakes.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewIntake()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.patientIntake.newIntake', 'New Intake')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Users className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientIntake.totalIntakes', 'Total Intakes')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientIntake.pending', 'Pending')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientIntake.inProgress', 'In Progress')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.patientIntake.completedToday', 'Completed Today')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.completedToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.patientIntake.searchPatients', 'Search patients...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${inputClass} w-full sm:w-48`}
          >
            <option value="">{t('tools.patientIntake.allStatus', 'All Status')}</option>
            <option value="pending">{t('tools.patientIntake.pending2', 'Pending')}</option>
            <option value="in-progress">{t('tools.patientIntake.inProgress2', 'In Progress')}</option>
            <option value="completed">{t('tools.patientIntake.completed', 'Completed')}</option>
            <option value="cancelled">{t('tools.patientIntake.cancelled', 'Cancelled')}</option>
          </select>
        </div>
      </div>

      {/* Intake List */}
      <div className={cardClass}>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.patientIntake.loading', 'Loading...')}</p>
          </div>
        ) : filteredIntakes.length === 0 ? (
          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('tools.patientIntake.noIntakeFormsFound', 'No intake forms found')}</p>
            <p className="text-sm mt-1">{t('tools.patientIntake.createANewIntakeForm', 'Create a new intake form to get started')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                  <th className="text-left p-4 font-medium">{t('tools.patientIntake.patient', 'Patient')}</th>
                  <th className="text-left p-4 font-medium">{t('tools.patientIntake.contact', 'Contact')}</th>
                  <th className="text-left p-4 font-medium">{t('tools.patientIntake.reason', 'Reason')}</th>
                  <th className="text-left p-4 font-medium">{t('tools.patientIntake.date', 'Date')}</th>
                  <th className="text-left p-4 font-medium">{t('tools.patientIntake.status', 'Status')}</th>
                  <th className="text-left p-4 font-medium">{t('tools.patientIntake.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredIntakes.map(intake => (
                  <tr
                    key={intake.id}
                    className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <User className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                          <p className="font-medium">{intake.firstName} {intake.lastName}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            DOB: {intake.dateOfBirth || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{intake.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[150px]">{intake.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm truncate max-w-[200px]">{intake.reasonForVisit || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{intake.intakeDate}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(intake.status)}`}>
                        {intake.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(intake)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit2 className="w-4 h-4 text-cyan-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(intake.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' ? 'hover:bg-red-500/20' : 'hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{editingIntake ? t('tools.patientIntake.editIntakeForm', 'Edit Intake Form') : t('tools.patientIntake.newPatientIntake', 'New Patient Intake')}</h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Step {formStep} of 4
                </p>
              </div>
              <button onClick={() => { setShowModal(false); setEditingIntake(null); setFormStep(1); setFormErrors({}); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1: Personal Information */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-500" />
                    {t('tools.patientIntake.personalInformation', 'Personal Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.firstName', 'First Name *')}</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); setFormErrors(prev => ({ ...prev, firstName: '' })); }}
                        className={`${inputClass} ${formErrors.firstName ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.lastName', 'Last Name *')}</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); setFormErrors(prev => ({ ...prev, lastName: '' })); }}
                        className={`${inputClass} ${formErrors.lastName ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.dateOfBirth', 'Date of Birth *')}</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => { setFormData({ ...formData, dateOfBirth: e.target.value }); setFormErrors(prev => ({ ...prev, dateOfBirth: '' })); }}
                        className={`${inputClass} ${formErrors.dateOfBirth ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{formErrors.dateOfBirth}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.gender', 'Gender')}</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                        className={inputClass}
                      >
                        <option value="male">{t('tools.patientIntake.male', 'Male')}</option>
                        <option value="female">{t('tools.patientIntake.female', 'Female')}</option>
                        <option value="other">{t('tools.patientIntake.other', 'Other')}</option>
                        <option value="prefer-not-to-say">{t('tools.patientIntake.preferNotToSay', 'Prefer not to say')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.ssnLast4Digits', 'SSN (Last 4 digits)')}</label>
                      <input
                        type="text"
                        value={formData.ssn}
                        onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                        className={inputClass}
                        maxLength={4}
                        placeholder={t('tools.patientIntake.xxxx', 'XXXX')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-cyan-500" />
                    {t('tools.patientIntake.contactInformation', 'Contact Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.email', 'Email')}</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.phone', 'Phone *')}</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>{t('tools.patientIntake.address', 'Address')}</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.city', 'City')}</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.state', 'State')}</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.zipCode', 'Zip Code')}</label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <h3 className="font-semibold flex items-center gap-2 mt-6">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    {t('tools.patientIntake.emergencyContact', 'Emergency Contact')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.name', 'Name')}</label>
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.relationship', 'Relationship')}</label>
                      <input
                        type="text"
                        value={formData.emergencyContact.relationship}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relationship: e.target.value } })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.patientIntake.phone2', 'Phone')}</label>
                      <input
                        type="tel"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value } })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Medical Information */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    {t('tools.patientIntake.medicalInformation', 'Medical Information')}
                  </h3>
                  <div>
                    <label className={labelClass}>{t('tools.patientIntake.reasonForVisit', 'Reason for Visit *')}</label>
                    <textarea
                      value={formData.reasonForVisit}
                      onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                      className={inputClass}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientIntake.symptoms', 'Symptoms')}</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSymptom}
                        onChange={(e) => setNewSymptom(e.target.value)}
                        placeholder={t('tools.patientIntake.addSymptom', 'Add symptom')}
                        className={inputClass}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                      />
                      <button type="button" onClick={addSymptom} className={buttonSecondary}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.symptoms.map((symptom, index) => (
                        <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm flex items-center gap-2">
                          {symptom}
                          <button type="button" onClick={() => removeSymptom(index)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientIntake.currentMedications', 'Current Medications')}</label>
                    <textarea
                      value={formData.currentMedications}
                      onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                      className={inputClass}
                      rows={2}
                      placeholder={t('tools.patientIntake.listCurrentMedications', 'List current medications...')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientIntake.allergies', 'Allergies')}</label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.patientIntake.listAnyAllergies', 'List any allergies...')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.patientIntake.primaryPhysician', 'Primary Physician')}</label>
                    <input
                      type="text"
                      value={formData.primaryPhysician}
                      onChange={(e) => setFormData({ ...formData, primaryPhysician: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Insurance & Consent */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-500" />
                    {t('tools.patientIntake.insuranceConsent', 'Insurance & Consent')}
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasInsurance"
                      checked={formData.hasInsurance}
                      onChange={(e) => setFormData({ ...formData, hasInsurance: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="hasInsurance" className={labelClass}>{t('tools.patientIntake.iHaveInsurance', 'I have insurance')}</label>
                  </div>
                  {formData.hasInsurance && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.patientIntake.insuranceProvider', 'Insurance Provider')}</label>
                        <input
                          type="text"
                          value={formData.insuranceProvider}
                          onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.patientIntake.policyNumber', 'Policy Number')}</label>
                        <input
                          type="text"
                          value={formData.policyNumber}
                          onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.patientIntake.groupNumber', 'Group Number')}</label>
                        <input
                          type="text"
                          value={formData.groupNumber}
                          onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="consentSigned"
                        checked={formData.consentSigned}
                        onChange={(e) => setFormData({ ...formData, consentSigned: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <label htmlFor="consentSigned" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.patientIntake.iConsentToTreatmentAnd', 'I consent to treatment and authorize the release of medical information *')}
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="hipaaAcknowledged"
                        checked={formData.hipaaAcknowledged}
                        onChange={(e) => setFormData({ ...formData, hipaaAcknowledged: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <label htmlFor="hipaaAcknowledged" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.patientIntake.iAcknowledgeReceiptOfHipaa', 'I acknowledge receipt of HIPAA privacy practices *')}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>{t('tools.patientIntake.status2', 'Status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="pending">{t('tools.patientIntake.pending3', 'Pending')}</option>
                      <option value="in-progress">{t('tools.patientIntake.inProgress3', 'In Progress')}</option>
                      <option value="completed">{t('tools.patientIntake.completed2', 'Completed')}</option>
                      <option value="cancelled">{t('tools.patientIntake.cancelled2', 'Cancelled')}</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>{t('tools.patientIntake.notes', 'Notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className={inputClass}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => formStep > 1 ? setFormStep(formStep - 1) : (setShowModal(false), setEditingIntake(null), setFormErrors({}))}
                  className={buttonSecondary}
                >
                  {formStep === 1 ? t('tools.patientIntake.cancel', 'Cancel') : t('tools.patientIntake.previous', 'Previous')}
                </button>
                {formStep < 4 ? (
                  <button type="button" onClick={() => { if (formStep === 1 && !validateStep1()) return; setFormStep(formStep + 1); }} className={buttonPrimary}>
                    {t('tools.patientIntake.next', 'Next')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.consentSigned || !formData.hipaaAcknowledged}
                    className={buttonPrimary}
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.patientIntake.saveIntake', 'Save Intake')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.patientIntake.aboutPatientIntakeTool', 'About Patient Intake Tool')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Streamline patient registration with comprehensive intake forms. Collect personal information,
          medical history, insurance details, and consent acknowledgments. Track intake status and
          manage patient onboarding efficiently.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default PatientIntakeTool;
