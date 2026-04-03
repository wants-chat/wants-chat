'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BadgeCheck,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertCircle,
  Shield,
  Award,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building,
  Phone,
  Mail,
  Hash,
  ChevronRight,
  RefreshCw,
  Filter,
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
interface License {
  id: string;
  type: string;
  licenseNumber: string;
  state: string;
  issueDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'pending-renewal' | 'suspended';
  verificationDate?: string;
  verifiedBy?: string;
}

interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  certificateNumber: string;
  issueDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'pending';
  ceuRequired: number;
  ceuCompleted: number;
}

interface Privilege {
  id: string;
  category: string;
  privilege: string;
  grantedDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  proctoring?: string;
  cases?: number;
}

interface VerificationRecord {
  id: string;
  staffId: string;
  verificationType: string;
  source: string;
  verificationDate: string;
  verifiedBy: string;
  result: 'verified' | 'discrepancy' | 'pending';
  notes: string;
}

interface StaffMember {
  id: string;
  name: string;
  title: string;
  department: string;
  employeeId: string;
  npi?: string;
  email: string;
  phone: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  licenses: License[];
  certifications: Certification[];
  privileges: Privilege[];
  verifications: VerificationRecord[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffCredentialingToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'staff-credentialing';

const staffColumns: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'employeeId', header: 'Employee ID', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'hireDate', header: 'Hire Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewStaffMember = (): StaffMember => ({
  id: crypto.randomUUID(),
  name: '',
  title: '',
  department: '',
  employeeId: '',
  npi: '',
  email: '',
  phone: '',
  hireDate: '',
  status: 'pending',
  licenses: [],
  certifications: [],
  privileges: [],
  verifications: [],
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createNewLicense = (): License => ({
  id: crypto.randomUUID(),
  type: '',
  licenseNumber: '',
  state: '',
  issueDate: '',
  expirationDate: '',
  status: 'active',
  verificationDate: '',
  verifiedBy: '',
});

const createNewCertification = (): Certification => ({
  id: crypto.randomUUID(),
  name: '',
  issuingBody: '',
  certificateNumber: '',
  issueDate: '',
  expirationDate: '',
  status: 'active',
  ceuRequired: 0,
  ceuCompleted: 0,
});

const createNewPrivilege = (): Privilege => ({
  id: crypto.randomUUID(),
  category: '',
  privilege: '',
  grantedDate: '',
  expirationDate: '',
  status: 'active',
  proctoring: '',
  cases: 0,
});

const createNewVerification = (staffId: string): VerificationRecord => ({
  id: crypto.randomUUID(),
  staffId,
  verificationType: '',
  source: '',
  verificationDate: new Date().toISOString().split('T')[0],
  verifiedBy: '',
  result: 'pending',
  notes: '',
});

const departments = [
  'Emergency Medicine',
  'Internal Medicine',
  'Surgery',
  'Pediatrics',
  'Obstetrics/Gynecology',
  'Radiology',
  'Pathology',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Oncology',
  'Psychiatry',
  'Anesthesiology',
  'Family Medicine',
  'Nursing',
  'Pharmacy',
  'Laboratory',
  'Rehabilitation',
  'Administration',
];

const licenseTypes = [
  'Medical Doctor (MD)',
  'Doctor of Osteopathy (DO)',
  'Registered Nurse (RN)',
  'Licensed Practical Nurse (LPN)',
  'Nurse Practitioner (NP)',
  'Physician Assistant (PA)',
  'Pharmacist (PharmD)',
  'Physical Therapist (PT)',
  'Occupational Therapist (OT)',
  'Respiratory Therapist (RT)',
  'Radiologic Technologist (RT)',
  'Medical Technologist (MT)',
  'Certified Nursing Assistant (CNA)',
  'Emergency Medical Technician (EMT)',
  'Paramedic',
  'Social Worker (LCSW)',
  'Psychologist (PhD/PsyD)',
];

const certificationBodies = [
  'American Board of Medical Specialties (ABMS)',
  'American Heart Association (AHA)',
  'American Nurses Credentialing Center (ANCC)',
  'National Commission on Certification of Physician Assistants (NCCPA)',
  'Board of Pharmacy Specialties (BPS)',
  'American Registry of Radiologic Technologists (ARRT)',
  'American Society for Clinical Pathology (ASCP)',
  'Commission on Accreditation of Allied Health Education Programs (CAAHEP)',
  'National Board for Certification in Occupational Therapy (NBCOT)',
  'American Board of Physical Therapy Specialties (ABPTS)',
];

const privilegeCategories = [
  'Admitting',
  'Surgical',
  'Consultation',
  'Emergency',
  'Obstetrical',
  'Anesthesia',
  'Radiology',
  'Pathology',
  'Allied Health',
  'Telemedicine',
];

const verificationTypes = [
  'License Verification',
  'Board Certification',
  'Education Verification',
  'Employment History',
  'Malpractice History',
  'Criminal Background',
  'DEA Registration',
  'Peer References',
  'Sanctions Check',
  'OIG Exclusion Check',
];

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export const StaffCredentialingTool: React.FC<StaffCredentialingToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: staffMembers,
    addItem: addStaffMember,
    updateItem: updateStaffMember,
    deleteItem: deleteStaffMember,
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
  } = useToolData<StaffMember>(TOOL_ID, [], staffColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCredentialStatus, setFilterCredentialStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showPrivilegeModal, setShowPrivilegeModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<StaffMember>(createNewStaffMember());
  const [licenseForm, setLicenseForm] = useState<License>(createNewLicense());
  const [certForm, setCertForm] = useState<Certification>(createNewCertification());
  const [privilegeForm, setPrivilegeForm] = useState<Privilege>(createNewPrivilege());
  const [verificationForm, setVerificationForm] = useState<VerificationRecord>(createNewVerification(''));
  const [activeTab, setActiveTab] = useState<'licenses' | 'certifications' | 'privileges' | 'verifications'>('licenses');
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [editingPrivilege, setEditingPrivilege] = useState<Privilege | null>(null);

  // Calculate expiring credentials
  const getExpiringCredentials = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    let expiring30 = 0;
    let expiring60 = 0;
    let expiring90 = 0;
    let expired = 0;

    staffMembers.forEach(staff => {
      [...staff.licenses, ...staff.certifications, ...staff.privileges].forEach(cred => {
        if ('expirationDate' in cred && cred.expirationDate) {
          const expDate = new Date(cred.expirationDate);
          if (expDate < now) {
            expired++;
          } else if (expDate <= thirtyDaysFromNow) {
            expiring30++;
          } else if (expDate <= sixtyDaysFromNow) {
            expiring60++;
          } else if (expDate <= ninetyDaysFromNow) {
            expiring90++;
          }
        }
      });
    });

    return { expiring30, expiring60, expiring90, expired };
  }, [staffMembers]);

  // Statistics
  const stats = useMemo(() => {
    const active = staffMembers.filter(s => s.status === 'active');
    const pending = staffMembers.filter(s => s.status === 'pending');
    const totalLicenses = staffMembers.reduce((acc, s) => acc + s.licenses.length, 0);
    const totalCerts = staffMembers.reduce((acc, s) => acc + s.certifications.length, 0);
    const totalPrivileges = staffMembers.reduce((acc, s) => acc + s.privileges.length, 0);
    const verifiedCount = staffMembers.reduce((acc, s) =>
      acc + s.verifications.filter(v => v.result === 'verified').length, 0);
    const pendingVerifications = staffMembers.reduce((acc, s) =>
      acc + s.verifications.filter(v => v.result === 'pending').length, 0);

    return {
      total: staffMembers.length,
      active: active.length,
      pending: pending.length,
      totalLicenses,
      totalCerts,
      totalPrivileges,
      verifiedCount,
      pendingVerifications,
      complianceRate: totalLicenses > 0
        ? Math.round((staffMembers.reduce((acc, s) =>
            acc + s.licenses.filter(l => l.status === 'active').length, 0) / totalLicenses) * 100)
        : 100,
    };
  }, [staffMembers]);

  // Check if staff has any expiring or expired credentials
  const getStaffCredentialStatus = (staff: StaffMember) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let hasExpired = false;
    let hasExpiring = false;

    [...staff.licenses, ...staff.certifications, ...staff.privileges].forEach(cred => {
      if ('expirationDate' in cred && cred.expirationDate) {
        const expDate = new Date(cred.expirationDate);
        if (expDate < now) {
          hasExpired = true;
        } else if (expDate <= thirtyDaysFromNow) {
          hasExpiring = true;
        }
      }
    });

    if (hasExpired) return 'expired';
    if (hasExpiring) return 'expiring';
    return 'current';
  };

  // Filtered staff members
  const filteredStaff = useMemo(() => {
    return staffMembers.filter(staff => {
      const matchesSearch = searchQuery === '' ||
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = filterDepartment === '' || staff.department === filterDepartment;
      const matchesStatus = filterStatus === '' || staff.status === filterStatus;
      const matchesCredStatus = filterCredentialStatus === '' || getStaffCredentialStatus(staff) === filterCredentialStatus;
      return matchesSearch && matchesDepartment && matchesStatus && matchesCredStatus;
    });
  }, [staffMembers, searchQuery, filterDepartment, filterStatus, filterCredentialStatus]);

  const handleSave = () => {
    if (editingStaff) {
      updateStaffMember(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addStaffMember({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingStaff(null);
    setFormData(createNewStaffMember());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Staff Member',
      message: 'Are you sure you want to delete this staff member record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteStaffMember(id);
      if (selectedStaff?.id === id) setSelectedStaff(null);
    }
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData(staff);
    setShowModal(true);
  };

  // License handlers
  const saveLicense = () => {
    if (selectedStaff) {
      let updatedLicenses: License[];
      if (editingLicense) {
        updatedLicenses = selectedStaff.licenses.map(l => l.id === editingLicense.id ? licenseForm : l);
      } else {
        updatedLicenses = [...selectedStaff.licenses, licenseForm];
      }
      const updated = { ...selectedStaff, licenses: updatedLicenses, updatedAt: new Date().toISOString() };
      updateStaffMember(selectedStaff.id, updated);
      setSelectedStaff(updated);
      setShowLicenseModal(false);
      setLicenseForm(createNewLicense());
      setEditingLicense(null);
    }
  };

  const deleteLicense = async (licenseId: string) => {
    if (!selectedStaff) return;
    const confirmed = await confirm({
      title: 'Delete License',
      message: 'Are you sure you want to delete this license?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      const updatedLicenses = selectedStaff.licenses.filter(l => l.id !== licenseId);
      const updated = { ...selectedStaff, licenses: updatedLicenses, updatedAt: new Date().toISOString() };
      updateStaffMember(selectedStaff.id, updated);
      setSelectedStaff(updated);
    }
  };

  // Certification handlers
  const saveCertification = () => {
    if (selectedStaff) {
      let updatedCerts: Certification[];
      if (editingCert) {
        updatedCerts = selectedStaff.certifications.map(c => c.id === editingCert.id ? certForm : c);
      } else {
        updatedCerts = [...selectedStaff.certifications, certForm];
      }
      const updated = { ...selectedStaff, certifications: updatedCerts, updatedAt: new Date().toISOString() };
      updateStaffMember(selectedStaff.id, updated);
      setSelectedStaff(updated);
      setShowCertModal(false);
      setCertForm(createNewCertification());
      setEditingCert(null);
    }
  };

  const deleteCertification = async (certId: string) => {
    if (!selectedStaff) return;
    const confirmed = await confirm({
      title: 'Delete Certification',
      message: 'Are you sure you want to delete this certification?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      const updatedCerts = selectedStaff.certifications.filter(c => c.id !== certId);
      const updated = { ...selectedStaff, certifications: updatedCerts, updatedAt: new Date().toISOString() };
      updateStaffMember(selectedStaff.id, updated);
      setSelectedStaff(updated);
    }
  };

  // Privilege handlers
  const savePrivilege = () => {
    if (selectedStaff) {
      let updatedPrivileges: Privilege[];
      if (editingPrivilege) {
        updatedPrivileges = selectedStaff.privileges.map(p => p.id === editingPrivilege.id ? privilegeForm : p);
      } else {
        updatedPrivileges = [...selectedStaff.privileges, privilegeForm];
      }
      const updated = { ...selectedStaff, privileges: updatedPrivileges, updatedAt: new Date().toISOString() };
      updateStaffMember(selectedStaff.id, updated);
      setSelectedStaff(updated);
      setShowPrivilegeModal(false);
      setPrivilegeForm(createNewPrivilege());
      setEditingPrivilege(null);
    }
  };

  const deletePrivilege = async (privilegeId: string) => {
    if (!selectedStaff) return;
    const confirmed = await confirm({
      title: 'Delete Privilege',
      message: 'Are you sure you want to delete this privilege?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      const updatedPrivileges = selectedStaff.privileges.filter(p => p.id !== privilegeId);
      const updated = { ...selectedStaff, privileges: updatedPrivileges, updatedAt: new Date().toISOString() };
      updateStaffMember(selectedStaff.id, updated);
      setSelectedStaff(updated);
    }
  };

  // Verification handlers
  const saveVerification = () => {
    if (selectedStaff) {
      const updatedVerifications = [...selectedStaff.verifications, verificationForm];
      const updated = { ...selectedStaff, verifications: updatedVerifications, updatedAt: new Date().toISOString() };
      updateStaffMember(selectedStaff.id, updated);
      setSelectedStaff(updated);
      setShowVerificationModal(false);
      setVerificationForm(createNewVerification(selectedStaff.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'terminated': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending-renewal': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'suspended': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'revoked': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'verified': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'discrepancy': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCredentialStatusBadge = (staff: StaffMember) => {
    const status = getStaffCredentialStatus(staff);
    switch (status) {
      case 'expired':
        return <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/30">Expired</span>;
      case 'expiring':
        return <span className="px-2 py-0.5 text-xs rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">Expiring Soon</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">Current</span>;
    }
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const exp = new Date(expirationDate);
    const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
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

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-400'
      : theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <BadgeCheck className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.staffCredentialing.staffCredentialing', 'Staff Credentialing')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.staffCredentialing.manageHealthcareStaffCredentialsLicenses', 'Manage healthcare staff credentials, licenses, and certifications')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="staff-credentialing" toolName="Staff Credentialing" />

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
            onExportCSV={() => exportCSV({ filename: 'staff-credentialing' })}
            onExportExcel={() => exportExcel({ filename: 'staff-credentialing' })}
            onExportJSON={() => exportJSON({ filename: 'staff-credentialing' })}
            onExportPDF={() => exportPDF({ filename: 'staff-credentialing', title: 'Staff Credentialing Records' })}
            onPrint={() => print('Staff Credentialing Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={staffMembers.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewStaffMember()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.staffCredentialing.addStaff', 'Add Staff')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <User className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.staffCredentialing.totalStaff', 'Total Staff')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.staffCredentialing.active', 'Active')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.staffCredentialing.licenses', 'Licenses')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.totalLicenses}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Award className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.staffCredentialing.certifications', 'Certifications')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.totalCerts}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.staffCredentialing.expiring', 'Expiring')}</p>
              <p className="text-2xl font-bold text-orange-500">{getExpiringCredentials.expiring30}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.staffCredentialing.compliance', 'Compliance')}</p>
              <p className="text-2xl font-bold text-teal-500">{stats.complianceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expiration Alerts */}
      {(getExpiringCredentials.expired > 0 || getExpiringCredentials.expiring30 > 0) && (
        <div className={`${cardClass} p-4 mb-6 border-l-4 border-l-orange-500`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-500">{t('tools.staffCredentialing.credentialAlerts', 'Credential Alerts')}</h3>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                {getExpiringCredentials.expired > 0 && (
                  <span className="text-red-400">
                    <strong>{getExpiringCredentials.expired}</strong> expired credentials
                  </span>
                )}
                {getExpiringCredentials.expiring30 > 0 && (
                  <span className="text-orange-400">
                    <strong>{getExpiringCredentials.expiring30}</strong> expiring within 30 days
                  </span>
                )}
                {getExpiringCredentials.expiring60 > 0 && (
                  <span className="text-yellow-400">
                    <strong>{getExpiringCredentials.expiring60}</strong> expiring within 60 days
                  </span>
                )}
                {getExpiringCredentials.expiring90 > 0 && (
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    <strong>{getExpiringCredentials.expiring90}</strong> expiring within 90 days
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.staffCredentialing.searchByNameEmployeeId', 'Search by name, employee ID, or email...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.staffCredentialing.allDepartments', 'All Departments')}</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-36`}>
            <option value="">{t('tools.staffCredentialing.allStatus', 'All Status')}</option>
            <option value="active">{t('tools.staffCredentialing.active2', 'Active')}</option>
            <option value="inactive">{t('tools.staffCredentialing.inactive', 'Inactive')}</option>
            <option value="pending">{t('tools.staffCredentialing.pending', 'Pending')}</option>
            <option value="terminated">{t('tools.staffCredentialing.terminated', 'Terminated')}</option>
          </select>
          <select value={filterCredentialStatus} onChange={(e) => setFilterCredentialStatus(e.target.value)} className={`${inputClass} w-full sm:w-44`}>
            <option value="">{t('tools.staffCredentialing.allCredentials', 'All Credentials')}</option>
            <option value="current">{t('tools.staffCredentialing.current', 'Current')}</option>
            <option value="expiring">{t('tools.staffCredentialing.expiringSoon', 'Expiring Soon')}</option>
            <option value="expired">{t('tools.staffCredentialing.expired', 'Expired')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.staffCredentialing.staffRoster', 'Staff Roster')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.staffCredentialing.noStaffMembersFound', 'No staff members found')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredStaff.map(staff => (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedStaff?.id === staff.id
                        ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                        : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <User className="w-4 h-4 text-cyan-500" />
                        </div>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {staff.title}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {staff.department}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(staff.status)}`}>
                              {staff.status}
                            </span>
                            {getCredentialStatusBadge(staff)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(staff); }} className="p-1.5 hover:bg-gray-600 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(staff.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedStaff ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedStaff.name}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedStaff.status)}`}>
                        {selectedStaff.status}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedStaff.title} - {selectedStaff.department}
                    </p>
                  </div>
                  <button onClick={() => openEditModal(selectedStaff)} className={buttonSecondary}>
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Staff Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.employeeId', 'Employee ID')}</p>
                    </div>
                    <p className="font-medium">{selectedStaff.employeeId || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.npi', 'NPI')}</p>
                    </div>
                    <p className="font-medium">{selectedStaff.npi || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.email', 'Email')}</p>
                    </div>
                    <p className="font-medium text-sm truncate">{selectedStaff.email || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.hireDate', 'Hire Date')}</p>
                    </div>
                    <p className="font-medium">{selectedStaff.hireDate || 'N/A'}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setActiveTab('licenses')} className={tabClass(activeTab === 'licenses')}>
                    <FileText className="w-4 h-4 inline-block mr-1" />
                    Licenses ({selectedStaff.licenses.length})
                  </button>
                  <button onClick={() => setActiveTab('certifications')} className={tabClass(activeTab === 'certifications')}>
                    <Award className="w-4 h-4 inline-block mr-1" />
                    Certifications ({selectedStaff.certifications.length})
                  </button>
                  <button onClick={() => setActiveTab('privileges')} className={tabClass(activeTab === 'privileges')}>
                    <Shield className="w-4 h-4 inline-block mr-1" />
                    Privileges ({selectedStaff.privileges.length})
                  </button>
                  <button onClick={() => setActiveTab('verifications')} className={tabClass(activeTab === 'verifications')}>
                    <CheckCircle2 className="w-4 h-4 inline-block mr-1" />
                    Verifications ({selectedStaff.verifications.length})
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'licenses' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{t('tools.staffCredentialing.licenses2', 'Licenses')}</h3>
                      <button onClick={() => { setLicenseForm(createNewLicense()); setEditingLicense(null); setShowLicenseModal(true); }} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add License
                      </button>
                    </div>
                    {selectedStaff.licenses.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.staffCredentialing.noLicensesRecorded', 'No licenses recorded')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedStaff.licenses.map(license => {
                          const daysLeft = getDaysUntilExpiration(license.expirationDate);
                          return (
                            <div key={license.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium">{license.type}</p>
                                    <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(license.status)}`}>
                                      {license.status}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-2">
                                    <div>
                                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.license', 'License #')}</p>
                                      <p>{license.licenseNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.state', 'State')}</p>
                                      <p>{license.state}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.issued', 'Issued')}</p>
                                      <p>{license.issueDate}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.expires', 'Expires')}</p>
                                      <p className={daysLeft <= 30 ? 'text-orange-400' : daysLeft <= 0 ? 'text-red-400' : ''}>
                                        {license.expirationDate}
                                        {daysLeft > 0 && daysLeft <= 90 && (
                                          <span className="text-xs ml-1">({daysLeft}d)</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  {license.verificationDate && (
                                    <p className="text-xs text-gray-400 mt-2">
                                      Verified: {license.verificationDate} by {license.verifiedBy}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => { setLicenseForm(license); setEditingLicense(license); setShowLicenseModal(true); }} className="p-1.5 hover:bg-gray-600 rounded">
                                    <Edit2 className="w-4 h-4 text-gray-400" />
                                  </button>
                                  <button onClick={() => deleteLicense(license.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'certifications' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{t('tools.staffCredentialing.certifications2', 'Certifications')}</h3>
                      <button onClick={() => { setCertForm(createNewCertification()); setEditingCert(null); setShowCertModal(true); }} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Certification
                      </button>
                    </div>
                    {selectedStaff.certifications.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.staffCredentialing.noCertificationsRecorded', 'No certifications recorded')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedStaff.certifications.map(cert => {
                          const daysLeft = getDaysUntilExpiration(cert.expirationDate);
                          const ceuProgress = cert.ceuRequired > 0 ? Math.min((cert.ceuCompleted / cert.ceuRequired) * 100, 100) : 100;
                          return (
                            <div key={cert.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium">{cert.name}</p>
                                    <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(cert.status)}`}>
                                      {cert.status}
                                    </span>
                                  </div>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {cert.issuingBody}
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-2">
                                    <div>
                                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.certificate', 'Certificate #')}</p>
                                      <p>{cert.certificateNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.issued2', 'Issued')}</p>
                                      <p>{cert.issueDate}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.expires2', 'Expires')}</p>
                                      <p className={daysLeft <= 30 ? 'text-orange-400' : daysLeft <= 0 ? 'text-red-400' : ''}>
                                        {cert.expirationDate}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.ceuProgress', 'CEU Progress')}</p>
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-cyan-500 rounded-full"
                                            style={{ width: `${ceuProgress}%` }}
                                          />
                                        </div>
                                        <span className="text-xs">{cert.ceuCompleted}/{cert.ceuRequired}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => { setCertForm(cert); setEditingCert(cert); setShowCertModal(true); }} className="p-1.5 hover:bg-gray-600 rounded">
                                    <Edit2 className="w-4 h-4 text-gray-400" />
                                  </button>
                                  <button onClick={() => deleteCertification(cert.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'privileges' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{t('tools.staffCredentialing.clinicalPrivileges', 'Clinical Privileges')}</h3>
                      <button onClick={() => { setPrivilegeForm(createNewPrivilege()); setEditingPrivilege(null); setShowPrivilegeModal(true); }} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Privilege
                      </button>
                    </div>
                    {selectedStaff.privileges.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.staffCredentialing.noPrivilegesRecorded', 'No privileges recorded')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedStaff.privileges.map(privilege => {
                          const daysLeft = getDaysUntilExpiration(privilege.expirationDate);
                          return (
                            <div key={privilege.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium">{privilege.privilege}</p>
                                    <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(privilege.status)}`}>
                                      {privilege.status}
                                    </span>
                                  </div>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Category: {privilege.category}
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-2">
                                    <div>
                                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.granted', 'Granted')}</p>
                                      <p>{privilege.grantedDate}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">{t('tools.staffCredentialing.expires3', 'Expires')}</p>
                                      <p className={daysLeft <= 30 ? 'text-orange-400' : daysLeft <= 0 ? 'text-red-400' : ''}>
                                        {privilege.expirationDate}
                                      </p>
                                    </div>
                                    {privilege.proctoring && (
                                      <div>
                                        <p className="text-xs text-gray-400">{t('tools.staffCredentialing.proctoring', 'Proctoring')}</p>
                                        <p>{privilege.proctoring}</p>
                                      </div>
                                    )}
                                    {privilege.cases !== undefined && privilege.cases > 0 && (
                                      <div>
                                        <p className="text-xs text-gray-400">{t('tools.staffCredentialing.casesRequired', 'Cases Required')}</p>
                                        <p>{privilege.cases}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => { setPrivilegeForm(privilege); setEditingPrivilege(privilege); setShowPrivilegeModal(true); }} className="p-1.5 hover:bg-gray-600 rounded">
                                    <Edit2 className="w-4 h-4 text-gray-400" />
                                  </button>
                                  <button onClick={() => deletePrivilege(privilege.id)} className="p-1.5 hover:bg-red-500/20 rounded">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'verifications' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{t('tools.staffCredentialing.primarySourceVerifications', 'Primary Source Verifications')}</h3>
                      <button onClick={() => { setVerificationForm(createNewVerification(selectedStaff.id)); setShowVerificationModal(true); }} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Verification
                      </button>
                    </div>
                    {selectedStaff.verifications.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.staffCredentialing.noVerificationsRecorded', 'No verifications recorded')}</p>
                    ) : (
                      <div className="space-y-3">
                        {[...selectedStaff.verifications].reverse().map(verification => (
                          <div key={verification.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{verification.verificationType}</p>
                                  <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(verification.result)}`}>
                                    {verification.result}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mt-2">
                                  <div>
                                    <p className="text-xs text-gray-400">{t('tools.staffCredentialing.source', 'Source')}</p>
                                    <p>{verification.source}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">{t('tools.staffCredentialing.date', 'Date')}</p>
                                    <p>{verification.verificationDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400">{t('tools.staffCredentialing.verifiedBy', 'Verified By')}</p>
                                    <p>{verification.verifiedBy}</p>
                                  </div>
                                </div>
                                {verification.notes && (
                                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {verification.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <BadgeCheck className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.staffCredentialing.selectAStaffMember', 'Select a staff member')}</p>
              <p className="text-sm">{t('tools.staffCredentialing.chooseAStaffMemberTo', 'Choose a staff member to view their credentials')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingStaff ? t('tools.staffCredentialing.editStaffMember', 'Edit Staff Member') : t('tools.staffCredentialing.addStaffMember', 'Add Staff Member')}</h2>
              <button onClick={() => { setShowModal(false); setEditingStaff(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.fullName', 'Full Name *')}</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.title', 'Title *')}</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder={t('tools.staffCredentialing.eGPhysicianRnPa', 'e.g., Physician, RN, PA')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.department', 'Department')}</label>
                  <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.staffCredentialing.selectDepartment', 'Select Department')}</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.employeeId2', 'Employee ID')}</label>
                  <input type="text" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.npiNumber', 'NPI Number')}</label>
                  <input type="text" value={formData.npi || ''} onChange={(e) => setFormData({ ...formData, npi: e.target.value })} className={inputClass} placeholder={t('tools.staffCredentialing.10DigitNpi', '10-digit NPI')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.status', 'Status')}</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                    <option value="pending">{t('tools.staffCredentialing.pending2', 'Pending')}</option>
                    <option value="active">{t('tools.staffCredentialing.active3', 'Active')}</option>
                    <option value="inactive">{t('tools.staffCredentialing.inactive2', 'Inactive')}</option>
                    <option value="terminated">{t('tools.staffCredentialing.terminated2', 'Terminated')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.email2', 'Email')}</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.phone', 'Phone')}</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.hireDate2', 'Hire Date')}</label>
                  <input type="date" value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.notes', 'Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingStaff(null); }} className={buttonSecondary}>{t('tools.staffCredentialing.cancel', 'Cancel')}</button>
                <button type="button" onClick={handleSave} disabled={!formData.name || !formData.title} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* License Modal */}
      {showLicenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingLicense ? t('tools.staffCredentialing.editLicense', 'Edit License') : t('tools.staffCredentialing.addLicense', 'Add License')}</h2>
              <button onClick={() => setShowLicenseModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.licenseType', 'License Type *')}</label>
                <select value={licenseForm.type} onChange={(e) => setLicenseForm({ ...licenseForm, type: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.staffCredentialing.selectType', 'Select Type')}</option>
                  {licenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.licenseNumber', 'License Number *')}</label>
                  <input type="text" value={licenseForm.licenseNumber} onChange={(e) => setLicenseForm({ ...licenseForm, licenseNumber: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.state2', 'State *')}</label>
                  <select value={licenseForm.state} onChange={(e) => setLicenseForm({ ...licenseForm, state: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.staffCredentialing.selectState', 'Select State')}</option>
                    {usStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.issueDate', 'Issue Date')}</label>
                  <input type="date" value={licenseForm.issueDate} onChange={(e) => setLicenseForm({ ...licenseForm, issueDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.expirationDate', 'Expiration Date *')}</label>
                  <input type="date" value={licenseForm.expirationDate} onChange={(e) => setLicenseForm({ ...licenseForm, expirationDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.status2', 'Status')}</label>
                  <select value={licenseForm.status} onChange={(e) => setLicenseForm({ ...licenseForm, status: e.target.value as any })} className={inputClass}>
                    <option value="active">{t('tools.staffCredentialing.active4', 'Active')}</option>
                    <option value="pending-renewal">{t('tools.staffCredentialing.pendingRenewal', 'Pending Renewal')}</option>
                    <option value="expired">{t('tools.staffCredentialing.expired2', 'Expired')}</option>
                    <option value="suspended">{t('tools.staffCredentialing.suspended', 'Suspended')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.verificationDate', 'Verification Date')}</label>
                  <input type="date" value={licenseForm.verificationDate || ''} onChange={(e) => setLicenseForm({ ...licenseForm, verificationDate: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.verifiedBy2', 'Verified By')}</label>
                <input type="text" value={licenseForm.verifiedBy || ''} onChange={(e) => setLicenseForm({ ...licenseForm, verifiedBy: e.target.value })} className={inputClass} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowLicenseModal(false)} className={buttonSecondary}>{t('tools.staffCredentialing.cancel2', 'Cancel')}</button>
                <button type="button" onClick={saveLicense} disabled={!licenseForm.type || !licenseForm.licenseNumber || !licenseForm.state || !licenseForm.expirationDate} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingCert ? t('tools.staffCredentialing.editCertification', 'Edit Certification') : t('tools.staffCredentialing.addCertification', 'Add Certification')}</h2>
              <button onClick={() => setShowCertModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.certificationName', 'Certification Name *')}</label>
                <input type="text" value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} className={inputClass} placeholder={t('tools.staffCredentialing.eGBlsAclsBoard', 'e.g., BLS, ACLS, Board Certified')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.issuingBody', 'Issuing Body')}</label>
                <select value={certForm.issuingBody} onChange={(e) => setCertForm({ ...certForm, issuingBody: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.staffCredentialing.selectIssuingBody', 'Select Issuing Body')}</option>
                  {certificationBodies.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.certificateNumber', 'Certificate Number')}</label>
                  <input type="text" value={certForm.certificateNumber} onChange={(e) => setCertForm({ ...certForm, certificateNumber: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.status3', 'Status')}</label>
                  <select value={certForm.status} onChange={(e) => setCertForm({ ...certForm, status: e.target.value as any })} className={inputClass}>
                    <option value="active">{t('tools.staffCredentialing.active5', 'Active')}</option>
                    <option value="pending">{t('tools.staffCredentialing.pending3', 'Pending')}</option>
                    <option value="expired">{t('tools.staffCredentialing.expired3', 'Expired')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.issueDate2', 'Issue Date')}</label>
                  <input type="date" value={certForm.issueDate} onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.expirationDate2', 'Expiration Date *')}</label>
                  <input type="date" value={certForm.expirationDate} onChange={(e) => setCertForm({ ...certForm, expirationDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.ceuRequired', 'CEU Required')}</label>
                  <input type="number" value={certForm.ceuRequired} onChange={(e) => setCertForm({ ...certForm, ceuRequired: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.ceuCompleted', 'CEU Completed')}</label>
                  <input type="number" value={certForm.ceuCompleted} onChange={(e) => setCertForm({ ...certForm, ceuCompleted: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowCertModal(false)} className={buttonSecondary}>{t('tools.staffCredentialing.cancel3', 'Cancel')}</button>
                <button type="button" onClick={saveCertification} disabled={!certForm.name || !certForm.expirationDate} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privilege Modal */}
      {showPrivilegeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingPrivilege ? t('tools.staffCredentialing.editPrivilege', 'Edit Privilege') : t('tools.staffCredentialing.addPrivilege', 'Add Privilege')}</h2>
              <button onClick={() => setShowPrivilegeModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.category', 'Category *')}</label>
                <select value={privilegeForm.category} onChange={(e) => setPrivilegeForm({ ...privilegeForm, category: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.staffCredentialing.selectCategory', 'Select Category')}</option>
                  {privilegeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.privilege', 'Privilege *')}</label>
                <input type="text" value={privilegeForm.privilege} onChange={(e) => setPrivilegeForm({ ...privilegeForm, privilege: e.target.value })} className={inputClass} placeholder={t('tools.staffCredentialing.eGGeneralSurgeryIcu', 'e.g., General Surgery, ICU Admission')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.grantedDate', 'Granted Date')}</label>
                  <input type="date" value={privilegeForm.grantedDate} onChange={(e) => setPrivilegeForm({ ...privilegeForm, grantedDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.expirationDate3', 'Expiration Date *')}</label>
                  <input type="date" value={privilegeForm.expirationDate} onChange={(e) => setPrivilegeForm({ ...privilegeForm, expirationDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.status4', 'Status')}</label>
                  <select value={privilegeForm.status} onChange={(e) => setPrivilegeForm({ ...privilegeForm, status: e.target.value as any })} className={inputClass}>
                    <option value="active">{t('tools.staffCredentialing.active6', 'Active')}</option>
                    <option value="expired">{t('tools.staffCredentialing.expired4', 'Expired')}</option>
                    <option value="suspended">{t('tools.staffCredentialing.suspended2', 'Suspended')}</option>
                    <option value="revoked">{t('tools.staffCredentialing.revoked', 'Revoked')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.casesRequired2', 'Cases Required')}</label>
                  <input type="number" value={privilegeForm.cases || 0} onChange={(e) => setPrivilegeForm({ ...privilegeForm, cases: parseInt(e.target.value) || 0 })} className={inputClass} min="0" />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.proctoringRequirements', 'Proctoring Requirements')}</label>
                <input type="text" value={privilegeForm.proctoring || ''} onChange={(e) => setPrivilegeForm({ ...privilegeForm, proctoring: e.target.value })} className={inputClass} placeholder={t('tools.staffCredentialing.eG5ProctoredCases', 'e.g., 5 proctored cases required')} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowPrivilegeModal(false)} className={buttonSecondary}>{t('tools.staffCredentialing.cancel4', 'Cancel')}</button>
                <button type="button" onClick={savePrivilege} disabled={!privilegeForm.category || !privilegeForm.privilege || !privilegeForm.expirationDate} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.staffCredentialing.addVerificationRecord', 'Add Verification Record')}</h2>
              <button onClick={() => setShowVerificationModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.verificationType', 'Verification Type *')}</label>
                <select value={verificationForm.verificationType} onChange={(e) => setVerificationForm({ ...verificationForm, verificationType: e.target.value })} className={inputClass}>
                  <option value="">{t('tools.staffCredentialing.selectType2', 'Select Type')}</option>
                  {verificationTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.source2', 'Source *')}</label>
                <input type="text" value={verificationForm.source} onChange={(e) => setVerificationForm({ ...verificationForm, source: e.target.value })} className={inputClass} placeholder={t('tools.staffCredentialing.eGStateBoardNpdb', 'e.g., State Board, NPDB, Institution')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.verificationDate2', 'Verification Date')}</label>
                  <input type="date" value={verificationForm.verificationDate} onChange={(e) => setVerificationForm({ ...verificationForm, verificationDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.staffCredentialing.result', 'Result *')}</label>
                  <select value={verificationForm.result} onChange={(e) => setVerificationForm({ ...verificationForm, result: e.target.value as any })} className={inputClass}>
                    <option value="pending">{t('tools.staffCredentialing.pending4', 'Pending')}</option>
                    <option value="verified">{t('tools.staffCredentialing.verified', 'Verified')}</option>
                    <option value="discrepancy">{t('tools.staffCredentialing.discrepancyFound', 'Discrepancy Found')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.verifiedBy3', 'Verified By *')}</label>
                <input type="text" value={verificationForm.verifiedBy} onChange={(e) => setVerificationForm({ ...verificationForm, verifiedBy: e.target.value })} className={inputClass} placeholder={t('tools.staffCredentialing.nameOfVerifier', 'Name of verifier')} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.staffCredentialing.notes2', 'Notes')}</label>
                <textarea value={verificationForm.notes} onChange={(e) => setVerificationForm({ ...verificationForm, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setShowVerificationModal(false)} className={buttonSecondary}>{t('tools.staffCredentialing.cancel5', 'Cancel')}</button>
                <button type="button" onClick={saveVerification} disabled={!verificationForm.verificationType || !verificationForm.source || !verificationForm.verifiedBy} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.staffCredentialing.aboutStaffCredentialing', 'About Staff Credentialing')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage healthcare staff credentials including professional licenses, board certifications, and clinical privileges.
          Track expiration dates, CEU requirements, and primary source verifications. Monitor compliance rates and receive
          alerts for expiring credentials to maintain regulatory compliance.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default StaffCredentialingTool;
