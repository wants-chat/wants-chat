'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface DaycareManagementToolProps {
  uiConfig?: UIConfig;
}
import {
  Baby,
  Users,
  Phone,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Shield,
  Heart,
  Utensils,
  Moon,
  Activity,
  Camera,
  DollarSign,
  FileText,
  UserCheck,
  Building,
  ClipboardList,
  Bell,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Syringe,
} from 'lucide-react';

// Types
interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isAuthorizedPickup: boolean;
}

interface Guardian {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  isPrimary: boolean;
  isAuthorizedPickup: boolean;
}

interface VaccinationRecord {
  id: string;
  vaccineName: string;
  dateAdministered: string;
  nextDueDate?: string;
  provider: string;
  notes?: string;
}

interface HealthRecord {
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  doctorName: string;
  doctorPhone: string;
  insuranceProvider?: string;
  insuranceId?: string;
  specialNeeds?: string;
  dietaryRestrictions: string[];
  vaccinations: VaccinationRecord[];
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  profilePhoto?: string;
  classroomId: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'waitlist';
  guardians: Guardian[];
  emergencyContacts: EmergencyContact[];
  authorizedPickups: string[];
  healthRecord: HealthRecord;
  photoConsent: boolean;
  notes?: string;
}

interface AttendanceRecord {
  id: string;
  childId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInBy?: string;
  checkOutBy?: string;
  status: 'present' | 'absent' | 'late' | 'early-pickup';
  notes?: string;
}

interface ActivityLog {
  id: string;
  childId: string;
  date: string;
  time: string;
  type: 'meal' | 'nap' | 'diaper' | 'activity' | 'medication' | 'milestone';
  description: string;
  notes?: string;
  staffId: string;
}

interface IncidentReport {
  id: string;
  childId: string;
  date: string;
  time: string;
  type: 'injury' | 'illness' | 'behavior' | 'other';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  actionTaken: string;
  witnessedBy: string[];
  parentNotified: boolean;
  parentNotifiedTime?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  staffId: string;
}

interface Classroom {
  id: string;
  name: string;
  ageGroup: string;
  capacity: number;
  minStaffRatio: number;
  assignedStaff: string[];
  description?: string;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'assistant' | 'director' | 'admin';
  email: string;
  phone: string;
  classroomIds: string[];
  certifications: string[];
  hireDate: string;
  status: 'active' | 'inactive';
}

interface PaymentRecord {
  id: string;
  childId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: string;
  description: string;
  notes?: string;
}

interface DaycareData {
  children: Child[];
  attendance: AttendanceRecord[];
  activityLogs: ActivityLog[];
  incidentReports: IncidentReport[];
  classrooms: Classroom[];
  staff: Staff[];
  payments: PaymentRecord[];
}

// Column configurations for export
const childColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
  { key: 'gender', header: 'Gender', type: 'string' },
  { key: 'classroomId', header: 'Classroom', type: 'string' },
  { key: 'enrollmentDate', header: 'Enrollment Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'photoConsent', header: 'Photo Consent', type: 'boolean' },
];

const attendanceColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'childId', header: 'Child ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'checkInTime', header: 'Check In', type: 'string' },
  { key: 'checkOutTime', header: 'Check Out', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

const activityLogColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'childId', header: 'Child ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'staffId', header: 'Staff ID', type: 'string' },
];

const incidentColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'childId', header: 'Child ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'severity', header: 'Severity', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'actionTaken', header: 'Action Taken', type: 'string' },
  { key: 'parentNotified', header: 'Parent Notified', type: 'boolean' },
];

const classroomColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'ageGroup', header: 'Age Group', type: 'string' },
  { key: 'capacity', header: 'Capacity', type: 'number' },
  { key: 'minStaffRatio', header: 'Staff Ratio', type: 'number' },
];

const staffColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'role', header: 'Role', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'hireDate', header: 'Hire Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
];

const paymentColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'childId', header: 'Child ID', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'paidDate', header: 'Paid Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
];

// Default data for classrooms
const defaultClassrooms: Classroom[] = [
  { id: 'infant', name: 'Infant Room', ageGroup: '0-12 months', capacity: 8, minStaffRatio: 4, assignedStaff: [], description: 'For babies up to 1 year' },
  { id: 'toddler', name: 'Toddler Room', ageGroup: '1-2 years', capacity: 12, minStaffRatio: 4, assignedStaff: [], description: 'For toddlers 1-2 years' },
  { id: 'preschool', name: 'Preschool Room', ageGroup: '3-4 years', capacity: 16, minStaffRatio: 8, assignedStaff: [], description: 'For preschoolers 3-4 years' },
  { id: 'prek', name: 'Pre-K Room', ageGroup: '4-5 years', capacity: 20, minStaffRatio: 10, assignedStaff: [], description: 'For pre-kindergarteners' },
];

type TabType = 'dashboard' | 'children' | 'attendance' | 'activities' | 'incidents' | 'classrooms' | 'staff' | 'payments' | 'reports';

export const DaycareManagementTool: React.FC<DaycareManagementToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showChildForm, setShowChildForm] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [filterClassroom, setFilterClassroom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Initialize useToolData hooks for each data type with backend sync
  // Extract sync status from children data hook (primary data source)
  const {
    data: childrenDataItems,
    setData: setChildrenData,
    addItem: addChild,
    updateItem: updateChild,
    deleteItem: deleteChild,
    clearData: clearChildrenData,
    resetToDefault: resetChildrenToDefault,
    exportCSV: exportChildrenCSV,
    exportExcel: exportChildrenExcel,
    exportJSON: exportChildrenJSON,
    exportPDF: exportChildrenPDF,
    copyToClipboard: copyChildrenToClipboard,
    print: printChildren,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Child>(
    'daycare-children',
    [],
    childColumns,
    { autoSave: true }
  );

  // Wrap in object for compatibility with existing code
  const childrenData = {
    data: childrenDataItems,
    setData: setChildrenData,
    addItem: addChild,
    updateItem: updateChild,
    deleteItem: deleteChild,
    clearData: clearChildrenData,
    resetToDefault: resetChildrenToDefault,
  };

  const attendanceData = useToolData<AttendanceRecord>(
    'daycare-attendance',
    [],
    attendanceColumns,
    { autoSave: true }
  );

  const activityLogsData = useToolData<ActivityLog>(
    'daycare-activity-logs',
    [],
    activityLogColumns,
    { autoSave: true }
  );

  const incidentReportsData = useToolData<IncidentReport>(
    'daycare-incidents',
    [],
    incidentColumns,
    { autoSave: true }
  );

  const classroomsData = useToolData<Classroom>(
    'daycare-classrooms',
    defaultClassrooms,
    classroomColumns,
    { autoSave: true }
  );

  const staffData = useToolData<Staff>(
    'daycare-staff',
    [],
    staffColumns,
    { autoSave: true }
  );

  const paymentsData = useToolData<PaymentRecord>(
    'daycare-payments',
    [],
    paymentColumns,
    { autoSave: true }
  );

  // Create a unified data object for compatibility with existing code
  const data: DaycareData = {
    children: childrenData.data,
    attendance: attendanceData.data,
    activityLogs: activityLogsData.data,
    incidentReports: incidentReportsData.data,
    classrooms: classroomsData.data,
    staff: staffData.data,
    payments: paymentsData.data,
  };

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const prefillData = uiConfig.prefillData as ToolPrefillData;
      if (prefillData.activeTab) setActiveTab(prefillData.activeTab as TabType);
      if (prefillData.searchTerm) setSearchTerm(prefillData.searchTerm as string);
      if (prefillData.filterClassroom) setFilterClassroom(prefillData.filterClassroom as string);
      if (prefillData.filterStatus) setFilterStatus(prefillData.filterStatus as string);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const calculateAge = (dob: string): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();

    if (years === 0) {
      return `${months + (months < 0 ? 12 : 0)} months`;
    }
    return `${years} year${years !== 1 ? 's' : ''}, ${Math.abs(months)} month${Math.abs(months) !== 1 ? 's' : ''}`;
  };

  const getChildFullName = (child: Child): string => `${child.firstName} ${child.lastName}`;

  const getClassroomName = (classroomId: string): string => {
    const classroom = data.classrooms.find(c => c.id === classroomId);
    return classroom?.name || 'Unassigned';
  };

  const getStaffName = (staffId: string): string => {
    const staff = data.staff.find(s => s.id === staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';
  };

  const getTodayAttendance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return data.attendance.filter(a => a.date === today);
  }, [data.attendance]);

  const getChildrenInClassroom = (classroomId: string): Child[] => {
    return data.children.filter(c => c.classroomId === classroomId && c.status === 'active');
  };

  const getStaffRatio = (classroomId: string): { current: number; required: number; compliant: boolean } => {
    const classroom = data.classrooms.find(c => c.id === classroomId);
    if (!classroom) return { current: 0, required: 0, compliant: true };

    const childCount = getChildrenInClassroom(classroomId).length;
    const staffCount = classroom.assignedStaff.length;
    const required = Math.ceil(childCount / classroom.minStaffRatio);

    return {
      current: staffCount,
      required,
      compliant: staffCount >= required,
    };
  };

  // Filter children
  const filteredChildren = useMemo(() => {
    return data.children.filter(child => {
      const matchesSearch = searchTerm === '' ||
        getChildFullName(child).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClassroom = filterClassroom === 'all' || child.classroomId === filterClassroom;
      const matchesStatus = filterStatus === 'all' || child.status === filterStatus;
      return matchesSearch && matchesClassroom && matchesStatus;
    });
  }, [data.children, searchTerm, filterClassroom, filterStatus]);

  // Stats for dashboard
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const activeChildren = data.children.filter(c => c.status === 'active').length;
    const presentToday = data.attendance.filter(a => a.date === today && a.checkInTime && !a.checkOutTime).length;
    const pendingPayments = data.payments.filter(p => p.status === 'pending' || p.status === 'overdue').length;
    const totalStaff = data.staff.filter(s => s.status === 'active').length;
    const incidentsThisMonth = data.incidentReports.filter(i => {
      const incidentDate = new Date(i.date);
      const now = new Date();
      return incidentDate.getMonth() === now.getMonth() && incidentDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      activeChildren,
      presentToday,
      pendingPayments,
      totalStaff,
      incidentsThisMonth,
      waitlistCount: data.children.filter(c => c.status === 'waitlist').length,
    };
  }, [data]);

  // Child Form State
  const [childForm, setChildForm] = useState<Partial<Child>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    classroomId: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active',
    guardians: [],
    emergencyContacts: [],
    authorizedPickups: [],
    healthRecord: {
      allergies: [],
      medicalConditions: [],
      medications: [],
      doctorName: '',
      doctorPhone: '',
      dietaryRestrictions: [],
      vaccinations: [],
    },
    photoConsent: false,
  });

  const resetChildForm = () => {
    setChildForm({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      classroomId: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      guardians: [],
      emergencyContacts: [],
      authorizedPickups: [],
      healthRecord: {
        allergies: [],
        medicalConditions: [],
        medications: [],
        doctorName: '',
        doctorPhone: '',
        dietaryRestrictions: [],
        vaccinations: [],
      },
      photoConsent: false,
    });
    setSelectedChild(null);
  };

  const handleSaveChild = () => {
    if (!childForm.firstName || !childForm.lastName || !childForm.dateOfBirth || !childForm.classroomId) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (selectedChild) {
      // Update existing child
      childrenData.updateItem(selectedChild.id, childForm as Partial<Child>);
    } else {
      // Add new child
      const newChild: Child = {
        ...childForm,
        id: generateId(),
        guardians: childForm.guardians || [],
        emergencyContacts: childForm.emergencyContacts || [],
        authorizedPickups: childForm.authorizedPickups || [],
        healthRecord: childForm.healthRecord || {
          allergies: [],
          medicalConditions: [],
          medications: [],
          doctorName: '',
          doctorPhone: '',
          dietaryRestrictions: [],
          vaccinations: [],
        },
      } as Child;
      childrenData.addItem(newChild);
    }

    setShowChildForm(false);
    resetChildForm();
  };

  const handleDeleteChild = async (childId: string) => {
    const confirmed = await confirm({
      title: 'Delete Child Record',
      message: 'Are you sure you want to delete this child record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      childrenData.deleteItem(childId);
      // Also delete associated records
      data.attendance.filter(a => a.childId === childId).forEach(a => attendanceData.deleteItem(a.id));
      data.activityLogs.filter(a => a.childId === childId).forEach(a => activityLogsData.deleteItem(a.id));
      data.incidentReports.filter(i => i.childId === childId).forEach(i => incidentReportsData.deleteItem(i.id));
      data.payments.filter(p => p.childId === childId).forEach(p => paymentsData.deleteItem(p.id));
    }
  };

  // Attendance functions
  const handleCheckIn = (childId: string, checkInBy: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });

    const existingRecord = data.attendance.find(a => a.childId === childId && a.date === today);

    if (existingRecord) {
      if (existingRecord.checkInTime) {
        setValidationMessage('Child is already checked in');
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }
      attendanceData.updateItem(existingRecord.id, { checkInTime: now, checkInBy, status: 'present' as const });
    } else {
      const newRecord: AttendanceRecord = {
        id: generateId(),
        childId,
        date: today,
        checkInTime: now,
        checkInBy,
        status: 'present',
      };
      attendanceData.addItem(newRecord);
    }
  };

  const handleCheckOut = (childId: string, checkOutBy: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });

    const existingRecord = data.attendance.find(a => a.childId === childId && a.date === today);

    if (!existingRecord || !existingRecord.checkInTime) {
      setValidationMessage('Child must be checked in first');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (existingRecord.checkOutTime) {
      setValidationMessage('Child is already checked out');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    attendanceData.updateItem(existingRecord.id, { checkOutTime: now, checkOutBy });
  };

  // Activity Log functions
  const [activityForm, setActivityForm] = useState({
    childId: '',
    type: 'meal' as ActivityLog['type'],
    description: '',
    notes: '',
    staffId: '',
  });

  const handleAddActivity = () => {
    if (!activityForm.childId || !activityForm.description || !activityForm.staffId) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newActivity: ActivityLog = {
      id: generateId(),
      childId: activityForm.childId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: activityForm.type,
      description: activityForm.description,
      notes: activityForm.notes,
      staffId: activityForm.staffId,
    };

    activityLogsData.addItem(newActivity);

    setActivityForm({
      childId: '',
      type: 'meal',
      description: '',
      notes: '',
      staffId: '',
    });
    setShowActivityModal(false);
  };

  // Incident Report functions
  const [incidentForm, setIncidentForm] = useState({
    childId: '',
    type: 'injury' as IncidentReport['type'],
    severity: 'minor' as IncidentReport['severity'],
    description: '',
    actionTaken: '',
    witnessedBy: [] as string[],
    parentNotified: false,
    followUpRequired: false,
    followUpNotes: '',
    staffId: '',
  });

  const handleAddIncident = () => {
    if (!incidentForm.childId || !incidentForm.description || !incidentForm.actionTaken || !incidentForm.staffId) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newIncident: IncidentReport = {
      id: generateId(),
      childId: incidentForm.childId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: incidentForm.type,
      severity: incidentForm.severity,
      description: incidentForm.description,
      actionTaken: incidentForm.actionTaken,
      witnessedBy: incidentForm.witnessedBy,
      parentNotified: incidentForm.parentNotified,
      parentNotifiedTime: incidentForm.parentNotified ? new Date().toLocaleTimeString('en-US', { hour12: false }) : undefined,
      followUpRequired: incidentForm.followUpRequired,
      followUpNotes: incidentForm.followUpNotes,
      staffId: incidentForm.staffId,
    };

    incidentReportsData.addItem(newIncident);

    setIncidentForm({
      childId: '',
      type: 'injury',
      severity: 'minor',
      description: '',
      actionTaken: '',
      witnessedBy: [],
      parentNotified: false,
      followUpRequired: false,
      followUpNotes: '',
      staffId: '',
    });
    setShowIncidentModal(false);
  };

  // Staff functions
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    role: 'teacher' as Staff['role'],
    email: '',
    phone: '',
    classroomIds: [] as string[],
    certifications: [] as string[],
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active' as Staff['status'],
  });

  const handleSaveStaff = () => {
    if (!staffForm.firstName || !staffForm.lastName || !staffForm.email || !staffForm.phone) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newStaff: Staff = {
      id: generateId(),
      ...staffForm,
    };

    staffData.addItem(newStaff);

    setStaffForm({
      firstName: '',
      lastName: '',
      role: 'teacher',
      email: '',
      phone: '',
      classroomIds: [],
      certifications: [],
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setShowStaffForm(false);
  };

  // Payment functions
  const [paymentForm, setPaymentForm] = useState({
    childId: '',
    amount: 0,
    dueDate: '',
    description: '',
    notes: '',
  });

  const handleAddPayment = () => {
    if (!paymentForm.childId || !paymentForm.amount || !paymentForm.dueDate) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newPayment: PaymentRecord = {
      id: generateId(),
      childId: paymentForm.childId,
      amount: paymentForm.amount,
      dueDate: paymentForm.dueDate,
      status: 'pending',
      description: paymentForm.description,
      notes: paymentForm.notes,
    };

    paymentsData.addItem(newPayment);

    setPaymentForm({
      childId: '',
      amount: 0,
      dueDate: '',
      description: '',
      notes: '',
    });
    setShowPaymentForm(false);
  };

  const handleMarkPaymentPaid = (paymentId: string, paymentMethod: string) => {
    paymentsData.updateItem(paymentId, {
      status: 'paid' as const,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod,
    });
  };

  // Export data - uses the children data hook's export for full export
  const handleExportData = () => {
    // Create a combined export of all data
    const exportData = {
      children: childrenData.data,
      attendance: attendanceData.data,
      activityLogs: activityLogsData.data,
      incidentReports: incidentReportsData.data,
      classrooms: classroomsData.data,
      staff: staffData.data,
      payments: paymentsData.data,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daycare-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          // Import each data type using the hooks
          if (imported.children) {
            childrenData.resetToDefault(imported.children);
          }
          if (imported.attendance) {
            attendanceData.resetToDefault(imported.attendance);
          }
          if (imported.activityLogs) {
            activityLogsData.resetToDefault(imported.activityLogs);
          }
          if (imported.incidentReports) {
            incidentReportsData.resetToDefault(imported.incidentReports);
          }
          if (imported.classrooms) {
            classroomsData.resetToDefault(imported.classrooms);
          }
          if (imported.staff) {
            staffData.resetToDefault(imported.staff);
          }
          if (imported.payments) {
            paymentsData.resetToDefault(imported.payments);
          }
          setValidationMessage('Data imported successfully!');
          setTimeout(() => setValidationMessage(null), 3000);
        } catch (error) {
          setValidationMessage('Failed to import data. Please check the file format.');
          setTimeout(() => setValidationMessage(null), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  // Clear all data
  const handleClearData = async () => {
    const confirmed = await confirm({
      title: 'Clear All Data',
      message: 'Are you sure you want to clear all data? This cannot be undone.',
      confirmText: 'Clear',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      childrenData.clearData();
      attendanceData.clearData();
      activityLogsData.clearData();
      incidentReportsData.clearData();
      classroomsData.resetToDefault(defaultClassrooms);
      staffData.clearData();
      paymentsData.clearData();
    }
  };

  // Styles
  const containerClass = `min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`;
  const cardClass = `${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border`;
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const inputClass = `w-full px-4 py-2.5 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-teal-500`;
  const buttonPrimary = 'bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2';
  const buttonSecondary = `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2`;

  // Tab button component
  const TabButton = ({ tab, icon: Icon, label }: { tab: TabType; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
        activeTab === tab
          ? 'bg-teal-600 text-white'
          : theme === 'dark'
          ? 'text-gray-300 hover:bg-gray-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  // Render Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <Baby className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${textClass}`}>{stats.activeChildren}</p>
              <p className={`text-xs ${mutedTextClass}`}>Active Children</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${textClass}`}>{stats.presentToday}</p>
              <p className={`text-xs ${mutedTextClass}`}>Present Today</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${textClass}`}>{stats.totalStaff}</p>
              <p className={`text-xs ${mutedTextClass}`}>Staff Members</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${textClass}`}>{stats.waitlistCount}</p>
              <p className={`text-xs ${mutedTextClass}`}>On Waitlist</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${textClass}`}>{stats.incidentsThisMonth}</p>
              <p className={`text-xs ${mutedTextClass}`}>Incidents (Month)</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${textClass}`}>{stats.pendingPayments}</p>
              <p className={`text-xs ${mutedTextClass}`}>Pending Payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Overview */}
      <div className={cardClass}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold ${textClass}`}>Classroom Overview</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.classrooms.map(classroom => {
              const childCount = getChildrenInClassroom(classroom.id).length;
              const ratio = getStaffRatio(classroom.id);
              return (
                <div key={classroom.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${textClass}`}>{classroom.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      ratio.compliant ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {ratio.compliant ? t('tools.daycareManagement.compliant', 'Compliant') : t('tools.daycareManagement.underStaffed', 'Under-staffed')}
                    </span>
                  </div>
                  <p className={`text-sm ${mutedTextClass}`}>{classroom.ageGroup}</p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={mutedTextClass}>{t('tools.daycareManagement.children', 'Children:')}</span>
                      <span className={textClass}>{childCount} / {classroom.capacity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={mutedTextClass}>{t('tools.daycareManagement.staff', 'Staff:')}</span>
                      <span className={textClass}>{ratio.current} / {ratio.required} required</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${(childCount / classroom.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activities & Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className={cardClass}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.recentActivities', 'Recent Activities')}</h3>
            <button onClick={() => setActiveTab('activities')} className="text-teal-500 text-sm hover:underline">
              {t('tools.daycareManagement.viewAll', 'View All')}
            </button>
          </div>
          <div className="p-4">
            {data.activityLogs.slice(-5).reverse().map(activity => {
              const child = data.children.find(c => c.id === activity.childId);
              return (
                <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'meal' ? 'bg-orange-100 dark:bg-orange-900' :
                    activity.type === 'nap' ? 'bg-blue-100 dark:bg-blue-900' :
                    activity.type === 'diaper' ? 'bg-purple-100 dark:bg-purple-900' :
                    'bg-green-100 dark:bg-green-900'
                  }`}>
                    {activity.type === 'meal' ? <Utensils className="w-4 h-4 text-orange-600" /> :
                     activity.type === 'nap' ? <Moon className="w-4 h-4 text-blue-600" /> :
                     activity.type === 'diaper' ? <Baby className="w-4 h-4 text-purple-600" /> :
                     <Activity className="w-4 h-4 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${textClass}`}>
                      {child ? getChildFullName(child) : 'Unknown'}
                    </p>
                    <p className={`text-xs ${mutedTextClass}`}>{activity.description}</p>
                    <p className={`text-xs ${mutedTextClass} mt-1`}>{activity.time}</p>
                  </div>
                </div>
              );
            })}
            {data.activityLogs.length === 0 && (
              <p className={`text-center py-4 ${mutedTextClass}`}>{t('tools.daycareManagement.noActivitiesRecordedYet', 'No activities recorded yet')}</p>
            )}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className={cardClass}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.recentIncidents', 'Recent Incidents')}</h3>
            <button onClick={() => setActiveTab('incidents')} className="text-teal-500 text-sm hover:underline">
              {t('tools.daycareManagement.viewAll2', 'View All')}
            </button>
          </div>
          <div className="p-4">
            {data.incidentReports.slice(-5).reverse().map(incident => {
              const child = data.children.find(c => c.id === incident.childId);
              return (
                <div key={incident.id} className="flex items-start gap-3 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className={`p-2 rounded-lg ${
                    incident.severity === 'severe' ? 'bg-red-100 dark:bg-red-900' :
                    incident.severity === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 ${
                      incident.severity === 'severe' ? 'text-red-600' :
                      incident.severity === 'moderate' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${textClass}`}>
                        {child ? getChildFullName(child) : 'Unknown'}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        incident.severity === 'severe' ? 'bg-red-100 text-red-700' :
                        incident.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className={`text-xs ${mutedTextClass}`}>{incident.description.substring(0, 50)}...</p>
                    <p className={`text-xs ${mutedTextClass} mt-1`}>{incident.date} at {incident.time}</p>
                  </div>
                </div>
              );
            })}
            {data.incidentReports.length === 0 && (
              <p className={`text-center py-4 ${mutedTextClass}`}>{t('tools.daycareManagement.noIncidentsRecorded', 'No incidents recorded')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Children Tab
  const renderChildren = () => (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
            <input
              type="text"
              placeholder={t('tools.daycareManagement.searchChildren', 'Search children...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={filterClassroom}
            onChange={(e) => setFilterClassroom(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('tools.daycareManagement.allClassrooms', 'All Classrooms')}</option>
            {data.classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('tools.daycareManagement.allStatus', 'All Status')}</option>
            <option value="active">{t('tools.daycareManagement.active', 'Active')}</option>
            <option value="inactive">{t('tools.daycareManagement.inactive', 'Inactive')}</option>
            <option value="waitlist">{t('tools.daycareManagement.waitlist', 'Waitlist')}</option>
          </select>
        </div>
        <button
          onClick={() => {
            resetChildForm();
            setShowChildForm(true);
          }}
          className={buttonPrimary}
        >
          <Plus className="w-4 h-4" />
          {t('tools.daycareManagement.addChild', 'Add Child')}
        </button>
      </div>

      {/* Children List */}
      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.child', 'Child')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.age', 'Age')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.classroom', 'Classroom')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.status', 'Status')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.guardian', 'Guardian')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.alerts', 'Alerts')}</th>
                <th className={`text-right p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map(child => (
                <tr key={child.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                        <span className="text-teal-600 font-semibold">
                          {child.firstName[0]}{child.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className={`font-medium ${textClass}`}>{getChildFullName(child)}</p>
                        <p className={`text-xs ${mutedTextClass}`}>DOB: {child.dateOfBirth}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`p-4 ${textClass}`}>{calculateAge(child.dateOfBirth)}</td>
                  <td className={`p-4 ${textClass}`}>{getClassroomName(child.classroomId)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      child.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      child.status === 'waitlist' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {child.status}
                    </span>
                  </td>
                  <td className={`p-4 ${textClass}`}>
                    {child.guardians.find(g => g.isPrimary)?.name || 'None'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {child.healthRecord.allergies.length > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded text-xs" title={`Allergies: ${child.healthRecord.allergies.join(', ')}`}>
                          {t('tools.daycareManagement.allergies', 'Allergies')}
                        </span>
                      )}
                      {child.healthRecord.medicalConditions.length > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded text-xs">
                          {t('tools.daycareManagement.medical', 'Medical')}
                        </span>
                      )}
                      {!child.photoConsent && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded text-xs">
                          {t('tools.daycareManagement.noPhoto', 'No Photo')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedChild(child);
                          setChildForm(child);
                          setShowChildForm(true);
                        }}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Eye className={`w-4 h-4 ${mutedTextClass}`} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedChild(child);
                          setChildForm(child);
                          setShowChildForm(true);
                        }}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 className={`w-4 h-4 ${mutedTextClass}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteChild(child.id)}
                        className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredChildren.length === 0 && (
            <div className={`p-8 text-center ${mutedTextClass}`}>
              <Baby className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.daycareManagement.noChildrenFound', 'No children found')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Attendance Tab
  const renderAttendance = () => {
    const activeChildren = data.children.filter(c => c.status === 'active');
    const todayAttendance = data.attendance.filter(a => a.date === selectedDate);

    return (
      <div className="space-y-6">
        {/* Date Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className={`w-5 h-5 ${mutedTextClass}`} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className={`flex items-center gap-4 ${textClass}`}>
            <span>Checked In: {todayAttendance.filter(a => a.checkInTime && !a.checkOutTime).length}</span>
            <span>Checked Out: {todayAttendance.filter(a => a.checkOutTime).length}</span>
            <span>Absent: {activeChildren.length - todayAttendance.filter(a => a.checkInTime).length}</span>
          </div>
        </div>

        {/* Attendance Grid */}
        <div className={cardClass}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.dailyAttendance', 'Daily Attendance')}</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeChildren.map(child => {
                const attendance = todayAttendance.find(a => a.childId === child.id);
                const isCheckedIn = attendance?.checkInTime && !attendance?.checkOutTime;
                const isCheckedOut = attendance?.checkOutTime;

                return (
                  <div key={child.id} className={`p-4 rounded-lg border ${
                    isCheckedIn ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                    isCheckedOut ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800' :
                    'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                          <span className="text-teal-600 text-sm font-semibold">
                            {child.firstName[0]}{child.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className={`font-medium ${textClass}`}>{getChildFullName(child)}</p>
                          <p className={`text-xs ${mutedTextClass}`}>{getClassroomName(child.classroomId)}</p>
                        </div>
                      </div>
                      {isCheckedIn && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {isCheckedOut && <XCircle className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {!attendance?.checkInTime && (
                        <button
                          onClick={() => handleCheckIn(child.id, 'Staff')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-1"
                        >
                          <Clock className="w-4 h-4" /> Check In
                        </button>
                      )}
                      {isCheckedIn && (
                        <button
                          onClick={() => handleCheckOut(child.id, 'Staff')}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-1"
                        >
                          <Clock className="w-4 h-4" /> Check Out
                        </button>
                      )}
                      {isCheckedOut && (
                        <div className={`flex-1 text-center text-sm ${mutedTextClass}`}>
                          <p>In: {attendance?.checkInTime}</p>
                          <p>Out: {attendance?.checkOutTime}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {activeChildren.length === 0 && (
              <div className={`p-8 text-center ${mutedTextClass}`}>
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.daycareManagement.noActiveChildrenEnrolled', 'No active children enrolled')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Calendar */}
        <div className={cardClass}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.attendanceHistory', 'Attendance History')}</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left p-3 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.child2', 'Child')}</th>
                  <th className={`text-left p-3 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.date', 'Date')}</th>
                  <th className={`text-left p-3 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.checkIn', 'Check In')}</th>
                  <th className={`text-left p-3 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.checkOut', 'Check Out')}</th>
                  <th className={`text-left p-3 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.status2', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {data.attendance.slice(-10).reverse().map(record => {
                  const child = data.children.find(c => c.id === record.childId);
                  return (
                    <tr key={record.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`p-3 ${textClass}`}>{child ? getChildFullName(child) : 'Unknown'}</td>
                      <td className={`p-3 ${textClass}`}>{record.date}</td>
                      <td className={`p-3 ${textClass}`}>{record.checkInTime || '-'}</td>
                      <td className={`p-3 ${textClass}`}>{record.checkOutTime || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present' ? 'bg-green-100 text-green-700' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Activities Tab
  const renderActivities = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.activityLogs', 'Activity Logs')}</h3>
        <button onClick={() => setShowActivityModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Log Activity
        </button>
      </div>

      <div className={cardClass}>
        <div className="p-4">
          {data.activityLogs.length > 0 ? (
            <div className="space-y-4">
              {data.activityLogs.slice().reverse().map(activity => {
                const child = data.children.find(c => c.id === activity.childId);
                return (
                  <div key={activity.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'meal' ? 'bg-orange-100 dark:bg-orange-900' :
                        activity.type === 'nap' ? 'bg-blue-100 dark:bg-blue-900' :
                        activity.type === 'diaper' ? 'bg-purple-100 dark:bg-purple-900' :
                        activity.type === 'medication' ? 'bg-red-100 dark:bg-red-900' :
                        activity.type === 'milestone' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-green-100 dark:bg-green-900'
                      }`}>
                        {activity.type === 'meal' ? <Utensils className="w-5 h-5 text-orange-600" /> :
                         activity.type === 'nap' ? <Moon className="w-5 h-5 text-blue-600" /> :
                         activity.type === 'diaper' ? <Baby className="w-5 h-5 text-purple-600" /> :
                         activity.type === 'medication' ? <Heart className="w-5 h-5 text-red-600" /> :
                         activity.type === 'milestone' ? <CheckCircle className="w-5 h-5 text-yellow-600" /> :
                         <Activity className="w-5 h-5 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${textClass}`}>
                              {child ? getChildFullName(child) : 'Unknown'}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} ${mutedTextClass}`}>
                              {activity.type}
                            </span>
                          </div>
                          <span className={`text-sm ${mutedTextClass}`}>{activity.date} {activity.time}</span>
                        </div>
                        <p className={`mt-2 ${textClass}`}>{activity.description}</p>
                        {activity.notes && <p className={`mt-1 text-sm ${mutedTextClass}`}>Notes: {activity.notes}</p>}
                        <p className={`text-xs mt-2 ${mutedTextClass}`}>Logged by: {getStaffName(activity.staffId)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-8 text-center ${mutedTextClass}`}>
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.daycareManagement.noActivitiesLoggedYet', 'No activities logged yet')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Incidents Tab
  const renderIncidents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.incidentReports', 'Incident Reports')}</h3>
        <button onClick={() => setShowIncidentModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Report Incident
        </button>
      </div>

      <div className={cardClass}>
        <div className="p-4">
          {data.incidentReports.length > 0 ? (
            <div className="space-y-4">
              {data.incidentReports.slice().reverse().map(incident => {
                const child = data.children.find(c => c.id === incident.childId);
                return (
                  <div key={incident.id} className={`p-4 rounded-lg border-l-4 ${
                    incident.severity === 'severe' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    incident.severity === 'moderate' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium ${textClass}`}>
                            {child ? getChildFullName(child) : 'Unknown'}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            incident.severity === 'severe' ? 'bg-red-100 text-red-700' :
                            incident.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {incident.severity}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} ${mutedTextClass}`}>
                            {incident.type}
                          </span>
                        </div>
                        <p className={`text-sm ${mutedTextClass}`}>{incident.date} at {incident.time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {incident.parentNotified && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{t('tools.daycareManagement.parentNotified', 'Parent Notified')}</span>
                        )}
                        {incident.followUpRequired && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{t('tools.daycareManagement.followUpRequired', 'Follow-up Required')}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className={`text-sm font-medium ${textClass}`}>{t('tools.daycareManagement.description', 'Description:')}</p>
                        <p className={`text-sm ${mutedTextClass}`}>{incident.description}</p>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${textClass}`}>{t('tools.daycareManagement.actionTaken', 'Action Taken:')}</p>
                        <p className={`text-sm ${mutedTextClass}`}>{incident.actionTaken}</p>
                      </div>
                      {incident.followUpNotes && (
                        <div>
                          <p className={`text-sm font-medium ${textClass}`}>{t('tools.daycareManagement.followUpNotes', 'Follow-up Notes:')}</p>
                          <p className={`text-sm ${mutedTextClass}`}>{incident.followUpNotes}</p>
                        </div>
                      )}
                      <p className={`text-xs ${mutedTextClass}`}>Reported by: {getStaffName(incident.staffId)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-8 text-center ${mutedTextClass}`}>
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.daycareManagement.noIncidentsReported', 'No incidents reported')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Classrooms Tab
  const renderClassrooms = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.classroomsRatios', 'Classrooms & Ratios')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.classrooms.map(classroom => {
          const children = getChildrenInClassroom(classroom.id);
          const ratio = getStaffRatio(classroom.id);
          const assignedStaff = data.staff.filter(s => classroom.assignedStaff.includes(s.id));

          return (
            <div key={classroom.id} className={cardClass}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                      <Building className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${textClass}`}>{classroom.name}</h4>
                      <p className={`text-sm ${mutedTextClass}`}>{classroom.ageGroup}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ratio.compliant ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {ratio.compliant ? t('tools.daycareManagement.compliant2', 'Compliant') : t('tools.daycareManagement.underStaffed2', 'Under-staffed')}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.capacity', 'Capacity')}</p>
                    <p className={`text-xl font-bold ${textClass}`}>{children.length} / {classroom.capacity}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${mutedTextClass}`}>Staff Ratio (1:{classroom.minStaffRatio})</p>
                    <p className={`text-xl font-bold ${textClass}`}>{ratio.current} / {ratio.required} needed</p>
                  </div>
                </div>

                <div>
                  <p className={`text-sm font-medium mb-2 ${textClass}`}>Enrolled Children ({children.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {children.slice(0, 5).map(child => (
                      <span key={child.id} className={`px-2 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} ${textClass}`}>
                        {child.firstName} {child.lastName[0]}.
                      </span>
                    ))}
                    {children.length > 5 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} ${mutedTextClass}`}>
                        +{children.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className={`text-sm font-medium mb-2 ${textClass}`}>Assigned Staff ({assignedStaff.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {assignedStaff.map(staff => (
                      <span key={staff.id} className={`px-2 py-1 rounded-full text-xs bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300`}>
                        {staff.firstName} {staff.lastName[0]}.
                      </span>
                    ))}
                    {assignedStaff.length === 0 && (
                      <span className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.noStaffAssigned', 'No staff assigned')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Staff Tab
  const renderStaff = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.staffManagement', 'Staff Management')}</h3>
        <button onClick={() => setShowStaffForm(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.staffMember', 'Staff Member')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.role', 'Role')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.contact', 'Contact')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.classrooms', 'Classrooms')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.status3', 'Status')}</th>
                <th className={`text-right p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.actions2', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {data.staff.map(staff => (
                <tr key={staff.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {staff.firstName[0]}{staff.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className={`font-medium ${textClass}`}>{staff.firstName} {staff.lastName}</p>
                        <p className={`text-xs ${mutedTextClass}`}>Since {staff.hireDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`p-4 capitalize ${textClass}`}>{staff.role}</td>
                  <td className="p-4">
                    <p className={`text-sm ${textClass}`}>{staff.email}</p>
                    <p className={`text-xs ${mutedTextClass}`}>{staff.phone}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {staff.classroomIds.map(id => (
                        <span key={id} className={`px-2 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} ${textClass}`}>
                          {getClassroomName(id)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      staff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => staffData.deleteItem(staff.id)}
                        className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.staff.length === 0 && (
            <div className={`p-8 text-center ${mutedTextClass}`}>
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.daycareManagement.noStaffMembersAdded', 'No staff members added')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Payments Tab
  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.tuitionPayments', 'Tuition & Payments')}</h3>
        <button onClick={() => setShowPaymentForm(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" /> Add Payment
        </button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cardClass} p-4`}>
          <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.totalPending', 'Total Pending')}</p>
          <p className={`text-2xl font-bold text-yellow-500`}>
            ${data.payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className={`${cardClass} p-4`}>
          <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.totalOverdue', 'Total Overdue')}</p>
          <p className={`text-2xl font-bold text-red-500`}>
            ${data.payments.filter(p => p.status === 'overdue').reduce((acc, p) => acc + p.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className={`${cardClass} p-4`}>
          <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.collectedThisMonth', 'Collected This Month')}</p>
          <p className={`text-2xl font-bold text-green-500`}>
            ${data.payments.filter(p => {
              if (!p.paidDate) return false;
              const paid = new Date(p.paidDate);
              const now = new Date();
              return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear();
            }).reduce((acc, p) => acc + p.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className={`${cardClass} p-4`}>
          <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.totalCollected', 'Total Collected')}</p>
          <p className={`text-2xl font-bold text-teal-500`}>
            ${data.payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.child3', 'Child')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.description2', 'Description')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.amount', 'Amount')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.dueDate', 'Due Date')}</th>
                <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.status4', 'Status')}</th>
                <th className={`text-right p-4 font-medium ${mutedTextClass}`}>{t('tools.daycareManagement.actions3', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.slice().reverse().map(payment => {
                const child = data.children.find(c => c.id === payment.childId);
                return (
                  <tr key={payment.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${textClass}`}>{child ? getChildFullName(child) : 'Unknown'}</td>
                    <td className={`p-4 ${textClass}`}>{payment.description}</td>
                    <td className={`p-4 font-semibold ${textClass}`}>${payment.amount.toFixed(2)}</td>
                    <td className={`p-4 ${textClass}`}>{payment.dueDate}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                        payment.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        payment.status === 'partial' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {payment.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkPaymentPaid(payment.id, 'Cash/Check')}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg"
                          >
                            {t('tools.daycareManagement.markPaid', 'Mark Paid')}
                          </button>
                        )}
                        <button
                          onClick={() => paymentsData.deleteItem(payment.id)}
                          className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.payments.length === 0 && (
            <div className={`p-8 text-center ${mutedTextClass}`}>
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.daycareManagement.noPaymentRecords', 'No payment records')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Reports Tab
  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.reportsDataManagement', 'Reports & Data Management')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Export Data */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className={`font-semibold ${textClass}`}>{t('tools.daycareManagement.exportData', 'Export Data')}</h4>
                <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.downloadAllDataAsJson', 'Download all data as JSON')}</p>
              </div>
            </div>
            <button onClick={handleExportData} className={`${buttonPrimary} w-full justify-center`}>
              <Download className="w-4 h-4" /> Export All Data
            </button>
          </div>
        </div>

        {/* Import Data */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className={`font-semibold ${textClass}`}>{t('tools.daycareManagement.importData', 'Import Data')}</h4>
                <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.restoreFromBackup', 'Restore from backup')}</p>
              </div>
            </div>
            <label className={`${buttonSecondary} w-full justify-center cursor-pointer`}>
              <Upload className="w-4 h-4" /> Import Data
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
          </div>
        </div>

        {/* Clear Data */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className={`font-semibold ${textClass}`}>{t('tools.daycareManagement.clearData', 'Clear Data')}</h4>
                <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.resetAllData', 'Reset all data')}</p>
              </div>
            </div>
            <button
              onClick={handleClearData}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-lg w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={cardClass}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className={`font-semibold ${textClass}`}>{t('tools.daycareManagement.dataSummary', 'Data Summary')}</h4>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.totalChildren', 'Total Children')}</p>
              <p className={`text-2xl font-bold ${textClass}`}>{data.children.length}</p>
            </div>
            <div>
              <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.attendanceRecords', 'Attendance Records')}</p>
              <p className={`text-2xl font-bold ${textClass}`}>{data.attendance.length}</p>
            </div>
            <div>
              <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.activityLogs2', 'Activity Logs')}</p>
              <p className={`text-2xl font-bold ${textClass}`}>{data.activityLogs.length}</p>
            </div>
            <div>
              <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.incidentReports2', 'Incident Reports')}</p>
              <p className={`text-2xl font-bold ${textClass}`}>{data.incidentReports.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Modals
  const renderChildFormModal = () => (
    showChildForm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-inherit">
            <h3 className={`text-lg font-semibold ${textClass}`}>
              {selectedChild ? t('tools.daycareManagement.editChild', 'Edit Child') : t('tools.daycareManagement.addNewChild', 'Add New Child')}
            </h3>
            <button onClick={() => { setShowChildForm(false); resetChildForm(); }} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className={`font-medium mb-4 ${textClass}`}>{t('tools.daycareManagement.basicInformation', 'Basic Information')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={childForm.firstName}
                    onChange={(e) => setChildForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className={inputClass}
                    placeholder={t('tools.daycareManagement.firstName3', 'First name')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={childForm.lastName}
                    onChange={(e) => setChildForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className={inputClass}
                    placeholder={t('tools.daycareManagement.lastName3', 'Last name')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.dateOfBirth', 'Date of Birth *')}</label>
                  <input
                    type="date"
                    value={childForm.dateOfBirth}
                    onChange={(e) => setChildForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.gender', 'Gender')}</label>
                  <select
                    value={childForm.gender}
                    onChange={(e) => setChildForm(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                    className={inputClass}
                  >
                    <option value="male">{t('tools.daycareManagement.male', 'Male')}</option>
                    <option value="female">{t('tools.daycareManagement.female', 'Female')}</option>
                    <option value="other">{t('tools.daycareManagement.other', 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.classroom2', 'Classroom *')}</label>
                  <select
                    value={childForm.classroomId}
                    onChange={(e) => setChildForm(prev => ({ ...prev, classroomId: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">{t('tools.daycareManagement.selectClassroom', 'Select classroom')}</option>
                    {data.classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.ageGroup})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.status5', 'Status')}</label>
                  <select
                    value={childForm.status}
                    onChange={(e) => setChildForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'waitlist' }))}
                    className={inputClass}
                  >
                    <option value="active">{t('tools.daycareManagement.active2', 'Active')}</option>
                    <option value="waitlist">{t('tools.daycareManagement.waitlist2', 'Waitlist')}</option>
                    <option value="inactive">{t('tools.daycareManagement.inactive2', 'Inactive')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Health Info */}
            <div>
              <h4 className={`font-medium mb-4 ${textClass}`}>{t('tools.daycareManagement.healthInformation', 'Health Information')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.allergiesCommaSeparated', 'Allergies (comma-separated)')}</label>
                  <input
                    type="text"
                    value={childForm.healthRecord?.allergies?.join(', ') || ''}
                    onChange={(e) => setChildForm(prev => ({
                      ...prev,
                      healthRecord: {
                        ...prev.healthRecord!,
                        allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    }))}
                    className={inputClass}
                    placeholder={t('tools.daycareManagement.eGPeanutsDairy', 'e.g., Peanuts, Dairy')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.medicalConditions', 'Medical Conditions')}</label>
                  <input
                    type="text"
                    value={childForm.healthRecord?.medicalConditions?.join(', ') || ''}
                    onChange={(e) => setChildForm(prev => ({
                      ...prev,
                      healthRecord: {
                        ...prev.healthRecord!,
                        medicalConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    }))}
                    className={inputClass}
                    placeholder={t('tools.daycareManagement.eGAsthmaEczema', 'e.g., Asthma, Eczema')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.doctorName', 'Doctor Name')}</label>
                  <input
                    type="text"
                    value={childForm.healthRecord?.doctorName || ''}
                    onChange={(e) => setChildForm(prev => ({
                      ...prev,
                      healthRecord: { ...prev.healthRecord!, doctorName: e.target.value }
                    }))}
                    className={inputClass}
                    placeholder={t('tools.daycareManagement.pediatricianName', 'Pediatrician name')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.doctorPhone', 'Doctor Phone')}</label>
                  <input
                    type="tel"
                    value={childForm.healthRecord?.doctorPhone || ''}
                    onChange={(e) => setChildForm(prev => ({
                      ...prev,
                      healthRecord: { ...prev.healthRecord!, doctorPhone: e.target.value }
                    }))}
                    className={inputClass}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.dietaryRestrictions', 'Dietary Restrictions')}</label>
                  <input
                    type="text"
                    value={childForm.healthRecord?.dietaryRestrictions?.join(', ') || ''}
                    onChange={(e) => setChildForm(prev => ({
                      ...prev,
                      healthRecord: {
                        ...prev.healthRecord!,
                        dietaryRestrictions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    }))}
                    className={inputClass}
                    placeholder={t('tools.daycareManagement.eGVegetarianNoGluten', 'e.g., Vegetarian, No Gluten')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.medications', 'Medications')}</label>
                  <input
                    type="text"
                    value={childForm.healthRecord?.medications?.join(', ') || ''}
                    onChange={(e) => setChildForm(prev => ({
                      ...prev,
                      healthRecord: {
                        ...prev.healthRecord!,
                        medications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    }))}
                    className={inputClass}
                    placeholder={t('tools.daycareManagement.currentMedications', 'Current medications')}
                  />
                </div>
              </div>
            </div>

            {/* Photo Consent */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={childForm.photoConsent}
                  onChange={(e) => setChildForm(prev => ({ ...prev, photoConsent: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className={`font-medium ${textClass}`}>{t('tools.daycareManagement.photoVideoConsent', 'Photo/Video Consent')}</span>
                  <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.allowPhotosAndVideosOf', 'Allow photos and videos of this child for facility use')}</p>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.additionalNotes', 'Additional Notes')}</label>
              <textarea
                value={childForm.notes || ''}
                onChange={(e) => setChildForm(prev => ({ ...prev, notes: e.target.value }))}
                className={`${inputClass} h-24 resize-none`}
                placeholder={t('tools.daycareManagement.anyAdditionalInformation', 'Any additional information...')}
              />
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button onClick={() => { setShowChildForm(false); resetChildForm(); }} className={buttonSecondary}>
              {t('tools.daycareManagement.cancel5', 'Cancel')}
            </button>
            <button onClick={handleSaveChild} className={buttonPrimary}>
              <Save className="w-4 h-4" /> {selectedChild ? t('tools.daycareManagement.update', 'Update') : t('tools.daycareManagement.save', 'Save')} Child
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderActivityModal = () => (
    showActivityModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${cardClass} w-full max-w-lg`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.logActivity', 'Log Activity')}</h3>
            <button onClick={() => setShowActivityModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.child4', 'Child *')}</label>
              <select
                value={activityForm.childId}
                onChange={(e) => setActivityForm(prev => ({ ...prev, childId: e.target.value }))}
                className={inputClass}
              >
                <option value="">{t('tools.daycareManagement.selectChild', 'Select child')}</option>
                {data.children.filter(c => c.status === 'active').map(c => (
                  <option key={c.id} value={c.id}>{getChildFullName(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.activityType', 'Activity Type')}</label>
              <select
                value={activityForm.type}
                onChange={(e) => setActivityForm(prev => ({ ...prev, type: e.target.value as ActivityLog['type'] }))}
                className={inputClass}
              >
                <option value="meal">{t('tools.daycareManagement.meal', 'Meal')}</option>
                <option value="nap">{t('tools.daycareManagement.nap', 'Nap')}</option>
                <option value="diaper">{t('tools.daycareManagement.diaperChange', 'Diaper Change')}</option>
                <option value="activity">{t('tools.daycareManagement.activity', 'Activity')}</option>
                <option value="medication">{t('tools.daycareManagement.medication', 'Medication')}</option>
                <option value="milestone">{t('tools.daycareManagement.milestone', 'Milestone')}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.description3', 'Description *')}</label>
              <input
                type="text"
                value={activityForm.description}
                onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                className={inputClass}
                placeholder={t('tools.daycareManagement.eGAteLunchChicken', 'e.g., Ate lunch - chicken nuggets, vegetables')}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.staffMember2', 'Staff Member *')}</label>
              <select
                value={activityForm.staffId}
                onChange={(e) => setActivityForm(prev => ({ ...prev, staffId: e.target.value }))}
                className={inputClass}
              >
                <option value="">{t('tools.daycareManagement.selectStaff', 'Select staff')}</option>
                {data.staff.filter(s => s.status === 'active').map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.notes', 'Notes')}</label>
              <textarea
                value={activityForm.notes}
                onChange={(e) => setActivityForm(prev => ({ ...prev, notes: e.target.value }))}
                className={`${inputClass} h-20 resize-none`}
                placeholder={t('tools.daycareManagement.additionalNotes2', 'Additional notes...')}
              />
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button onClick={() => setShowActivityModal(false)} className={buttonSecondary}>{t('tools.daycareManagement.cancel', 'Cancel')}</button>
            <button onClick={handleAddActivity} className={buttonPrimary}>
              <Plus className="w-4 h-4" /> Log Activity
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderIncidentModal = () => (
    showIncidentModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-inherit">
            <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.reportIncident', 'Report Incident')}</h3>
            <button onClick={() => setShowIncidentModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.child5', 'Child *')}</label>
              <select
                value={incidentForm.childId}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, childId: e.target.value }))}
                className={inputClass}
              >
                <option value="">{t('tools.daycareManagement.selectChild2', 'Select child')}</option>
                {data.children.filter(c => c.status === 'active').map(c => (
                  <option key={c.id} value={c.id}>{getChildFullName(c)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.incidentType', 'Incident Type')}</label>
                <select
                  value={incidentForm.type}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, type: e.target.value as IncidentReport['type'] }))}
                  className={inputClass}
                >
                  <option value="injury">{t('tools.daycareManagement.injury', 'Injury')}</option>
                  <option value="illness">{t('tools.daycareManagement.illness', 'Illness')}</option>
                  <option value="behavior">{t('tools.daycareManagement.behavior', 'Behavior')}</option>
                  <option value="other">{t('tools.daycareManagement.other2', 'Other')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.severity', 'Severity')}</label>
                <select
                  value={incidentForm.severity}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, severity: e.target.value as IncidentReport['severity'] }))}
                  className={inputClass}
                >
                  <option value="minor">{t('tools.daycareManagement.minor', 'Minor')}</option>
                  <option value="moderate">{t('tools.daycareManagement.moderate', 'Moderate')}</option>
                  <option value="severe">{t('tools.daycareManagement.severe', 'Severe')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.description4', 'Description *')}</label>
              <textarea
                value={incidentForm.description}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                className={`${inputClass} h-24 resize-none`}
                placeholder={t('tools.daycareManagement.describeWhatHappened', 'Describe what happened...')}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.actionTaken2', 'Action Taken *')}</label>
              <textarea
                value={incidentForm.actionTaken}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, actionTaken: e.target.value }))}
                className={`${inputClass} h-20 resize-none`}
                placeholder={t('tools.daycareManagement.whatWasDoneToAddress', 'What was done to address the incident...')}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.staffMember3', 'Staff Member *')}</label>
              <select
                value={incidentForm.staffId}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, staffId: e.target.value }))}
                className={inputClass}
              >
                <option value="">{t('tools.daycareManagement.selectStaff2', 'Select staff')}</option>
                {data.staff.filter(s => s.status === 'active').map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incidentForm.parentNotified}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, parentNotified: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className={textClass}>{t('tools.daycareManagement.parentHasBeenNotified', 'Parent has been notified')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incidentForm.followUpRequired}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className={textClass}>{t('tools.daycareManagement.followUpRequired2', 'Follow-up required')}</span>
              </label>
            </div>
            {incidentForm.followUpRequired && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.followUpNotes2', 'Follow-up Notes')}</label>
                <textarea
                  value={incidentForm.followUpNotes}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, followUpNotes: e.target.value }))}
                  className={`${inputClass} h-20 resize-none`}
                  placeholder={t('tools.daycareManagement.whatNeedsToBeFollowed', 'What needs to be followed up on...')}
                />
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button onClick={() => setShowIncidentModal(false)} className={buttonSecondary}>{t('tools.daycareManagement.cancel2', 'Cancel')}</button>
            <button onClick={handleAddIncident} className={buttonPrimary}>
              <AlertTriangle className="w-4 h-4" /> Submit Report
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderStaffFormModal = () => (
    showStaffForm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${cardClass} w-full max-w-lg`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.addStaffMember', 'Add Staff Member')}</h3>
            <button onClick={() => setShowStaffForm(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.firstName2', 'First Name *')}</label>
                <input
                  type="text"
                  value={staffForm.firstName}
                  onChange={(e) => setStaffForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.lastName2', 'Last Name *')}</label>
                <input
                  type="text"
                  value={staffForm.lastName}
                  onChange={(e) => setStaffForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.role2', 'Role')}</label>
              <select
                value={staffForm.role}
                onChange={(e) => setStaffForm(prev => ({ ...prev, role: e.target.value as Staff['role'] }))}
                className={inputClass}
              >
                <option value="teacher">{t('tools.daycareManagement.teacher', 'Teacher')}</option>
                <option value="assistant">{t('tools.daycareManagement.assistant', 'Assistant')}</option>
                <option value="director">{t('tools.daycareManagement.director', 'Director')}</option>
                <option value="admin">{t('tools.daycareManagement.admin', 'Admin')}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.email', 'Email *')}</label>
              <input
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.phone', 'Phone *')}</label>
              <input
                type="tel"
                value={staffForm.phone}
                onChange={(e) => setStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.assignedClassrooms', 'Assigned Classrooms')}</label>
              <div className="space-y-2">
                {data.classrooms.map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={staffForm.classroomIds.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStaffForm(prev => ({ ...prev, classroomIds: [...prev.classroomIds, c.id] }));
                        } else {
                          setStaffForm(prev => ({ ...prev, classroomIds: prev.classroomIds.filter(id => id !== c.id) }));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className={textClass}>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button onClick={() => setShowStaffForm(false)} className={buttonSecondary}>{t('tools.daycareManagement.cancel3', 'Cancel')}</button>
            <button onClick={handleSaveStaff} className={buttonPrimary}>
              <Plus className="w-4 h-4" /> Add Staff
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderPaymentFormModal = () => (
    showPaymentForm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${cardClass} w-full max-w-lg`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${textClass}`}>{t('tools.daycareManagement.addPayment', 'Add Payment')}</h3>
            <button onClick={() => setShowPaymentForm(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.child6', 'Child *')}</label>
              <select
                value={paymentForm.childId}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, childId: e.target.value }))}
                className={inputClass}
              >
                <option value="">{t('tools.daycareManagement.selectChild3', 'Select child')}</option>
                {data.children.map(c => (
                  <option key={c.id} value={c.id}>{getChildFullName(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.amount2', 'Amount *')}</label>
              <input
                type="number"
                step="0.01"
                value={paymentForm.amount || ''}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.dueDate2', 'Due Date *')}</label>
              <input
                type="date"
                value={paymentForm.dueDate}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.description5', 'Description')}</label>
              <input
                type="text"
                value={paymentForm.description}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                className={inputClass}
                placeholder={t('tools.daycareManagement.eGMonthlyTuitionJanuary', 'e.g., Monthly tuition - January 2025')}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.daycareManagement.notes2', 'Notes')}</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                className={`${inputClass} h-20 resize-none`}
                placeholder={t('tools.daycareManagement.additionalNotes3', 'Additional notes...')}
              />
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button onClick={() => setShowPaymentForm(false)} className={buttonSecondary}>{t('tools.daycareManagement.cancel4', 'Cancel')}</button>
            <button onClick={handleAddPayment} className={buttonPrimary}>
              <Plus className="w-4 h-4" /> Add Payment
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className={containerClass}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${cardClass} p-4 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-lg">
                <Baby className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${textClass}`}>{t('tools.daycareManagement.daycareManagement', 'Daycare Management')}</h1>
                <p className={`text-sm ${mutedTextClass}`}>{t('tools.daycareManagement.manageChildrenStaffAttendanceAnd', 'Manage children, staff, attendance, and more')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="daycare-management" toolName="Daycare Management" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme === 'dark' ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => exportChildrenCSV({ filename: 'daycare-children' })}
                onExportExcel={() => exportChildrenExcel({ filename: 'daycare-children' })}
                onExportJSON={handleExportData}
                onExportPDF={() => exportChildrenPDF({
                  filename: 'daycare-children',
                  title: 'Daycare Children',
                  subtitle: `Generated on ${new Date().toLocaleDateString()}`
                })}
                onPrint={() => printChildren('Daycare Children')}
                onCopyToClipboard={() => copyChildrenToClipboard('tab')}
                disabled={childrenDataItems.length === 0}
                theme={theme === 'dark' ? 'dark' : 'light'}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`${cardClass} p-2 mb-6 overflow-x-auto`}>
          <div className="flex items-center gap-1 min-w-max">
            <TabButton tab="dashboard" icon={Activity} label="Dashboard" />
            <TabButton tab="children" icon={Baby} label="Children" />
            <TabButton tab="attendance" icon={UserCheck} label="Attendance" />
            <TabButton tab="activities" icon={ClipboardList} label="Activities" />
            <TabButton tab="incidents" icon={AlertTriangle} label="Incidents" />
            <TabButton tab="classrooms" icon={Building} label="Classrooms" />
            <TabButton tab="staff" icon={Users} label="Staff" />
            <TabButton tab="payments" icon={DollarSign} label="Payments" />
            <TabButton tab="reports" icon={FileText} label="Reports" />
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'children' && renderChildren()}
          {activeTab === 'attendance' && renderAttendance()}
          {activeTab === 'activities' && renderActivities()}
          {activeTab === 'incidents' && renderIncidents()}
          {activeTab === 'classrooms' && renderClassrooms()}
          {activeTab === 'staff' && renderStaff()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'reports' && renderReports()}
        </div>

        {/* Modals */}
        {renderChildFormModal()}
        {renderActivityModal()}
        {renderIncidentModal()}
        {renderStaffFormModal()}
        {renderPaymentFormModal()}

        {/* Confirm Dialog */}
        <ConfirmDialog />

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-in fade-in slide-in-from-bottom-4 duration-300 ${
              validationMessage.includes('successfully') || validationMessage.includes('imported')
                ? 'bg-green-600'
                : 'bg-red-600'
            }`}>
              {validationMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DaycareManagementTool;
