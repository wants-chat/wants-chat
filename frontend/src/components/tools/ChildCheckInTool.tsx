'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { api } from '../../lib/api';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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
  LogIn,
  LogOut,
  Shield,
  Heart,
  Camera,
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
  Mail,
  MapPin,
  Pill,
  AlertCircle,
  User,
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
  address?: string;
  isPrimary: boolean;
  isAuthorizedPickup: boolean;
}

interface AuthorizedPickup {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  photoUrl?: string;
  idType?: string;
  idNumber?: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  photoUrl?: string;
  classroomId: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'waitlist';
  allergies: string[];
  medicalNotes: string;
  guardians: Guardian[];
  emergencyContacts: EmergencyContact[];
  authorizedPickups: AuthorizedPickup[];
  notes?: string;
}

interface CheckInRecord {
  id: string;
  childId: string;
  date: string;
  checkInTime: string;
  checkInBy: string;
  checkInNotes?: string;
  checkOutTime?: string;
  checkOutBy?: string;
  checkOutNotes?: string;
  authorizedPickupId?: string;
}

interface AttendanceRecord {
  id: string;
  childId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'early-pickup';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

interface Classroom {
  id: string;
  name: string;
  ageGroup: string;
  capacity: number;
  description?: string;
}

interface ChildCheckInData {
  children: Child[];
  checkIns: CheckInRecord[];
  attendance: AttendanceRecord[];
  classrooms: Classroom[];
}

interface ChildCheckInToolProps {
  uiConfig?: UIConfig;
}

// Column configurations for export
const childColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
  { key: 'classroomId', header: 'Classroom', type: 'string' },
  { key: 'enrollmentDate', header: 'Enrollment Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'allergies', header: 'Allergies', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : v },
  { key: 'medicalNotes', header: 'Medical Notes', type: 'string' },
];

const checkInColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'childId', header: 'Child ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'checkInTime', header: 'Check-In Time', type: 'string' },
  { key: 'checkInBy', header: 'Checked In By', type: 'string' },
  { key: 'checkOutTime', header: 'Check-Out Time', type: 'string' },
  { key: 'checkOutBy', header: 'Checked Out By', type: 'string' },
];

const attendanceColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'childId', header: 'Child ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'checkInTime', header: 'Check-In Time', type: 'string' },
  { key: 'checkOutTime', header: 'Check-Out Time', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const classroomColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'ageGroup', header: 'Age Group', type: 'string' },
  { key: 'capacity', header: 'Capacity', type: 'number' },
  { key: 'description', header: 'Description', type: 'string' },
];

// Sample data generator
const generateSampleData = (): ChildCheckInData => {
  const classrooms: Classroom[] = [
    { id: 'infant', name: 'Infant Room', ageGroup: '0-12 months', capacity: 8, description: 'For babies up to 1 year' },
    { id: 'toddler', name: 'Toddler Room', ageGroup: '1-2 years', capacity: 12, description: 'For toddlers 1-2 years' },
    { id: 'preschool', name: 'Preschool Room', ageGroup: '3-4 years', capacity: 16, description: 'For preschoolers 3-4 years' },
    { id: 'prek', name: 'Pre-K Room', ageGroup: '4-5 years', capacity: 20, description: 'For pre-kindergarteners' },
    { id: 'schoolage', name: 'School Age Room', ageGroup: '5-12 years', capacity: 24, description: 'For school-age children' },
  ];

  const sampleChildren: Child[] = [
    {
      id: 'child-1',
      firstName: 'Emma',
      lastName: 'Johnson',
      dateOfBirth: '2022-03-15',
      photoUrl: '',
      classroomId: 'toddler',
      enrollmentDate: '2024-01-10',
      status: 'active',
      allergies: ['Peanuts', 'Tree nuts'],
      medicalNotes: 'Carries EpiPen. Must avoid all nut products.',
      guardians: [
        {
          id: 'guard-1',
          name: 'Sarah Johnson',
          relationship: 'Mother',
          phone: '555-0101',
          email: 'sarah.johnson@email.com',
          address: '123 Oak Street, Springfield',
          isPrimary: true,
          isAuthorizedPickup: true,
        },
        {
          id: 'guard-2',
          name: 'Michael Johnson',
          relationship: 'Father',
          phone: '555-0102',
          email: 'michael.johnson@email.com',
          address: '123 Oak Street, Springfield',
          isPrimary: false,
          isAuthorizedPickup: true,
        },
      ],
      emergencyContacts: [
        {
          id: 'ec-1',
          name: 'Mary Smith',
          relationship: 'Grandmother',
          phone: '555-0103',
          email: 'mary.smith@email.com',
          isAuthorizedPickup: true,
        },
      ],
      authorizedPickups: [
        {
          id: 'ap-1',
          name: 'Mary Smith',
          relationship: 'Grandmother',
          phone: '555-0103',
          idType: 'Drivers License',
          idNumber: 'DL12345',
        },
      ],
      notes: 'Emma loves story time and playing with blocks.',
    },
    {
      id: 'child-2',
      firstName: 'Liam',
      lastName: 'Williams',
      dateOfBirth: '2021-07-22',
      photoUrl: '',
      classroomId: 'preschool',
      enrollmentDate: '2023-09-01',
      status: 'active',
      allergies: [],
      medicalNotes: '',
      guardians: [
        {
          id: 'guard-3',
          name: 'Jennifer Williams',
          relationship: 'Mother',
          phone: '555-0201',
          email: 'jennifer.williams@email.com',
          address: '456 Maple Ave, Springfield',
          isPrimary: true,
          isAuthorizedPickup: true,
        },
      ],
      emergencyContacts: [
        {
          id: 'ec-2',
          name: 'Robert Williams',
          relationship: 'Grandfather',
          phone: '555-0202',
          isAuthorizedPickup: true,
        },
      ],
      authorizedPickups: [],
      notes: 'Liam is very active and enjoys outdoor play.',
    },
    {
      id: 'child-3',
      firstName: 'Olivia',
      lastName: 'Brown',
      dateOfBirth: '2020-11-08',
      photoUrl: '',
      classroomId: 'prek',
      enrollmentDate: '2023-01-15',
      status: 'active',
      allergies: ['Dairy'],
      medicalNotes: 'Lactose intolerant. Please provide dairy-free snacks.',
      guardians: [
        {
          id: 'guard-4',
          name: 'David Brown',
          relationship: 'Father',
          phone: '555-0301',
          email: 'david.brown@email.com',
          address: '789 Pine Road, Springfield',
          isPrimary: true,
          isAuthorizedPickup: true,
        },
        {
          id: 'guard-5',
          name: 'Lisa Brown',
          relationship: 'Mother',
          phone: '555-0302',
          email: 'lisa.brown@email.com',
          address: '789 Pine Road, Springfield',
          isPrimary: false,
          isAuthorizedPickup: true,
        },
      ],
      emergencyContacts: [],
      authorizedPickups: [
        {
          id: 'ap-2',
          name: 'Aunt Carol',
          relationship: 'Aunt',
          phone: '555-0303',
        },
      ],
      notes: 'Olivia is preparing for kindergarten and loves learning letters.',
    },
  ];

  const today = new Date().toISOString().split('T')[0];
  const sampleCheckIns: CheckInRecord[] = [
    {
      id: 'checkin-1',
      childId: 'child-1',
      date: today,
      checkInTime: '08:15',
      checkInBy: 'Sarah Johnson',
      checkInNotes: 'Emma had breakfast at home.',
    },
    {
      id: 'checkin-2',
      childId: 'child-2',
      date: today,
      checkInTime: '08:30',
      checkInBy: 'Jennifer Williams',
      checkOutTime: '16:45',
      checkOutBy: 'Jennifer Williams',
    },
  ];

  const sampleAttendance: AttendanceRecord[] = [
    {
      id: 'att-1',
      childId: 'child-1',
      date: today,
      status: 'present',
      checkInTime: '08:15',
    },
    {
      id: 'att-2',
      childId: 'child-2',
      date: today,
      status: 'present',
      checkInTime: '08:30',
      checkOutTime: '16:45',
    },
    {
      id: 'att-3',
      childId: 'child-3',
      date: today,
      status: 'absent',
      notes: 'Called in sick',
    },
  ];

  return {
    children: sampleChildren,
    checkIns: sampleCheckIns,
    attendance: sampleAttendance,
    classrooms,
  };
};

const defaultData: ChildCheckInData = {
  children: [],
  checkIns: [],
  attendance: [],
  classrooms: [
    { id: 'infant', name: 'Infant Room', ageGroup: '0-12 months', capacity: 8, description: 'For babies up to 1 year' },
    { id: 'toddler', name: 'Toddler Room', ageGroup: '1-2 years', capacity: 12, description: 'For toddlers 1-2 years' },
    { id: 'preschool', name: 'Preschool Room', ageGroup: '3-4 years', capacity: 16, description: 'For preschoolers 3-4 years' },
    { id: 'prek', name: 'Pre-K Room', ageGroup: '4-5 years', capacity: 20, description: 'For pre-kindergarteners' },
    { id: 'schoolage', name: 'School Age Room', ageGroup: '5-12 years', capacity: 24, description: 'For school-age children' },
  ],
};

type TabType = 'children' | 'checkin' | 'guardians' | 'reports';

export const ChildCheckInTool: React.FC<ChildCheckInToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('checkin');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassroom, setFilterClassroom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCheckedIn, setFilterCheckedIn] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Initialize hooks for data with backend sync
  // Use defaultData for initial values (these are only used if no saved data exists)
  const {
    data: childrenDataArr,
    addItem: addChild,
    updateItem: updateChild,
    deleteItem: deleteChild,
    resetToDefault: resetChildren,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Child>(
    'child-checkin-children',
    defaultData.children,
    childColumns,
    { autoSave: true }
  );

  const checkInsData = useToolData<CheckInRecord>(
    'child-checkin-checkins',
    defaultData.checkIns,
    checkInColumns,
    { autoSave: true }
  );

  const attendanceData = useToolData<AttendanceRecord>(
    'child-checkin-attendance',
    defaultData.attendance,
    attendanceColumns,
    { autoSave: true }
  );

  const classroomsData = useToolData<Classroom>(
    'child-checkin-classrooms',
    defaultData.classrooms,
    classroomColumns,
    { autoSave: true }
  );

  // Alias for childrenData to maintain compatibility
  const childrenData = {
    data: childrenDataArr,
    addItem: addChild,
    updateItem: updateChild,
    deleteItem: deleteChild,
    resetToDefault: resetChildren,
  };

  // Create a unified data object for compatibility
  const data: ChildCheckInData = {
    children: childrenData.data,
    checkIns: checkInsData.data,
    attendance: attendanceData.data,
    classrooms: classroomsData.data,
  };

  // Modal states
  const [showChildForm, setShowChildForm] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const prefillData = uiConfig.prefillData as ToolPrefillData;
      if ((prefillData as any).activeTab) setActiveTab((prefillData as any).activeTab as TabType);
      if ((prefillData as any).searchTerm) setSearchTerm((prefillData as any).searchTerm as string);
      if ((prefillData as any).filterClassroom) setFilterClassroom((prefillData as any).filterClassroom as string);
      if ((prefillData as any).filterStatus) setFilterStatus((prefillData as any).filterStatus as string);
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
    const adjustedMonths = months < 0 ? months + 12 : months;

    if (years === 0) {
      return `${adjustedMonths} months`;
    }
    return `${years} year${years !== 1 ? 's' : ''}, ${Math.abs(adjustedMonths)} month${Math.abs(adjustedMonths) !== 1 ? 's' : ''}`;
  };

  const getChildFullName = (child: Child): string => `${child.firstName} ${child.lastName}`;

  const getClassroomName = (classroomId: string): string => {
    const classroom = data.classrooms.find(c => c.id === classroomId);
    return classroom?.name || 'Unassigned';
  };

  const isCheckedIn = (childId: string): boolean => {
    const todayCheckIn = data.checkIns.find(
      c => c.childId === childId && c.date === selectedDate && c.checkInTime && !c.checkOutTime
    );
    return !!todayCheckIn;
  };

  const getCheckInRecord = (childId: string): CheckInRecord | undefined => {
    return data.checkIns.find(
      c => c.childId === childId && c.date === selectedDate
    );
  };

  const getTodayAttendance = useMemo(() => {
    return data.attendance.filter(a => a.date === selectedDate);
  }, [data.attendance, selectedDate]);

  // Filter children
  const filteredChildren = useMemo(() => {
    return data.children.filter(child => {
      const matchesSearch = searchTerm === '' ||
        getChildFullName(child).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClassroom = filterClassroom === 'all' || child.classroomId === filterClassroom;
      const matchesStatus = filterStatus === 'all' || child.status === filterStatus;

      // Filter by checked-in status
      const checkedIn = isCheckedIn(child.id);
      const matchesCheckedIn = filterCheckedIn === 'all' ||
        (filterCheckedIn === 'checked-in' && checkedIn) ||
        (filterCheckedIn === 'checked-out' && !checkedIn);

      return matchesSearch && matchesClassroom && matchesStatus && matchesCheckedIn;
    });
  }, [data.children, searchTerm, filterClassroom, filterStatus, filterCheckedIn, selectedDate, data.checkIns]);

  // Stats
  const stats = useMemo(() => {
    const activeChildren = data.children.filter(c => c.status === 'active').length;
    const checkedInCount = data.children.filter(c => c.status === 'active' && isCheckedIn(c.id)).length;
    const childrenWithAllergies = data.children.filter(c => c.allergies.length > 0).length;

    return {
      totalChildren: data.children.length,
      activeChildren,
      checkedInCount,
      checkedOutCount: activeChildren - checkedInCount,
      childrenWithAllergies,
    };
  }, [data.children, selectedDate, data.checkIns]);

  // Child Form State
  const [childForm, setChildForm] = useState<Partial<Child>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    photoUrl: '',
    classroomId: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active',
    allergies: [],
    medicalNotes: '',
    guardians: [],
    emergencyContacts: [],
    authorizedPickups: [],
    notes: '',
  });

  const [allergyInput, setAllergyInput] = useState('');

  // Check-in form state
  const [checkInForm, setCheckInForm] = useState({
    checkInBy: '',
    checkInNotes: '',
    checkOutBy: '',
    checkOutNotes: '',
    authorizedPickupId: '',
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

  const resetChildForm = () => {
    setChildForm({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      photoUrl: '',
      classroomId: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      allergies: [],
      medicalNotes: '',
      guardians: [],
      emergencyContacts: [],
      authorizedPickups: [],
      notes: '',
    });
    setAllergyInput('');
    setEditingChild(null);
  };

  const handleSaveChild = () => {
    if (!childForm.firstName || !childForm.lastName || !childForm.dateOfBirth || !childForm.classroomId) {
      setValidationMessage('Please fill in all required fields (First Name, Last Name, Date of Birth, Classroom)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingChild) {
      childrenData.updateItem(editingChild.id, childForm as Partial<Child>);
    } else {
      const newChild: Child = {
        ...childForm,
        id: generateId(),
        guardians: childForm.guardians || [],
        emergencyContacts: childForm.emergencyContacts || [],
        authorizedPickups: childForm.authorizedPickups || [],
        allergies: childForm.allergies || [],
      } as Child;

      childrenData.addItem(newChild);
    }

    setShowChildForm(false);
    resetChildForm();
  };

  const handleEditChild = (child: Child) => {
    setEditingChild(child);
    setChildForm(child);
    setShowChildForm(true);
  };

  const handleDeleteChild = async (childId: string) => {
    const confirmed = await confirm({
      title: 'Delete Child',
      message: 'Are you sure you want to delete this child? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    childrenData.deleteItem(childId);
    // Also delete associated check-ins and attendance records
    data.checkIns.forEach(c => {
      if (c.childId === childId) {
        checkInsData.deleteItem(c.id);
      }
    });
    data.attendance.forEach(a => {
      if (a.childId === childId) {
        attendanceData.deleteItem(a.id);
      }
    });
  };

  const handleCheckIn = (child: Child) => {
    setSelectedChild(child);
    setCheckInForm({
      checkInBy: '',
      checkInNotes: '',
      checkOutBy: '',
      checkOutNotes: '',
      authorizedPickupId: '',
    });
    setShowCheckInModal(true);
  };

  const handlePerformCheckIn = () => {
    if (!selectedChild || !checkInForm.checkInBy) {
      setValidationMessage('Please enter who is checking in the child.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const newCheckIn: CheckInRecord = {
      id: generateId(),
      childId: selectedChild.id,
      date: selectedDate,
      checkInTime: currentTime,
      checkInBy: checkInForm.checkInBy,
      checkInNotes: checkInForm.checkInNotes,
    };

    const newAttendance: AttendanceRecord = {
      id: generateId(),
      childId: selectedChild.id,
      date: selectedDate,
      status: 'present',
      checkInTime: currentTime,
    };

    // Add new check-in
    checkInsData.addItem(newCheckIn);

    // Remove existing attendance for this child on this date and add new one
    const existingAttendance = data.attendance.find(a => a.childId === selectedChild.id && a.date === selectedDate);
    if (existingAttendance) {
      attendanceData.deleteItem(existingAttendance.id);
    }
    attendanceData.addItem(newAttendance);

    setShowCheckInModal(false);
    setSelectedChild(null);
  };

  const handleCheckOut = (child: Child) => {
    setSelectedChild(child);
    const existingCheckIn = getCheckInRecord(child.id);
    setCheckInForm({
      checkInBy: existingCheckIn?.checkInBy || '',
      checkInNotes: existingCheckIn?.checkInNotes || '',
      checkOutBy: '',
      checkOutNotes: '',
      authorizedPickupId: '',
    });
    setShowCheckInModal(true);
  };

  const handlePerformCheckOut = () => {
    if (!selectedChild || !checkInForm.checkOutBy) {
      setValidationMessage('Please enter who is checking out the child.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    // Update check-in record with check-out info
    const checkInToUpdate = data.checkIns.find(
      c => c.childId === selectedChild.id && c.date === selectedDate && !c.checkOutTime
    );
    if (checkInToUpdate) {
      checkInsData.updateItem(checkInToUpdate.id, {
        checkOutTime: currentTime,
        checkOutBy: checkInForm.checkOutBy,
        checkOutNotes: checkInForm.checkOutNotes,
        authorizedPickupId: checkInForm.authorizedPickupId,
      });
    }

    // Update attendance record
    const attendanceToUpdate = data.attendance.find(
      a => a.childId === selectedChild.id && a.date === selectedDate
    );
    if (attendanceToUpdate) {
      attendanceData.updateItem(attendanceToUpdate.id, { checkOutTime: currentTime });
    }

    setShowCheckInModal(false);
    setSelectedChild(null);
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setChildForm(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), allergyInput.trim()],
      }));
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setChildForm(prev => ({
      ...prev,
      allergies: (prev.allergies || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddGuardian = () => {
    if (!guardianForm.name || !guardianForm.phone || !guardianForm.relationship) {
      setValidationMessage('Please fill in required guardian fields (Name, Relationship, Phone)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newGuardian: Guardian = {
      id: generateId(),
      name: guardianForm.name,
      relationship: guardianForm.relationship,
      phone: guardianForm.phone,
      email: guardianForm.email || '',
      address: guardianForm.address,
      isPrimary: guardianForm.isPrimary || false,
      isAuthorizedPickup: guardianForm.isAuthorizedPickup !== false,
    };

    setChildForm(prev => ({
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

  const handleLoadSampleData = async () => {
    const confirmed = await confirm({
      title: 'Load Sample Data',
      message: 'This will replace your current data with sample data. Continue?',
      confirmText: 'Load',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    const newSampleData = generateSampleData();
    childrenData.resetToDefault(newSampleData.children);
    checkInsData.resetToDefault(newSampleData.checkIns);
    attendanceData.resetToDefault(newSampleData.attendance);
    classroomsData.resetToDefault(newSampleData.classrooms);
  };

  const handleExportData = () => {
    // Export all data as JSON
    const exportData = {
      children: data.children,
      checkIns: data.checkIns,
      attendance: data.attendance,
      classrooms: data.classrooms,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `child-checkin-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Styling classes
  const cardClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = `w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`;
  const buttonPrimary = 'flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors';
  const buttonSecondary = `flex items-center gap-2 px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`;

  // Tab Button component
  const TabButton = ({ tab, icon: Icon, label }: { tab: TabType; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === tab
          ? 'bg-[#0D9488] text-white'
          : isDark
          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  // Render Children Tab
  const renderChildrenTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className={`${cardClass} border rounded-xl p-4`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
            <input
              type="text"
              placeholder="Search children..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={filterClassroom}
            onChange={(e) => setFilterClassroom(e.target.value)}
            className={inputClass}
            style={{ width: 'auto' }}
          >
            <option value="all">All Classrooms</option>
            {data.classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={inputClass}
            style={{ width: 'auto' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="waitlist">Waitlist</option>
          </select>
          <button onClick={() => { resetChildForm(); setShowChildForm(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" /> Add Child
          </button>
        </div>
      </div>

      {/* Children List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChildren.length === 0 ? (
          <div className={`col-span-full ${cardClass} border rounded-xl p-8 text-center`}>
            <Baby className={`w-12 h-12 mx-auto mb-3 ${mutedTextClass} opacity-50`} />
            <p className={mutedTextClass}>No children found</p>
            <button onClick={() => setShowChildForm(true)} className="mt-3 text-[#0D9488] hover:underline">
              Add your first child
            </button>
          </div>
        ) : (
          filteredChildren.map(child => (
            <div key={child.id} className={`${cardClass} border rounded-xl p-4 transition-shadow hover:shadow-lg`}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0D9488]/10 flex items-center justify-center flex-shrink-0">
                  {child.photoUrl ? (
                    <img src={child.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <Baby className="w-6 h-6 text-[#0D9488]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${textClass} truncate`}>{getChildFullName(child)}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      child.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      child.status === 'waitlist' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {child.status}
                    </span>
                  </div>
                  <p className={`text-sm ${mutedTextClass}`}>{getClassroomName(child.classroomId)}</p>
                  <p className={`text-sm ${mutedTextClass}`}>Age: {calculateAge(child.dateOfBirth)}</p>

                  {child.allergies.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">Allergies: {child.allergies.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEditChild(child)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleDeleteChild(child.id)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Check-In Tab
  const renderCheckInTab = () => (
    <div className="space-y-6">
      {/* Date Selector and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={`${cardClass} border rounded-xl p-4`}>
          <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className={`${cardClass} border rounded-xl p-4`}>
          <p className={`text-sm ${mutedTextClass}`}>Total Active</p>
          <p className={`text-2xl font-bold ${textClass}`}>{stats.activeChildren}</p>
        </div>
        <div className={`${cardClass} border rounded-xl p-4`}>
          <p className={`text-sm ${mutedTextClass}`}>Checked In</p>
          <p className="text-2xl font-bold text-green-500">{stats.checkedInCount}</p>
        </div>
        <div className={`${cardClass} border rounded-xl p-4`}>
          <p className={`text-sm ${mutedTextClass}`}>Checked Out</p>
          <p className="text-2xl font-bold text-blue-500">{stats.checkedOutCount}</p>
        </div>
        <div className={`${cardClass} border rounded-xl p-4`}>
          <p className={`text-sm ${mutedTextClass}`}>Allergies Alert</p>
          <p className="text-2xl font-bold text-red-500">{stats.childrenWithAllergies}</p>
        </div>
      </div>

      {/* Filter by check-in status */}
      <div className={`${cardClass} border rounded-xl p-4`}>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
            <input
              type="text"
              placeholder="Search children..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={filterClassroom}
            onChange={(e) => setFilterClassroom(e.target.value)}
            className={inputClass}
            style={{ width: 'auto' }}
          >
            <option value="all">All Classrooms</option>
            {data.classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterCheckedIn}
            onChange={(e) => setFilterCheckedIn(e.target.value)}
            className={inputClass}
            style={{ width: 'auto' }}
          >
            <option value="all">All Status</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Not Checked In</option>
          </select>
        </div>
      </div>

      {/* Children Check-In List */}
      <div className="space-y-3">
        {filteredChildren.filter(c => c.status === 'active').length === 0 ? (
          <div className={`${cardClass} border rounded-xl p-8 text-center`}>
            <Users className={`w-12 h-12 mx-auto mb-3 ${mutedTextClass} opacity-50`} />
            <p className={mutedTextClass}>No active children to show</p>
          </div>
        ) : (
          filteredChildren.filter(c => c.status === 'active').map(child => {
            const checkedIn = isCheckedIn(child.id);
            const checkInRecord = getCheckInRecord(child.id);

            return (
              <div key={child.id} className={`${cardClass} border rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      checkedIn ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {checkedIn ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <Baby className={`w-6 h-6 ${mutedTextClass}`} />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${textClass}`}>{getChildFullName(child)}</h4>
                      <p className={`text-sm ${mutedTextClass}`}>{getClassroomName(child.classroomId)}</p>
                      {checkInRecord && (
                        <div className={`text-xs ${mutedTextClass} mt-1`}>
                          {checkInRecord.checkInTime && (
                            <span>In: {checkInRecord.checkInTime} by {checkInRecord.checkInBy}</span>
                          )}
                          {checkInRecord.checkOutTime && (
                            <span className="ml-3">Out: {checkInRecord.checkOutTime} by {checkInRecord.checkOutBy}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {child.allergies.length > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-red-600 dark:text-red-400 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        {t('tools.childCheckIn.allergy', 'Allergy')}
                      </div>
                    )}
                    {checkedIn ? (
                      <button
                        onClick={() => handleCheckOut(child)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <LogOut className="w-4 h-4" /> Check Out
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(child)}
                        className={buttonPrimary}
                      >
                        <LogIn className="w-4 h-4" /> Check In
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Render Guardians Tab
  const renderGuardiansTab = () => {
    const allGuardians = data.children.flatMap(child =>
      child.guardians.map(g => ({
        ...g,
        childId: child.id,
        childName: getChildFullName(child),
      }))
    );

    return (
      <div className="space-y-6">
        <div className={`${cardClass} border rounded-xl p-4`}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
              <input
                type="text"
                placeholder={t('tools.childCheckIn.searchGuardians', 'Search guardians...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
        </div>

        {/* Guardians List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allGuardians.length === 0 ? (
            <div className={`col-span-full ${cardClass} border rounded-xl p-8 text-center`}>
              <Users className={`w-12 h-12 mx-auto mb-3 ${mutedTextClass} opacity-50`} />
              <p className={mutedTextClass}>{t('tools.childCheckIn.noGuardiansFoundAddChildren', 'No guardians found. Add children with guardians first.')}</p>
            </div>
          ) : (
            allGuardians
              .filter(g => searchTerm === '' || g.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((guardian, idx) => (
                <div key={`${guardian.childId}-${guardian.id}`} className={`${cardClass} border rounded-xl p-4`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0D9488]/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-[#0D9488]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${textClass}`}>{guardian.name}</h4>
                        {guardian.isPrimary && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                            {t('tools.childCheckIn.primary', 'Primary')}
                          </span>
                        )}
                        {guardian.isAuthorizedPickup && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            {t('tools.childCheckIn.pickupOk', 'Pickup OK')}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${mutedTextClass}`}>{guardian.relationship} of {guardian.childName}</p>
                      <div className={`flex flex-wrap gap-4 mt-2 text-sm ${mutedTextClass}`}>
                        {guardian.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {guardian.phone}
                          </span>
                        )}
                        {guardian.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {guardian.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    );
  };

  // Render Reports Tab
  const renderReportsTab = () => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const weeklyAttendance = data.attendance.filter(a => {
      const date = new Date(a.date);
      return date >= startOfWeek;
    });

    const classroomStats = data.classrooms.map(classroom => {
      const childrenInClass = data.children.filter(c => c.classroomId === classroom.id && c.status === 'active');
      const todayCheckIns = childrenInClass.filter(c => isCheckedIn(c.id));

      return {
        ...classroom,
        enrolled: childrenInClass.length,
        presentToday: todayCheckIns.length,
        occupancy: childrenInClass.length / classroom.capacity * 100,
      };
    });

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${cardClass} border rounded-xl p-4`}>
            <p className={`text-sm ${mutedTextClass}`}>{t('tools.childCheckIn.totalEnrolled', 'Total Enrolled')}</p>
            <p className={`text-2xl font-bold ${textClass}`}>{stats.totalChildren}</p>
          </div>
          <div className={`${cardClass} border rounded-xl p-4`}>
            <p className={`text-sm ${mutedTextClass}`}>{t('tools.childCheckIn.activeChildren', 'Active Children')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.activeChildren}</p>
          </div>
          <div className={`${cardClass} border rounded-xl p-4`}>
            <p className={`text-sm ${mutedTextClass}`}>{t('tools.childCheckIn.checkedInToday', 'Checked In Today')}</p>
            <p className="text-2xl font-bold text-blue-500">{stats.checkedInCount}</p>
          </div>
          <div className={`${cardClass} border rounded-xl p-4`}>
            <p className={`text-sm ${mutedTextClass}`}>{t('tools.childCheckIn.weeklyCheckIns', 'Weekly Check-ins')}</p>
            <p className="text-2xl font-bold text-purple-500">{weeklyAttendance.length}</p>
          </div>
        </div>

        {/* Classroom Occupancy */}
        <div className={`${cardClass} border rounded-xl overflow-hidden`}>
          <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-semibold ${textClass}`}>{t('tools.childCheckIn.classroomOccupancy', 'Classroom Occupancy')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.childCheckIn.classroom', 'Classroom')}</th>
                  <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.childCheckIn.ageGroup', 'Age Group')}</th>
                  <th className={`text-center p-4 font-medium ${mutedTextClass}`}>{t('tools.childCheckIn.enrolled', 'Enrolled')}</th>
                  <th className={`text-center p-4 font-medium ${mutedTextClass}`}>{t('tools.childCheckIn.present', 'Present')}</th>
                  <th className={`text-center p-4 font-medium ${mutedTextClass}`}>{t('tools.childCheckIn.capacity', 'Capacity')}</th>
                  <th className={`text-left p-4 font-medium ${mutedTextClass}`}>{t('tools.childCheckIn.occupancy', 'Occupancy')}</th>
                </tr>
              </thead>
              <tbody>
                {classroomStats.map(classroom => (
                  <tr key={classroom.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${textClass}`}>{classroom.name}</td>
                    <td className={`p-4 ${mutedTextClass}`}>{classroom.ageGroup}</td>
                    <td className={`p-4 text-center ${textClass}`}>{classroom.enrolled}</td>
                    <td className="p-4 text-center text-green-500">{classroom.presentToday}</td>
                    <td className={`p-4 text-center ${mutedTextClass}`}>{classroom.capacity}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              classroom.occupancy > 90 ? 'bg-red-500' :
                              classroom.occupancy > 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(classroom.occupancy, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm ${mutedTextClass}`}>{classroom.occupancy.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button onClick={handleExportData} className={buttonSecondary}>
            <Download className="w-4 h-4" /> Export Data
          </button>
        </div>
      </div>
    );
  };

  // Render Child Form Modal
  const renderChildFormModal = () => showChildForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <h3 className={`text-lg font-semibold ${textClass}`}>
            {editingChild ? t('tools.childCheckIn.editChild', 'Edit Child') : t('tools.childCheckIn.addNewChild', 'Add New Child')}
          </h3>
          <button onClick={() => { setShowChildForm(false); resetChildForm(); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Basic Info */}
          <div>
            <h4 className={`font-medium mb-3 ${textClass}`}>{t('tools.childCheckIn.basicInformation', 'Basic Information')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.firstName', 'First Name *')}</label>
                <input
                  type="text"
                  value={childForm.firstName || ''}
                  onChange={(e) => setChildForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className={inputClass}
                  placeholder={t('tools.childCheckIn.firstName2', 'First name')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.lastName', 'Last Name *')}</label>
                <input
                  type="text"
                  value={childForm.lastName || ''}
                  onChange={(e) => setChildForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className={inputClass}
                  placeholder={t('tools.childCheckIn.lastName2', 'Last name')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.dateOfBirth', 'Date of Birth *')}</label>
                <input
                  type="date"
                  value={childForm.dateOfBirth || ''}
                  onChange={(e) => setChildForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.classroom2', 'Classroom *')}</label>
                <select
                  value={childForm.classroomId || ''}
                  onChange={(e) => setChildForm(prev => ({ ...prev, classroomId: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">{t('tools.childCheckIn.selectClassroom', 'Select classroom')}</option>
                  {data.classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.ageGroup})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.photoUrl', 'Photo URL')}</label>
                <input
                  type="text"
                  value={childForm.photoUrl || ''}
                  onChange={(e) => setChildForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className={inputClass}
                  placeholder={t('tools.childCheckIn.https', 'https://...')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.status', 'Status')}</label>
                <select
                  value={childForm.status || 'active'}
                  onChange={(e) => setChildForm(prev => ({ ...prev, status: e.target.value as Child['status'] }))}
                  className={inputClass}
                >
                  <option value="active">{t('tools.childCheckIn.active', 'Active')}</option>
                  <option value="inactive">{t('tools.childCheckIn.inactive', 'Inactive')}</option>
                  <option value="waitlist">{t('tools.childCheckIn.waitlist', 'Waitlist')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div>
            <h4 className={`font-medium mb-3 ${textClass}`}>{t('tools.childCheckIn.medicalInformation', 'Medical Information')}</h4>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.allergies', 'Allergies')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                    className={`flex-1 ${inputClass}`}
                    placeholder={t('tools.childCheckIn.typeAllergyAndPressEnter', 'Type allergy and press Enter')}
                  />
                  <button onClick={handleAddAllergy} className={buttonSecondary}>{t('tools.childCheckIn.add', 'Add')}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(childForm.allergies || []).map((allergy, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">
                      {allergy}
                      <button onClick={() => handleRemoveAllergy(idx)} className="hover:text-red-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.medicalNotes', 'Medical Notes')}</label>
                <textarea
                  value={childForm.medicalNotes || ''}
                  onChange={(e) => setChildForm(prev => ({ ...prev, medicalNotes: e.target.value }))}
                  className={`${inputClass} h-20 resize-none`}
                  placeholder={t('tools.childCheckIn.anyMedicalConditionsMedicationsOr', 'Any medical conditions, medications, or special needs...')}
                />
              </div>
            </div>
          </div>

          {/* Guardians */}
          <div>
            <h4 className={`font-medium mb-3 ${textClass}`}>{t('tools.childCheckIn.guardians', 'Guardians')}</h4>
            {(childForm.guardians || []).length > 0 && (
              <div className="space-y-2 mb-4">
                {(childForm.guardians || []).map((guardian, idx) => (
                  <div key={guardian.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between`}>
                    <div>
                      <p className={`font-medium ${textClass}`}>{guardian.name}</p>
                      <p className={`text-sm ${mutedTextClass}`}>{guardian.relationship} - {guardian.phone}</p>
                    </div>
                    <button
                      onClick={() => setChildForm(prev => ({
                        ...prev,
                        guardians: (prev.guardians || []).filter((_, i) => i !== idx)
                      }))}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium mb-3 ${mutedTextClass}`}>{t('tools.childCheckIn.addGuardian', 'Add Guardian')}</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={guardianForm.name || ''}
                  onChange={(e) => setGuardianForm(prev => ({ ...prev, name: e.target.value }))}
                  className={inputClass}
                  placeholder={t('tools.childCheckIn.name', 'Name *')}
                />
                <input
                  type="text"
                  value={guardianForm.relationship || ''}
                  onChange={(e) => setGuardianForm(prev => ({ ...prev, relationship: e.target.value }))}
                  className={inputClass}
                  placeholder={t('tools.childCheckIn.relationship', 'Relationship *')}
                />
                <input
                  type="tel"
                  value={guardianForm.phone || ''}
                  onChange={(e) => setGuardianForm(prev => ({ ...prev, phone: e.target.value }))}
                  className={inputClass}
                  placeholder={t('tools.childCheckIn.phone', 'Phone *')}
                />
                <input
                  type="email"
                  value={guardianForm.email || ''}
                  onChange={(e) => setGuardianForm(prev => ({ ...prev, email: e.target.value }))}
                  className={inputClass}
                  placeholder={t('tools.childCheckIn.email', 'Email')}
                />
              </div>
              <div className="flex items-center gap-4 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianForm.isPrimary || false}
                    onChange={(e) => setGuardianForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className={`text-sm ${mutedTextClass}`}>{t('tools.childCheckIn.primaryGuardian', 'Primary Guardian')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianForm.isAuthorizedPickup !== false}
                    onChange={(e) => setGuardianForm(prev => ({ ...prev, isAuthorizedPickup: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className={`text-sm ${mutedTextClass}`}>{t('tools.childCheckIn.authorizedForPickup', 'Authorized for Pickup')}</span>
                </label>
                <button onClick={handleAddGuardian} className={`ml-auto ${buttonSecondary}`}>
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.additionalNotes', 'Additional Notes')}</label>
            <textarea
              value={childForm.notes || ''}
              onChange={(e) => setChildForm(prev => ({ ...prev, notes: e.target.value }))}
              className={`${inputClass} h-20 resize-none`}
              placeholder={t('tools.childCheckIn.anyAdditionalInformationAboutThe', 'Any additional information about the child...')}
            />
          </div>
        </div>

        <div className={`sticky bottom-0 p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex justify-end gap-3`}>
          <button onClick={() => { setShowChildForm(false); resetChildForm(); }} className={buttonSecondary}>{t('tools.childCheckIn.cancel', 'Cancel')}</button>
          <button onClick={handleSaveChild} className={buttonPrimary}>
            <Save className="w-4 h-4" /> Save Child
          </button>
        </div>
      </div>
    </div>
  );

  // Render Check-In Modal
  const renderCheckInModal = () => showCheckInModal && selectedChild && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`w-full max-w-md rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${textClass}`}>
            {isCheckedIn(selectedChild.id) ? t('tools.childCheckIn.checkOut', 'Check Out') : t('tools.childCheckIn.checkIn', 'Check In')} - {getChildFullName(selectedChild)}
          </h3>
          <button onClick={() => { setShowCheckInModal(false); setSelectedChild(null); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {selectedChild.allergies.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium mb-1">
                <AlertTriangle className="w-4 h-4" />
                {t('tools.childCheckIn.allergyAlert', 'Allergy Alert')}
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                {selectedChild.allergies.join(', ')}
              </p>
            </div>
          )}

          {isCheckedIn(selectedChild.id) ? (
            <>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.checkedOutBy', 'Checked Out By *')}</label>
                <input
                  type="text"
                  value={checkInForm.checkOutBy}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, checkOutBy: e.target.value }))}
                  className={inputClass}
                  placeholder={t('tools.childCheckIn.nameOfPersonPickingUp', 'Name of person picking up')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.authorizedPickup', 'Authorized Pickup')}</label>
                <select
                  value={checkInForm.authorizedPickupId}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, authorizedPickupId: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">{t('tools.childCheckIn.selectFromAuthorizedList', 'Select from authorized list')}</option>
                  {selectedChild.guardians.filter(g => g.isAuthorizedPickup).map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.relationship})</option>
                  ))}
                  {selectedChild.authorizedPickups.map(ap => (
                    <option key={ap.id} value={ap.id}>{ap.name} ({ap.relationship})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.notes', 'Notes')}</label>
                <textarea
                  value={checkInForm.checkOutNotes}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, checkOutNotes: e.target.value }))}
                  className={`${inputClass} h-20 resize-none`}
                  placeholder={t('tools.childCheckIn.anyNotesAboutCheckOut', 'Any notes about check-out...')}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.checkedInBy', 'Checked In By *')}</label>
                <input
                  type="text"
                  value={checkInForm.checkInBy}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, checkInBy: e.target.value }))}
                  className={inputClass}
                  placeholder={t('tools.childCheckIn.nameOfPersonDroppingOff', 'Name of person dropping off')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedTextClass}`}>{t('tools.childCheckIn.notes2', 'Notes')}</label>
                <textarea
                  value={checkInForm.checkInNotes}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, checkInNotes: e.target.value }))}
                  className={`${inputClass} h-20 resize-none`}
                  placeholder={t('tools.childCheckIn.anyNotesAboutCheckIn', 'Any notes about check-in (e.g., had breakfast, medication given)...')}
                />
              </div>
            </>
          )}
        </div>

        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
          <button onClick={() => { setShowCheckInModal(false); setSelectedChild(null); }} className={buttonSecondary}>
            {t('tools.childCheckIn.cancel2', 'Cancel')}
          </button>
          {isCheckedIn(selectedChild.id) ? (
            <button onClick={handlePerformCheckOut} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <LogOut className="w-4 h-4" /> Check Out
            </button>
          ) : (
            <button onClick={handlePerformCheckIn} className={buttonPrimary}>
              <LogIn className="w-4 h-4" /> Check In
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
            <p className="text-red-700 dark:text-red-400">{validationMessage}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${cardClass} border rounded-xl p-4 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488]/10 rounded-lg">
                <Baby className="w-6 h-6 text-[#0D9488]" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${textClass}`}>{t('tools.childCheckIn.childCheckIn', 'Child Check-In')}</h1>
                <p className={`text-sm ${mutedTextClass}`}>{t('tools.childCheckIn.manageCheckInsForDaycare', 'Manage check-ins for daycare, church, or school')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="child-check-in" toolName="Child Check In" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={handleLoadSampleData} className={buttonSecondary}>
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">{t('tools.childCheckIn.loadSample', 'Load Sample')}</span>
              </button>
              <ExportDropdown
                onExportCSV={() => exportToCSV(data.children, childColumns, { filename: 'child-checkin-children' })}
                onExportExcel={() => exportToExcel(data.children, childColumns, { filename: 'child-checkin-children' })}
                onExportJSON={() => exportToJSON(data.children, { filename: 'child-checkin-children' })}
                onExportPDF={async () => {
                  await exportToPDF(data.children, childColumns, {
                    filename: 'child-checkin-children',
                    title: 'Child Check-In Report',
                    subtitle: `Generated on ${new Date().toLocaleDateString()}`,
                  });
                }}
                onPrint={() => printData(data.children, childColumns, { title: 'Child Check-In Report' })}
                onCopyToClipboard={async () => copyUtil(data.children, childColumns)}
                theme={isDark ? 'dark' : 'light'}
                showImport={false}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`${cardClass} border rounded-xl p-2 mb-6 overflow-x-auto`}>
          <div className="flex items-center gap-1 min-w-max">
            <TabButton tab="children" icon={Baby} label="Children" />
            <TabButton tab="checkin" icon={UserCheck} label="Check-In" />
            <TabButton tab="guardians" icon={Users} label="Guardians" />
            <TabButton tab="reports" icon={FileText} label="Reports" />
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'children' && renderChildrenTab()}
          {activeTab === 'checkin' && renderCheckInTab()}
          {activeTab === 'guardians' && renderGuardiansTab()}
          {activeTab === 'reports' && renderReportsTab()}
        </div>

        {/* Modals */}
        {renderChildFormModal()}
        {renderCheckInModal()}

        {/* Confirmation Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ChildCheckInTool;
