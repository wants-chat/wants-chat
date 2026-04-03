'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  Calendar,
  DollarSign,
  Award,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  ClipboardList,
  FileText,
  Shield,
  Heart,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
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

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  goals: string;
  notes: string;
  startDate: string;
  status: 'active' | 'inactive' | 'paused';
  assessments: FitnessAssessment[];
  totalPaid: number;
  outstandingBalance: number;
}

interface FitnessAssessment {
  id: string;
  date: string;
  weight: number;
  bodyFatPercentage: number;
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    arms: number;
    thighs: number;
  };
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  notes: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  hourlyRate: number;
  contactPerson: string;
  contactPhone: string;
  notes: string;
}

interface ClassSchedule {
  id: string;
  name: string;
  locationId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  ratePerClass: number;
  recurring: boolean;
  attendees: string[];
}

interface PrivateSession {
  id: string;
  clientId: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
  rate: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  paid: boolean;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'circuit' | 'sports';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    notes: string;
  }[];
  notes: string;
}

interface Certification {
  id: string;
  name: string;
  organization: string;
  dateObtained: string;
  expirationDate: string;
  certNumber: string;
  type: 'fitness' | 'cpr' | 'first-aid' | 'specialty';
}

interface Insurance {
  id: string;
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  startDate: string;
  expirationDate: string;
  type: 'liability' | 'professional' | 'equipment';
}

interface SubRequest {
  id: string;
  classId: string;
  date: string;
  reason: string;
  status: 'pending' | 'filled' | 'unfilled';
  substituteInstructor: string;
}

interface Payment {
  id: string;
  clientId: string;
  sessionId?: string;
  classId?: string;
  amount: number;
  date: string;
  method: 'cash' | 'card' | 'transfer' | 'check';
  notes: string;
}

type TabType = 'clients' | 'schedule' | 'sessions' | 'templates' | 'payments' | 'certifications' | 'locations' | 'analytics';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Column configurations for each entity type
const clientColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'goals', header: 'Goals', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'totalPaid', header: 'Total Paid', type: 'currency' },
];

const locationColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'contactPerson', header: 'Contact Person', type: 'string' },
  { key: 'contactPhone', header: 'Contact Phone', type: 'string' },
];

const classScheduleColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Class Name', type: 'string' },
  { key: 'dayOfWeek', header: 'Day', type: 'string' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'maxCapacity', header: 'Max Capacity', type: 'number' },
  { key: 'ratePerClass', header: 'Rate', type: 'currency' },
];

const privateSessionColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'clientId', header: 'Client ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'rate', header: 'Rate', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'paid', header: 'Paid', type: 'boolean' },
];

const workoutTemplateColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'difficulty', header: 'Difficulty', type: 'string' },
];

const certificationColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'organization', header: 'Organization', type: 'string' },
  { key: 'dateObtained', header: 'Date Obtained', type: 'date' },
  { key: 'expirationDate', header: 'Expiration Date', type: 'date' },
  { key: 'certNumber', header: 'Cert Number', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
];

const insuranceColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'provider', header: 'Provider', type: 'string' },
  { key: 'policyNumber', header: 'Policy Number', type: 'string' },
  { key: 'coverageAmount', header: 'Coverage Amount', type: 'currency' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'expirationDate', header: 'Expiration Date', type: 'date' },
  { key: 'type', header: 'Type', type: 'string' },
];

const subRequestColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'classId', header: 'Class ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'reason', header: 'Reason', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'substituteInstructor', header: 'Substitute', type: 'string' },
];

const paymentColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'clientId', header: 'Client ID', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'method', header: 'Method', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

interface FitnessInstructorToolProps {
  uiConfig?: UIConfig;
}

export const FitnessInstructorTool: React.FC<FitnessInstructorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<TabType>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Initialize useToolData hooks for each entity type with backend sync
  const clientsData = useToolData<Client>(
    'fitness-instructor-clients',
    [],
    clientColumns,
    { autoSave: true }
  );

  const locationsData = useToolData<Location>(
    'fitness-instructor-locations',
    [],
    locationColumns,
    { autoSave: true }
  );

  const classSchedulesData = useToolData<ClassSchedule>(
    'fitness-instructor-classes',
    [],
    classScheduleColumns,
    { autoSave: true }
  );

  const privateSessionsData = useToolData<PrivateSession>(
    'fitness-instructor-sessions',
    [],
    privateSessionColumns,
    { autoSave: true }
  );

  const workoutTemplatesData = useToolData<WorkoutTemplate>(
    'fitness-instructor-templates',
    [],
    workoutTemplateColumns,
    { autoSave: true }
  );

  const certificationsData = useToolData<Certification>(
    'fitness-instructor-certifications',
    [],
    certificationColumns,
    { autoSave: true }
  );

  const insuranceData = useToolData<Insurance>(
    'fitness-instructor-insurance',
    [],
    insuranceColumns,
    { autoSave: true }
  );

  const subRequestsData = useToolData<SubRequest>(
    'fitness-instructor-sub-requests',
    [],
    subRequestColumns,
    { autoSave: true }
  );

  const paymentsData = useToolData<Payment>(
    'fitness-instructor-payments',
    [],
    paymentColumns,
    { autoSave: true }
  );

  // Create a unified data object for convenience (read-only access)
  const data = useMemo(() => ({
    clients: clientsData.data,
    locations: locationsData.data,
    classSchedules: classSchedulesData.data,
    privateSessions: privateSessionsData.data,
    workoutTemplates: workoutTemplatesData.data,
    certifications: certificationsData.data,
    insurance: insuranceData.data,
    subRequests: subRequestsData.data,
    payments: paymentsData.data,
  }), [
    clientsData.data,
    locationsData.data,
    classSchedulesData.data,
    privateSessionsData.data,
    workoutTemplatesData.data,
    certificationsData.data,
    insuranceData.data,
    subRequestsData.data,
    paymentsData.data,
  ]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Form states
  const [clientForm, setClientForm] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    goals: '',
    notes: '',
    status: 'active',
  });

  const [locationForm, setLocationForm] = useState<Partial<Location>>({
    name: '',
    address: '',
    hourlyRate: 0,
    contactPerson: '',
    contactPhone: '',
    notes: '',
  });

  const [classForm, setClassForm] = useState<Partial<ClassSchedule>>({
    name: '',
    locationId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    maxCapacity: 10,
    ratePerClass: 50,
    recurring: true,
    attendees: [],
  });

  const [sessionForm, setSessionForm] = useState<Partial<PrivateSession>>({
    clientId: '',
    locationId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    rate: 75,
    status: 'scheduled',
    notes: '',
    paid: false,
  });

  const [templateForm, setTemplateForm] = useState<Partial<WorkoutTemplate>>({
    name: '',
    category: 'strength',
    duration: 60,
    difficulty: 'intermediate',
    exercises: [],
    notes: '',
  });

  const [certForm, setCertForm] = useState<Partial<Certification>>({
    name: '',
    organization: '',
    dateObtained: '',
    expirationDate: '',
    certNumber: '',
    type: 'fitness',
  });

  const [insuranceForm, setInsuranceForm] = useState<Partial<Insurance>>({
    provider: '',
    policyNumber: '',
    coverageAmount: 0,
    startDate: '',
    expirationDate: '',
    type: 'liability',
  });

  const [subRequestForm, setSubRequestForm] = useState<Partial<SubRequest>>({
    classId: '',
    date: '',
    reason: '',
    status: 'pending',
    substituteInstructor: '',
  });

  const [paymentForm, setPaymentForm] = useState<Partial<Payment>>({
    clientId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    notes: '',
  });

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // CRUD operations for Clients
  const addClient = () => {
    if (!clientForm.name) return;
    const newClient: Client = {
      id: generateId(),
      name: clientForm.name || '',
      email: clientForm.email || '',
      phone: clientForm.phone || '',
      goals: clientForm.goals || '',
      notes: clientForm.notes || '',
      startDate: new Date().toISOString().split('T')[0],
      status: clientForm.status || 'active',
      assessments: [],
      totalPaid: 0,
      outstandingBalance: 0,
    };
    clientsData.addItem(newClient);
    setClientForm({ name: '', email: '', phone: '', goals: '', notes: '', status: 'active' });
    setShowAddForm(false);
  };

  const updateClient = (id: string) => {
    clientsData.updateItem(id, clientForm);
    setEditingId(null);
    setClientForm({ name: '', email: '', phone: '', goals: '', notes: '', status: 'active' });
  };

  const deleteClient = async (id: string) => {
    const confirmed = await confirm({ title: 'Delete Client', message: 'Are you sure you want to delete this client?', confirmText: 'Delete', cancelText: 'Cancel', variant: 'danger' });
    if (confirmed) {
      clientsData.deleteItem(id);
    }
  };

  // CRUD operations for Locations
  const addLocation = () => {
    if (!locationForm.name) return;
    const newLocation: Location = {
      id: generateId(),
      name: locationForm.name || '',
      address: locationForm.address || '',
      hourlyRate: locationForm.hourlyRate || 0,
      contactPerson: locationForm.contactPerson || '',
      contactPhone: locationForm.contactPhone || '',
      notes: locationForm.notes || '',
    };
    locationsData.addItem(newLocation);
    setLocationForm({ name: '', address: '', hourlyRate: 0, contactPerson: '', contactPhone: '', notes: '' });
    setShowAddForm(false);
  };

  const deleteLocation = async (id: string) => {
    const confirmed = await confirm({ title: 'Delete Location', message: 'Are you sure you want to delete this location?', confirmText: 'Delete', cancelText: 'Cancel', variant: 'danger' });
    if (confirmed) {
      locationsData.deleteItem(id);
    }
  };

  // CRUD operations for Class Schedules
  const addClass = () => {
    if (!classForm.name || !classForm.locationId) return;
    const newClass: ClassSchedule = {
      id: generateId(),
      name: classForm.name || '',
      locationId: classForm.locationId || '',
      dayOfWeek: classForm.dayOfWeek || 'Monday',
      startTime: classForm.startTime || '09:00',
      endTime: classForm.endTime || '10:00',
      maxCapacity: classForm.maxCapacity || 10,
      ratePerClass: classForm.ratePerClass || 50,
      recurring: classForm.recurring ?? true,
      attendees: [],
    };
    classSchedulesData.addItem(newClass);
    setClassForm({ name: '', locationId: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', maxCapacity: 10, ratePerClass: 50, recurring: true, attendees: [] });
    setShowAddForm(false);
  };

  const deleteClass = async (id: string) => {
    const confirmed = await confirm({ title: 'Delete Class', message: 'Are you sure you want to delete this class?', confirmText: 'Delete', cancelText: 'Cancel', variant: 'danger' });
    if (confirmed) {
      classSchedulesData.deleteItem(id);
    }
  };

  const addAttendee = (classId: string, clientId: string) => {
    const classSchedule = data.classSchedules.find((c) => c.id === classId);
    if (classSchedule && !classSchedule.attendees.includes(clientId) && classSchedule.attendees.length < classSchedule.maxCapacity) {
      classSchedulesData.updateItem(classId, { attendees: [...classSchedule.attendees, clientId] });
    }
  };

  const removeAttendee = (classId: string, clientId: string) => {
    const classSchedule = data.classSchedules.find((c) => c.id === classId);
    if (classSchedule) {
      classSchedulesData.updateItem(classId, { attendees: classSchedule.attendees.filter((a) => a !== clientId) });
    }
  };

  // CRUD operations for Private Sessions
  const addSession = () => {
    if (!sessionForm.clientId || !sessionForm.locationId) return;
    const newSession: PrivateSession = {
      id: generateId(),
      clientId: sessionForm.clientId || '',
      locationId: sessionForm.locationId || '',
      date: sessionForm.date || new Date().toISOString().split('T')[0],
      startTime: sessionForm.startTime || '09:00',
      endTime: sessionForm.endTime || '10:00',
      rate: sessionForm.rate || 75,
      status: 'scheduled',
      notes: sessionForm.notes || '',
      paid: false,
    };
    privateSessionsData.addItem(newSession);
    setSessionForm({ clientId: '', locationId: '', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00', rate: 75, status: 'scheduled', notes: '', paid: false });
    setShowAddForm(false);
  };

  const updateSessionStatus = (id: string, status: PrivateSession['status']) => {
    privateSessionsData.updateItem(id, { status });
  };

  const markSessionPaid = (id: string) => {
    privateSessionsData.updateItem(id, { paid: true });
  };

  const deleteSession = async (id: string) => {
    const confirmed = await confirm({ title: 'Delete Session', message: 'Are you sure you want to delete this session?', confirmText: 'Delete', cancelText: 'Cancel', variant: 'danger' });
    if (confirmed) {
      privateSessionsData.deleteItem(id);
    }
  };

  // CRUD operations for Workout Templates
  const addTemplate = () => {
    if (!templateForm.name) return;
    const newTemplate: WorkoutTemplate = {
      id: generateId(),
      name: templateForm.name || '',
      category: templateForm.category || 'strength',
      duration: templateForm.duration || 60,
      difficulty: templateForm.difficulty || 'intermediate',
      exercises: templateForm.exercises || [],
      notes: templateForm.notes || '',
    };
    workoutTemplatesData.addItem(newTemplate);
    setTemplateForm({ name: '', category: 'strength', duration: 60, difficulty: 'intermediate', exercises: [], notes: '' });
    setShowAddForm(false);
  };

  const deleteTemplate = async (id: string) => {
    const confirmed = await confirm({ title: 'Delete Template', message: 'Are you sure you want to delete this template?', confirmText: 'Delete', cancelText: 'Cancel', variant: 'danger' });
    if (confirmed) {
      workoutTemplatesData.deleteItem(id);
    }
  };

  // CRUD operations for Certifications
  const addCertification = () => {
    if (!certForm.name) return;
    const newCert: Certification = {
      id: generateId(),
      name: certForm.name || '',
      organization: certForm.organization || '',
      dateObtained: certForm.dateObtained || '',
      expirationDate: certForm.expirationDate || '',
      certNumber: certForm.certNumber || '',
      type: certForm.type || 'fitness',
    };
    certificationsData.addItem(newCert);
    setCertForm({ name: '', organization: '', dateObtained: '', expirationDate: '', certNumber: '', type: 'fitness' });
    setShowAddForm(false);
  };

  const deleteCertification = async (id: string) => {
    const confirmed = await confirm({ title: 'Delete Certification', message: 'Are you sure you want to delete this certification?', confirmText: 'Delete', cancelText: 'Cancel', variant: 'danger' });
    if (confirmed) {
      certificationsData.deleteItem(id);
    }
  };

  // CRUD operations for Insurance
  const addInsurance = () => {
    if (!insuranceForm.provider) return;
    const newInsurance: Insurance = {
      id: generateId(),
      provider: insuranceForm.provider || '',
      policyNumber: insuranceForm.policyNumber || '',
      coverageAmount: insuranceForm.coverageAmount || 0,
      startDate: insuranceForm.startDate || '',
      expirationDate: insuranceForm.expirationDate || '',
      type: insuranceForm.type || 'liability',
    };
    insuranceData.addItem(newInsurance);
    setInsuranceForm({ provider: '', policyNumber: '', coverageAmount: 0, startDate: '', expirationDate: '', type: 'liability' });
    setShowAddForm(false);
  };

  const deleteInsurance = async (id: string) => {
    const confirmed = await confirm({ title: 'Delete Insurance', message: 'Are you sure you want to delete this insurance?', confirmText: 'Delete', cancelText: 'Cancel', variant: 'danger' });
    if (confirmed) {
      insuranceData.deleteItem(id);
    }
  };

  // CRUD operations for Sub Requests
  const addSubRequest = () => {
    if (!subRequestForm.classId || !subRequestForm.date) return;
    const newSubRequest: SubRequest = {
      id: generateId(),
      classId: subRequestForm.classId || '',
      date: subRequestForm.date || '',
      reason: subRequestForm.reason || '',
      status: 'pending',
      substituteInstructor: '',
    };
    subRequestsData.addItem(newSubRequest);
    setSubRequestForm({ classId: '', date: '', reason: '', status: 'pending', substituteInstructor: '' });
    setShowAddForm(false);
  };

  const updateSubRequest = (id: string, update: Partial<SubRequest>) => {
    subRequestsData.updateItem(id, update);
  };

  const deleteSubRequest = async (id: string) => {
    const confirmed = await confirm({ title: 'Delete Sub Request', message: 'Are you sure you want to delete this sub request?', confirmText: 'Delete', cancelText: 'Cancel', variant: 'danger' });
    if (confirmed) {
      subRequestsData.deleteItem(id);
    }
  };

  // CRUD operations for Payments
  const addPayment = () => {
    if (!paymentForm.clientId || !paymentForm.amount) return;
    const newPayment: Payment = {
      id: generateId(),
      clientId: paymentForm.clientId || '',
      amount: paymentForm.amount || 0,
      date: paymentForm.date || new Date().toISOString().split('T')[0],
      method: paymentForm.method || 'cash',
      notes: paymentForm.notes || '',
    };
    paymentsData.addItem(newPayment);

    // Update client's totalPaid
    const client = data.clients.find((c) => c.id === paymentForm.clientId);
    if (client) {
      clientsData.updateItem(client.id, { totalPaid: client.totalPaid + (paymentForm.amount || 0) });
    }

    setPaymentForm({ clientId: '', amount: 0, date: new Date().toISOString().split('T')[0], method: 'cash', notes: '' });
    setShowAddForm(false);
  };

  const deletePayment = async (id: string) => {
    const payment = data.payments.find((p) => p.id === id);
    if (payment) {
      const confirmed = await confirm({ title: 'Delete Payment', message: 'Are you sure you want to delete this payment?', confirmText: 'Delete', cancelText: 'Cancel', variant: 'danger' });
      if (confirmed) {
        paymentsData.deleteItem(id);

        // Update client's totalPaid
        const client = data.clients.find((c) => c.id === payment.clientId);
        if (client) {
          clientsData.updateItem(client.id, { totalPaid: client.totalPaid - payment.amount });
        }
      }
    }
  };

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalClients = data.clients.length;
    const activeClients = data.clients.filter((c) => c.status === 'active').length;
    const totalSessions = data.privateSessions.length;
    const completedSessions = data.privateSessions.filter((s) => s.status === 'completed').length;
    const totalClasses = data.classSchedules.length;

    const sessionRevenue = data.privateSessions
      .filter((s) => s.status === 'completed' && s.paid)
      .reduce((sum, s) => sum + s.rate, 0);

    const classRevenue = data.classSchedules.reduce((sum, c) => {
      const attendeeCount = c.attendees.length;
      return sum + c.ratePerClass * attendeeCount;
    }, 0);

    const totalRevenue = sessionRevenue + classRevenue;
    const totalPayments = data.payments.reduce((sum, p) => sum + p.amount, 0);

    const revenueByClient = data.clients.map((client) => {
      const clientSessions = data.privateSessions
        .filter((s) => s.clientId === client.id && s.status === 'completed' && s.paid)
        .reduce((sum, s) => sum + s.rate, 0);
      const clientPayments = data.payments
        .filter((p) => p.clientId === client.id)
        .reduce((sum, p) => sum + p.amount, 0);
      return { name: client.name, revenue: clientSessions + clientPayments };
    }).sort((a, b) => b.revenue - a.revenue);

    const revenueByClass = data.classSchedules.map((cls) => ({
      name: cls.name,
      revenue: cls.ratePerClass * cls.attendees.length,
      attendees: cls.attendees.length,
    })).sort((a, b) => b.revenue - a.revenue);

    const expiringCerts = data.certifications.filter((cert) => {
      const expDate = new Date(cert.expirationDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    });

    const expiredCerts = data.certifications.filter((cert) => {
      const expDate = new Date(cert.expirationDate);
      return expDate < new Date();
    });

    const expiringInsurance = data.insurance.filter((ins) => {
      const expDate = new Date(ins.expirationDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    });

    const pendingSubRequests = data.subRequests.filter((s) => s.status === 'pending').length;

    return {
      totalClients,
      activeClients,
      totalSessions,
      completedSessions,
      totalClasses,
      sessionRevenue,
      classRevenue,
      totalRevenue,
      totalPayments,
      revenueByClient,
      revenueByClass,
      expiringCerts,
      expiredCerts,
      expiringInsurance,
      pendingSubRequests,
    };
  }, [data]);

  // Filter helpers
  const getClientName = (id: string) => data.clients.find((c) => c.id === id)?.name || 'Unknown';
  const getLocationName = (id: string) => data.locations.find((l) => l.id === id)?.name || 'Unknown';
  const getClassName = (id: string) => data.classSchedules.find((c) => c.id === id)?.name || 'Unknown';

  // Certification expiry check
  const getDaysUntilExpiry = (date: string) => {
    const expDate = new Date(date);
    const today = new Date();
    return Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (date: string) => {
    const days = getDaysUntilExpiry(date);
    if (days < 0) return { status: 'expired', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
    if (days <= 30) return { status: 'critical', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    if (days <= 90) return { status: 'warning', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { status: 'valid', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
    { id: 'schedule', label: 'Classes', icon: <Calendar className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'certifications', label: 'Certs & Insurance', icon: <Award className="w-4 h-4" /> },
    { id: 'locations', label: 'Locations', icon: <MapPin className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const buttonPrimary = 'bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2';

  const buttonSecondary = `${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  } font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2`;

  const cardClass = `${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.fitnessInstructor.fitnessInstructorManager', 'Fitness Instructor Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.fitnessInstructor.manageClientsClassesSessionsAnd', 'Manage clients, classes, sessions, and more')}
                </p>
              </div>
            </div>

            {/* Prefill Indicator */}
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 mb-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm text-[#0D9488] font-medium">{t('tools.fitnessInstructor.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
              </div>
            )}

            {/* Alerts and Sync Status */}
            <div className="flex items-center gap-4">
              {analytics.expiredCerts.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {analytics.expiredCerts.length} Expired Cert(s)
                </div>
              )}
              {analytics.pendingSubRequests > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full text-sm">
                  <RefreshCw className="w-4 h-4" />
                  {analytics.pendingSubRequests} Sub Request(s)
                </div>
              )}
              <WidgetEmbedButton toolSlug="fitness-instructor" toolName="Fitness Instructor" />

              <SyncStatus
                isSynced={clientsData.isSynced}
                isSaving={clientsData.isSaving}
                lastSaved={clientsData.lastSaved}
                syncError={clientsData.syncError}
                onForceSync={clientsData.forceSync}
                theme={theme}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => clientsData.exportCSV({ filename: 'fitness-instructor-clients' })}
                onExportExcel={() => clientsData.exportExcel({ filename: 'fitness-instructor-clients' })}
                onExportJSON={() => clientsData.exportJSON({ filename: 'fitness-instructor-clients' })}
                onExportPDF={() => clientsData.exportPDF({
                  filename: 'fitness-instructor-clients',
                  title: 'Fitness Instructor - Clients Report',
                  subtitle: `Total Clients: ${data.clients.length} | Active: ${data.clients.filter(c => c.status === 'active').length}`,
                  orientation: 'landscape',
                })}
                onPrint={() => clientsData.print('Fitness Instructor - Clients Report')}
                onCopyToClipboard={() => clientsData.copyToClipboard('tab')}
                disabled={data.clients.length === 0}
                theme={theme}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowAddForm(false);
                  setEditingId(null);
                }}
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

        {/* Main Content */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Search and Add Button */}
          {activeTab !== 'analytics' && (
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder={t('tools.fitnessInstructor.search', 'Search...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={buttonPrimary}
              >
                <Plus className="w-4 h-4" />
                {t('tools.fitnessInstructor.addNew', 'Add New')}
              </button>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              {showAddForm && (
                <div className={cardClass}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.addNewClient', 'Add New Client')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.fitnessInstructor.name', 'Name *')}
                      value={clientForm.name || ''}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="email"
                      placeholder={t('tools.fitnessInstructor.email', 'Email')}
                      value={clientForm.email || ''}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="tel"
                      placeholder={t('tools.fitnessInstructor.phone', 'Phone')}
                      value={clientForm.phone || ''}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className={inputClass}
                    />
                    <select
                      value={clientForm.status || 'active'}
                      onChange={(e) => setClientForm({ ...clientForm, status: e.target.value as Client['status'] })}
                      className={inputClass}
                    >
                      <option value="active">{t('tools.fitnessInstructor.active', 'Active')}</option>
                      <option value="inactive">{t('tools.fitnessInstructor.inactive', 'Inactive')}</option>
                      <option value="paused">{t('tools.fitnessInstructor.paused', 'Paused')}</option>
                    </select>
                    <textarea
                      placeholder={t('tools.fitnessInstructor.goals2', 'Goals')}
                      value={clientForm.goals || ''}
                      onChange={(e) => setClientForm({ ...clientForm, goals: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                      rows={2}
                    />
                    <textarea
                      placeholder={t('tools.fitnessInstructor.notes2', 'Notes')}
                      value={clientForm.notes || ''}
                      onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addClient} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.fitnessInstructor.saveClient', 'Save Client')}
                    </button>
                    <button onClick={() => setShowAddForm(false)} className={buttonSecondary}>
                      <X className="w-4 h-4" />
                      {t('tools.fitnessInstructor.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {data.clients
                .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((client) => (
                  <div key={client.id} className={cardClass}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          client.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : client.status === 'paused'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Users className={`w-5 h-5 ${
                            client.status === 'active'
                              ? 'text-green-600 dark:text-green-400'
                              : client.status === 'paused'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {client.name}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {client.email} | {client.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          client.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : client.status === 'paused'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {client.status}
                        </span>
                        <button
                          onClick={() => toggleExpand(client.id)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          {expandedItems.has(client.id) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {expandedItems.has(client.id) && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.fitnessInstructor.startDate', 'Start Date')}
                            </p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {client.startDate}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.fitnessInstructor.totalPaid', 'Total Paid')}
                            </p>
                            <p className="text-green-500 font-semibold">
                              ${client.totalPaid.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.fitnessInstructor.goals', 'Goals')}
                            </p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {client.goals || 'Not specified'}
                            </p>
                          </div>
                        </div>
                        {client.notes && (
                          <div className="mt-4">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.fitnessInstructor.notes', 'Notes')}
                            </p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {client.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

              {data.clients.length === 0 && (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.fitnessInstructor.noClientsYetAddYour', 'No clients yet. Add your first client to get started.')}</p>
                </div>
              )}
            </div>
          )}

          {/* Classes/Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {showAddForm && (
                <div className={cardClass}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.addNewClass', 'Add New Class')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.fitnessInstructor.className', 'Class Name *')}
                      value={classForm.name || ''}
                      onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                      className={inputClass}
                    />
                    <select
                      value={classForm.locationId || ''}
                      onChange={(e) => setClassForm({ ...classForm, locationId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.fitnessInstructor.selectLocation', 'Select Location *')}</option>
                      {data.locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                    <select
                      value={classForm.dayOfWeek || 'Monday'}
                      onChange={(e) => setClassForm({ ...classForm, dayOfWeek: e.target.value })}
                      className={inputClass}
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={classForm.startTime || '09:00'}
                        onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="time"
                        value={classForm.endTime || '10:00'}
                        onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <input
                      type="number"
                      placeholder={t('tools.fitnessInstructor.maxCapacity', 'Max Capacity')}
                      value={classForm.maxCapacity || ''}
                      onChange={(e) => setClassForm({ ...classForm, maxCapacity: parseInt(e.target.value) })}
                      className={inputClass}
                    />
                    <input
                      type="number"
                      placeholder={t('tools.fitnessInstructor.ratePerClass', 'Rate per Class ($)')}
                      value={classForm.ratePerClass || ''}
                      onChange={(e) => setClassForm({ ...classForm, ratePerClass: parseFloat(e.target.value) })}
                      className={inputClass}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={classForm.recurring ?? true}
                        onChange={(e) => setClassForm({ ...classForm, recurring: e.target.checked })}
                        className="w-4 h-4 text-[#0D9488] rounded"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {t('tools.fitnessInstructor.recurringWeekly', 'Recurring Weekly')}
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addClass} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.fitnessInstructor.saveClass', 'Save Class')}
                    </button>
                    <button onClick={() => setShowAddForm(false)} className={buttonSecondary}>
                      <X className="w-4 h-4" />
                      {t('tools.fitnessInstructor.cancel2', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Sub Request Form */}
              {data.subRequests.filter((s) => s.status === 'pending').length > 0 && (
                <div className={`${cardClass} border-l-4 border-yellow-500`}>
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.pendingSubRequests', 'Pending Sub Requests')}
                  </h3>
                  {data.subRequests.filter((s) => s.status === 'pending').map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div>
                        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {getClassName(sub.classId)} - {sub.date}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {sub.reason}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSubRequest(sub.id, { status: 'filled' })}
                          className="px-2 py-1 text-sm bg-green-500 text-white rounded"
                        >
                          {t('tools.fitnessInstructor.markFilled', 'Mark Filled')}
                        </button>
                        <button
                          onClick={() => deleteSubRequest(sub.id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Classes by Day */}
              {daysOfWeek.map((day) => {
                const dayClasses = data.classSchedules.filter(
                  (c) => c.dayOfWeek === day && c.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (dayClasses.length === 0) return null;

                return (
                  <div key={day}>
                    <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {day}
                    </h3>
                    <div className="space-y-2">
                      {dayClasses.map((cls) => (
                        <div key={cls.id} className={cardClass}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {cls.name}
                              </h4>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {cls.startTime} - {cls.endTime} @ {getLocationName(cls.locationId)}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <Users className="w-4 h-4 inline mr-1" />
                                  {cls.attendees.length}/{cls.maxCapacity}
                                </span>
                                <span className="text-sm text-green-500 font-medium">
                                  ${cls.ratePerClass}/class
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSubRequestForm({ ...subRequestForm, classId: cls.id });
                                  // Toggle sub request form
                                }}
                                className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
                                title={t('tools.fitnessInstructor.requestSub', 'Request Sub')}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteClass(cls.id)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Attendees Management */}
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.fitnessInstructor.attendees', 'Attendees')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {cls.attendees.map((clientId) => (
                                <span
                                  key={clientId}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                  }`}
                                >
                                  {getClientName(clientId)}
                                  <button
                                    onClick={() => removeAttendee(cls.id, clientId)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                              {cls.attendees.length < cls.maxCapacity && (
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      addAttendee(cls.id, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  className={`${inputClass} w-40`}
                                  defaultValue=""
                                >
                                  <option value="">{t('tools.fitnessInstructor.addClient', 'Add client...')}</option>
                                  {data.clients
                                    .filter((c) => c.status === 'active' && !cls.attendees.includes(c.id))
                                    .map((c) => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {data.classSchedules.length === 0 && (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.fitnessInstructor.noClassesScheduledAddYour', 'No classes scheduled. Add your first class to get started.')}</p>
                </div>
              )}
            </div>
          )}

          {/* Private Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {showAddForm && (
                <div className={cardClass}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.bookPrivateSession', 'Book Private Session')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={sessionForm.clientId || ''}
                      onChange={(e) => setSessionForm({ ...sessionForm, clientId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.fitnessInstructor.selectClient', 'Select Client *')}</option>
                      {data.clients.filter((c) => c.status === 'active').map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      value={sessionForm.locationId || ''}
                      onChange={(e) => setSessionForm({ ...sessionForm, locationId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.fitnessInstructor.selectLocation2', 'Select Location *')}</option>
                      {data.locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={sessionForm.date || ''}
                      onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                      className={inputClass}
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={sessionForm.startTime || '09:00'}
                        onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="time"
                        value={sessionForm.endTime || '10:00'}
                        onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <input
                      type="number"
                      placeholder={t('tools.fitnessInstructor.rate', 'Rate ($)')}
                      value={sessionForm.rate || ''}
                      onChange={(e) => setSessionForm({ ...sessionForm, rate: parseFloat(e.target.value) })}
                      className={inputClass}
                    />
                    <textarea
                      placeholder={t('tools.fitnessInstructor.notes3', 'Notes')}
                      value={sessionForm.notes || ''}
                      onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                      className={inputClass}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addSession} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.fitnessInstructor.bookSession', 'Book Session')}
                    </button>
                    <button onClick={() => setShowAddForm(false)} className={buttonSecondary}>
                      <X className="w-4 h-4" />
                      {t('tools.fitnessInstructor.cancel3', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {data.privateSessions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .filter((s) => getClientName(s.clientId).toLowerCase().includes(searchTerm.toLowerCase()))
                .map((session) => (
                  <div key={session.id} className={cardClass}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {getClientName(session.clientId)}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {session.date} | {session.startTime} - {session.endTime}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          @ {getLocationName(session.locationId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          session.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : session.status === 'cancelled'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : session.status === 'no-show'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                          {session.status}
                        </span>
                        {session.paid && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            {t('tools.fitnessInstructor.paid', 'Paid')}
                          </span>
                        )}
                        <span className="text-green-500 font-semibold">
                          ${session.rate}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {session.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => updateSessionStatus(session.id, 'completed')}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            {t('tools.fitnessInstructor.complete', 'Complete')}
                          </button>
                          <button
                            onClick={() => updateSessionStatus(session.id, 'cancelled')}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            {t('tools.fitnessInstructor.cancel4', 'Cancel')}
                          </button>
                          <button
                            onClick={() => updateSessionStatus(session.id, 'no-show')}
                            className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                          >
                            {t('tools.fitnessInstructor.noShow', 'No Show')}
                          </button>
                        </>
                      )}
                      {session.status === 'completed' && !session.paid && (
                        <button
                          onClick={() => markSessionPaid(session.id)}
                          className="px-3 py-1 text-sm bg-[#0D9488] text-white rounded hover:bg-[#0F766E]"
                        >
                          {t('tools.fitnessInstructor.markPaid', 'Mark Paid')}
                        </button>
                      )}
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="px-3 py-1 text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

              {data.privateSessions.length === 0 && (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.fitnessInstructor.noSessionsScheduledBookYour', 'No sessions scheduled. Book your first session to get started.')}</p>
                </div>
              )}
            </div>
          )}

          {/* Workout Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {showAddForm && (
                <div className={cardClass}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.createWorkoutTemplate', 'Create Workout Template')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.fitnessInstructor.templateName', 'Template Name *')}
                      value={templateForm.name || ''}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className={inputClass}
                    />
                    <select
                      value={templateForm.category || 'strength'}
                      onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value as WorkoutTemplate['category'] })}
                      className={inputClass}
                    >
                      <option value="strength">{t('tools.fitnessInstructor.strength', 'Strength')}</option>
                      <option value="cardio">{t('tools.fitnessInstructor.cardio', 'Cardio')}</option>
                      <option value="flexibility">{t('tools.fitnessInstructor.flexibility', 'Flexibility')}</option>
                      <option value="hiit">{t('tools.fitnessInstructor.hiit', 'HIIT')}</option>
                      <option value="circuit">{t('tools.fitnessInstructor.circuit', 'Circuit')}</option>
                      <option value="sports">{t('tools.fitnessInstructor.sports', 'Sports')}</option>
                    </select>
                    <input
                      type="number"
                      placeholder={t('tools.fitnessInstructor.durationMinutes', 'Duration (minutes)')}
                      value={templateForm.duration || ''}
                      onChange={(e) => setTemplateForm({ ...templateForm, duration: parseInt(e.target.value) })}
                      className={inputClass}
                    />
                    <select
                      value={templateForm.difficulty || 'intermediate'}
                      onChange={(e) => setTemplateForm({ ...templateForm, difficulty: e.target.value as WorkoutTemplate['difficulty'] })}
                      className={inputClass}
                    >
                      <option value="beginner">{t('tools.fitnessInstructor.beginner', 'Beginner')}</option>
                      <option value="intermediate">{t('tools.fitnessInstructor.intermediate', 'Intermediate')}</option>
                      <option value="advanced">{t('tools.fitnessInstructor.advanced', 'Advanced')}</option>
                    </select>
                    <textarea
                      placeholder={t('tools.fitnessInstructor.notes4', 'Notes')}
                      value={templateForm.notes || ''}
                      onChange={(e) => setTemplateForm({ ...templateForm, notes: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addTemplate} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.fitnessInstructor.saveTemplate', 'Save Template')}
                    </button>
                    <button onClick={() => setShowAddForm(false)} className={buttonSecondary}>
                      <X className="w-4 h-4" />
                      {t('tools.fitnessInstructor.cancel5', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.workoutTemplates
                  .filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((template) => (
                    <div key={template.id} className={cardClass}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {template.name}
                        </h4>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          {template.category}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          template.difficulty === 'beginner'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : template.difficulty === 'intermediate'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {template.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          {template.duration} min
                        </span>
                      </div>
                      {template.notes && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {template.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>

              {data.workoutTemplates.length === 0 && (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.fitnessInstructor.noWorkoutTemplatesCreateYour', 'No workout templates. Create your first template to get started.')}</p>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              {showAddForm && (
                <div className={cardClass}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.recordPayment', 'Record Payment')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={paymentForm.clientId || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, clientId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.fitnessInstructor.selectClient2', 'Select Client *')}</option>
                      {data.clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder={t('tools.fitnessInstructor.amount', 'Amount ($) *')}
                      value={paymentForm.amount || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                      className={inputClass}
                    />
                    <input
                      type="date"
                      value={paymentForm.date || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                      className={inputClass}
                    />
                    <select
                      value={paymentForm.method || 'cash'}
                      onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as Payment['method'] })}
                      className={inputClass}
                    >
                      <option value="cash">{t('tools.fitnessInstructor.cash', 'Cash')}</option>
                      <option value="card">{t('tools.fitnessInstructor.card', 'Card')}</option>
                      <option value="transfer">{t('tools.fitnessInstructor.bankTransfer', 'Bank Transfer')}</option>
                      <option value="check">{t('tools.fitnessInstructor.check', 'Check')}</option>
                    </select>
                    <textarea
                      placeholder={t('tools.fitnessInstructor.notes5', 'Notes')}
                      value={paymentForm.notes || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addPayment} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.fitnessInstructor.recordPayment2', 'Record Payment')}
                    </button>
                    <button onClick={() => setShowAddForm(false)} className={buttonSecondary}>
                      <X className="w-4 h-4" />
                      {t('tools.fitnessInstructor.cancel6', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {data.payments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .filter((p) => getClientName(p.clientId).toLowerCase().includes(searchTerm.toLowerCase()))
                .map((payment) => (
                  <div key={payment.id} className={cardClass}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {getClientName(payment.clientId)}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {payment.date} | {payment.method}
                        </p>
                        {payment.notes && (
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {payment.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-green-500">
                          ${payment.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => deletePayment(payment.id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {data.payments.length === 0 && (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.fitnessInstructor.noPaymentsRecordedRecordYour', 'No payments recorded. Record your first payment to get started.')}</p>
                </div>
              )}
            </div>
          )}

          {/* Certifications & Insurance Tab */}
          {activeTab === 'certifications' && (
            <div className="space-y-6">
              {/* Certifications Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.certifications', 'Certifications')}
                  </h3>
                  <button
                    onClick={() => setShowAddForm(showAddForm === 'cert' ? false : 'cert' as any)}
                    className={buttonPrimary}
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.fitnessInstructor.addCertification', 'Add Certification')}
                  </button>
                </div>

                {showAddForm === ('cert' as any) && (
                  <div className={cardClass}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder={t('tools.fitnessInstructor.certificationName', 'Certification Name *')}
                        value={certForm.name || ''}
                        onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.fitnessInstructor.organization', 'Organization')}
                        value={certForm.organization || ''}
                        onChange={(e) => setCertForm({ ...certForm, organization: e.target.value })}
                        className={inputClass}
                      />
                      <select
                        value={certForm.type || 'fitness'}
                        onChange={(e) => setCertForm({ ...certForm, type: e.target.value as Certification['type'] })}
                        className={inputClass}
                      >
                        <option value="fitness">{t('tools.fitnessInstructor.fitnessCertification', 'Fitness Certification')}</option>
                        <option value="cpr">{t('tools.fitnessInstructor.cprCertification', 'CPR Certification')}</option>
                        <option value="first-aid">{t('tools.fitnessInstructor.firstAid', 'First Aid')}</option>
                        <option value="specialty">{t('tools.fitnessInstructor.specialty', 'Specialty')}</option>
                      </select>
                      <input
                        type="text"
                        placeholder={t('tools.fitnessInstructor.certificateNumber', 'Certificate Number')}
                        value={certForm.certNumber || ''}
                        onChange={(e) => setCertForm({ ...certForm, certNumber: e.target.value })}
                        className={inputClass}
                      />
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.fitnessInstructor.dateObtained', 'Date Obtained')}
                        </label>
                        <input
                          type="date"
                          value={certForm.dateObtained || ''}
                          onChange={(e) => setCertForm({ ...certForm, dateObtained: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.fitnessInstructor.expirationDate', 'Expiration Date')}
                        </label>
                        <input
                          type="date"
                          value={certForm.expirationDate || ''}
                          onChange={(e) => setCertForm({ ...certForm, expirationDate: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={addCertification} className={buttonPrimary}>
                        <Save className="w-4 h-4" />
                        {t('tools.fitnessInstructor.saveCertification', 'Save Certification')}
                      </button>
                      <button onClick={() => setShowAddForm(false)} className={buttonSecondary}>
                        <X className="w-4 h-4" />
                        {t('tools.fitnessInstructor.cancel7', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.certifications.map((cert) => {
                    const expiry = getExpiryStatus(cert.expirationDate);
                    return (
                      <div key={cert.id} className={`${cardClass} ${expiry.bg}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {cert.type === 'cpr' ? (
                                <Heart className="w-5 h-5 text-red-500" />
                              ) : cert.type === 'first-aid' ? (
                                <Shield className="w-5 h-5 text-blue-500" />
                              ) : (
                                <Award className="w-5 h-5 text-[#0D9488]" />
                              )}
                              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {cert.name}
                              </h4>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {cert.organization}
                            </p>
                            {cert.certNumber && (
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                #{cert.certNumber}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteCertification(cert.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Expires: {cert.expirationDate}
                            </span>
                            <span className={`text-sm font-medium ${expiry.color}`}>
                              {expiry.status === 'expired'
                                ? 'EXPIRED'
                                : `${getDaysUntilExpiry(cert.expirationDate)} days left`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {data.certifications.length === 0 && (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.fitnessInstructor.noCertificationsAddedYet', 'No certifications added yet.')}</p>
                  </div>
                )}
              </div>

              {/* Insurance Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.insurancePolicies', 'Insurance Policies')}
                  </h3>
                  <button
                    onClick={() => setShowAddForm(showAddForm === 'insurance' ? false : 'insurance' as any)}
                    className={buttonPrimary}
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.fitnessInstructor.addInsurance', 'Add Insurance')}
                  </button>
                </div>

                {showAddForm === ('insurance' as any) && (
                  <div className={cardClass}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder={t('tools.fitnessInstructor.insuranceProvider', 'Insurance Provider *')}
                        value={insuranceForm.provider || ''}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, provider: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.fitnessInstructor.policyNumber', 'Policy Number')}
                        value={insuranceForm.policyNumber || ''}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })}
                        className={inputClass}
                      />
                      <select
                        value={insuranceForm.type || 'liability'}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, type: e.target.value as Insurance['type'] })}
                        className={inputClass}
                      >
                        <option value="liability">{t('tools.fitnessInstructor.liabilityInsurance', 'Liability Insurance')}</option>
                        <option value="professional">{t('tools.fitnessInstructor.professionalLiability', 'Professional Liability')}</option>
                        <option value="equipment">{t('tools.fitnessInstructor.equipmentInsurance', 'Equipment Insurance')}</option>
                      </select>
                      <input
                        type="number"
                        placeholder={t('tools.fitnessInstructor.coverageAmount', 'Coverage Amount ($)')}
                        value={insuranceForm.coverageAmount || ''}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, coverageAmount: parseFloat(e.target.value) })}
                        className={inputClass}
                      />
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.fitnessInstructor.startDate2', 'Start Date')}
                        </label>
                        <input
                          type="date"
                          value={insuranceForm.startDate || ''}
                          onChange={(e) => setInsuranceForm({ ...insuranceForm, startDate: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.fitnessInstructor.expirationDate2', 'Expiration Date')}
                        </label>
                        <input
                          type="date"
                          value={insuranceForm.expirationDate || ''}
                          onChange={(e) => setInsuranceForm({ ...insuranceForm, expirationDate: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={addInsurance} className={buttonPrimary}>
                        <Save className="w-4 h-4" />
                        {t('tools.fitnessInstructor.saveInsurance', 'Save Insurance')}
                      </button>
                      <button onClick={() => setShowAddForm(false)} className={buttonSecondary}>
                        <X className="w-4 h-4" />
                        {t('tools.fitnessInstructor.cancel8', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.insurance.map((ins) => {
                    const expiry = getExpiryStatus(ins.expirationDate);
                    return (
                      <div key={ins.id} className={`${cardClass} ${expiry.bg}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-5 h-5 text-blue-500" />
                              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {ins.provider}
                              </h4>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {ins.type.replace('-', ' ').toUpperCase()}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              Policy: {ins.policyNumber}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteInsurance(ins.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.fitnessInstructor.coverage', 'Coverage')}
                            </span>
                            <span className="text-sm font-semibold text-green-500">
                              ${ins.coverageAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Expires: {ins.expirationDate}
                            </span>
                            <span className={`text-sm font-medium ${expiry.color}`}>
                              {expiry.status === 'expired'
                                ? 'EXPIRED'
                                : `${getDaysUntilExpiry(ins.expirationDate)} days left`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {data.insurance.length === 0 && (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.fitnessInstructor.noInsurancePoliciesAddedYet', 'No insurance policies added yet.')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              {showAddForm && (
                <div className={cardClass}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.addNewLocation', 'Add New Location')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.fitnessInstructor.locationName', 'Location Name *')}
                      value={locationForm.name || ''}
                      onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="number"
                      placeholder={t('tools.fitnessInstructor.hourlyRate', 'Hourly Rate ($)')}
                      value={locationForm.hourlyRate || ''}
                      onChange={(e) => setLocationForm({ ...locationForm, hourlyRate: parseFloat(e.target.value) })}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.fitnessInstructor.address', 'Address')}
                      value={locationForm.address || ''}
                      onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.fitnessInstructor.contactPerson', 'Contact Person')}
                      value={locationForm.contactPerson || ''}
                      onChange={(e) => setLocationForm({ ...locationForm, contactPerson: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="tel"
                      placeholder={t('tools.fitnessInstructor.contactPhone', 'Contact Phone')}
                      value={locationForm.contactPhone || ''}
                      onChange={(e) => setLocationForm({ ...locationForm, contactPhone: e.target.value })}
                      className={inputClass}
                    />
                    <textarea
                      placeholder={t('tools.fitnessInstructor.notes6', 'Notes')}
                      value={locationForm.notes || ''}
                      onChange={(e) => setLocationForm({ ...locationForm, notes: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addLocation} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.fitnessInstructor.saveLocation', 'Save Location')}
                    </button>
                    <button onClick={() => setShowAddForm(false)} className={buttonSecondary}>
                      <X className="w-4 h-4" />
                      {t('tools.fitnessInstructor.cancel9', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.locations
                  .filter((l) => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((location) => (
                    <div key={location.id} className={cardClass}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#0D9488]" />
                            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {location.name}
                            </h4>
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {location.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500 font-semibold">
                            ${location.hourlyRate}/hr
                          </span>
                          <button
                            onClick={() => deleteLocation(location.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {(location.contactPerson || location.contactPhone) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Contact: {location.contactPerson} {location.contactPhone && `| ${location.contactPhone}`}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {data.locations.length === 0 && (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.fitnessInstructor.noLocationsAddedAddYour', 'No locations added. Add your first location to get started.')}</p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={cardClass}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.fitnessInstructor.activeClients', 'Active Clients')}
                      </p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {analytics.activeClients} / {analytics.totalClients}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cardClass}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.fitnessInstructor.totalRevenue', 'Total Revenue')}
                      </p>
                      <p className={`text-2xl font-bold text-green-500`}>
                        ${analytics.totalPayments.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cardClass}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Clock className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.fitnessInstructor.sessionsCompleted', 'Sessions Completed')}
                      </p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {analytics.completedSessions} / {analytics.totalSessions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cardClass}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Calendar className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.fitnessInstructor.weeklyClasses', 'Weekly Classes')}
                      </p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {analytics.totalClasses}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Client */}
                <div className={cardClass}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.revenueByClient', 'Revenue by Client')}
                  </h3>
                  {analytics.revenueByClient.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.revenueByClient.slice(0, 5).map((client, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {client.name}
                          </span>
                          <span className="font-semibold text-green-500">
                            ${client.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.fitnessInstructor.noRevenueDataYet', 'No revenue data yet')}
                    </p>
                  )}
                </div>

                {/* Revenue by Class */}
                <div className={cardClass}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fitnessInstructor.revenueByClass', 'Revenue by Class')}
                  </h3>
                  {analytics.revenueByClass.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.revenueByClass.slice(0, 5).map((cls, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {cls.name}
                            </span>
                            <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              ({cls.attendees} attendees)
                            </span>
                          </div>
                          <span className="font-semibold text-green-500">
                            ${cls.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.fitnessInstructor.noClassRevenueDataYet', 'No class revenue data yet')}
                    </p>
                  )}
                </div>
              </div>

              {/* Alerts Section */}
              {(analytics.expiringCerts.length > 0 || analytics.expiredCerts.length > 0 || analytics.expiringInsurance.length > 0) && (
                <div className={`${cardClass} border-l-4 border-yellow-500`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <AlertTriangle className="w-5 h-5 inline mr-2 text-yellow-500" />
                    {t('tools.fitnessInstructor.importantAlerts', 'Important Alerts')}
                  </h3>
                  <div className="space-y-2">
                    {analytics.expiredCerts.map((cert) => (
                      <div key={cert.id} className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{cert.name} certification has EXPIRED</span>
                      </div>
                    ))}
                    {analytics.expiringCerts.map((cert) => (
                      <div key={cert.id} className="flex items-center gap-2 text-yellow-500">
                        <Clock className="w-4 h-4" />
                        <span>{cert.name} expires in {getDaysUntilExpiry(cert.expirationDate)} days</span>
                      </div>
                    ))}
                    {analytics.expiringInsurance.map((ins) => (
                      <div key={ins.id} className="flex items-center gap-2 text-yellow-500">
                        <Shield className="w-4 h-4" />
                        <span>{ins.provider} insurance expires in {getDaysUntilExpiry(ins.expirationDate)} days</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.fitnessInstructor.aboutFitnessInstructorManager', 'About Fitness Instructor Manager')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            A comprehensive tool for freelance fitness instructors to manage their business.
            Track clients, schedule classes and private sessions, manage workout templates,
            record payments, and keep certifications and insurance up to date.
            All data is stored locally in your browser for privacy.
          </p>
        </div>

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default FitnessInstructorTool;
