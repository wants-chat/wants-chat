'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToolData } from '../../hooks/useToolData';
import { Loader2 } from 'lucide-react';
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
  Baby,
  Users,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Shield,
  Heart,
  AlertTriangle,
  FileText,
  UserCheck,
  ClipboardList,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Syringe,
  Home,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ChildEnrollmentToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Guardian {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  isPrimary: boolean;
  isAuthorizedPickup: boolean;
  employer?: string;
  workPhone?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isAuthorizedPickup: boolean;
}

interface MedicalInfo {
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  doctorName: string;
  doctorPhone: string;
  insuranceProvider?: string;
  insuranceId?: string;
  specialNeeds?: string;
  dietaryRestrictions: string[];
}

interface EnrollmentRecord {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  profilePhoto?: string;
  enrollmentDate: string;
  startDate: string;
  program: 'full-time' | 'part-time' | 'drop-in' | 'before-after-school';
  scheduleType: string;
  classroomAssignment: string;
  status: 'pending' | 'approved' | 'active' | 'waitlist' | 'withdrawn' | 'graduated';
  guardians: Guardian[];
  emergencyContacts: EmergencyContact[];
  medicalInfo: MedicalInfo;
  photoConsent: boolean;
  mediaConsent: boolean;
  fieldTripConsent: boolean;
  transportConsent: boolean;
  tuitionRate: number;
  paymentSchedule: 'weekly' | 'bi-weekly' | 'monthly';
  notes?: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

// Column configurations for export
const enrollmentColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
  { key: 'gender', header: 'Gender', type: 'string' },
  { key: 'enrollmentDate', header: 'Enrollment Date', type: 'date' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'program', header: 'Program', type: 'string' },
  { key: 'classroomAssignment', header: 'Classroom', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'tuitionRate', header: 'Tuition Rate', type: 'currency' },
  { key: 'paymentSchedule', header: 'Payment Schedule', type: 'string' },
];

// Program options
const PROGRAMS = [
  { value: 'full-time', label: 'Full-Time (5 days/week)' },
  { value: 'part-time', label: 'Part-Time (2-3 days/week)' },
  { value: 'drop-in', label: 'Drop-In Care' },
  { value: 'before-after-school', label: 'Before/After School' },
];

// Classroom options
const CLASSROOMS = [
  { value: 'infant', label: 'Infant Room (0-12 months)', ageRange: '0-12 months' },
  { value: 'toddler', label: 'Toddler Room (1-2 years)', ageRange: '1-2 years' },
  { value: 'preschool', label: 'Preschool Room (3-4 years)', ageRange: '3-4 years' },
  { value: 'prek', label: 'Pre-K Room (4-5 years)', ageRange: '4-5 years' },
  { value: 'school-age', label: 'School Age (5+ years)', ageRange: '5+ years' },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Review', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'blue' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'waitlist', label: 'Waitlist', color: 'orange' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'red' },
  { value: 'graduated', label: 'Graduated', color: 'purple' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const calculateAge = (dateOfBirth: string): string => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return `${months} months`;
  } else if (years === 1 && months === 0) {
    return '1 year';
  } else if (months === 0) {
    return `${years} years`;
  } else {
    return `${years} years, ${months} months`;
  }
};

type TabType = 'enrollments' | 'pending' | 'waitlist' | 'form';

export const ChildEnrollmentTool: React.FC<ChildEnrollmentToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('enrollments');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClassroom, setFilterClassroom] = useState<string>('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentRecord | null>(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentRecord | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hook for backend sync
  const {
    data: enrollments,
    isLoading,
    addItem: addEnrollment,
    updateItem: updateEnrollment,
    deleteItem: deleteEnrollment,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<EnrollmentRecord>('child-enrollments', [], enrollmentColumns);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Form state for new enrollment
  const [formData, setFormData] = useState<Partial<EnrollmentRecord>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    program: 'full-time',
    scheduleType: 'Monday-Friday',
    classroomAssignment: '',
    status: 'pending',
    guardians: [],
    emergencyContacts: [],
    medicalInfo: {
      allergies: [],
      medicalConditions: [],
      medications: [],
      doctorName: '',
      doctorPhone: '',
      dietaryRestrictions: [],
    },
    photoConsent: false,
    mediaConsent: false,
    fieldTripConsent: false,
    transportConsent: false,
    tuitionRate: 0,
    paymentSchedule: 'monthly',
    documents: [],
  });

  // Guardian form state
  const [guardianForm, setGuardianForm] = useState<Partial<Guardian>>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    isPrimary: false,
    isAuthorizedPickup: true,
  });

  // Emergency contact form state
  const [emergencyContactForm, setEmergencyContactForm] = useState<Partial<EmergencyContact>>({
    name: '',
    relationship: '',
    phone: '',
    isAuthorizedPickup: false,
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.firstName) setFormData(prev => ({ ...prev, firstName: params.firstName }));
      if (params.lastName) setFormData(prev => ({ ...prev, lastName: params.lastName }));
      if (params.childName) {
        const [first, ...rest] = (params.childName as string).split(' ');
        setFormData(prev => ({ ...prev, firstName: first, lastName: rest.join(' ') }));
      }
      setShowEnrollmentForm(true);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const matchesSearch =
        searchTerm === '' ||
        `${enrollment.firstName} ${enrollment.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
      const matchesClassroom = filterClassroom === 'all' || enrollment.classroomAssignment === filterClassroom;
      return matchesSearch && matchesStatus && matchesClassroom;
    });
  }, [enrollments, searchTerm, filterStatus, filterClassroom]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: enrollments.length,
      active: enrollments.filter(e => e.status === 'active').length,
      pending: enrollments.filter(e => e.status === 'pending').length,
      waitlist: enrollments.filter(e => e.status === 'waitlist').length,
      withdrawn: enrollments.filter(e => e.status === 'withdrawn').length,
    };
  }, [enrollments]);

  // Add guardian to form
  const addGuardian = () => {
    if (!guardianForm.name || !guardianForm.phone) {
      setValidationMessage('Please fill in guardian name and phone');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newGuardian: Guardian = {
      id: generateId(),
      name: guardianForm.name || '',
      relationship: guardianForm.relationship || '',
      phone: guardianForm.phone || '',
      email: guardianForm.email || '',
      address: guardianForm.address || '',
      isPrimary: formData.guardians?.length === 0 ? true : (guardianForm.isPrimary || false),
      isAuthorizedPickup: guardianForm.isAuthorizedPickup || true,
    };

    setFormData(prev => ({
      ...prev,
      guardians: [...(prev.guardians || []), newGuardian],
    }));

    setGuardianForm({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      isPrimary: false,
      isAuthorizedPickup: true,
    });
  };

  // Remove guardian from form
  const removeGuardian = (id: string) => {
    setFormData(prev => ({
      ...prev,
      guardians: (prev.guardians || []).filter(g => g.id !== id),
    }));
  };

  // Add emergency contact
  const addEmergencyContact = () => {
    if (!emergencyContactForm.name || !emergencyContactForm.phone) {
      setValidationMessage('Please fill in contact name and phone');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newContact: EmergencyContact = {
      id: generateId(),
      name: emergencyContactForm.name || '',
      relationship: emergencyContactForm.relationship || '',
      phone: emergencyContactForm.phone || '',
      email: emergencyContactForm.email || '',
      isAuthorizedPickup: emergencyContactForm.isAuthorizedPickup || false,
    };

    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...(prev.emergencyContacts || []), newContact],
    }));

    setEmergencyContactForm({
      name: '',
      relationship: '',
      phone: '',
      isAuthorizedPickup: false,
    });
  };

  // Remove emergency contact
  const removeEmergencyContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: (prev.emergencyContacts || []).filter(c => c.id !== id),
    }));
  };

  // Submit enrollment form
  const submitEnrollment = () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      setValidationMessage('Please fill in required fields (First Name, Last Name, Date of Birth)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if ((formData.guardians || []).length === 0) {
      setValidationMessage('Please add at least one guardian');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if ((formData.emergencyContacts || []).length === 0) {
      setValidationMessage('Please add at least one emergency contact');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const enrollment: EnrollmentRecord = {
      id: editingEnrollment?.id || generateId(),
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      dateOfBirth: formData.dateOfBirth || '',
      gender: formData.gender || 'male',
      profilePhoto: formData.profilePhoto,
      enrollmentDate: editingEnrollment?.enrollmentDate || now,
      startDate: formData.startDate || now,
      program: formData.program || 'full-time',
      scheduleType: formData.scheduleType || 'Monday-Friday',
      classroomAssignment: formData.classroomAssignment || '',
      status: formData.status || 'pending',
      guardians: formData.guardians || [],
      emergencyContacts: formData.emergencyContacts || [],
      medicalInfo: formData.medicalInfo || {
        allergies: [],
        medicalConditions: [],
        medications: [],
        doctorName: '',
        doctorPhone: '',
        dietaryRestrictions: [],
      },
      photoConsent: formData.photoConsent || false,
      mediaConsent: formData.mediaConsent || false,
      fieldTripConsent: formData.fieldTripConsent || false,
      transportConsent: formData.transportConsent || false,
      tuitionRate: formData.tuitionRate || 0,
      paymentSchedule: formData.paymentSchedule || 'monthly',
      notes: formData.notes,
      documents: formData.documents || [],
      createdAt: editingEnrollment?.createdAt || now,
      updatedAt: now,
    };

    if (editingEnrollment) {
      updateEnrollment(editingEnrollment.id, enrollment);
    } else {
      addEnrollment(enrollment);
    }

    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      program: 'full-time',
      scheduleType: 'Monday-Friday',
      classroomAssignment: '',
      status: 'pending',
      guardians: [],
      emergencyContacts: [],
      medicalInfo: {
        allergies: [],
        medicalConditions: [],
        medications: [],
        doctorName: '',
        doctorPhone: '',
        dietaryRestrictions: [],
      },
      photoConsent: false,
      mediaConsent: false,
      fieldTripConsent: false,
      transportConsent: false,
      tuitionRate: 0,
      paymentSchedule: 'monthly',
      documents: [],
    });
    setEditingEnrollment(null);
    setShowEnrollmentForm(false);
  };

  // Edit enrollment
  const handleEdit = (enrollment: EnrollmentRecord) => {
    setFormData(enrollment);
    setEditingEnrollment(enrollment);
    setShowEnrollmentForm(true);
  };

  // Delete enrollment
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Enrollment',
      message: 'Are you sure you want to delete this enrollment record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteEnrollment(id);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    switch (statusOption?.color) {
      case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'red': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.childEnrollment.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.childEnrollment.childEnrollmentManager', 'Child Enrollment Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.childEnrollment.manageChildEnrollmentsGuardiansAnd', 'Manage child enrollments, guardians, and documentation')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="child-enrollment" toolName="Child Enrollment" />

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
                onExportCSV={() => exportToCSV(enrollments, enrollmentColumns, 'child-enrollments')}
                onExportExcel={() => exportToExcel(enrollments, enrollmentColumns, 'child-enrollments')}
                onExportJSON={() => exportToJSON(enrollments, 'child-enrollments')}
                onExportPDF={() => exportToPDF(enrollments, enrollmentColumns, 'Child Enrollments')}
                onCopy={() => copyUtil(enrollments, enrollmentColumns)}
                onPrint={() => printData(enrollments, enrollmentColumns, 'Child Enrollments')}
                theme={theme}
              />
              <button
                onClick={() => setShowEnrollmentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.childEnrollment.newEnrollment', 'New Enrollment')}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.childEnrollment.total', 'Total')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{t('tools.childEnrollment.active', 'Active')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{stats.active}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.childEnrollment.pending', 'Pending')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.pending}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>{t('tools.childEnrollment.waitlist', 'Waitlist')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>{stats.waitlist}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{t('tools.childEnrollment.withdrawn', 'Withdrawn')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{stats.withdrawn}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.childEnrollment.searchByChildName', 'Search by child name...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={inputClass}
              style={{ width: 'auto' }}
            >
              <option value="all">{t('tools.childEnrollment.allStatus', 'All Status')}</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <select
              value={filterClassroom}
              onChange={(e) => setFilterClassroom(e.target.value)}
              className={inputClass}
              style={{ width: 'auto' }}
            >
              <option value="all">{t('tools.childEnrollment.allClassrooms', 'All Classrooms')}</option>
              {CLASSROOMS.map(classroom => (
                <option key={classroom.value} value={classroom.value}>{classroom.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Enrollments List */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          {filteredEnrollments.length === 0 ? (
            <div className="p-12 text-center">
              <Baby className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.childEnrollment.noEnrollmentsFound', 'No Enrollments Found')}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {enrollments.length === 0
                  ? t('tools.childEnrollment.getStartedByAddingYour', 'Get started by adding your first child enrollment.') : t('tools.childEnrollment.noEnrollmentsMatchYourSearch', 'No enrollments match your search criteria.')}
              </p>
              {enrollments.length === 0 && (
                <button
                  onClick={() => setShowEnrollmentForm(true)}
                  className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.childEnrollment.addFirstEnrollment', 'Add First Enrollment')}
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Baby className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {enrollment.firstName} {enrollment.lastName}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Age: {calculateAge(enrollment.dateOfBirth)}
                          </span>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {CLASSROOMS.find(c => c.value === enrollment.classroomAssignment)?.label || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {STATUS_OPTIONS.find(s => s.value === enrollment.status)?.label}
                      </span>
                      <button
                        onClick={() => setExpandedId(expandedId === enrollment.id ? null : enrollment.id)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        {expandedId === enrollment.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(enrollment)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(enrollment.id)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === enrollment.id && (
                    <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Enrollment Info */}
                        <div>
                          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.childEnrollment.enrollmentInfo', 'Enrollment Info')}
                          </h4>
                          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p><strong>{t('tools.childEnrollment.program', 'Program:')}</strong> {PROGRAMS.find(p => p.value === enrollment.program)?.label}</p>
                            <p><strong>{t('tools.childEnrollment.schedule', 'Schedule:')}</strong> {enrollment.scheduleType}</p>
                            <p><strong>{t('tools.childEnrollment.startDate', 'Start Date:')}</strong> {formatDate(enrollment.startDate)}</p>
                            <p><strong>{t('tools.childEnrollment.tuition', 'Tuition:')}</strong> {formatCurrency(enrollment.tuitionRate)}/{enrollment.paymentSchedule}</p>
                          </div>
                        </div>

                        {/* Guardians */}
                        <div>
                          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Guardians ({enrollment.guardians.length})
                          </h4>
                          <div className="space-y-2">
                            {enrollment.guardians.map((guardian) => (
                              <div key={guardian.id} className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <p className="font-medium">{guardian.name} {guardian.isPrimary && '(Primary)'}</p>
                                <p>{guardian.relationship} - {guardian.phone}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Medical Info */}
                        <div>
                          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.childEnrollment.medicalInfo', 'Medical Info')}
                          </h4>
                          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p><strong>{t('tools.childEnrollment.allergies', 'Allergies:')}</strong> {enrollment.medicalInfo.allergies.length > 0 ? enrollment.medicalInfo.allergies.join(', ') : 'None'}</p>
                            <p><strong>{t('tools.childEnrollment.conditions', 'Conditions:')}</strong> {enrollment.medicalInfo.medicalConditions.length > 0 ? enrollment.medicalInfo.medicalConditions.join(', ') : 'None'}</p>
                            <p><strong>{t('tools.childEnrollment.doctor', 'Doctor:')}</strong> {enrollment.medicalInfo.doctorName || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Consents */}
                      <div className="mt-4 flex flex-wrap gap-4">
                        <span className={`flex items-center gap-1 text-sm ${enrollment.photoConsent ? 'text-green-500' : 'text-red-500'}`}>
                          {enrollment.photoConsent ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          Photo Consent
                        </span>
                        <span className={`flex items-center gap-1 text-sm ${enrollment.fieldTripConsent ? 'text-green-500' : 'text-red-500'}`}>
                          {enrollment.fieldTripConsent ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          Field Trip Consent
                        </span>
                        <span className={`flex items-center gap-1 text-sm ${enrollment.transportConsent ? 'text-green-500' : 'text-red-500'}`}>
                          {enrollment.transportConsent ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          Transport Consent
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrollment Form Modal */}
        {showEnrollmentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingEnrollment ? t('tools.childEnrollment.editEnrollment', 'Edit Enrollment') : t('tools.childEnrollment.newChildEnrollment', 'New Child Enrollment')}
                </h2>
                <button
                  onClick={resetForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Child Information */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.childEnrollment.childInformation', 'Child Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.childEnrollment.firstName', 'First Name *')}</label>
                      <input
                        type="text"
                        value={formData.firstName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.childEnrollment.lastName', 'Last Name *')}</label>
                      <input
                        type="text"
                        value={formData.lastName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.childEnrollment.dateOfBirth', 'Date of Birth *')}</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.childEnrollment.gender', 'Gender')}</label>
                      <select
                        value={formData.gender || 'male'}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                        className={inputClass}
                      >
                        <option value="male">{t('tools.childEnrollment.male', 'Male')}</option>
                        <option value="female">{t('tools.childEnrollment.female', 'Female')}</option>
                        <option value="other">{t('tools.childEnrollment.other', 'Other')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.childEnrollment.program2', 'Program *')}</label>
                      <select
                        value={formData.program || 'full-time'}
                        onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value as any }))}
                        className={inputClass}
                      >
                        {PROGRAMS.map(program => (
                          <option key={program.value} value={program.value}>{program.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.childEnrollment.classroomAssignment', 'Classroom Assignment')}</label>
                      <select
                        value={formData.classroomAssignment || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, classroomAssignment: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="">{t('tools.childEnrollment.selectClassroom', 'Select Classroom')}</option>
                        {CLASSROOMS.map(classroom => (
                          <option key={classroom.value} value={classroom.value}>{classroom.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.childEnrollment.startDate2', 'Start Date')}</label>
                      <input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.childEnrollment.status', 'Status')}</label>
                      <select
                        value={formData.status || 'pending'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className={inputClass}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.childEnrollment.tuitionRate', 'Tuition Rate')}</label>
                      <input
                        type="number"
                        value={formData.tuitionRate || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, tuitionRate: parseFloat(e.target.value) || 0 }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Guardians Section */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.childEnrollment.guardians', 'Guardians *')}
                  </h3>

                  {/* Existing Guardians */}
                  {(formData.guardians || []).length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.guardians?.map((guardian) => (
                        <div key={guardian.id} className={`flex items-center justify-between p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {guardian.name} {guardian.isPrimary && <span className="text-[#0D9488]">(Primary)</span>}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {guardian.relationship} - {guardian.phone}
                            </p>
                          </div>
                          <button
                            onClick={() => removeGuardian(guardian.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Guardian Form */}
                  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.childEnrollment.name', 'Name')}</label>
                        <input
                          type="text"
                          value={guardianForm.name || ''}
                          onChange={(e) => setGuardianForm(prev => ({ ...prev, name: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.childEnrollment.guardianName', 'Guardian name')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.childEnrollment.relationship', 'Relationship')}</label>
                        <select
                          value={guardianForm.relationship || ''}
                          onChange={(e) => setGuardianForm(prev => ({ ...prev, relationship: e.target.value }))}
                          className={inputClass}
                        >
                          <option value="">Select</option>
                          <option value="Mother">{t('tools.childEnrollment.mother', 'Mother')}</option>
                          <option value="Father">{t('tools.childEnrollment.father', 'Father')}</option>
                          <option value="Stepmother">{t('tools.childEnrollment.stepmother', 'Stepmother')}</option>
                          <option value="Stepfather">{t('tools.childEnrollment.stepfather', 'Stepfather')}</option>
                          <option value="Grandmother">{t('tools.childEnrollment.grandmother', 'Grandmother')}</option>
                          <option value="Grandfather">{t('tools.childEnrollment.grandfather', 'Grandfather')}</option>
                          <option value="Legal Guardian">{t('tools.childEnrollment.legalGuardian', 'Legal Guardian')}</option>
                          <option value="Other">{t('tools.childEnrollment.other2', 'Other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.childEnrollment.phone', 'Phone')}</label>
                        <input
                          type="tel"
                          value={guardianForm.phone || ''}
                          onChange={(e) => setGuardianForm(prev => ({ ...prev, phone: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.childEnrollment.phoneNumber', 'Phone number')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.childEnrollment.email', 'Email')}</label>
                        <input
                          type="email"
                          value={guardianForm.email || ''}
                          onChange={(e) => setGuardianForm(prev => ({ ...prev, email: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.childEnrollment.emailAddress', 'Email address')}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('tools.childEnrollment.address', 'Address')}</label>
                        <input
                          type="text"
                          value={guardianForm.address || ''}
                          onChange={(e) => setGuardianForm(prev => ({ ...prev, address: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.childEnrollment.homeAddress', 'Home address')}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={guardianForm.isAuthorizedPickup || false}
                          onChange={(e) => setGuardianForm(prev => ({ ...prev, isAuthorizedPickup: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.childEnrollment.authorizedForPickup', 'Authorized for Pickup')}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={addGuardian}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.childEnrollment.addGuardian', 'Add Guardian')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts Section */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.childEnrollment.emergencyContacts', 'Emergency Contacts *')}
                  </h3>

                  {/* Existing Contacts */}
                  {(formData.emergencyContacts || []).length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.emergencyContacts?.map((contact) => (
                        <div key={contact.id} className={`flex items-center justify-between p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {contact.name}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {contact.relationship} - {contact.phone}
                              {contact.isAuthorizedPickup && ' (Authorized Pickup)'}
                            </p>
                          </div>
                          <button
                            onClick={() => removeEmergencyContact(contact.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Contact Form */}
                  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.childEnrollment.name2', 'Name')}</label>
                        <input
                          type="text"
                          value={emergencyContactForm.name || ''}
                          onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, name: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.childEnrollment.contactName', 'Contact name')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.childEnrollment.relationship2', 'Relationship')}</label>
                        <input
                          type="text"
                          value={emergencyContactForm.relationship || ''}
                          onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.childEnrollment.eGAuntNeighbor', 'e.g., Aunt, Neighbor')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.childEnrollment.phone2', 'Phone')}</label>
                        <input
                          type="tel"
                          value={emergencyContactForm.phone || ''}
                          onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, phone: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.childEnrollment.phoneNumber2', 'Phone number')}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emergencyContactForm.isAuthorizedPickup || false}
                          onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, isAuthorizedPickup: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.childEnrollment.authorizedForPickup2', 'Authorized for Pickup')}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={addEmergencyContact}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.childEnrollment.addContact', 'Add Contact')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Consents */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.childEnrollment.consentsPermissions', 'Consents & Permissions')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.photoConsent || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, photoConsent: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.childEnrollment.photoConsent', 'Photo Consent')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.mediaConsent || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, mediaConsent: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.childEnrollment.mediaRelease', 'Media Release')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.fieldTripConsent || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, fieldTripConsent: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.childEnrollment.fieldTripConsent', 'Field Trip Consent')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.transportConsent || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, transportConsent: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.childEnrollment.transportConsent', 'Transport Consent')}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={labelClass}>{t('tools.childEnrollment.additionalNotes', 'Additional Notes')}</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className={inputClass}
                    placeholder={t('tools.childEnrollment.anyAdditionalInformation', 'Any additional information...')}
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
                  {t('tools.childEnrollment.cancel', 'Cancel')}
                </button>
                <button
                  onClick={submitEnrollment}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingEnrollment ? t('tools.childEnrollment.updateEnrollment', 'Update Enrollment') : t('tools.childEnrollment.createEnrollment', 'Create Enrollment')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 px-4 py-3 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 shadow-lg border border-red-200 dark:border-red-800">
            <p className="font-medium">{validationMessage}</p>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ChildEnrollmentTool;
