'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  parseCSV,
  readFileAsText,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Users,
  Calendar,
  FileText,
  Gift,
  DollarSign,
  Clock,
  Heart,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Repeat,
  Home,
  Activity,
  Check,
  ClipboardList,
  Star,
  BadgeDollarSign,
  Loader2,
} from 'lucide-react';

// Types
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyPhone: string;
  createdAt: string;
  notes: string;
}

interface HealthHistory {
  clientId: string;
  conditions: string[];
  surgeries: string;
  medications: string;
  allergies: string[];
  contraindications: string[];
  bloodPressure: string;
  pregnant: boolean;
  pregnancyTrimester?: string;
  recentInjuries: string;
  preferences: {
    pressurePreference: 'light' | 'medium' | 'deep' | 'varies';
    areasToAvoid: string[];
    areasToFocus: string[];
    preferredTechniques: string[];
    roomTemperature: 'cool' | 'warm' | 'hot';
    musicPreference: string;
    aromatherapyPreference: string;
  };
  intakeFormCompleted: boolean;
  intakeFormDate: string;
  lastUpdated: string;
}

interface Therapist {
  id: string;
  name: string;
  specialties: string[];
  certifications: string[];
  availability: { [key: string]: { start: string; end: string }[] };
  color: string;
}

interface Room {
  id: string;
  name: string;
  features: string[];
  available: boolean;
}

interface Session {
  id: string;
  clientId: string;
  therapistId: string;
  roomId: string;
  date: string;
  startTime: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  price: number;
  tipAmount: number;
  notes: string;
  treatmentNotes?: TreatmentNote;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    endDate?: string;
  };
}

interface TreatmentNote {
  areasWorked: string[];
  techniques: string[];
  pressureUsed: 'light' | 'medium' | 'deep' | 'varied';
  clientFeedback: string;
  recommendations: string;
  productRecommendations: string[];
  followUpNeeded: boolean;
  bodyDiagramNotes: { [area: string]: string };
}

interface SessionPackage {
  id: string;
  clientId: string;
  name: string;
  totalSessions: number;
  sessionsUsed: number;
  purchaseDate: string;
  expirationDate: string;
  price: number;
  sessionType: string;
}

interface GiftCertificate {
  id: string;
  code: string;
  amount: number;
  balance: number;
  purchaserName: string;
  recipientName: string;
  recipientEmail: string;
  purchaseDate: string;
  expirationDate: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedDate?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

// Combined data type for backend sync
interface MassageTherapyData {
  id: string;
  clients: Client[];
  healthHistories: HealthHistory[];
  therapists: Therapist[];
  rooms: Room[];
  sessions: Session[];
  packages: SessionPackage[];
  giftCertificates: GiftCertificate[];
  products: Product[];
}

// Default data
const defaultTherapists: Therapist[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    specialties: ['Swedish', 'Deep Tissue', 'Sports Massage'],
    certifications: ['LMT', 'NCBTMB'],
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '15:00' }],
    },
    color: '#0D9488',
  },
  {
    id: '2',
    name: 'Michael Chen',
    specialties: ['Thai Massage', 'Shiatsu', 'Reflexology'],
    certifications: ['LMT', 'Thai Massage Certified'],
    availability: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      saturday: [{ start: '09:00', end: '14:00' }],
    },
    color: '#6366F1',
  },
];

const defaultRooms: Room[] = [
  { id: '1', name: 'Serenity Suite', features: ['Heated Table', 'Sound System', 'Aromatherapy'], available: true },
  { id: '2', name: 'Tranquility Room', features: ['Standard Table', 'Sound System'], available: true },
  { id: '3', name: 'Wellness Studio', features: ['Heated Table', 'Hot Stones', 'Sound System', 'Aromatherapy'], available: true },
];

const defaultProducts: Product[] = [
  { id: '1', name: 'Relaxation Massage Oil', description: 'Lavender-infused massage oil', price: 24.99, category: 'Oils', inStock: true },
  { id: '2', name: 'Deep Tissue Balm', description: 'Muscle relief balm', price: 19.99, category: 'Balms', inStock: true },
  { id: '3', name: 'Hot Stone Set', description: 'Basalt hot stone kit', price: 89.99, category: 'Equipment', inStock: true },
  { id: '4', name: 'Aromatherapy Diffuser', description: 'Ultrasonic diffuser', price: 34.99, category: 'Aromatherapy', inStock: true },
  { id: '5', name: 'Epsom Salt Bath Soak', description: 'Muscle recovery bath soak', price: 14.99, category: 'Bath', inStock: true },
];

const massageTechniques = [
  'Swedish', 'Deep Tissue', 'Sports Massage', 'Thai Massage', 'Shiatsu',
  'Hot Stone', 'Aromatherapy', 'Reflexology', 'Trigger Point', 'Myofascial Release',
  'Prenatal', 'Lymphatic Drainage', 'Cupping', 'Craniosacral',
];

const bodyAreas = [
  'Head/Scalp', 'Face', 'Neck', 'Shoulders', 'Upper Back', 'Middle Back', 'Lower Back',
  'Left Arm', 'Right Arm', 'Left Hand', 'Right Hand', 'Chest', 'Abdomen',
  'Glutes', 'Left Hip', 'Right Hip', 'Left Thigh', 'Right Thigh',
  'Left Calf', 'Right Calf', 'Left Foot', 'Right Foot',
];

const commonConditions = [
  'Arthritis', 'Fibromyalgia', 'Chronic Pain', 'Diabetes', 'Heart Condition',
  'High Blood Pressure', 'Low Blood Pressure', 'Varicose Veins', 'Osteoporosis',
  'Cancer', 'Skin Conditions', 'Blood Clots', 'Recent Surgery',
];

const commonAllergens = [
  'Nuts', 'Latex', 'Fragrances', 'Essential Oils', 'Coconut Oil',
  'Almond Oil', 'Lanolin', 'Propylene Glycol',
];

type TabType = 'clients' | 'scheduling' | 'sessions' | 'packages' | 'gifts' | 'products' | 'therapists' | 'rooms';

interface MassageTherapyToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for export (defined at module level for useToolData)
const MASSAGE_DATA_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
];

// Default combined data
const defaultMassageData: MassageTherapyData[] = [{
  id: 'massage-therapy-data',
  clients: [],
  healthHistories: [],
  therapists: defaultTherapists,
  rooms: defaultRooms,
  sessions: [],
  packages: [],
  giftCertificates: [],
  products: defaultProducts,
}];

export const MassageTherapyTool = ({ uiConfig }: MassageTherapyToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<TabType>('clients');

  // Use the useToolData hook for backend persistence
  const toolData = useToolData<MassageTherapyData>(
    'massage-therapy',
    defaultMassageData,
    MASSAGE_DATA_COLUMNS,
    { autoSave: true }
  );

  // Extract individual data arrays from the combined data structure
  const massageData = toolData.data[0] || defaultMassageData[0];
  const clients = massageData.clients || [];
  const healthHistories = massageData.healthHistories || [];
  const therapists = massageData.therapists?.length ? massageData.therapists : defaultTherapists;
  const rooms = massageData.rooms?.length ? massageData.rooms : defaultRooms;
  const sessions = massageData.sessions || [];
  const packages = massageData.packages || [];
  const giftCertificates = massageData.giftCertificates || [];
  const products = massageData.products?.length ? massageData.products : defaultProducts;

  // Sync state from hook
  const { isLoading, isSaving, isSynced, lastSaved, syncError, forceSync } = toolData;

  // Helper to update the combined data
  const updateMassageData = useCallback((updates: Partial<MassageTherapyData>) => {
    const currentData = toolData.data[0] || defaultMassageData[0];
    const updatedData: MassageTherapyData = {
      ...currentData,
      ...updates,
    };
    toolData.setData([updatedData]);
  }, [toolData]);

  // Setters that update the combined data structure
  const setClients = useCallback((clientsOrUpdater: Client[] | ((prev: Client[]) => Client[])) => {
    const newClients = typeof clientsOrUpdater === 'function'
      ? clientsOrUpdater(clients)
      : clientsOrUpdater;
    updateMassageData({ clients: newClients });
  }, [clients, updateMassageData]);

  const setHealthHistories = useCallback((historiesOrUpdater: HealthHistory[] | ((prev: HealthHistory[]) => HealthHistory[])) => {
    const newHistories = typeof historiesOrUpdater === 'function'
      ? historiesOrUpdater(healthHistories)
      : historiesOrUpdater;
    updateMassageData({ healthHistories: newHistories });
  }, [healthHistories, updateMassageData]);

  const setTherapists = useCallback((therapistsOrUpdater: Therapist[] | ((prev: Therapist[]) => Therapist[])) => {
    const newTherapists = typeof therapistsOrUpdater === 'function'
      ? therapistsOrUpdater(therapists)
      : therapistsOrUpdater;
    updateMassageData({ therapists: newTherapists });
  }, [therapists, updateMassageData]);

  const setRooms = useCallback((roomsOrUpdater: Room[] | ((prev: Room[]) => Room[])) => {
    const newRooms = typeof roomsOrUpdater === 'function'
      ? roomsOrUpdater(rooms)
      : roomsOrUpdater;
    updateMassageData({ rooms: newRooms });
  }, [rooms, updateMassageData]);

  const setSessions = useCallback((sessionsOrUpdater: Session[] | ((prev: Session[]) => Session[])) => {
    const newSessions = typeof sessionsOrUpdater === 'function'
      ? sessionsOrUpdater(sessions)
      : sessionsOrUpdater;
    updateMassageData({ sessions: newSessions });
  }, [sessions, updateMassageData]);

  const setPackages = useCallback((packagesOrUpdater: SessionPackage[] | ((prev: SessionPackage[]) => SessionPackage[])) => {
    const newPackages = typeof packagesOrUpdater === 'function'
      ? packagesOrUpdater(packages)
      : packagesOrUpdater;
    updateMassageData({ packages: newPackages });
  }, [packages, updateMassageData]);

  const setGiftCertificates = useCallback((giftsOrUpdater: GiftCertificate[] | ((prev: GiftCertificate[]) => GiftCertificate[])) => {
    const newGifts = typeof giftsOrUpdater === 'function'
      ? giftsOrUpdater(giftCertificates)
      : giftsOrUpdater;
    updateMassageData({ giftCertificates: newGifts });
  }, [giftCertificates, updateMassageData]);

  const setProducts = useCallback((productsOrUpdater: Product[] | ((prev: Product[]) => Product[])) => {
    const newProducts = typeof productsOrUpdater === 'function'
      ? productsOrUpdater(products)
      : productsOrUpdater;
    updateMassageData({ products: newProducts });
  }, [products, updateMassageData]);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showTreatmentNotes, setShowTreatmentNotes] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Client name can be prefilled - show client form
      if (params.texts && params.texts.length > 0) {
        setShowClientForm(true);
        setIsPrefilled(true);
      }
      // Date can be prefilled for sessions
      if (params.dates && params.dates.length > 0) {
        setSelectedDate(params.dates[0]);
        setActiveTab('scheduling');
        setIsPrefilled(true);
      }
      // Search term from notes
      if (params.notes) {
        setSearchTerm(params.notes);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Generate gift certificate code
  const generateGiftCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GC-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  // Sessions for selected date
  const sessionsForDate = useMemo(() => {
    return sessions.filter(session => session.date === selectedDate);
  }, [sessions, selectedDate]);

  // Get client by ID
  const getClientById = (id: string) => clients.find(c => c.id === id);
  const getTherapistById = (id: string) => therapists.find(t => t.id === id);
  const getRoomById = (id: string) => rooms.find(r => r.id === id);
  const getHealthHistory = (clientId: string) => healthHistories.find(h => h.clientId === clientId);

  // Client CRUD operations
  const handleSaveClient = (clientData: Partial<Client>) => {
    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...clientData } : c));
    } else {
      const newClient: Client = {
        id: generateId(),
        firstName: clientData.firstName || '',
        lastName: clientData.lastName || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
        dateOfBirth: clientData.dateOfBirth || '',
        emergencyContact: clientData.emergencyContact || '',
        emergencyPhone: clientData.emergencyPhone || '',
        createdAt: new Date().toISOString(),
        notes: clientData.notes || '',
      };
      setClients(prev => [...prev, newClient]);
    }
    setShowClientForm(false);
    setEditingClient(null);
  };

  const handleDeleteClient = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client? This will also delete their health history and sessions.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setClients(prev => prev.filter(c => c.id !== id));
      setHealthHistories(prev => prev.filter(h => h.clientId !== id));
      setSessions(prev => prev.filter(s => s.clientId !== id));
      setPackages(prev => prev.filter(p => p.clientId !== id));
    }
  };

  // Health History operations
  const handleSaveHealthHistory = (clientId: string, healthData: Partial<HealthHistory>) => {
    const existing = healthHistories.find(h => h.clientId === clientId);
    if (existing) {
      setHealthHistories(prev => prev.map(h =>
        h.clientId === clientId
          ? { ...h, ...healthData, lastUpdated: new Date().toISOString() }
          : h
      ));
    } else {
      const newHealth: HealthHistory = {
        clientId,
        conditions: healthData.conditions || [],
        surgeries: healthData.surgeries || '',
        medications: healthData.medications || '',
        allergies: healthData.allergies || [],
        contraindications: healthData.contraindications || [],
        bloodPressure: healthData.bloodPressure || '',
        pregnant: healthData.pregnant || false,
        pregnancyTrimester: healthData.pregnancyTrimester,
        recentInjuries: healthData.recentInjuries || '',
        preferences: healthData.preferences || {
          pressurePreference: 'medium',
          areasToAvoid: [],
          areasToFocus: [],
          preferredTechniques: [],
          roomTemperature: 'warm',
          musicPreference: '',
          aromatherapyPreference: '',
        },
        intakeFormCompleted: true,
        intakeFormDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      setHealthHistories(prev => [...prev, newHealth]);
    }
    setShowHealthForm(false);
  };

  // Session operations
  const handleSaveSession = (sessionData: Partial<Session>) => {
    if (selectedSession) {
      setSessions(prev => prev.map(s => s.id === selectedSession.id ? { ...s, ...sessionData } : s));
    } else {
      const newSession: Session = {
        id: generateId(),
        clientId: sessionData.clientId || '',
        therapistId: sessionData.therapistId || '',
        roomId: sessionData.roomId || '',
        date: sessionData.date || selectedDate,
        startTime: sessionData.startTime || '09:00',
        duration: sessionData.duration || 60,
        type: sessionData.type || 'Swedish Massage',
        status: 'scheduled',
        price: sessionData.price || 80,
        tipAmount: 0,
        notes: sessionData.notes || '',
        isRecurring: sessionData.isRecurring || false,
        recurringPattern: sessionData.recurringPattern,
      };
      setSessions(prev => [...prev, newSession]);

      // Create recurring sessions if applicable
      if (newSession.isRecurring && newSession.recurringPattern) {
        const recurringSessions: Session[] = [];
        let currentDate = new Date(newSession.date);
        const endDate = newSession.recurringPattern.endDate
          ? new Date(newSession.recurringPattern.endDate)
          : new Date(currentDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days default

        const daysToAdd = newSession.recurringPattern.frequency === 'weekly' ? 7
          : newSession.recurringPattern.frequency === 'biweekly' ? 14 : 30;

        while (currentDate < endDate) {
          currentDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
          if (currentDate <= endDate) {
            recurringSessions.push({
              ...newSession,
              id: generateId(),
              date: currentDate.toISOString().split('T')[0],
            });
          }
        }
        setSessions(prev => [...prev, ...recurringSessions]);
      }
    }
    setShowSessionForm(false);
    setSelectedSession(null);
  };

  const handleUpdateSessionStatus = (sessionId: string, status: Session['status']) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s));
  };

  const handleAddTip = (sessionId: string, tipAmount: number) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, tipAmount } : s));
  };

  // Package operations
  const handleSavePackage = (packageData: Partial<SessionPackage>) => {
    const newPackage: SessionPackage = {
      id: generateId(),
      clientId: packageData.clientId || '',
      name: packageData.name || '',
      totalSessions: packageData.totalSessions || 5,
      sessionsUsed: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      expirationDate: packageData.expirationDate || '',
      price: packageData.price || 0,
      sessionType: packageData.sessionType || 'Any',
    };
    setPackages(prev => [...prev, newPackage]);
    setShowPackageForm(false);
  };

  const handleUsePackageSession = (packageId: string) => {
    setPackages(prev => prev.map(p =>
      p.id === packageId && p.sessionsUsed < p.totalSessions
        ? { ...p, sessionsUsed: p.sessionsUsed + 1 }
        : p
    ));
  };

  // Gift Certificate operations
  const handleSaveGiftCertificate = (giftData: Partial<GiftCertificate>) => {
    const newGift: GiftCertificate = {
      id: generateId(),
      code: generateGiftCode(),
      amount: giftData.amount || 0,
      balance: giftData.amount || 0,
      purchaserName: giftData.purchaserName || '',
      recipientName: giftData.recipientName || '',
      recipientEmail: giftData.recipientEmail || '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expirationDate: giftData.expirationDate || '',
      isRedeemed: false,
    };
    setGiftCertificates(prev => [...prev, newGift]);
    setShowGiftForm(false);
  };

  const handleRedeemGiftCertificate = (code: string, amount: number, redeemedBy: string) => {
    setGiftCertificates(prev => prev.map(g => {
      if (g.code === code && g.balance >= amount) {
        return {
          ...g,
          balance: g.balance - amount,
          isRedeemed: g.balance - amount === 0,
          redeemedBy,
          redeemedDate: new Date().toISOString(),
        };
      }
      return g;
    }));
  };

  // Treatment Notes
  const handleSaveTreatmentNotes = (sessionId: string, notes: TreatmentNote) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, treatmentNotes: notes, status: 'completed' } : s
    ));
    setShowTreatmentNotes(false);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todaySessions = sessions.filter(s => s.date === today);
    const monthSessions = sessions.filter(s => s.date.startsWith(thisMonth));
    const completedMonthSessions = monthSessions.filter(s => s.status === 'completed');

    const monthRevenue = completedMonthSessions.reduce((sum, s) => sum + s.price, 0);
    const monthTips = completedMonthSessions.reduce((sum, s) => sum + s.tipAmount, 0);

    const activePackages = packages.filter(p =>
      p.sessionsUsed < p.totalSessions && new Date(p.expirationDate) > new Date()
    );

    const activeGiftCerts = giftCertificates.filter(g =>
      g.balance > 0 && new Date(g.expirationDate) > new Date()
    );

    return {
      totalClients: clients.length,
      todayAppointments: todaySessions.length,
      monthlyRevenue: monthRevenue,
      monthlyTips: monthTips,
      activePackages: activePackages.length,
      activeGiftCertificates: activeGiftCerts.length,
      pendingIntakeForms: clients.filter(c => !getHealthHistory(c.id)?.intakeFormCompleted).length,
    };
  }, [clients, sessions, packages, giftCertificates, healthHistories]);

  // Column configurations for export
  const CLIENT_COLUMNS: ColumnConfig[] = [
    { key: 'firstName', header: 'First Name', type: 'string' },
    { key: 'lastName', header: 'Last Name', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'phone', header: 'Phone', type: 'string' },
    { key: 'address', header: 'Address', type: 'string' },
    { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
    { key: 'emergencyContact', header: 'Emergency Contact', type: 'string' },
    { key: 'emergencyPhone', header: 'Emergency Phone', type: 'string' },
    { key: 'createdAt', header: 'Created At', type: 'date' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const SESSION_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'Session ID', type: 'string' },
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'startTime', header: 'Start Time', type: 'string' },
    { key: 'duration', header: 'Duration (min)', type: 'number' },
    { key: 'type', header: 'Session Type', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'tipAmount', header: 'Tip Amount', type: 'currency' },
    { key: 'notes', header: 'Notes', type: 'string' },
    { key: 'isRecurring', header: 'Recurring', type: 'boolean' },
  ];

  const PACKAGE_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'Package ID', type: 'string' },
    { key: 'name', header: 'Package Name', type: 'string' },
    { key: 'totalSessions', header: 'Total Sessions', type: 'number' },
    { key: 'sessionsUsed', header: 'Sessions Used', type: 'number' },
    { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
    { key: 'expirationDate', header: 'Expiration Date', type: 'date' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'sessionType', header: 'Session Type', type: 'string' },
  ];

  const GIFT_COLUMNS: ColumnConfig[] = [
    { key: 'code', header: 'Gift Code', type: 'string' },
    { key: 'amount', header: 'Amount', type: 'currency' },
    { key: 'balance', header: 'Balance', type: 'currency' },
    { key: 'purchaserName', header: 'Purchaser Name', type: 'string' },
    { key: 'recipientName', header: 'Recipient Name', type: 'string' },
    { key: 'recipientEmail', header: 'Recipient Email', type: 'string' },
    { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
    { key: 'expirationDate', header: 'Expiration Date', type: 'date' },
    { key: 'isRedeemed', header: 'Redeemed', type: 'boolean' },
  ];

  const PRODUCT_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Product Name', type: 'string' },
    { key: 'description', header: 'Description', type: 'string' },
    { key: 'price', header: 'Price', type: 'currency' },
    { key: 'category', header: 'Category', type: 'string' },
    { key: 'inStock', header: 'In Stock', type: 'boolean' },
  ];

  const THERAPIST_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'specialties', header: 'Specialties', type: 'string', format: (v: string[]) => v?.join(', ') || '' },
    { key: 'certifications', header: 'Certifications', type: 'string', format: (v: string[]) => v?.join(', ') || '' },
    { key: 'color', header: 'Color Code', type: 'string' },
  ];

  const ROOM_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Room Name', type: 'string' },
    { key: 'features', header: 'Features', type: 'string', format: (v: string[]) => v?.join(', ') || '' },
    { key: 'available', header: 'Available', type: 'boolean' },
  ];

  // Get current export data and columns based on active tab
  const getExportConfig = () => {
    switch (activeTab) {
      case 'clients':
        return { data: clients, columns: CLIENT_COLUMNS, filename: 'massage_therapy_clients' };
      case 'sessions':
      case 'scheduling':
        // Enrich session data with client and therapist names
        const enrichedSessions = sessions.map(s => ({
          ...s,
          clientName: `${getClientById(s.clientId)?.firstName || ''} ${getClientById(s.clientId)?.lastName || ''}`.trim(),
          therapistName: getTherapistById(s.therapistId)?.name || '',
          roomName: getRoomById(s.roomId)?.name || '',
        }));
        const sessionColumnsWithNames: ColumnConfig[] = [
          { key: 'clientName', header: 'Client Name', type: 'string' },
          { key: 'therapistName', header: 'Therapist', type: 'string' },
          { key: 'roomName', header: 'Room', type: 'string' },
          ...SESSION_COLUMNS,
        ];
        return { data: enrichedSessions, columns: sessionColumnsWithNames, filename: 'massage_therapy_sessions' };
      case 'packages':
        // Enrich package data with client names
        const enrichedPackages = packages.map(p => ({
          ...p,
          clientName: `${getClientById(p.clientId)?.firstName || ''} ${getClientById(p.clientId)?.lastName || ''}`.trim(),
        }));
        const packageColumnsWithNames: ColumnConfig[] = [
          { key: 'clientName', header: 'Client Name', type: 'string' },
          ...PACKAGE_COLUMNS,
        ];
        return { data: enrichedPackages, columns: packageColumnsWithNames, filename: 'massage_therapy_packages' };
      case 'gifts':
        return { data: giftCertificates, columns: GIFT_COLUMNS, filename: 'massage_therapy_gift_certificates' };
      case 'products':
        return { data: products, columns: PRODUCT_COLUMNS, filename: 'massage_therapy_products' };
      case 'therapists':
        return { data: therapists, columns: THERAPIST_COLUMNS, filename: 'massage_therapy_therapists' };
      case 'rooms':
        return { data: rooms, columns: ROOM_COLUMNS, filename: 'massage_therapy_rooms' };
      default:
        return { data: clients, columns: CLIENT_COLUMNS, filename: 'massage_therapy_clients' };
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const { data, columns, filename } = getExportConfig();
    exportToCSV(data, columns, { filename });
  };

  const handleExportExcel = () => {
    const { data, columns, filename } = getExportConfig();
    exportToExcel(data, columns, { filename });
  };

  const handleExportJSON = () => {
    const { data, filename } = getExportConfig();
    exportToJSON(data, { filename });
  };

  const handleExportPDF = async () => {
    const { data, columns, filename } = getExportConfig();
    const tabLabels: Record<TabType, string> = {
      clients: 'Clients',
      scheduling: 'Scheduling',
      sessions: 'Sessions',
      packages: 'Packages',
      gifts: 'Gift Certificates',
      products: 'Products',
      therapists: 'Therapists',
      rooms: 'Rooms',
    };
    await exportToPDF(data, columns, {
      filename,
      title: `Massage Therapy - ${tabLabels[activeTab]}`,
    });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const { data, columns } = getExportConfig();
    return await copyUtil(data, columns);
  };

  const handlePrint = () => {
    const { data, columns } = getExportConfig();
    const tabLabels: Record<TabType, string> = {
      clients: 'Clients',
      scheduling: 'Scheduling',
      sessions: 'Sessions',
      packages: 'Packages',
      gifts: 'Gift Certificates',
      products: 'Products',
      therapists: 'Therapists',
      rooms: 'Rooms',
    };
    printData(data, columns, { title: `Massage Therapy - ${tabLabels[activeTab]}` });
  };

  // Import handlers
  const handleImportCSV = async (file: File): Promise<void> => {
    try {
      const content = await readFileAsText(file);
      const { columns } = getExportConfig();
      const result = parseCSV(content, columns);

      if (result.success && result.data) {
        switch (activeTab) {
          case 'clients':
            setClients(prev => [...prev, ...(result.data as Client[])]);
            break;
          case 'sessions':
          case 'scheduling':
            setSessions(prev => [...prev, ...(result.data as Session[])]);
            break;
          case 'packages':
            setPackages(prev => [...prev, ...(result.data as SessionPackage[])]);
            break;
          case 'gifts':
            setGiftCertificates(prev => [...prev, ...(result.data as GiftCertificate[])]);
            break;
          case 'products':
            setProducts(prev => [...prev, ...(result.data as Product[])]);
            break;
          case 'therapists':
            setTherapists(prev => [...prev, ...(result.data as Therapist[])]);
            break;
          case 'rooms':
            setRooms(prev => [...prev, ...(result.data as Room[])]);
            break;
        }
      }
    } catch (error) {
      console.error('Failed to import CSV:', error);
    }
  };

  const handleImportJSON = async (file: File): Promise<void> => {
    try {
      const content = await readFileAsText(file);
      const parsed = JSON.parse(content);
      const importedData = Array.isArray(parsed)
        ? parsed
        : parsed.data?.items || parsed.data || parsed.items || [];

      if (Array.isArray(importedData)) {
        switch (activeTab) {
          case 'clients':
            setClients(prev => [...prev, ...(importedData as Client[])]);
            break;
          case 'sessions':
          case 'scheduling':
            setSessions(prev => [...prev, ...(importedData as Session[])]);
            break;
          case 'packages':
            setPackages(prev => [...prev, ...(importedData as SessionPackage[])]);
            break;
          case 'gifts':
            setGiftCertificates(prev => [...prev, ...(importedData as GiftCertificate[])]);
            break;
          case 'products':
            setProducts(prev => [...prev, ...(importedData as Product[])]);
            break;
          case 'therapists':
            setTherapists(prev => [...prev, ...(importedData as Therapist[])]);
            break;
          case 'rooms':
            setRooms(prev => [...prev, ...(importedData as Room[])]);
            break;
        }
      }
    } catch (error) {
      console.error('Failed to import JSON:', error);
    }
  };

  // Styles
  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const buttonPrimaryClass = 'px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors flex items-center gap-2';
  const buttonSecondaryClass = `px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
    { id: 'scheduling', label: 'Scheduling', icon: <Calendar className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
    { id: 'packages', label: 'Packages', icon: <Package className="w-4 h-4" /> },
    { id: 'gifts', label: 'Gift Cards', icon: <Gift className="w-4 h-4" /> },
    { id: 'products', label: 'Products', icon: <Star className="w-4 h-4" /> },
    { id: 'therapists', label: 'Therapists', icon: <User className="w-4 h-4" /> },
    { id: 'rooms', label: 'Rooms', icon: <Home className="w-4 h-4" /> },
  ];

  // Client Form Component
  const ClientForm = ({ client, onSave, onCancel }: { client?: Client | null; onSave: (data: Partial<Client>) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      dateOfBirth: client?.dateOfBirth || '',
      emergencyContact: client?.emergencyContact || '',
      emergencyPhone: client?.emergencyPhone || '',
      notes: client?.notes || '',
    });

    return (
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {client ? t('tools.massageTherapy.editClient', 'Edit Client') : t('tools.massageTherapy.newClient', 'New Client')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.firstName', 'First Name *')}</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.firstName2', 'First name')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.lastName', 'Last Name *')}</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.lastName2', 'Last name')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.email', 'Email')}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.emailExampleCom', 'email@example.com')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.phone', 'Phone *')}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClass}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.address', 'Address')}</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.streetCityStateZip', 'Street, City, State, ZIP')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.dateOfBirth', 'Date of Birth')}</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.emergencyContact', 'Emergency Contact')}</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.contactName', 'Contact name')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.emergencyPhone', 'Emergency Phone')}</label>
            <input
              type="tel"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              className={inputClass}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.notes', 'Notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputClass}
              rows={3}
              placeholder={t('tools.massageTherapy.anyAdditionalNotes', 'Any additional notes...')}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className={buttonSecondaryClass}>
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.firstName || !formData.lastName || !formData.phone}
            className={`${buttonPrimaryClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save className="w-4 h-4" /> Save Client
          </button>
        </div>
      </div>
    );
  };

  // Health History Form Component
  const HealthHistoryForm = ({ clientId, onSave, onCancel }: { clientId: string; onSave: (clientId: string, data: Partial<HealthHistory>) => void; onCancel: () => void }) => {
    const existing = getHealthHistory(clientId);
    const [formData, setFormData] = useState({
      conditions: existing?.conditions || [],
      surgeries: existing?.surgeries || '',
      medications: existing?.medications || '',
      allergies: existing?.allergies || [],
      contraindications: existing?.contraindications || [],
      bloodPressure: existing?.bloodPressure || '',
      pregnant: existing?.pregnant || false,
      pregnancyTrimester: existing?.pregnancyTrimester || '',
      recentInjuries: existing?.recentInjuries || '',
      preferences: existing?.preferences || {
        pressurePreference: 'medium' as const,
        areasToAvoid: [] as string[],
        areasToFocus: [] as string[],
        preferredTechniques: [] as string[],
        roomTemperature: 'warm' as const,
        musicPreference: '',
        aromatherapyPreference: '',
      },
    });

    const toggleArrayItem = (array: string[], item: string) => {
      return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
    };

    return (
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg max-h-[80vh] overflow-y-auto`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.massageTherapy.healthHistoryIntakeForm', 'Health History & Intake Form')}
        </h3>

        {/* Medical Conditions */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <Heart className="w-4 h-4 inline mr-2" /> Medical Conditions
          </label>
          <div className="flex flex-wrap gap-2">
            {commonConditions.map(condition => (
              <button
                key={condition}
                onClick={() => setFormData({ ...formData, conditions: toggleArrayItem(formData.conditions, condition) })}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.conditions.includes(condition)
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <AlertTriangle className="w-4 h-4 inline mr-2" /> Allergies
          </label>
          <div className="flex flex-wrap gap-2">
            {commonAllergens.map(allergen => (
              <button
                key={allergen}
                onClick={() => setFormData({ ...formData, allergies: toggleArrayItem(formData.allergies, allergen) })}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.allergies.includes(allergen)
                    ? 'bg-red-500 text-white'
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {allergen}
              </button>
            ))}
          </div>
        </div>

        {/* Contraindications */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.massageTherapy.contraindicationsAreasToAvoid', 'Contraindications / Areas to Avoid')}
          </label>
          <div className="flex flex-wrap gap-2">
            {bodyAreas.map(area => (
              <button
                key={area}
                onClick={() => setFormData({ ...formData, contraindications: toggleArrayItem(formData.contraindications, area) })}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.contraindications.includes(area)
                    ? 'bg-orange-500 text-white'
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.bloodPressure', 'Blood Pressure')}</label>
            <input
              type="text"
              value={formData.bloodPressure}
              onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
              className={inputClass}
              placeholder="120/80"
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.recentInjuries', 'Recent Injuries')}</label>
            <input
              type="text"
              value={formData.recentInjuries}
              onChange={(e) => setFormData({ ...formData, recentInjuries: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.describeAnyRecentInjuries', 'Describe any recent injuries')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.pastSurgeries', 'Past Surgeries')}</label>
            <input
              type="text"
              value={formData.surgeries}
              onChange={(e) => setFormData({ ...formData, surgeries: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.listAnyPastSurgeries', 'List any past surgeries')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.currentMedications', 'Current Medications')}</label>
            <input
              type="text"
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.listCurrentMedications', 'List current medications')}
            />
          </div>
        </div>

        {/* Pregnancy */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.pregnant}
              onChange={(e) => setFormData({ ...formData, pregnant: e.target.checked })}
              className="w-4 h-4 text-[#0D9488] rounded"
            />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.massageTherapy.currentlyPregnant', 'Currently Pregnant')}</span>
          </label>
          {formData.pregnant && (
            <select
              value={formData.pregnancyTrimester}
              onChange={(e) => setFormData({ ...formData, pregnancyTrimester: e.target.value })}
              className={`${inputClass} mt-2`}
            >
              <option value="">{t('tools.massageTherapy.selectTrimester', 'Select Trimester')}</option>
              <option value="first">{t('tools.massageTherapy.firstTrimester', 'First Trimester')}</option>
              <option value="second">{t('tools.massageTherapy.secondTrimester', 'Second Trimester')}</option>
              <option value="third">{t('tools.massageTherapy.thirdTrimester', 'Third Trimester')}</option>
            </select>
          )}
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <h4 className={`text-md font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.massageTherapy.preferences', 'Preferences')}</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.pressurePreference', 'Pressure Preference')}</label>
              <select
                value={formData.preferences.pressurePreference}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, pressurePreference: e.target.value as any }
                })}
                className={inputClass}
              >
                <option value="light">{t('tools.massageTherapy.light', 'Light')}</option>
                <option value="medium">{t('tools.massageTherapy.medium', 'Medium')}</option>
                <option value="deep">{t('tools.massageTherapy.deep', 'Deep')}</option>
                <option value="varies">{t('tools.massageTherapy.variesByArea', 'Varies by Area')}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.roomTemperature', 'Room Temperature')}</label>
              <select
                value={formData.preferences.roomTemperature}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, roomTemperature: e.target.value as any }
                })}
                className={inputClass}
              >
                <option value="cool">{t('tools.massageTherapy.cool', 'Cool')}</option>
                <option value="warm">{t('tools.massageTherapy.warm', 'Warm')}</option>
                <option value="hot">{t('tools.massageTherapy.hot', 'Hot')}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.musicPreference', 'Music Preference')}</label>
              <input
                type="text"
                value={formData.preferences.musicPreference}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, musicPreference: e.target.value }
                })}
                className={inputClass}
                placeholder={t('tools.massageTherapy.eGNatureSoundsClassical', 'e.g., Nature sounds, Classical')}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.aromatherapyPreference', 'Aromatherapy Preference')}</label>
              <input
                type="text"
                value={formData.preferences.aromatherapyPreference}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, aromatherapyPreference: e.target.value }
                })}
                className={inputClass}
                placeholder={t('tools.massageTherapy.eGLavenderEucalyptus', 'e.g., Lavender, Eucalyptus')}
              />
            </div>
          </div>

          {/* Preferred Techniques */}
          <div className="mt-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.preferredTechniques', 'Preferred Techniques')}</label>
            <div className="flex flex-wrap gap-2">
              {massageTechniques.map(technique => (
                <button
                  key={technique}
                  onClick={() => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      preferredTechniques: toggleArrayItem(formData.preferences.preferredTechniques, technique)
                    }
                  })}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.preferences.preferredTechniques.includes(technique)
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {technique}
                </button>
              ))}
            </div>
          </div>

          {/* Areas to Focus */}
          <div className="mt-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.areasToFocusOn', 'Areas to Focus On')}</label>
            <div className="flex flex-wrap gap-2">
              {bodyAreas.map(area => (
                <button
                  key={area}
                  onClick={() => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      areasToFocus: toggleArrayItem(formData.preferences.areasToFocus, area)
                    }
                  })}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.preferences.areasToFocus.includes(area)
                      ? 'bg-green-500 text-white'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className={buttonSecondaryClass}>
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={() => onSave(clientId, formData)} className={buttonPrimaryClass}>
            <Save className="w-4 h-4" /> Save Health History
          </button>
        </div>
      </div>
    );
  };

  // Session Form Component
  const SessionForm = ({ session, onSave, onCancel }: { session?: Session | null; onSave: (data: Partial<Session>) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      clientId: session?.clientId || '',
      therapistId: session?.therapistId || therapists[0]?.id || '',
      roomId: session?.roomId || rooms[0]?.id || '',
      date: session?.date || selectedDate,
      startTime: session?.startTime || '09:00',
      duration: session?.duration || 60,
      type: session?.type || 'Swedish Massage',
      price: session?.price || 80,
      notes: session?.notes || '',
      isRecurring: session?.isRecurring || false,
      recurringFrequency: session?.recurringPattern?.frequency || 'weekly',
      recurringEndDate: session?.recurringPattern?.endDate || '',
    });

    return (
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {session ? t('tools.massageTherapy.editSession', 'Edit Session') : t('tools.massageTherapy.newSession', 'New Session')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.client', 'Client *')}</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className={inputClass}
            >
              <option value="">{t('tools.massageTherapy.selectClient', 'Select Client')}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.therapist', 'Therapist *')}</label>
            <select
              value={formData.therapistId}
              onChange={(e) => setFormData({ ...formData, therapistId: e.target.value })}
              className={inputClass}
            >
              {therapists.map(therapist => (
                <option key={therapist.id} value={therapist.id}>{therapist.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.room', 'Room *')}</label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className={inputClass}
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.serviceType', 'Service Type *')}</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={inputClass}
            >
              {massageTechniques.map(technique => (
                <option key={technique} value={technique}>{technique}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.date', 'Date *')}</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.startTime', 'Start Time *')}</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.durationMinutes', 'Duration (minutes) *')}</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className={inputClass}
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.price', 'Price ($)')}</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className={inputClass}
              min="0"
              step="0.01"
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.notes2', 'Notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputClass}
              rows={2}
              placeholder={t('tools.massageTherapy.sessionNotes', 'Session notes...')}
            />
          </div>

          {/* Recurring Options */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="w-4 h-4 text-[#0D9488] rounded"
              />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                <Repeat className="w-4 h-4 inline mr-1" /> Set as Recurring Appointment
              </span>
            </label>
          </div>

          {formData.isRecurring && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.frequency', 'Frequency')}</label>
                <select
                  value={formData.recurringFrequency}
                  onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                  className={inputClass}
                >
                  <option value="weekly">{t('tools.massageTherapy.weekly', 'Weekly')}</option>
                  <option value="biweekly">{t('tools.massageTherapy.every2Weeks', 'Every 2 Weeks')}</option>
                  <option value="monthly">{t('tools.massageTherapy.monthly', 'Monthly')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.endDate', 'End Date')}</label>
                <input
                  type="date"
                  value={formData.recurringEndDate}
                  onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className={buttonSecondaryClass}>
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={() => onSave({
              ...formData,
              recurringPattern: formData.isRecurring ? {
                frequency: formData.recurringFrequency as any,
                endDate: formData.recurringEndDate,
              } : undefined,
            })}
            disabled={!formData.clientId || !formData.therapistId || !formData.roomId}
            className={`${buttonPrimaryClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save className="w-4 h-4" /> Save Session
          </button>
        </div>
      </div>
    );
  };

  // Treatment Notes Form
  const TreatmentNotesForm = ({ session, onSave, onCancel }: { session: Session; onSave: (sessionId: string, notes: TreatmentNote) => void; onCancel: () => void }) => {
    const [notes, setNotes] = useState<TreatmentNote>(session.treatmentNotes || {
      areasWorked: [],
      techniques: [],
      pressureUsed: 'medium',
      clientFeedback: '',
      recommendations: '',
      productRecommendations: [],
      followUpNeeded: false,
      bodyDiagramNotes: {},
    });

    const toggleArrayItem = (array: string[], item: string) => {
      return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
    };

    return (
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg max-h-[80vh] overflow-y-auto`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.massageTherapy.treatmentNotes', 'Treatment Notes')}
        </h3>

        {/* Areas Worked */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.areasWorked', 'Areas Worked')}</label>
          <div className="flex flex-wrap gap-2">
            {bodyAreas.map(area => (
              <button
                key={area}
                onClick={() => setNotes({ ...notes, areasWorked: toggleArrayItem(notes.areasWorked, area) })}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  notes.areasWorked.includes(area)
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Techniques Used */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.techniquesUsed', 'Techniques Used')}</label>
          <div className="flex flex-wrap gap-2">
            {massageTechniques.map(technique => (
              <button
                key={technique}
                onClick={() => setNotes({ ...notes, techniques: toggleArrayItem(notes.techniques, technique) })}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  notes.techniques.includes(technique)
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {technique}
              </button>
            ))}
          </div>
        </div>

        {/* Pressure Used */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.pressureUsed', 'Pressure Used')}</label>
          <select
            value={notes.pressureUsed}
            onChange={(e) => setNotes({ ...notes, pressureUsed: e.target.value as any })}
            className={inputClass}
          >
            <option value="light">{t('tools.massageTherapy.light2', 'Light')}</option>
            <option value="medium">{t('tools.massageTherapy.medium2', 'Medium')}</option>
            <option value="deep">{t('tools.massageTherapy.deep2', 'Deep')}</option>
            <option value="varied">{t('tools.massageTherapy.varied', 'Varied')}</option>
          </select>
        </div>

        {/* Body Diagram Notes */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <Activity className="w-4 h-4 inline mr-2" /> Body Diagram Notes (Problem Areas)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {bodyAreas.map(area => (
              <div key={area} className="flex flex-col">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{area}</span>
                <input
                  type="text"
                  value={notes.bodyDiagramNotes[area] || ''}
                  onChange={(e) => setNotes({
                    ...notes,
                    bodyDiagramNotes: { ...notes.bodyDiagramNotes, [area]: e.target.value }
                  })}
                  placeholder={t('tools.massageTherapy.notes3', 'Notes...')}
                  className={`${inputClass} text-xs py-1`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Client Feedback */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.clientFeedback', 'Client Feedback')}</label>
          <textarea
            value={notes.clientFeedback}
            onChange={(e) => setNotes({ ...notes, clientFeedback: e.target.value })}
            className={inputClass}
            rows={2}
            placeholder={t('tools.massageTherapy.clientSFeedbackDuringAfter', 'Client\'s feedback during/after session...')}
          />
        </div>

        {/* Recommendations */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.therapistRecommendations', 'Therapist Recommendations')}</label>
          <textarea
            value={notes.recommendations}
            onChange={(e) => setNotes({ ...notes, recommendations: e.target.value })}
            className={inputClass}
            rows={2}
            placeholder={t('tools.massageTherapy.recommendationsForClient', 'Recommendations for client...')}
          />
        </div>

        {/* Product Recommendations */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.productRecommendations', 'Product Recommendations')}</label>
          <div className="flex flex-wrap gap-2">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => setNotes({ ...notes, productRecommendations: toggleArrayItem(notes.productRecommendations, product.name) })}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  notes.productRecommendations.includes(product.name)
                    ? 'bg-purple-500 text-white'
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {product.name}
              </button>
            ))}
          </div>
        </div>

        {/* Follow-up Needed */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notes.followUpNeeded}
              onChange={(e) => setNotes({ ...notes, followUpNeeded: e.target.checked })}
              className="w-4 h-4 text-[#0D9488] rounded"
            />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.massageTherapy.followUpSessionRecommended', 'Follow-up Session Recommended')}</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className={buttonSecondaryClass}>
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={() => onSave(session.id, notes)} className={buttonPrimaryClass}>
            <Save className="w-4 h-4" /> Save Treatment Notes
          </button>
        </div>
      </div>
    );
  };

  // Package Form
  const PackageForm = ({ onSave, onCancel }: { onSave: (data: Partial<SessionPackage>) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      clientId: '',
      name: '',
      totalSessions: 5,
      price: 350,
      sessionType: 'Any',
      expirationDate: '',
    });

    const packageOptions = [
      { name: '5 Session Package', sessions: 5, price: 350 },
      { name: '10 Session Package', sessions: 10, price: 650 },
      { name: 'Monthly Unlimited', sessions: 30, price: 499 },
    ];

    return (
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.massageTherapy.newSessionPackage', 'New Session Package')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.client2', 'Client *')}</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className={inputClass}
            >
              <option value="">{t('tools.massageTherapy.selectClient2', 'Select Client')}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.packageType', 'Package Type')}</label>
            <div className="grid grid-cols-3 gap-2">
              {packageOptions.map(pkg => (
                <button
                  key={pkg.name}
                  onClick={() => setFormData({ ...formData, name: pkg.name, totalSessions: pkg.sessions, price: pkg.price })}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    formData.name === pkg.name
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{pkg.name}</div>
                  <div className="text-sm">${pkg.price}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.sessionType', 'Session Type')}</label>
            <select
              value={formData.sessionType}
              onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
              className={inputClass}
            >
              <option value="Any">{t('tools.massageTherapy.anyService', 'Any Service')}</option>
              {massageTechniques.map(technique => (
                <option key={technique} value={technique}>{technique}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.expirationDate', 'Expiration Date')}</label>
            <input
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className={buttonSecondaryClass}>
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.clientId || !formData.name}
            className={`${buttonPrimaryClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save className="w-4 h-4" /> Create Package
          </button>
        </div>
      </div>
    );
  };

  // Gift Certificate Form
  const GiftCertificateForm = ({ onSave, onCancel }: { onSave: (data: Partial<GiftCertificate>) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      amount: 100,
      purchaserName: '',
      recipientName: '',
      recipientEmail: '',
      expirationDate: '',
    });

    const amounts = [50, 75, 100, 150, 200, 250];

    return (
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.massageTherapy.newGiftCertificate', 'New Gift Certificate')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.amount', 'Amount')}</label>
            <div className="flex flex-wrap gap-2">
              {amounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setFormData({ ...formData, amount: amt })}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    formData.amount === amt
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  ${amt}
                </button>
              ))}
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className={`${inputClass} w-24`}
                min="0"
                placeholder={t('tools.massageTherapy.custom', 'Custom')}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.purchaserName', 'Purchaser Name *')}</label>
            <input
              type="text"
              value={formData.purchaserName}
              onChange={(e) => setFormData({ ...formData, purchaserName: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.whoIsBuying', 'Who is buying?')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.recipientName', 'Recipient Name *')}</label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.whoIsReceiving', 'Who is receiving?')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.recipientEmail', 'Recipient Email')}</label>
            <input
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
              className={inputClass}
              placeholder={t('tools.massageTherapy.recipientEmailCom', 'recipient@email.com')}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.expirationDate2', 'Expiration Date')}</label>
            <input
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className={buttonSecondaryClass}>
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.purchaserName || !formData.recipientName || formData.amount <= 0}
            className={`${buttonPrimaryClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save className="w-4 h-4" /> Create Gift Certificate
          </button>
        </div>
      </div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'clients':
        return (
          <div className="space-y-4">
            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('tools.massageTherapy.searchClients', 'Search clients...')}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <button onClick={() => { setShowClientForm(true); setEditingClient(null); }} className={buttonPrimaryClass}>
                <Plus className="w-4 h-4" /> Add Client
              </button>
            </div>

            {/* Client Form */}
            {showClientForm && (
              <ClientForm
                client={editingClient}
                onSave={handleSaveClient}
                onCancel={() => { setShowClientForm(false); setEditingClient(null); }}
              />
            )}

            {/* Health Form */}
            {showHealthForm && selectedClient && (
              <HealthHistoryForm
                clientId={selectedClient.id}
                onSave={handleSaveHealthHistory}
                onCancel={() => { setShowHealthForm(false); setSelectedClient(null); }}
              />
            )}

            {/* Client List */}
            <div className="space-y-2">
              {filteredClients.map(client => {
                const health = getHealthHistory(client.id);
                const clientSessions = sessions.filter(s => s.clientId === client.id);
                const clientPackages = packages.filter(p => p.clientId === client.id);
                const isExpanded = expandedClientId === client.id;

                return (
                  <div
                    key={client.id}
                    className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <User className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {client.firstName} {client.lastName}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {client.phone} | {client.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!health?.intakeFormCompleted && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">{t('tools.massageTherapy.needsIntake', 'Needs Intake')}</span>
                        )}
                        {health?.contraindications && health.contraindications.length > 0 && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={`px-4 pb-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          {/* Contact Info */}
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.contactInformation', 'Contact Information')}</h4>
                            <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {client.phone}</div>
                              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {client.email}</div>
                              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {client.address || 'No address'}</div>
                            </div>
                          </div>

                          {/* Health Summary */}
                          {health && (
                            <div>
                              <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.healthSummary', 'Health Summary')}</h4>
                              <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {health.allergies.length > 0 && (
                                  <div className="flex items-center gap-2 text-red-500">
                                    <AlertTriangle className="w-4 h-4" /> Allergies: {health.allergies.join(', ')}
                                  </div>
                                )}
                                {health.contraindications.length > 0 && (
                                  <div className="flex items-center gap-2 text-orange-500">
                                    <AlertTriangle className="w-4 h-4" /> Avoid: {health.contraindications.join(', ')}
                                  </div>
                                )}
                                <div>Pressure: {health.preferences.pressurePreference}</div>
                                {health.preferences.areasToFocus.length > 0 && (
                                  <div>Focus on: {health.preferences.areasToFocus.join(', ')}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Session History */}
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.sessionHistory', 'Session History')}</h4>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Total sessions: {clientSessions.length}
                              <br />
                              Completed: {clientSessions.filter(s => s.status === 'completed').length}
                            </div>
                          </div>

                          {/* Packages */}
                          <div>
                            <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.activePackages', 'Active Packages')}</h4>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {clientPackages.filter(p => p.sessionsUsed < p.totalSessions).map(pkg => (
                                <div key={pkg.id}>{pkg.name}: {pkg.totalSessions - pkg.sessionsUsed} remaining</div>
                              ))}
                              {clientPackages.filter(p => p.sessionsUsed < p.totalSessions).length === 0 && 'No active packages'}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingClient(client); setShowClientForm(true); }}
                            className={buttonSecondaryClass}
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedClient(client); setShowHealthForm(true); }}
                            className={buttonSecondaryClass}
                          >
                            <ClipboardList className="w-4 h-4" /> {health ? t('tools.massageTherapy.updateHealth', 'Update Health') : t('tools.massageTherapy.intakeForm', 'Intake Form')}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedClient(client); setShowSessionForm(true); }}
                            className={buttonPrimaryClass}
                          >
                            <Calendar className="w-4 h-4" /> Book Session
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }}
                            className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredClients.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.massageTherapy.noClientsFoundAddYour', 'No clients found. Add your first client to get started.')}
                </div>
              )}
            </div>
          </div>
        );

      case 'scheduling':
        return (
          <div className="space-y-4">
            {/* Date Picker and Add Session */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.selectDate', 'Select Date')}</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button onClick={() => setShowSessionForm(true)} className={`${buttonPrimaryClass} mt-auto`}>
                <Plus className="w-4 h-4" /> New Appointment
              </button>
            </div>

            {/* Session Form */}
            {showSessionForm && (
              <SessionForm
                session={selectedSession}
                onSave={handleSaveSession}
                onCancel={() => { setShowSessionForm(false); setSelectedSession(null); }}
              />
            )}

            {/* Daily Schedule */}
            <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
              <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>

              {/* Time slots by therapist */}
              {therapists.map(therapist => {
                const therapistSessions = sessionsForDate.filter(s => s.therapistId === therapist.id);
                return (
                  <div key={therapist.id} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: therapist.color }} />
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{therapist.name}</span>
                    </div>
                    {therapistSessions.length > 0 ? (
                      <div className="space-y-2 ml-5">
                        {therapistSessions.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(session => {
                          const client = getClientById(session.clientId);
                          const room = getRoomById(session.roomId);
                          return (
                            <div
                              key={session.id}
                              className={`p-3 rounded-lg border-l-4 ${
                                session.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' :
                                session.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20' :
                                session.status === 'no-show' ? 'bg-orange-50 dark:bg-orange-900/20' :
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                              }`}
                              style={{ borderLeftColor: therapist.color }}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {session.startTime} - {client?.firstName} {client?.lastName}
                                  </div>
                                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {session.type} | {session.duration} min | {room?.name}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    session.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    session.status === 'no-show' ? 'bg-orange-100 text-orange-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {session.status}
                                  </span>
                                </div>
                              </div>
                              {session.status === 'scheduled' && (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => { setSelectedSession(session); setShowTreatmentNotes(true); }}
                                    className="text-xs px-2 py-1 bg-[#0D9488] text-white rounded"
                                  >
                                    {t('tools.massageTherapy.complete', 'Complete')}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateSessionStatus(session.id, 'cancelled')}
                                    className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                                  >
                                    {t('tools.massageTherapy.cancel', 'Cancel')}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateSessionStatus(session.id, 'no-show')}
                                    className="text-xs px-2 py-1 bg-orange-500 text-white rounded"
                                  >
                                    {t('tools.massageTherapy.noShow', 'No-Show')}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`ml-5 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {t('tools.massageTherapy.noAppointmentsScheduled', 'No appointments scheduled')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Treatment Notes Modal */}
            {showTreatmentNotes && selectedSession && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="max-w-2xl w-full">
                  <TreatmentNotesForm
                    session={selectedSession}
                    onSave={handleSaveTreatmentNotes}
                    onCancel={() => { setShowTreatmentNotes(false); setSelectedSession(null); }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'sessions':
        return (
          <div className="space-y-4">
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.massageTherapy.allSessions', 'All Sessions')}</h3>
            <div className="overflow-x-auto">
              <table className={`w-full ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-4 py-2 text-left">{t('tools.massageTherapy.date2', 'Date')}</th>
                    <th className="px-4 py-2 text-left">{t('tools.massageTherapy.time', 'Time')}</th>
                    <th className="px-4 py-2 text-left">{t('tools.massageTherapy.client3', 'Client')}</th>
                    <th className="px-4 py-2 text-left">{t('tools.massageTherapy.therapist2', 'Therapist')}</th>
                    <th className="px-4 py-2 text-left">{t('tools.massageTherapy.service', 'Service')}</th>
                    <th className="px-4 py-2 text-left">{t('tools.massageTherapy.status', 'Status')}</th>
                    <th className="px-4 py-2 text-right">{t('tools.massageTherapy.price2', 'Price')}</th>
                    <th className="px-4 py-2 text-right">{t('tools.massageTherapy.tip', 'Tip')}</th>
                    <th className="px-4 py-2 text-left">{t('tools.massageTherapy.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.sort((a, b) => b.date.localeCompare(a.date)).map(session => {
                    const client = getClientById(session.clientId);
                    const therapist = getTherapistById(session.therapistId);
                    return (
                      <tr key={session.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="px-4 py-2">{session.date}</td>
                        <td className="px-4 py-2">{session.startTime}</td>
                        <td className="px-4 py-2">{client?.firstName} {client?.lastName}</td>
                        <td className="px-4 py-2">{therapist?.name}</td>
                        <td className="px-4 py-2">{session.type}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            session.status === 'completed' ? 'bg-green-100 text-green-700' :
                            session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            session.status === 'no-show' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">${session.price.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">
                          {session.status === 'completed' && (
                            <div className="flex items-center justify-end gap-1">
                              <span>${session.tipAmount.toFixed(2)}</span>
                              <button
                                onClick={() => {
                                  const tip = prompt('Enter tip amount:', session.tipAmount.toString());
                                  if (tip !== null) handleAddTip(session.id, parseFloat(tip) || 0);
                                }}
                                className="text-xs text-[#0D9488] hover:underline"
                              >
                                {t('tools.massageTherapy.edit', 'Edit')}
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {session.treatmentNotes && (
                            <button
                              onClick={() => { setSelectedSession(session); setShowTreatmentNotes(true); }}
                              className="text-xs text-[#0D9488] hover:underline"
                            >
                              {t('tools.massageTherapy.viewNotes', 'View Notes')}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'packages':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.massageTherapy.sessionPackagesMemberships', 'Session Packages & Memberships')}</h3>
              <button onClick={() => setShowPackageForm(true)} className={buttonPrimaryClass}>
                <Plus className="w-4 h-4" /> New Package
              </button>
            </div>

            {showPackageForm && (
              <PackageForm
                onSave={handleSavePackage}
                onCancel={() => setShowPackageForm(false)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map(pkg => {
                const client = getClientById(pkg.clientId);
                const isExpired = new Date(pkg.expirationDate) < new Date();
                const isExhausted = pkg.sessionsUsed >= pkg.totalSessions;
                return (
                  <div
                    key={pkg.id}
                    className={`p-4 rounded-lg border ${
                      isExpired || isExhausted
                        ? theme === 'dark' ? 'bg-gray-800 border-gray-600 opacity-60' : 'bg-gray-100 border-gray-300 opacity-60'
                        : theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{pkg.name}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {client?.firstName} {client?.lastName}
                        </div>
                      </div>
                      <Package className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sessions: {pkg.sessionsUsed} / {pkg.totalSessions}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-[#0D9488] h-2 rounded-full"
                        style={{ width: `${(pkg.sessionsUsed / pkg.totalSessions) * 100}%` }}
                      />
                    </div>
                    <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Expires: {new Date(pkg.expirationDate).toLocaleDateString()}
                    </div>
                    {!isExpired && !isExhausted && (
                      <button
                        onClick={() => handleUsePackageSession(pkg.id)}
                        className={`${buttonPrimaryClass} mt-3 text-sm w-full justify-center`}
                      >
                        <Check className="w-4 h-4" /> Use Session
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'gifts':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.massageTherapy.giftCertificates', 'Gift Certificates')}</h3>
              <button onClick={() => setShowGiftForm(true)} className={buttonPrimaryClass}>
                <Plus className="w-4 h-4" /> New Gift Certificate
              </button>
            </div>

            {showGiftForm && (
              <GiftCertificateForm
                onSave={handleSaveGiftCertificate}
                onCancel={() => setShowGiftForm(false)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {giftCertificates.map(gift => {
                const isExpired = new Date(gift.expirationDate) < new Date();
                const isRedeemed = gift.balance === 0;
                return (
                  <div
                    key={gift.id}
                    className={`p-4 rounded-lg border ${
                      isExpired || isRedeemed
                        ? theme === 'dark' ? 'bg-gray-800 border-gray-600 opacity-60' : 'bg-gray-100 border-gray-300 opacity-60'
                        : theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className={`font-mono font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{gift.code}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          For: {gift.recipientName}
                        </div>
                      </div>
                      <Gift className={`w-5 h-5 ${isRedeemed ? 'text-green-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${gift.balance.toFixed(2)}
                      {gift.balance !== gift.amount && (
                        <span className={`text-sm font-normal ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}> / ${gift.amount.toFixed(2)}</span>
                      )}
                    </div>
                    <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      From: {gift.purchaserName} | Expires: {new Date(gift.expirationDate).toLocaleDateString()}
                    </div>
                    {!isExpired && !isRedeemed && (
                      <button
                        onClick={() => {
                          const amount = prompt('Enter amount to redeem:', gift.balance.toString());
                          const clientName = prompt('Enter client name:');
                          if (amount !== null && clientName) {
                            handleRedeemGiftCertificate(gift.code, parseFloat(amount) || 0, clientName);
                          }
                        }}
                        className={`${buttonPrimaryClass} mt-3 text-sm w-full justify-center`}
                      >
                        <BadgeDollarSign className="w-4 h-4" /> Redeem
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-4">
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.massageTherapy.productRecommendations2', 'Product Recommendations')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div
                  key={product.id}
                  className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{product.name}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{product.category}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.inStock ? t('tools.massageTherapy.inStock', 'In Stock') : t('tools.massageTherapy.outOfStock', 'Out of Stock')}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{product.description}</p>
                  <div className={`text-lg font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${product.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'therapists':
        return (
          <div className="space-y-4">
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.massageTherapy.therapists', 'Therapists')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {therapists.map(therapist => (
                <div
                  key={therapist.id}
                  className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: therapist.color + '20' }}>
                      <User className="w-6 h-6" style={{ color: therapist.color }} />
                    </div>
                    <div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{therapist.name}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {therapist.certifications.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.massageTherapy.specialties', 'Specialties:')}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {therapist.specialties.map(spec => (
                          <span key={spec} className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'rooms':
        return (
          <div className="space-y-4">
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.massageTherapy.roomsTables', 'Rooms / Tables')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{room.name}</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${room.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {room.available ? t('tools.massageTherapy.available', 'Available') : t('tools.massageTherapy.inUse', 'In Use')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {room.features.map(feature => (
                      <span key={feature} className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.massageTherapy.massageTherapyPracticeManagement', 'Massage Therapy Practice Management')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.massageTherapy.manageClientsAppointmentsAndBusiness', 'Manage clients, appointments, and business operations')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="massage-therapy" toolName="Massage Therapy" />

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
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onCopyToClipboard={handleCopyToClipboard}
                onPrint={handlePrint}
                onImportCSV={handleImportCSV}
                onImportJSON={handleImportJSON}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalClients}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.massageTherapy.totalClients', 'Total Clients')}</div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.todayAppointments}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.massageTherapy.todaySAppts', 'Today\'s Appts')}</div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-green-500`}>${stats.monthlyRevenue.toFixed(0)}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.massageTherapy.monthlyRevenue', 'Monthly Revenue')}</div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-[#0D9488]`}>${stats.monthlyTips.toFixed(0)}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.massageTherapy.monthlyTips', 'Monthly Tips')}</div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.activePackages}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.massageTherapy.activePackages2', 'Active Packages')}</div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.activeGiftCertificates}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.massageTherapy.activeGiftCards', 'Active Gift Cards')}</div>
            </div>
            <div className={`p-3 rounded-lg ${stats.pendingIntakeForms > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${stats.pendingIntakeForms > 0 ? 'text-orange-600' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.pendingIntakeForms}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.massageTherapy.pendingIntakes', 'Pending Intakes')}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#0D9488] border-b-2 border-[#0D9488] bg-[#0D9488]/5'
                    : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.massageTherapy.aboutMassageTherapyPracticeManagement', 'About Massage Therapy Practice Management')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            A comprehensive tool for managing your massage therapy practice. Track clients, health histories,
            appointments, treatment notes, session packages, gift certificates, and more. Your data is automatically
            synced to the cloud when logged in, with local backup for offline access.
          </p>
        </div>

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default MassageTherapyTool;
