'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Palette,
  Users,
  Calendar,
  FileText,
  Image,
  Shield,
  Heart,
  UserCheck,
  DollarSign,
  Clock,
  FolderOpen,
  ClipboardCheck,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Phone,
  Mail,
  CreditCard,
  RefreshCw,
  Sparkles,
  Loader2,
} from 'lucide-react';

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  idVerified: boolean;
  idType: string;
  idNumber: string;
  createdAt: string;
  notes: string;
}

interface Artist {
  id: string;
  name: string;
  specialty: string[];
  hourlyRate: number;
  availability: { [key: string]: { start: string; end: string } };
  portfolioImages: string[];
  totalRevenue: number;
  completedAppointments: number;
}

interface Appointment {
  id: string;
  clientId: string;
  artistId: string;
  date: string;
  time: string;
  duration: number;
  type: 'tattoo' | 'piercing' | 'consultation' | 'touch-up';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  designNotes: string;
  referenceImages: string[];
  size: 'small' | 'medium' | 'large' | 'extra-large';
  complexity: 'simple' | 'moderate' | 'complex' | 'highly-complex';
  bodyPlacement: string;
  estimatedPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  consentSigned: boolean;
  waiverSigned: boolean;
  healthChecklistCompleted: boolean;
  aftercareProvided: boolean;
  aftercareNotes: string;
  touchUpScheduled: boolean;
  touchUpDate: string;
}

interface HealthChecklist {
  id: string;
  appointmentId: string;
  allergies: boolean;
  allergiesNotes: string;
  skinConditions: boolean;
  skinConditionsNotes: string;
  bloodDisorders: boolean;
  pregnant: boolean;
  recentSunExposure: boolean;
  alcoholLast24h: boolean;
  medications: boolean;
  medicationsNotes: string;
  previousTattooReactions: boolean;
  completedAt: string;
}

type TabType = 'clients' | 'appointments' | 'artists' | 'analytics' | 'health';

// Combined data structure for sync
interface TattooShopData {
  id: string;
  clients: Client[];
  appointments: Appointment[];
  artists: Artist[];
  healthChecklists: HealthChecklist[];
}

// Column configuration for exports
const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
  { key: 'idVerified', header: 'ID Verified', type: 'boolean' },
  { key: 'idType', header: 'ID Type', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const APPOINTMENT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'artistName', header: 'Artist', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'size', header: 'Size', type: 'string' },
  { key: 'complexity', header: 'Complexity', type: 'string' },
  { key: 'bodyPlacement', header: 'Body Placement', type: 'string' },
  { key: 'estimatedPrice', header: 'Estimated Price', type: 'currency' },
  { key: 'depositAmount', header: 'Deposit', type: 'currency' },
  { key: 'depositPaid', header: 'Deposit Paid', type: 'boolean' },
  { key: 'consentSigned', header: 'Consent Signed', type: 'boolean' },
  { key: 'waiverSigned', header: 'Waiver Signed', type: 'boolean' },
  { key: 'healthChecklistCompleted', header: 'Health Check', type: 'boolean' },
];

const ARTIST_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'specialtyStr', header: 'Specialties', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'totalRevenue', header: 'Total Revenue', type: 'currency' },
  { key: 'completedAppointments', header: 'Completed Sessions', type: 'number' },
];

// Master columns for the combined data structure (used by useToolData)
const MASTER_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Record ID', type: 'string' },
];

const defaultArtists: Artist[] = [
  {
    id: '1',
    name: 'Alex Rivera',
    specialty: ['Traditional', 'Neo-Traditional', 'Japanese'],
    hourlyRate: 150,
    availability: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' },
    },
    portfolioImages: [],
    totalRevenue: 0,
    completedAppointments: 0,
  },
  {
    id: '2',
    name: 'Jordan Blake',
    specialty: ['Realism', 'Portrait', 'Black & Grey'],
    hourlyRate: 175,
    availability: {
      tuesday: { start: '11:00', end: '19:00' },
      wednesday: { start: '11:00', end: '19:00' },
      thursday: { start: '11:00', end: '19:00' },
      friday: { start: '11:00', end: '19:00' },
      saturday: { start: '10:00', end: '16:00' },
    },
    portfolioImages: [],
    totalRevenue: 0,
    completedAppointments: 0,
  },
  {
    id: '3',
    name: 'Sam Chen',
    specialty: ['Watercolor', 'Geometric', 'Minimalist'],
    hourlyRate: 140,
    availability: {
      monday: { start: '12:00', end: '20:00' },
      wednesday: { start: '12:00', end: '20:00' },
      friday: { start: '12:00', end: '20:00' },
      saturday: { start: '10:00', end: '18:00' },
    },
    portfolioImages: [],
    totalRevenue: 0,
    completedAppointments: 0,
  },
];

const sizeMultipliers: Record<string, number> = {
  small: 1,
  medium: 2,
  large: 3.5,
  'extra-large': 5,
};

const complexityMultipliers: Record<string, number> = {
  simple: 1,
  moderate: 1.5,
  complex: 2,
  'highly-complex': 3,
};

// Default initial data structure
const defaultTattooShopData: TattooShopData = {
  id: 'tattoo-shop-main',
  clients: [],
  appointments: [],
  artists: defaultArtists,
  healthChecklists: [],
};

interface TattooShopToolProps {
  uiConfig?: UIConfig;
}

export const TattooShopTool: React.FC<TattooShopToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the new useToolData hook for backend persistence
  const {
    data: shopDataArray,
    setData: setShopDataArray,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    importCSV: hookImportCSV,
    importJSON: hookImportJSON,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
  } = useToolData<TattooShopData>('tattoo-shop', [defaultTattooShopData], MASTER_COLUMNS);

  // Extract the single data record from array (useToolData stores as array)
  const shopData = shopDataArray[0] || defaultTattooShopData;

  // Derived state from the synced data
  const clients = shopData.clients || [];
  const appointments = shopData.appointments || [];
  const artists = shopData.artists || defaultArtists;
  const healthChecklists = shopData.healthChecklists || [];

  // Helper to update the shop data
  const updateShopData = (updates: Partial<TattooShopData>) => {
    setShopDataArray([{ ...shopData, ...updates }]);
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // State
  const [activeTab, setActiveTab] = useState<TabType>('clients');

  // Form states
  const [showClientForm, setShowClientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [selectedAppointmentForHealth, setSelectedAppointmentForHealth] = useState<string | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Client form
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    idVerified: false,
    idType: '',
    idNumber: '',
    notes: '',
  });

  // Appointment form
  const [appointmentForm, setAppointmentForm] = useState({
    clientId: '',
    artistId: '',
    date: '',
    time: '',
    duration: 60,
    type: 'tattoo' as const,
    designNotes: '',
    size: 'medium' as const,
    complexity: 'moderate' as const,
    bodyPlacement: '',
    depositAmount: 0,
    depositPaid: false,
    consentSigned: false,
    waiverSigned: false,
    aftercareNotes: '',
  });

  // Artist form
  const [artistForm, setArtistForm] = useState({
    name: '',
    specialty: '',
    hourlyRate: 0,
  });

  // Health checklist form
  const [healthForm, setHealthForm] = useState({
    allergies: false,
    allergiesNotes: '',
    skinConditions: false,
    skinConditionsNotes: '',
    bloodDisorders: false,
    pregnant: false,
    recentSunExposure: false,
    alcoholLast24h: false,
    medications: false,
    medicationsNotes: '',
    previousTattooReactions: false,
  });

  // Calculate price
  const calculatePrice = (artistId: string, duration: number, size: string, complexity: string) => {
    const artist = artists.find((a) => a.id === artistId);
    if (!artist) return 0;
    const basePrice = artist.hourlyRate * (duration / 60);
    const sizeMultiplier = sizeMultipliers[size] || 1;
    const complexityMultiplier = complexityMultipliers[complexity] || 1;
    return Math.round(basePrice * sizeMultiplier * complexityMultiplier);
  };

  // Client handlers
  const handleSaveClient = () => {
    if (!clientForm.name.trim()) return;

    const newClient: Client = {
      id: editingClient?.id || Date.now().toString(),
      ...clientForm,
      createdAt: editingClient?.createdAt || new Date().toISOString(),
    };

    if (editingClient) {
      updateShopData({ clients: clients.map((c) => (c.id === editingClient.id ? newClient : c)) });
    } else {
      updateShopData({ clients: [...clients, newClient] });
    }

    setClientForm({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      idVerified: false,
      idType: '',
      idNumber: '',
      notes: '',
    });
    setEditingClient(null);
    setShowClientForm(false);
  };

  const handleEditClient = (client: Client) => {
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      dateOfBirth: client.dateOfBirth,
      idVerified: client.idVerified,
      idType: client.idType,
      idNumber: client.idNumber,
      notes: client.notes,
    });
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleDeleteClient = (id: string) => {
    updateShopData({ clients: clients.filter((c) => c.id !== id) });
  };

  // Appointment handlers
  const handleSaveAppointment = () => {
    if (!appointmentForm.clientId || !appointmentForm.artistId || !appointmentForm.date) return;

    const estimatedPrice = calculatePrice(
      appointmentForm.artistId,
      appointmentForm.duration,
      appointmentForm.size,
      appointmentForm.complexity
    );

    const newAppointment: Appointment = {
      id: editingAppointment?.id || Date.now().toString(),
      ...appointmentForm,
      referenceImages: editingAppointment?.referenceImages || [],
      status: editingAppointment?.status || 'scheduled',
      estimatedPrice,
      healthChecklistCompleted: editingAppointment?.healthChecklistCompleted || false,
      aftercareProvided: editingAppointment?.aftercareProvided || false,
      touchUpScheduled: editingAppointment?.touchUpScheduled || false,
      touchUpDate: editingAppointment?.touchUpDate || '',
    };

    if (editingAppointment) {
      updateShopData({ appointments: appointments.map((a) => (a.id === editingAppointment.id ? newAppointment : a)) });
    } else {
      updateShopData({ appointments: [...appointments, newAppointment] });
    }

    setAppointmentForm({
      clientId: '',
      artistId: '',
      date: '',
      time: '',
      duration: 60,
      type: 'tattoo',
      designNotes: '',
      size: 'medium',
      complexity: 'moderate',
      bodyPlacement: '',
      depositAmount: 0,
      depositPaid: false,
      consentSigned: false,
      waiverSigned: false,
      aftercareNotes: '',
    });
    setEditingAppointment(null);
    setShowAppointmentForm(false);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setAppointmentForm({
      clientId: appointment.clientId,
      artistId: appointment.artistId,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type,
      designNotes: appointment.designNotes,
      size: appointment.size,
      complexity: appointment.complexity,
      bodyPlacement: appointment.bodyPlacement,
      depositAmount: appointment.depositAmount,
      depositPaid: appointment.depositPaid,
      consentSigned: appointment.consentSigned,
      waiverSigned: appointment.waiverSigned,
      aftercareNotes: appointment.aftercareNotes,
    });
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = (id: string) => {
    updateShopData({ appointments: appointments.filter((a) => a.id !== id) });
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    let updatedArtists = artists;
    const updatedAppointments = appointments.map((a) => {
      if (a.id === id) {
        const updated = { ...a, status };
        if (status === 'completed') {
          const artist = artists.find((ar) => ar.id === a.artistId);
          if (artist) {
            updatedArtists = artists.map((ar) =>
              ar.id === artist.id
                ? {
                    ...ar,
                    totalRevenue: ar.totalRevenue + a.estimatedPrice,
                    completedAppointments: ar.completedAppointments + 1,
                  }
                : ar
            );
          }
        }
        return updated;
      }
      return a;
    });
    updateShopData({ appointments: updatedAppointments, artists: updatedArtists });
  };

  const handleScheduleTouchUp = (appointmentId: string, touchUpDate: string) => {
    updateShopData({
      appointments: appointments.map((a) =>
        a.id === appointmentId ? { ...a, touchUpScheduled: true, touchUpDate } : a
      ),
    });
  };

  const handleMarkAftercareProvided = (appointmentId: string) => {
    updateShopData({
      appointments: appointments.map((a) => (a.id === appointmentId ? { ...a, aftercareProvided: true } : a)),
    });
  };

  // Artist handlers
  const handleSaveArtist = () => {
    if (!artistForm.name.trim()) return;

    const newArtist: Artist = {
      id: editingArtist?.id || Date.now().toString(),
      name: artistForm.name,
      specialty: artistForm.specialty.split(',').map((s) => s.trim()),
      hourlyRate: artistForm.hourlyRate,
      availability: editingArtist?.availability || {},
      portfolioImages: editingArtist?.portfolioImages || [],
      totalRevenue: editingArtist?.totalRevenue || 0,
      completedAppointments: editingArtist?.completedAppointments || 0,
    };

    if (editingArtist) {
      updateShopData({ artists: artists.map((a) => (a.id === editingArtist.id ? newArtist : a)) });
    } else {
      updateShopData({ artists: [...artists, newArtist] });
    }

    setArtistForm({ name: '', specialty: '', hourlyRate: 0 });
    setEditingArtist(null);
    setShowArtistForm(false);
  };

  const handleEditArtist = (artist: Artist) => {
    setArtistForm({
      name: artist.name,
      specialty: artist.specialty.join(', '),
      hourlyRate: artist.hourlyRate,
    });
    setEditingArtist(artist);
    setShowArtistForm(true);
  };

  const handleDeleteArtist = (id: string) => {
    updateShopData({ artists: artists.filter((a) => a.id !== id) });
  };

  // Health checklist handler
  const handleSaveHealthChecklist = () => {
    if (!selectedAppointmentForHealth) return;

    const newChecklist: HealthChecklist = {
      id: Date.now().toString(),
      appointmentId: selectedAppointmentForHealth,
      ...healthForm,
      completedAt: new Date().toISOString(),
    };

    setHealthChecklists([...healthChecklists, newChecklist]);
    setAppointments(
      appointments.map((a) =>
        a.id === selectedAppointmentForHealth ? { ...a, healthChecklistCompleted: true } : a
      )
    );

    setHealthForm({
      allergies: false,
      allergiesNotes: '',
      skinConditions: false,
      skinConditionsNotes: '',
      bloodDisorders: false,
      pregnant: false,
      recentSunExposure: false,
      alcoholLast24h: false,
      medications: false,
      medicationsNotes: '',
      previousTattooReactions: false,
    });
    setSelectedAppointmentForHealth(null);
    setShowHealthForm(false);
    setTimeout(persistData, 0);
  };

  // Filtered data
  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const client = clients.find((c) => c.id === a.clientId);
      const matchesSearch =
        !searchTerm ||
        client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.designNotes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesDate = !dateFilter || a.date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, clients, searchTerm, statusFilter, dateFilter]);

  // Analytics
  const analytics = useMemo(() => {
    const totalRevenue = artists.reduce((sum, a) => sum + a.totalRevenue, 0);
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
    const pendingDeposits = appointments
      .filter((a) => !a.depositPaid && a.status === 'scheduled')
      .reduce((sum, a) => sum + a.depositAmount, 0);
    const upcomingAppointments = appointments.filter(
      (a) => a.status === 'scheduled' && new Date(a.date) >= new Date()
    ).length;
    const touchUpsScheduled = appointments.filter((a) => a.touchUpScheduled).length;

    return {
      totalRevenue,
      totalAppointments,
      completedAppointments,
      pendingDeposits,
      upcomingAppointments,
      touchUpsScheduled,
    };
  }, [appointments, artists]);

  // Styles
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'artists', label: 'Artists', icon: <Palette className="w-4 h-4" /> },
    { id: 'health', label: 'Health Compliance', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  // Column definitions for exports
  const CLIENT_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'phone', header: 'Phone', type: 'string' },
    { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
    { key: 'idVerified', header: 'ID Verified', type: 'boolean' },
    { key: 'idType', header: 'ID Type', type: 'string' },
    { key: 'createdAt', header: 'Created At', type: 'date' },
    { key: 'notes', header: 'Notes', type: 'string' },
  ];

  const APPOINTMENT_COLUMNS: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'string' },
    { key: 'clientName', header: 'Client', type: 'string' },
    { key: 'artistName', header: 'Artist', type: 'string' },
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'time', header: 'Time', type: 'string' },
    { key: 'duration', header: 'Duration (min)', type: 'number' },
    { key: 'type', header: 'Type', type: 'string' },
    { key: 'status', header: 'Status', type: 'string' },
    { key: 'size', header: 'Size', type: 'string' },
    { key: 'complexity', header: 'Complexity', type: 'string' },
    { key: 'bodyPlacement', header: 'Body Placement', type: 'string' },
    { key: 'estimatedPrice', header: 'Estimated Price', type: 'currency' },
    { key: 'depositAmount', header: 'Deposit', type: 'currency' },
    { key: 'depositPaid', header: 'Deposit Paid', type: 'boolean' },
    { key: 'consentSigned', header: 'Consent Signed', type: 'boolean' },
    { key: 'waiverSigned', header: 'Waiver Signed', type: 'boolean' },
    { key: 'healthChecklistCompleted', header: 'Health Check', type: 'boolean' },
  ];

  const ARTIST_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Name', type: 'string' },
    { key: 'specialtyStr', header: 'Specialties', type: 'string' },
    { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
    { key: 'totalRevenue', header: 'Total Revenue', type: 'currency' },
    { key: 'completedAppointments', header: 'Completed Sessions', type: 'number' },
  ];

  // Prepare data for export (add computed fields)
  const exportAppointments = useMemo(() => {
    return appointments.map((a) => ({
      ...a,
      clientName: clients.find((c) => c.id === a.clientId)?.name || 'Unknown',
      artistName: artists.find((ar) => ar.id === a.artistId)?.name || 'Unknown',
    }));
  }, [appointments, clients, artists]);

  const exportArtists = useMemo(() => {
    return artists.map((a) => ({
      ...a,
      specialtyStr: a.specialty.join(', '),
    }));
  }, [artists]);

  // Get current export data based on active tab
  const getCurrentExportData = () => {
    switch (activeTab) {
      case 'clients':
        return { data: clients, columns: CLIENT_COLUMNS, filename: 'tattoo-shop-clients' };
      case 'appointments':
        return { data: exportAppointments, columns: APPOINTMENT_COLUMNS, filename: 'tattoo-shop-appointments' };
      case 'artists':
        return { data: exportArtists, columns: ARTIST_COLUMNS, filename: 'tattoo-shop-artists' };
      default:
        return { data: clients, columns: CLIENT_COLUMNS, filename: 'tattoo-shop-data' };
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const { data, columns, filename } = getCurrentExportData();
    exportToCSV(data, columns, { filename });
  };

  const handleExportExcel = () => {
    const { data, columns, filename } = getCurrentExportData();
    exportToExcel(data, columns, { filename });
  };

  const handleExportJSON = () => {
    const { data, filename } = getCurrentExportData();
    exportToJSON(data, { filename });
  };

  const handleExportPDF = async () => {
    const { data, columns, filename } = getCurrentExportData();
    await exportToPDF(data, columns, {
      filename,
      title: `Tattoo Shop - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
      subtitle: `Total Records: ${data.length}`,
    });
  };

  const handlePrint = () => {
    const { data, columns } = getCurrentExportData();
    printData(data, columns, {
      title: `Tattoo Shop - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
    });
  };

  const handleCopyToClipboard = async () => {
    const { data, columns } = getCurrentExportData();
    return await copyUtil(data, columns);
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 rounded-lg ${cardBg} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Palette className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.tattooShop.tattooShopManager', 'Tattoo Shop Manager')}</h2>
            <p className={`text-sm ${textSecondary}`}>
              {t('tools.tattooShop.completeManagementForYourTattoo', 'Complete management for your tattoo and piercing studio')}
            </p>
          </div>
        </div>
        {(activeTab === 'clients' || activeTab === 'appointments' || activeTab === 'artists') && (
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        )}
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.tattooShop.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex flex-wrap gap-2 mb-6 border-b ${borderColor} pb-4`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : `${textSecondary} ${hoverBg}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className={`w-4 h-4 ${textSecondary}`} />
              <input
                type="text"
                placeholder={t('tools.tattooShop.searchClients', 'Search clients...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              />
            </div>
            <button
              onClick={() => setShowClientForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.tattooShop.addClient', 'Add Client')}
            </button>
          </div>

          {/* Client Form Modal */}
          {showClientForm && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>
                  {editingClient ? t('tools.tattooShop.editClient', 'Edit Client') : t('tools.tattooShop.newClient', 'New Client')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.fullName', 'Full Name *')}
                    </label>
                    <input
                      type="text"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.tattooShop.johnDoe', 'John Doe')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.tattooShop.johnExampleCom', 'john@example.com')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.dateOfBirth', 'Date of Birth')}
                    </label>
                    <input
                      type="date"
                      value={clientForm.dateOfBirth}
                      onChange={(e) => setClientForm({ ...clientForm, dateOfBirth: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.idType', 'ID Type')}
                    </label>
                    <select
                      value={clientForm.idType}
                      onChange={(e) => setClientForm({ ...clientForm, idType: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="">{t('tools.tattooShop.selectIdType', 'Select ID type')}</option>
                      <option value="drivers-license">{t('tools.tattooShop.driverSLicense', 'Driver\'s License')}</option>
                      <option value="passport">{t('tools.tattooShop.passport', 'Passport')}</option>
                      <option value="state-id">{t('tools.tattooShop.stateId', 'State ID')}</option>
                      <option value="military-id">{t('tools.tattooShop.militaryId', 'Military ID')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.idNumber', 'ID Number')}
                    </label>
                    <input
                      type="text"
                      value={clientForm.idNumber}
                      onChange={(e) => setClientForm({ ...clientForm, idNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.tattooShop.idNumber2', 'ID Number')}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={clientForm.idVerified}
                      onChange={(e) => setClientForm({ ...clientForm, idVerified: e.target.checked })}
                      className="w-4 h-4 text-purple-500"
                    />
                    <label className={`text-sm ${textSecondary}`}>{t('tools.tattooShop.idVerified', 'ID Verified')}</label>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.notes', 'Notes')}
                    </label>
                    <textarea
                      value={clientForm.notes}
                      onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                      rows={3}
                      placeholder={t('tools.tattooShop.additionalNotesAboutTheClient', 'Additional notes about the client...')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveClient}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.tattooShop.save', 'Save')}
                  </button>
                  <button
                    onClick={() => {
                      setShowClientForm(false);
                      setEditingClient(null);
                      setClientForm({
                        name: '',
                        email: '',
                        phone: '',
                        dateOfBirth: '',
                        idVerified: false,
                        idType: '',
                        idNumber: '',
                        notes: '',
                      });
                    }}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.tattooShop.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clients List */}
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className={`${cardBg} ${borderColor} border`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${textPrimary}`}>{client.name}</h3>
                        {client.idVerified && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                            <Check className="w-3 h-3" /> ID Verified
                          </span>
                        )}
                      </div>
                      <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {client.phone}
                          </span>
                        )}
                      </div>
                      {client.notes && (
                        <p className={`mt-2 text-sm ${textSecondary}`}>{client.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClient(client)}
                        className={`p-2 rounded-lg ${hoverBg}`}
                      >
                        <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredClients.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.tattooShop.noClientsFoundAddYour', 'No clients found. Add your first client to get started.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="flex items-center gap-2 min-w-[200px]">
                <Search className={`w-4 h-4 ${textSecondary}`} />
                <input
                  type="text"
                  placeholder={t('tools.tattooShop.searchAppointments', 'Search appointments...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${inputBg}`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="all">{t('tools.tattooShop.allStatus', 'All Status')}</option>
                <option value="scheduled">{t('tools.tattooShop.scheduled', 'Scheduled')}</option>
                <option value="in-progress">{t('tools.tattooShop.inProgress', 'In Progress')}</option>
                <option value="completed">{t('tools.tattooShop.completed', 'Completed')}</option>
                <option value="cancelled">{t('tools.tattooShop.cancelled', 'Cancelled')}</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              />
            </div>
            <button
              onClick={() => setShowAppointmentForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Plus className="w-4 h-4" />
              {t('tools.tattooShop.newAppointment', 'New Appointment')}
            </button>
          </div>

          {/* Appointment Form Modal */}
          {showAppointmentForm && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>
                  {editingAppointment ? t('tools.tattooShop.editAppointment', 'Edit Appointment') : t('tools.tattooShop.newAppointment2', 'New Appointment')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.client', 'Client *')}
                    </label>
                    <select
                      value={appointmentForm.clientId}
                      onChange={(e) =>
                        setAppointmentForm({ ...appointmentForm, clientId: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="">{t('tools.tattooShop.selectClient', 'Select client')}</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.artist', 'Artist *')}
                    </label>
                    <select
                      value={appointmentForm.artistId}
                      onChange={(e) =>
                        setAppointmentForm({ ...appointmentForm, artistId: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="">{t('tools.tattooShop.selectArtist', 'Select artist')}</option>
                      {artists.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} - ${a.hourlyRate}/hr
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.type', 'Type')}
                    </label>
                    <select
                      value={appointmentForm.type}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          type: e.target.value as Appointment['type'],
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="tattoo">{t('tools.tattooShop.tattoo', 'Tattoo')}</option>
                      <option value="piercing">{t('tools.tattooShop.piercing', 'Piercing')}</option>
                      <option value="consultation">{t('tools.tattooShop.consultation', 'Consultation')}</option>
                      <option value="touch-up">{t('tools.tattooShop.touchUp', 'Touch-up')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={appointmentForm.date}
                      onChange={(e) =>
                        setAppointmentForm({ ...appointmentForm, date: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.time', 'Time')}
                    </label>
                    <input
                      type="time"
                      value={appointmentForm.time}
                      onChange={(e) =>
                        setAppointmentForm({ ...appointmentForm, time: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.durationMinutes', 'Duration (minutes)')}
                    </label>
                    <input
                      type="number"
                      value={appointmentForm.duration}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          duration: parseInt(e.target.value) || 60,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      min={15}
                      step={15}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.size', 'Size')}
                    </label>
                    <select
                      value={appointmentForm.size}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          size: e.target.value as Appointment['size'],
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="small">{t('tools.tattooShop.small12Inches', 'Small (1-2 inches)')}</option>
                      <option value="medium">{t('tools.tattooShop.medium35Inches', 'Medium (3-5 inches)')}</option>
                      <option value="large">{t('tools.tattooShop.large610Inches', 'Large (6-10 inches)')}</option>
                      <option value="extra-large">{t('tools.tattooShop.extraLarge10Inches', 'Extra Large (10+ inches)')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.complexity', 'Complexity')}
                    </label>
                    <select
                      value={appointmentForm.complexity}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          complexity: e.target.value as Appointment['complexity'],
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="simple">{t('tools.tattooShop.simpleLineWork', 'Simple (line work)')}</option>
                      <option value="moderate">{t('tools.tattooShop.moderateShading', 'Moderate (shading)')}</option>
                      <option value="complex">{t('tools.tattooShop.complexFullColor', 'Complex (full color)')}</option>
                      <option value="highly-complex">{t('tools.tattooShop.highlyComplexPhotorealism', 'Highly Complex (photorealism)')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.bodyPlacement', 'Body Placement')}
                    </label>
                    <input
                      type="text"
                      value={appointmentForm.bodyPlacement}
                      onChange={(e) =>
                        setAppointmentForm({ ...appointmentForm, bodyPlacement: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.tattooShop.eGLeftForearm', 'e.g., Left forearm')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.depositAmount', 'Deposit Amount ($)')}
                    </label>
                    <input
                      type="number"
                      value={appointmentForm.depositAmount}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          depositAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      min={0}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={`flex items-center gap-2 text-sm ${textSecondary}`}>
                      <input
                        type="checkbox"
                        checked={appointmentForm.depositPaid}
                        onChange={(e) =>
                          setAppointmentForm({ ...appointmentForm, depositPaid: e.target.checked })
                        }
                        className="w-4 h-4 text-purple-500"
                      />
                      {t('tools.tattooShop.depositPaid', 'Deposit Paid')}
                    </label>
                    <label className={`flex items-center gap-2 text-sm ${textSecondary}`}>
                      <input
                        type="checkbox"
                        checked={appointmentForm.consentSigned}
                        onChange={(e) =>
                          setAppointmentForm({ ...appointmentForm, consentSigned: e.target.checked })
                        }
                        className="w-4 h-4 text-purple-500"
                      />
                      {t('tools.tattooShop.consentSigned', 'Consent Signed')}
                    </label>
                    <label className={`flex items-center gap-2 text-sm ${textSecondary}`}>
                      <input
                        type="checkbox"
                        checked={appointmentForm.waiverSigned}
                        onChange={(e) =>
                          setAppointmentForm({ ...appointmentForm, waiverSigned: e.target.checked })
                        }
                        className="w-4 h-4 text-purple-500"
                      />
                      {t('tools.tattooShop.waiverSigned', 'Waiver Signed')}
                    </label>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.designNotes', 'Design Notes')}
                    </label>
                    <textarea
                      value={appointmentForm.designNotes}
                      onChange={(e) =>
                        setAppointmentForm({ ...appointmentForm, designNotes: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                      rows={3}
                      placeholder={t('tools.tattooShop.designConsultationNotesClientPreferences', 'Design consultation notes, client preferences, reference ideas...')}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.referenceImages', 'Reference Images')}
                    </label>
                    <div
                      className={`w-full h-24 border-2 border-dashed ${borderColor} rounded-lg flex items-center justify-center ${textSecondary}`}
                    >
                      <div className="text-center">
                        <Image className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-sm">{t('tools.tattooShop.dropImagesHereOrClick', 'Drop images here or click to upload')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.aftercareNotes', 'Aftercare Notes')}
                    </label>
                    <textarea
                      value={appointmentForm.aftercareNotes}
                      onChange={(e) =>
                        setAppointmentForm({ ...appointmentForm, aftercareNotes: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                      rows={2}
                      placeholder={t('tools.tattooShop.specificAftercareInstructionsForThis', 'Specific aftercare instructions for this appointment...')}
                    />
                  </div>
                  {appointmentForm.artistId && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <span className={`text-sm ${textSecondary}`}>{t('tools.tattooShop.estimatedPrice', 'Estimated Price:')}</span>
                        <span className={`text-lg font-bold ${textPrimary}`}>
                          $
                          {calculatePrice(
                            appointmentForm.artistId,
                            appointmentForm.duration,
                            appointmentForm.size,
                            appointmentForm.complexity
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveAppointment}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.tattooShop.save2', 'Save')}
                  </button>
                  <button
                    onClick={() => {
                      setShowAppointmentForm(false);
                      setEditingAppointment(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.tattooShop.cancel2', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointments List */}
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => {
              const client = clients.find((c) => c.id === appointment.clientId);
              const artist = artists.find((a) => a.id === appointment.artistId);

              return (
                <Card key={appointment.id} className={`${cardBg} ${borderColor} border`}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold ${textPrimary}`}>
                            {client?.name || 'Unknown Client'}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              appointment.status === 'completed'
                                ? 'bg-green-500/10 text-green-500'
                                : appointment.status === 'in-progress'
                                ? 'bg-blue-500/10 text-blue-500'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-yellow-500/10 text-yellow-500'
                            }`}
                          >
                            {appointment.status}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`}
                          >
                            {appointment.type}
                          </span>
                        </div>
                        <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {appointment.date}
                            {appointment.time && ` at ${appointment.time}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {appointment.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Palette className="w-3 h-3" /> {artist?.name || 'No artist'}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> $
                            {appointment.estimatedPrice.toLocaleString()}
                          </span>
                        </div>
                        {appointment.bodyPlacement && (
                          <p className={`mt-1 text-sm ${textSecondary}`}>
                            Placement: {appointment.bodyPlacement}
                          </p>
                        )}
                        {appointment.designNotes && (
                          <p className={`mt-2 text-sm ${textSecondary}`}>
                            {appointment.designNotes}
                          </p>
                        )}

                        {/* Status indicators */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {appointment.depositPaid ? (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                              <CreditCard className="w-3 h-3" /> Deposit Paid
                            </span>
                          ) : appointment.depositAmount > 0 ? (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full">
                              <CreditCard className="w-3 h-3" /> Deposit: ${appointment.depositAmount}
                            </span>
                          ) : null}
                          {appointment.consentSigned && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                              <FileText className="w-3 h-3" /> Consent
                            </span>
                          )}
                          {appointment.waiverSigned && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                              <Shield className="w-3 h-3" /> Waiver
                            </span>
                          )}
                          {appointment.healthChecklistCompleted && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                              <ClipboardCheck className="w-3 h-3" /> Health Check
                            </span>
                          )}
                          {appointment.aftercareProvided && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                              <Heart className="w-3 h-3" /> Aftercare
                            </span>
                          )}
                          {appointment.touchUpScheduled && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                              <RefreshCw className="w-3 h-3" /> Touch-up: {appointment.touchUpDate}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditAppointment(appointment)}
                            className={`p-2 rounded-lg ${hoverBg}`}
                            title={t('tools.tattooShop.edit', 'Edit')}
                          >
                            <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quick Actions */}
                        {appointment.status === 'scheduled' && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() =>
                                handleUpdateAppointmentStatus(appointment.id, 'in-progress')
                              }
                              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              {t('tools.tattooShop.start', 'Start')}
                            </button>
                            {!appointment.healthChecklistCompleted && (
                              <button
                                onClick={() => {
                                  setSelectedAppointmentForHealth(appointment.id);
                                  setShowHealthForm(true);
                                }}
                                className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              >
                                {t('tools.tattooShop.healthCheck', 'Health Check')}
                              </button>
                            )}
                          </div>
                        )}
                        {appointment.status === 'in-progress' && (
                          <button
                            onClick={() =>
                              handleUpdateAppointmentStatus(appointment.id, 'completed')
                            }
                            className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            {t('tools.tattooShop.complete', 'Complete')}
                          </button>
                        )}
                        {appointment.status === 'completed' && !appointment.aftercareProvided && (
                          <button
                            onClick={() => handleMarkAftercareProvided(appointment.id)}
                            className="text-xs px-2 py-1 bg-pink-500 text-white rounded hover:bg-pink-600"
                          >
                            {t('tools.tattooShop.aftercareGiven', 'Aftercare Given')}
                          </button>
                        )}
                        {appointment.status === 'completed' && !appointment.touchUpScheduled && (
                          <button
                            onClick={() => {
                              const touchUpDate = prompt('Enter touch-up date (YYYY-MM-DD):');
                              if (touchUpDate) {
                                handleScheduleTouchUp(appointment.id, touchUpDate);
                              }
                            }}
                            className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                          >
                            {t('tools.tattooShop.scheduleTouchUp', 'Schedule Touch-up')}
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredAppointments.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.tattooShop.noAppointmentsFoundCreateA', 'No appointments found. Create a new appointment to get started.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Artists Tab */}
      {activeTab === 'artists' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowArtistForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Plus className="w-4 h-4" />
              {t('tools.tattooShop.addArtist', 'Add Artist')}
            </button>
          </div>

          {/* Artist Form Modal */}
          {showArtistForm && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>
                  {editingArtist ? t('tools.tattooShop.editArtist', 'Edit Artist') : t('tools.tattooShop.newArtist', 'New Artist')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.name', 'Name *')}
                    </label>
                    <input
                      type="text"
                      value={artistForm.name}
                      onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.tattooShop.artistName', 'Artist name')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.specialtiesCommaSeparated', 'Specialties (comma-separated)')}
                    </label>
                    <input
                      type="text"
                      value={artistForm.specialty}
                      onChange={(e) => setArtistForm({ ...artistForm, specialty: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.tattooShop.traditionalJapaneseRealism', 'Traditional, Japanese, Realism')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.tattooShop.hourlyRate', 'Hourly Rate ($)')}
                    </label>
                    <input
                      type="number"
                      value={artistForm.hourlyRate}
                      onChange={(e) =>
                        setArtistForm({ ...artistForm, hourlyRate: parseFloat(e.target.value) || 0 })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      min={0}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveArtist}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.tattooShop.save3', 'Save')}
                  </button>
                  <button
                    onClick={() => {
                      setShowArtistForm(false);
                      setEditingArtist(null);
                      setArtistForm({ name: '', specialty: '', hourlyRate: 0 });
                    }}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.tattooShop.cancel3', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Artists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <Card key={artist.id} className={`${cardBg} ${borderColor} border`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${textPrimary}`}>{artist.name}</h3>
                      <p className={`text-sm ${textSecondary}`}>${artist.hourlyRate}/hour</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditArtist(artist)}
                        className={`p-2 rounded-lg ${hoverBg}`}
                      >
                        <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteArtist(artist.id)}
                        className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {artist.specialty.map((spec, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Portfolio placeholder */}
                  <div
                    className={`mt-4 h-24 border-2 border-dashed ${borderColor} rounded-lg flex items-center justify-center ${textSecondary}`}
                  >
                    <div className="text-center">
                      <FolderOpen className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-xs">Portfolio ({artist.portfolioImages.length} images)</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className={`grid grid-cols-2 gap-2 mt-4 pt-4 border-t ${borderColor}`}>
                    <div>
                      <p className={`text-xs ${textSecondary}`}>{t('tools.tattooShop.totalRevenue', 'Total Revenue')}</p>
                      <p className={`font-semibold ${textPrimary}`}>
                        ${artist.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${textSecondary}`}>{t('tools.tattooShop.completed2', 'Completed')}</p>
                      <p className={`font-semibold ${textPrimary}`}>
                        {artist.completedAppointments} sessions
                      </p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                    <p className={`text-xs font-medium ${textSecondary} mb-2`}>{t('tools.tattooShop.availability', 'Availability')}</p>
                    <div className="flex flex-wrap gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const dayKey = day.toLowerCase().slice(0, -1) === 'sat' || day.toLowerCase().slice(0, -1) === 'sun'
                          ? day.toLowerCase().slice(0, 3) === 'sat' ? 'saturday' : 'sunday'
                          : day.toLowerCase() === 'mon' ? 'monday'
                          : day.toLowerCase() === 'tue' ? 'tuesday'
                          : day.toLowerCase() === 'wed' ? 'wednesday'
                          : day.toLowerCase() === 'thu' ? 'thursday'
                          : 'friday';
                        const isAvailable = artist.availability[dayKey];
                        return (
                          <span
                            key={day}
                            className={`text-xs px-2 py-0.5 rounded ${
                              isAvailable
                                ? 'bg-green-500/10 text-green-500'
                                : `${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Health Compliance Tab */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          {/* Health Form Modal */}
          {showHealthForm && selectedAppointmentForHealth && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>{t('tools.tattooShop.healthComplianceChecklist', 'Health Compliance Checklist')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'} border border-yellow-500/20`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{t('tools.tattooShop.importantHealthScreening', 'Important Health Screening')}</p>
                        <p className={`text-sm ${textSecondary}`}>
                          {t('tools.tattooShop.pleaseConfirmAllHealthConditions', 'Please confirm all health conditions before proceeding with the appointment.')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`flex items-center gap-2 ${textSecondary}`}>
                        <input
                          type="checkbox"
                          checked={healthForm.allergies}
                          onChange={(e) =>
                            setHealthForm({ ...healthForm, allergies: e.target.checked })
                          }
                          className="w-4 h-4 text-purple-500"
                        />
                        {t('tools.tattooShop.knownAllergiesLatexMetalsInks', 'Known allergies (latex, metals, inks)')}
                      </label>
                      {healthForm.allergies && (
                        <input
                          type="text"
                          value={healthForm.allergiesNotes}
                          onChange={(e) =>
                            setHealthForm({ ...healthForm, allergiesNotes: e.target.value })
                          }
                          className={`w-full mt-2 px-3 py-2 rounded-lg border ${inputBg}`}
                          placeholder={t('tools.tattooShop.specifyAllergies', 'Specify allergies...')}
                        />
                      )}
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 ${textSecondary}`}>
                        <input
                          type="checkbox"
                          checked={healthForm.skinConditions}
                          onChange={(e) =>
                            setHealthForm({ ...healthForm, skinConditions: e.target.checked })
                          }
                          className="w-4 h-4 text-purple-500"
                        />
                        {t('tools.tattooShop.skinConditionsEczemaPsoriasis', 'Skin conditions (eczema, psoriasis)')}
                      </label>
                      {healthForm.skinConditions && (
                        <input
                          type="text"
                          value={healthForm.skinConditionsNotes}
                          onChange={(e) =>
                            setHealthForm({ ...healthForm, skinConditionsNotes: e.target.value })
                          }
                          className={`w-full mt-2 px-3 py-2 rounded-lg border ${inputBg}`}
                          placeholder={t('tools.tattooShop.specifyConditions', 'Specify conditions...')}
                        />
                      )}
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 ${textSecondary}`}>
                        <input
                          type="checkbox"
                          checked={healthForm.bloodDisorders}
                          onChange={(e) =>
                            setHealthForm({ ...healthForm, bloodDisorders: e.target.checked })
                          }
                          className="w-4 h-4 text-purple-500"
                        />
                        {t('tools.tattooShop.bloodDisordersOrOnBlood', 'Blood disorders or on blood thinners')}
                      </label>
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 ${textSecondary}`}>
                        <input
                          type="checkbox"
                          checked={healthForm.pregnant}
                          onChange={(e) =>
                            setHealthForm({ ...healthForm, pregnant: e.target.checked })
                          }
                          className="w-4 h-4 text-purple-500"
                        />
                        {t('tools.tattooShop.pregnantOrNursing', 'Pregnant or nursing')}
                      </label>
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 ${textSecondary}`}>
                        <input
                          type="checkbox"
                          checked={healthForm.recentSunExposure}
                          onChange={(e) =>
                            setHealthForm({ ...healthForm, recentSunExposure: e.target.checked })
                          }
                          className="w-4 h-4 text-purple-500"
                        />
                        {t('tools.tattooShop.recentSunExposureOrSunburn', 'Recent sun exposure or sunburn')}
                      </label>
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 ${textSecondary}`}>
                        <input
                          type="checkbox"
                          checked={healthForm.alcoholLast24h}
                          onChange={(e) =>
                            setHealthForm({ ...healthForm, alcoholLast24h: e.target.checked })
                          }
                          className="w-4 h-4 text-purple-500"
                        />
                        {t('tools.tattooShop.alcoholConsumptionInLast24', 'Alcohol consumption in last 24 hours')}
                      </label>
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 ${textSecondary}`}>
                        <input
                          type="checkbox"
                          checked={healthForm.medications}
                          onChange={(e) =>
                            setHealthForm({ ...healthForm, medications: e.target.checked })
                          }
                          className="w-4 h-4 text-purple-500"
                        />
                        {t('tools.tattooShop.currentlyTakingMedications', 'Currently taking medications')}
                      </label>
                      {healthForm.medications && (
                        <input
                          type="text"
                          value={healthForm.medicationsNotes}
                          onChange={(e) =>
                            setHealthForm({ ...healthForm, medicationsNotes: e.target.value })
                          }
                          className={`w-full mt-2 px-3 py-2 rounded-lg border ${inputBg}`}
                          placeholder={t('tools.tattooShop.listMedications', 'List medications...')}
                        />
                      )}
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 ${textSecondary}`}>
                        <input
                          type="checkbox"
                          checked={healthForm.previousTattooReactions}
                          onChange={(e) =>
                            setHealthForm({
                              ...healthForm,
                              previousTattooReactions: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-purple-500"
                        />
                        {t('tools.tattooShop.previousAdverseReactionsToTattoos', 'Previous adverse reactions to tattoos')}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handleSaveHealthChecklist}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" />
                    {t('tools.tattooShop.completeHealthCheck', 'Complete Health Check')}
                  </button>
                  <button
                    onClick={() => {
                      setShowHealthForm(false);
                      setSelectedAppointmentForHealth(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.tattooShop.cancel4', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Health Checklists List */}
          <div className="grid gap-4">
            <h3 className={`font-semibold ${textPrimary}`}>{t('tools.tattooShop.completedHealthScreenings', 'Completed Health Screenings')}</h3>
            {healthChecklists.map((checklist) => {
              const appointment = appointments.find((a) => a.id === checklist.appointmentId);
              const client = clients.find((c) => c.id === appointment?.clientId);

              return (
                <Card key={checklist.id} className={`${cardBg} ${borderColor} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${textPrimary}`}>
                          {client?.name || 'Unknown Client'}
                        </h4>
                        <p className={`text-sm ${textSecondary}`}>
                          Completed: {new Date(checklist.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {checklist.allergies && (
                        <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full">
                          Allergies: {checklist.allergiesNotes || 'Yes'}
                        </span>
                      )}
                      {checklist.skinConditions && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full">
                          {t('tools.tattooShop.skinConditions', 'Skin Conditions')}
                        </span>
                      )}
                      {checklist.bloodDisorders && (
                        <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full">
                          {t('tools.tattooShop.bloodDisorders', 'Blood Disorders')}
                        </span>
                      )}
                      {checklist.medications && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                          Medications: {checklist.medicationsNotes || 'Yes'}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {healthChecklists.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.tattooShop.noHealthScreeningsCompletedYet', 'No health screenings completed yet.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  ${analytics.totalRevenue.toLocaleString()}
                </p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.tattooShop.totalRevenue2', 'Total Revenue')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{analytics.totalAppointments}</p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.tattooShop.totalAppointments', 'Total Appointments')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <Check className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  {analytics.completedAppointments}
                </p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.tattooShop.completed3', 'Completed')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  {analytics.upcomingAppointments}
                </p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.tattooShop.upcoming', 'Upcoming')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <CreditCard className="w-6 h-6 mx-auto text-red-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  ${analytics.pendingDeposits.toLocaleString()}
                </p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.tattooShop.pendingDeposits', 'Pending Deposits')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <RefreshCw className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{analytics.touchUpsScheduled}</p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.tattooShop.touchUps', 'Touch-ups')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Artist */}
          <Card className={`${cardBg} ${borderColor} border`}>
            <CardHeader>
              <CardTitle className={textPrimary}>{t('tools.tattooShop.revenueByArtist', 'Revenue by Artist')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {artists.map((artist) => {
                  const maxRevenue = Math.max(...artists.map((a) => a.totalRevenue), 1);
                  const percentage = (artist.totalRevenue / maxRevenue) * 100;

                  return (
                    <div key={artist.id}>
                      <div className="flex justify-between mb-1">
                        <span className={textPrimary}>{artist.name}</span>
                        <span className={textSecondary}>
                          ${artist.totalRevenue.toLocaleString()} ({artist.completedAppointments}{' '}
                          sessions)
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Types Breakdown */}
          <Card className={`${cardBg} ${borderColor} border`}>
            <CardHeader>
              <CardTitle className={textPrimary}>{t('tools.tattooShop.appointmentTypes', 'Appointment Types')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['tattoo', 'piercing', 'consultation', 'touch-up'].map((type) => {
                  const count = appointments.filter((a) => a.type === type).length;
                  const colors: Record<string, string> = {
                    tattoo: 'text-purple-500 bg-purple-500/10',
                    piercing: 'text-pink-500 bg-pink-500/10',
                    consultation: 'text-blue-500 bg-blue-500/10',
                    'touch-up': 'text-green-500 bg-green-500/10',
                  };

                  return (
                    <div
                      key={type}
                      className={`p-4 rounded-lg ${colors[type]} text-center`}
                    >
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm capitalize">{type.replace('-', ' ')}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${textPrimary}`}>
          {t('tools.tattooShop.aboutTattooShopManager', 'About Tattoo Shop Manager')}
        </h3>
        <p className={`text-sm ${textSecondary}`}>
          A comprehensive management tool for tattoo and piercing studios. Track clients, manage
          appointments, assign artists, handle deposits and waivers, ensure health compliance, and
          monitor revenue per artist. All data is automatically saved to your browser's local storage.
        </p>
      </div>
    </div>
  );
};

export default TattooShopTool;
