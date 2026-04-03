'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Home,
  Users,
  Calendar,
  Clock,
  Package,
  FileText,
  Star,
  DollarSign,
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Key,
  Building,
  Ruler,
  ClipboardCheck,
  Timer,
  UserCheck,
  AlertCircle,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  accessInfo: string;
  notes: string;
  createdAt: string;
}

interface Property {
  id: string;
  clientId: string;
  name: string;
  type: 'house' | 'apartment' | 'condo' | 'office' | 'commercial';
  size: number;
  sizeUnit: 'sqft' | 'sqm';
  bedrooms: number;
  bathrooms: number;
  specialAreas: string[];
  cleaningChecklist: ChecklistItem[];
  notes: string;
}

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  category: string;
}

interface Service {
  id: string;
  clientId: string;
  propertyId: string;
  type: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  scheduledDate: string;
  scheduledTime: string;
  assignedTeam: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  specialRequests: string;
  startTime?: string;
  endTime?: string;
  actualDuration?: number;
}

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'cleaner' | 'supervisor' | 'manager';
  availability: string[];
  rating: number;
}

interface Supply {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  lastRestocked: string;
}

interface QualityInspection {
  id: string;
  serviceId: string;
  inspectorId: string;
  date: string;
  overallRating: number;
  items: InspectionItem[];
  notes: string;
}

interface InspectionItem {
  area: string;
  rating: number;
  notes: string;
}

interface Invoice {
  id: string;
  clientId: string;
  serviceId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Feedback {
  id: string;
  clientId: string;
  serviceId: string;
  rating: number;
  comment: string;
  date: string;
}

interface PricingConfig {
  baseRate: number;
  perRoom: number;
  perSqft: number;
  hourlyRate: number;
  deepCleanMultiplier: number;
  specialAreaRates: { [key: string]: number };
}

// Unified data structure for backend sync
interface CleaningServiceData {
  id: string;
  clients: Client[];
  properties: Property[];
  services: Service[];
  team: TeamMember[];
  supplies: Supply[];
  inspections: QualityInspection[];
  invoices: Invoice[];
  feedback: Feedback[];
  pricing: PricingConfig;
}

// Column configuration for the unified data (used for export metadata)
const UNIFIED_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'clients', header: 'Clients Count', type: 'number' },
  { key: 'properties', header: 'Properties Count', type: 'number' },
  { key: 'services', header: 'Services Count', type: 'number' },
  { key: 'team', header: 'Team Count', type: 'number' },
  { key: 'supplies', header: 'Supplies Count', type: 'number' },
  { key: 'invoices', header: 'Invoices Count', type: 'number' },
  { key: 'feedback', header: 'Feedback Count', type: 'number' },
];

// Default data
const defaultPricing: PricingConfig = {
  baseRate: 50,
  perRoom: 25,
  perSqft: 0.15,
  hourlyRate: 35,
  deepCleanMultiplier: 1.5,
  specialAreaRates: {
    garage: 40,
    basement: 50,
    attic: 45,
    patio: 30,
    pool: 60,
  },
};

const defaultChecklist: ChecklistItem[] = [
  { id: '1', task: 'Dust all surfaces', completed: false, category: 'General' },
  { id: '2', task: 'Vacuum floors', completed: false, category: 'Floors' },
  { id: '3', task: 'Mop hard floors', completed: false, category: 'Floors' },
  { id: '4', task: 'Clean mirrors', completed: false, category: 'General' },
  { id: '5', task: 'Wipe countertops', completed: false, category: 'Kitchen' },
  { id: '6', task: 'Clean stovetop', completed: false, category: 'Kitchen' },
  { id: '7', task: 'Clean microwave', completed: false, category: 'Kitchen' },
  { id: '8', task: 'Sanitize toilets', completed: false, category: 'Bathroom' },
  { id: '9', task: 'Clean showers/tubs', completed: false, category: 'Bathroom' },
  { id: '10', task: 'Clean sinks', completed: false, category: 'Bathroom' },
  { id: '11', task: 'Make beds', completed: false, category: 'Bedroom' },
  { id: '12', task: 'Empty trash bins', completed: false, category: 'General' },
];

const specialAreaOptions = [
  'Garage',
  'Basement',
  'Attic',
  'Patio',
  'Pool Area',
  'Laundry Room',
  'Home Office',
  'Gym',
  'Wine Cellar',
  'Sunroom',
];

// Export columns for different data types
const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'accessInfo', header: 'Access Info', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const PROPERTY_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Property Name', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'size', header: 'Size', type: 'number' },
  { key: 'sizeUnit', header: 'Size Unit', type: 'string' },
  { key: 'bedrooms', header: 'Bedrooms', type: 'number' },
  { key: 'bathrooms', header: 'Bathrooms', type: 'number' },
  { key: 'specialAreas', header: 'Special Areas', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const SERVICE_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'propertyName', header: 'Property', type: 'string' },
  { key: 'type', header: 'Service Type', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'scheduledTime', header: 'Time', type: 'string' },
  { key: 'assignedTeam', header: 'Team', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'specialRequests', header: 'Special Requests', type: 'string' },
  { key: 'actualDuration', header: 'Duration (min)', type: 'number' },
];

const TEAM_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'role', header: 'Role', type: 'string' },
  { key: 'availability', header: 'Availability', type: 'string' },
  { key: 'rating', header: 'Rating', type: 'number' },
];

const SUPPLY_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'minStock', header: 'Min Stock', type: 'number' },
  { key: 'lastRestocked', header: 'Last Restocked', type: 'date' },
];

const INVOICE_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'tax', header: 'Tax', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const FEEDBACK_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'comment', header: 'Comment', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

// Tab type
type TabType = 'clients' | 'properties' | 'schedule' | 'team' | 'supplies' | 'pricing' | 'invoices' | 'feedback';

interface CleaningServiceToolProps {
  uiConfig?: UIConfig;
}

// Default unified data structure
const defaultCleaningServiceData: CleaningServiceData[] = [{
  id: 'cleaning-service-data',
  clients: [],
  properties: [],
  services: [],
  team: [],
  supplies: [],
  inspections: [],
  invoices: [],
  feedback: [],
  pricing: defaultPricing,
}];

export const CleaningServiceTool = ({ uiConfig }: CleaningServiceToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend sync
  const {
    data: syncedData,
    setData: setSyncedData,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    importCSV: hookImportCSV,
    importJSON: hookImportJSON,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<CleaningServiceData>('cleaning-service', defaultCleaningServiceData, UNIFIED_COLUMNS);

  // Extract data from the unified structure (always use first item)
  const dataRecord = syncedData[0] || defaultCleaningServiceData[0];
  const clients = dataRecord.clients || [];
  const properties = dataRecord.properties || [];
  const services = dataRecord.services || [];
  const team = dataRecord.team || [];
  const supplies = dataRecord.supplies || [];
  const inspections = dataRecord.inspections || [];
  const invoices = dataRecord.invoices || [];
  const feedback = dataRecord.feedback || [];
  const pricing = dataRecord.pricing || defaultPricing;

  // Helper function to update the unified data
  const updateData = useCallback((updates: Partial<CleaningServiceData>) => {
    setSyncedData(prev => {
      const current = prev[0] || defaultCleaningServiceData[0];
      return [{
        ...current,
        ...updates,
      }];
    });
  }, [setSyncedData]);

  // Setters that update the unified data structure
  const setClients = useCallback((value: Client[] | ((prev: Client[]) => Client[])) => {
    updateData({
      clients: typeof value === 'function' ? value(clients) : value
    });
  }, [clients, updateData]);

  const setProperties = useCallback((value: Property[] | ((prev: Property[]) => Property[])) => {
    updateData({
      properties: typeof value === 'function' ? value(properties) : value
    });
  }, [properties, updateData]);

  const setServices = useCallback((value: Service[] | ((prev: Service[]) => Service[])) => {
    updateData({
      services: typeof value === 'function' ? value(services) : value
    });
  }, [services, updateData]);

  const setTeam = useCallback((value: TeamMember[] | ((prev: TeamMember[]) => TeamMember[])) => {
    updateData({
      team: typeof value === 'function' ? value(team) : value
    });
  }, [team, updateData]);

  const setSupplies = useCallback((value: Supply[] | ((prev: Supply[]) => Supply[])) => {
    updateData({
      supplies: typeof value === 'function' ? value(supplies) : value
    });
  }, [supplies, updateData]);

  const setInspections = useCallback((value: QualityInspection[] | ((prev: QualityInspection[]) => QualityInspection[])) => {
    updateData({
      inspections: typeof value === 'function' ? value(inspections) : value
    });
  }, [inspections, updateData]);

  const setInvoices = useCallback((value: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    updateData({
      invoices: typeof value === 'function' ? value(invoices) : value
    });
  }, [invoices, updateData]);

  const setFeedback = useCallback((value: Feedback[] | ((prev: Feedback[]) => Feedback[])) => {
    updateData({
      feedback: typeof value === 'function' ? value(feedback) : value
    });
  }, [feedback, updateData]);

  const setPricing = useCallback((value: PricingConfig | ((prev: PricingConfig) => PricingConfig)) => {
    updateData({
      pricing: typeof value === 'function' ? value(pricing) : value
    });
  }, [pricing, updateData]);

  // State
  const [activeTab, setActiveTab] = useState<TabType>('clients');

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Form States
  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  const [propertyForm, setPropertyForm] = useState<Partial<Property>>({});
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({});
  const [teamForm, setTeamForm] = useState<Partial<TeamMember>>({});
  const [supplyForm, setSupplyForm] = useState<Partial<Supply>>({});
  const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice>>({});
  const [feedbackForm, setFeedbackForm] = useState<Partial<Feedback>>({});

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.clientName) {
        hasChanges = true;
      }
      if (params.address) {
        hasChanges = true;
      }
      if (params.phone) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && timerStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - timerStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerStartTime]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayServices = services.filter(s => s.scheduledDate === today);
    const completedToday = todayServices.filter(s => s.status === 'completed').length;
    const pendingToday = todayServices.filter(s => s.status === 'scheduled').length;
    const lowStockItems = supplies.filter(s => s.quantity <= s.minStock).length;
    const averageRating = feedback.length > 0
      ? feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length
      : 0;
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((acc, i) => acc + i.total, 0);
    const pendingPayments = invoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((acc, i) => acc + i.total, 0);

    return {
      totalClients: clients.length,
      totalProperties: properties.length,
      todayServices: todayServices.length,
      completedToday,
      pendingToday,
      teamSize: team.length,
      lowStockItems,
      averageRating: averageRating.toFixed(1),
      totalRevenue,
      pendingPayments,
    };
  }, [clients, properties, services, team, supplies, feedback, invoices]);

  // Export data and columns based on active tab
  const { exportData, exportColumns, exportFilename, exportTitle } = useMemo(() => {
    const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown';
    const getPropertyName = (propertyId: string) => properties.find(p => p.id === propertyId)?.name || 'Unknown';

    switch (activeTab) {
      case 'clients':
        return {
          exportData: clients,
          exportColumns: CLIENT_COLUMNS,
          exportFilename: 'cleaning-service-clients',
          exportTitle: 'Cleaning Service Clients',
        };
      case 'properties':
        return {
          exportData: properties.map(p => ({
            ...p,
            clientName: getClientName(p.clientId),
            specialAreas: p.specialAreas?.join(', ') || '',
          })),
          exportColumns: PROPERTY_COLUMNS,
          exportFilename: 'cleaning-service-properties',
          exportTitle: 'Cleaning Service Properties',
        };
      case 'schedule':
        return {
          exportData: services.map(s => ({
            ...s,
            clientName: getClientName(s.clientId),
            propertyName: getPropertyName(s.propertyId),
            assignedTeam: s.assignedTeam?.join(', ') || '',
          })),
          exportColumns: SERVICE_COLUMNS,
          exportFilename: 'cleaning-service-schedule',
          exportTitle: 'Cleaning Service Schedule',
        };
      case 'team':
        return {
          exportData: team.map(t => ({
            ...t,
            availability: t.availability?.join(', ') || '',
          })),
          exportColumns: TEAM_COLUMNS,
          exportFilename: 'cleaning-service-team',
          exportTitle: 'Cleaning Service Team',
        };
      case 'supplies':
        return {
          exportData: supplies,
          exportColumns: SUPPLY_COLUMNS,
          exportFilename: 'cleaning-service-supplies',
          exportTitle: 'Cleaning Service Supplies',
        };
      case 'invoices':
        return {
          exportData: invoices.map(i => ({
            ...i,
            clientName: getClientName(i.clientId),
          })),
          exportColumns: INVOICE_COLUMNS,
          exportFilename: 'cleaning-service-invoices',
          exportTitle: 'Cleaning Service Invoices',
        };
      case 'feedback':
        return {
          exportData: feedback.map(f => ({
            ...f,
            clientName: getClientName(f.clientId),
          })),
          exportColumns: FEEDBACK_COLUMNS,
          exportFilename: 'cleaning-service-feedback',
          exportTitle: 'Cleaning Service Feedback',
        };
      default:
        return {
          exportData: clients,
          exportColumns: CLIENT_COLUMNS,
          exportFilename: 'cleaning-service-clients',
          exportTitle: 'Cleaning Service Clients',
        };
    }
  }, [activeTab, clients, properties, services, team, supplies, invoices, feedback]);

  // Handlers
  const resetForms = () => {
    setClientForm({});
    setPropertyForm({});
    setServiceForm({});
    setTeamForm({});
    setSupplyForm({});
    setInvoiceForm({});
    setFeedbackForm({});
    setShowForm(false);
    setEditingId(null);
  };

  // Client handlers
  const handleSaveClient = () => {
    if (!clientForm.name || !clientForm.email) return;

    if (editingId) {
      setClients(prev => prev.map(c =>
        c.id === editingId ? { ...c, ...clientForm } as Client : c
      ));
    } else {
      const newClient: Client = {
        id: generateId(),
        name: clientForm.name || '',
        email: clientForm.email || '',
        phone: clientForm.phone || '',
        address: clientForm.address || '',
        accessInfo: clientForm.accessInfo || '',
        notes: clientForm.notes || '',
        createdAt: new Date().toISOString(),
      };
      setClients(prev => [...prev, newClient]);
    }
    resetForms();
  };

  const handleDeleteClient = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client? This will also delete associated properties and services.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setClients(prev => prev.filter(c => c.id !== id));
      setProperties(prev => prev.filter(p => p.clientId !== id));
      setServices(prev => prev.filter(s => s.clientId !== id));
    }
  };

  // Property handlers
  const handleSaveProperty = () => {
    if (!propertyForm.name || !propertyForm.clientId) return;

    if (editingId) {
      setProperties(prev => prev.map(p =>
        p.id === editingId ? { ...p, ...propertyForm } as Property : p
      ));
    } else {
      const newProperty: Property = {
        id: generateId(),
        clientId: propertyForm.clientId || '',
        name: propertyForm.name || '',
        type: propertyForm.type || 'house',
        size: propertyForm.size || 0,
        sizeUnit: propertyForm.sizeUnit || 'sqft',
        bedrooms: propertyForm.bedrooms || 0,
        bathrooms: propertyForm.bathrooms || 0,
        specialAreas: propertyForm.specialAreas || [],
        cleaningChecklist: [...defaultChecklist],
        notes: propertyForm.notes || '',
      };
      setProperties(prev => [...prev, newProperty]);
    }
    resetForms();
  };

  const handleDeleteProperty = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Property',
      message: 'Are you sure you want to delete this property?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setProperties(prev => prev.filter(p => p.id !== id));
      setServices(prev => prev.filter(s => s.propertyId !== id));
    }
  };

  const handleUpdateChecklist = (propertyId: string, itemId: string, completed: boolean) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          cleaningChecklist: p.cleaningChecklist.map(item =>
            item.id === itemId ? { ...item, completed } : item
          ),
        };
      }
      return p;
    }));
  };

  // Service handlers
  const handleSaveService = () => {
    if (!serviceForm.clientId || !serviceForm.propertyId || !serviceForm.scheduledDate) return;

    if (editingId) {
      setServices(prev => prev.map(s =>
        s.id === editingId ? { ...s, ...serviceForm } as Service : s
      ));
    } else {
      const newService: Service = {
        id: generateId(),
        clientId: serviceForm.clientId || '',
        propertyId: serviceForm.propertyId || '',
        type: serviceForm.type || 'one-time',
        scheduledDate: serviceForm.scheduledDate || '',
        scheduledTime: serviceForm.scheduledTime || '09:00',
        assignedTeam: serviceForm.assignedTeam || [],
        status: 'scheduled',
        specialRequests: serviceForm.specialRequests || '',
      };
      setServices(prev => [...prev, newService]);
    }
    resetForms();
  };

  const handleStartTimer = (serviceId: string) => {
    setActiveTimer(serviceId);
    setTimerStartTime(Date.now());
    setElapsedTime(0);
    setServices(prev => prev.map(s =>
      s.id === serviceId
        ? { ...s, status: 'in-progress' as const, startTime: new Date().toISOString() }
        : s
    ));
  };

  const handleStopTimer = (serviceId: string) => {
    const endTime = new Date().toISOString();
    const duration = Math.floor(elapsedTime / 60);
    setServices(prev => prev.map(s =>
      s.id === serviceId
        ? { ...s, status: 'completed' as const, endTime, actualDuration: duration }
        : s
    ));
    setActiveTimer(null);
    setTimerStartTime(null);
    setElapsedTime(0);
  };

  const formatElapsedTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Team handlers
  const handleSaveTeamMember = () => {
    if (!teamForm.name || !teamForm.email) return;

    if (editingId) {
      setTeam(prev => prev.map(t =>
        t.id === editingId ? { ...t, ...teamForm } as TeamMember : t
      ));
    } else {
      const newMember: TeamMember = {
        id: generateId(),
        name: teamForm.name || '',
        phone: teamForm.phone || '',
        email: teamForm.email || '',
        role: teamForm.role || 'cleaner',
        availability: teamForm.availability || [],
        rating: 5,
      };
      setTeam(prev => [...prev, newMember]);
    }
    resetForms();
  };

  const handleDeleteTeamMember = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Team Member',
      message: 'Are you sure you want to delete this team member?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setTeam(prev => prev.filter(t => t.id !== id));
    }
  };

  // Supply handlers
  const handleSaveSupply = () => {
    if (!supplyForm.name) return;

    if (editingId) {
      setSupplies(prev => prev.map(s =>
        s.id === editingId ? { ...s, ...supplyForm } as Supply : s
      ));
    } else {
      const newSupply: Supply = {
        id: generateId(),
        name: supplyForm.name || '',
        category: supplyForm.category || 'General',
        quantity: supplyForm.quantity || 0,
        unit: supplyForm.unit || 'units',
        minStock: supplyForm.minStock || 5,
        lastRestocked: new Date().toISOString(),
      };
      setSupplies(prev => [...prev, newSupply]);
    }
    resetForms();
  };

  const handleDeleteSupply = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Supply Item',
      message: 'Are you sure you want to delete this supply item?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setSupplies(prev => prev.filter(s => s.id !== id));
    }
  };

  // Pricing calculator
  const calculatePrice = (property: Property, isDeepClean: boolean = false) => {
    let total = pricing.baseRate;
    total += (property.bedrooms + property.bathrooms) * pricing.perRoom;
    total += property.size * pricing.perSqft;

    property.specialAreas.forEach(area => {
      const areaKey = area.toLowerCase().replace(' ', '');
      if (pricing.specialAreaRates[areaKey]) {
        total += pricing.specialAreaRates[areaKey];
      }
    });

    if (isDeepClean) {
      total *= pricing.deepCleanMultiplier;
    }

    return Math.round(total * 100) / 100;
  };

  // Invoice handlers
  const handleGenerateInvoice = (service: Service) => {
    const property = properties.find(p => p.id === service.propertyId);
    const client = clients.find(c => c.id === service.clientId);
    if (!property || !client) return;

    const price = calculatePrice(property);
    const tax = price * 0.1;

    const newInvoice: Invoice = {
      id: generateId(),
      clientId: service.clientId,
      serviceId: service.id,
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          description: `Cleaning service at ${property.name}`,
          quantity: 1,
          rate: price,
          amount: price,
        },
      ],
      subtotal: price,
      tax,
      total: price + tax,
      status: 'draft',
    };

    setInvoices(prev => [...prev, newInvoice]);
    setActiveTab('invoices');
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(i =>
      i.id === id ? { ...i, status } : i
    ));
  };

  // Feedback handlers
  const handleSaveFeedback = () => {
    if (!feedbackForm.clientId || !feedbackForm.serviceId || !feedbackForm.rating) return;

    const newFeedback: Feedback = {
      id: generateId(),
      clientId: feedbackForm.clientId || '',
      serviceId: feedbackForm.serviceId || '',
      rating: feedbackForm.rating || 5,
      comment: feedbackForm.comment || '',
      date: new Date().toISOString(),
    };

    setFeedback(prev => [...prev, newFeedback]);
    resetForms();
  };

  // Filter data based on search
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  // Styles
  const cardStyle = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg`;
  const inputStyle = `w-full px-4 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;
  const labelStyle = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`;
  const buttonPrimary = 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium shadow-lg shadow-[#0D9488]/20';
  const buttonSecondary = `px-4 py-2 rounded-lg font-medium transition-colors ${
    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
    { id: 'properties', label: 'Properties', icon: <Home className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'supplies', label: 'Supplies', icon: <Package className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
    { id: 'feedback', label: 'Feedback', icon: <Star className="w-4 h-4" /> },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.cleaningService.cleaningServiceManager', 'Cleaning Service Manager')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.cleaningService.manageClientsPropertiesSchedulingAnd', 'Manage clients, properties, scheduling, and billing')}
              </p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="cleaning-service" toolName="Cleaning Service" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <div className={`${cardStyle} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningService.totalClients', 'Total Clients')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalClients}</p>
              </div>
              <Users className="w-8 h-8 text-[#0D9488]" />
            </div>
          </div>
          <div className={`${cardStyle} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningService.todaySJobs', 'Today\'s Jobs')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.todayServices}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className={`${cardStyle} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningService.teamSize', 'Team Size')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.teamSize}</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className={`${cardStyle} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningService.avgRating', 'Avg Rating')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.averageRating}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className={`${cardStyle} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningService.lowStock', 'Low Stock')}</p>
                <p className={`text-2xl font-bold ${stats.lowStockItems > 0 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.lowStockItems}
                </p>
              </div>
              <AlertCircle className={`w-8 h-8 ${stats.lowStockItems > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); resetForms(); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0D9488] text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputStyle} pl-10`}
            />
          </div>
          <div className="flex gap-2">
            {exportData.length > 0 && (
              <ExportDropdown
                onExportCSV={() => exportToCSV(exportData, exportColumns, { filename: exportFilename })}
                onExportExcel={() => exportToExcel(exportData, exportColumns, { filename: exportFilename })}
                onExportJSON={() => exportToJSON(exportData, { filename: exportFilename })}
                onExportPDF={async () => {
                  await exportToPDF(exportData, exportColumns, {
                    filename: exportFilename,
                    title: exportTitle,
                  });
                }}
                onPrint={() => printData(exportData, exportColumns, { title: exportTitle })}
                onCopyToClipboard={() => copyUtil(exportData, exportColumns, 'tab')}
                onImportCSV={async (file) => {
                  // Import all data as JSON for this complex tool
                  const result = await hookImportJSON(file);
                  return result;
                }}
                onImportJSON={async (file) => {
                  const result = await hookImportJSON(file);
                  return result;
                }}
                theme={isDark ? 'dark' : 'light'}
              />
            )}
            <button
              onClick={() => { setShowForm(true); setEditingId(null); }}
              className={buttonPrimary}
            >
              <Plus className="w-4 h-4" />
              {t('tools.cleaningService.addNew', 'Add New')}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={cardStyle}>
          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="p-6">
              {showForm && (
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingId ? t('tools.cleaningService.editClient', 'Edit Client') : t('tools.cleaningService.addNewClient', 'Add New Client')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.name', 'Name *')}</label>
                      <input
                        type="text"
                        value={clientForm.name || ''}
                        onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                        className={inputStyle}
                        placeholder={t('tools.cleaningService.clientName', 'Client name')}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.email', 'Email *')}</label>
                      <input
                        type="email"
                        value={clientForm.email || ''}
                        onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                        className={inputStyle}
                        placeholder={t('tools.cleaningService.clientEmailCom', 'client@email.com')}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.phone', 'Phone')}</label>
                      <input
                        type="tel"
                        value={clientForm.phone || ''}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        className={inputStyle}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.address', 'Address')}</label>
                      <input
                        type="text"
                        value={clientForm.address || ''}
                        onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                        className={inputStyle}
                        placeholder={t('tools.cleaningService.123MainStCityState', '123 Main St, City, State')}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.accessInformation', 'Access Information')}</label>
                      <input
                        type="text"
                        value={clientForm.accessInfo || ''}
                        onChange={(e) => setClientForm({ ...clientForm, accessInfo: e.target.value })}
                        className={inputStyle}
                        placeholder={t('tools.cleaningService.gateCodeKeyLocationEtc', 'Gate code, key location, etc.')}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.notes', 'Notes')}</label>
                      <input
                        type="text"
                        value={clientForm.notes || ''}
                        onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                        className={inputStyle}
                        placeholder={t('tools.cleaningService.additionalNotes', 'Additional notes')}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveClient} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.cleaningService.saveClient', 'Save Client')}
                    </button>
                    <button onClick={resetForms} className={buttonSecondary}>
                      {t('tools.cleaningService.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.noClientsFoundAddYour', 'No clients found. Add your first client to get started.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredClients.map(client => (
                    <div
                      key={client.id}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {client.name}
                            </h3>
                            <button
                              onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                              className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              {expandedId === client.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm">
                            <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Mail className="w-4 h-4" /> {client.email}
                            </span>
                            {client.phone && (
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Phone className="w-4 h-4" /> {client.phone}
                              </span>
                            )}
                            {client.address && (
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <MapPin className="w-4 h-4" /> {client.address}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setClientForm(client);
                              setEditingId(client.id);
                              setShowForm(true);
                            }}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {expandedId === client.id && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          {client.accessInfo && (
                            <div className="mb-2">
                              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.cleaningService.accessInfo', 'Access Info:')}
                              </span>
                              <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {client.accessInfo}
                              </span>
                            </div>
                          )}
                          {client.notes && (
                            <div className="mb-2">
                              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.cleaningService.notes4', 'Notes:')}
                              </span>
                              <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {client.notes}
                              </span>
                            </div>
                          )}
                          <div className="mt-3">
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Properties: {properties.filter(p => p.clientId === client.id).length}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="p-6">
              {showForm && (
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingId ? t('tools.cleaningService.editProperty', 'Edit Property') : t('tools.cleaningService.addNewProperty', 'Add New Property')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.client', 'Client *')}</label>
                      <select
                        value={propertyForm.clientId || ''}
                        onChange={(e) => setPropertyForm({ ...propertyForm, clientId: e.target.value })}
                        className={inputStyle}
                      >
                        <option value="">{t('tools.cleaningService.selectClient', 'Select client')}</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.propertyName', 'Property Name *')}</label>
                      <input
                        type="text"
                        value={propertyForm.name || ''}
                        onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                        className={inputStyle}
                        placeholder={t('tools.cleaningService.mainHomeDowntownAptEtc', 'Main Home, Downtown Apt, etc.')}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.propertyType', 'Property Type')}</label>
                      <select
                        value={propertyForm.type || 'house'}
                        onChange={(e) => setPropertyForm({ ...propertyForm, type: e.target.value as Property['type'] })}
                        className={inputStyle}
                      >
                        <option value="house">{t('tools.cleaningService.house', 'House')}</option>
                        <option value="apartment">{t('tools.cleaningService.apartment', 'Apartment')}</option>
                        <option value="condo">{t('tools.cleaningService.condo', 'Condo')}</option>
                        <option value="office">{t('tools.cleaningService.office', 'Office')}</option>
                        <option value="commercial">{t('tools.cleaningService.commercial', 'Commercial')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.size', 'Size')}</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={propertyForm.size || ''}
                          onChange={(e) => setPropertyForm({ ...propertyForm, size: parseFloat(e.target.value) })}
                          className={inputStyle}
                          placeholder="1500"
                        />
                        <select
                          value={propertyForm.sizeUnit || 'sqft'}
                          onChange={(e) => setPropertyForm({ ...propertyForm, sizeUnit: e.target.value as 'sqft' | 'sqm' })}
                          className={`${inputStyle} w-24`}
                        >
                          <option value="sqft">sqft</option>
                          <option value="sqm">sqm</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.bedrooms', 'Bedrooms')}</label>
                      <input
                        type="number"
                        value={propertyForm.bedrooms || ''}
                        onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: parseInt(e.target.value) })}
                        className={inputStyle}
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.bathrooms', 'Bathrooms')}</label>
                      <input
                        type="number"
                        value={propertyForm.bathrooms || ''}
                        onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: parseInt(e.target.value) })}
                        className={inputStyle}
                        placeholder="2"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className={labelStyle}>{t('tools.cleaningService.specialAreas', 'Special Areas')}</label>
                      <div className="flex flex-wrap gap-2">
                        {specialAreaOptions.map(area => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => {
                              const current = propertyForm.specialAreas || [];
                              const updated = current.includes(area)
                                ? current.filter(a => a !== area)
                                : [...current, area];
                              setPropertyForm({ ...propertyForm, specialAreas: updated });
                            }}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              (propertyForm.specialAreas || []).includes(area)
                                ? 'bg-[#0D9488] text-white'
                                : isDark
                                  ? 'bg-gray-600 text-gray-300'
                                  : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className={labelStyle}>{t('tools.cleaningService.notes2', 'Notes')}</label>
                      <textarea
                        value={propertyForm.notes || ''}
                        onChange={(e) => setPropertyForm({ ...propertyForm, notes: e.target.value })}
                        className={`${inputStyle} min-h-[80px]`}
                        placeholder={t('tools.cleaningService.specialInstructionsPetInfoEtc', 'Special instructions, pet info, etc.')}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveProperty} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.cleaningService.saveProperty', 'Save Property')}
                    </button>
                    <button onClick={resetForms} className={buttonSecondary}>
                      {t('tools.cleaningService.cancel2', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <Home className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.noPropertiesFoundAddA', 'No properties found. Add a property for your clients.')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {properties.map(property => {
                    const client = clients.find(c => c.id === property.clientId);
                    const estimatedPrice = calculatePrice(property);
                    const completedTasks = property.cleaningChecklist.filter(t => t.completed).length;
                    const totalTasks = property.cleaningChecklist.length;

                    return (
                      <div
                        key={property.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {property.name}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {client?.name || 'Unknown Client'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setPropertyForm(property);
                                setEditingId(property.id);
                                setShowForm(true);
                              }}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(property.id)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Building className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ruler className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {property.size} {property.sizeUnit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Home className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {property.bedrooms} bed, {property.bathrooms} bath
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className="text-[#0D9488] font-medium">
                              ${estimatedPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {property.specialAreas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {property.specialAreas.map(area => (
                              <span
                                key={area}
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Checklist Preview */}
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('tools.cleaningService.cleaningChecklist', 'Cleaning Checklist')}
                            </span>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {completedTasks}/{totalTasks}
                            </span>
                          </div>
                          <div className="w-full bg-gray-300 dark:bg-gray-500 rounded-full h-2">
                            <div
                              className="bg-[#0D9488] h-2 rounded-full transition-all"
                              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                            />
                          </div>
                          <button
                            onClick={() => setExpandedId(expandedId === property.id ? null : property.id)}
                            className={`mt-2 text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                          >
                            {expandedId === property.id ? t('tools.cleaningService.hideChecklist', 'Hide checklist') : t('tools.cleaningService.viewChecklist', 'View checklist')}
                          </button>
                        </div>

                        {expandedId === property.id && (
                          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                            {property.cleaningChecklist.map(item => (
                              <label
                                key={item.id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={(e) => handleUpdateChecklist(property.id, item.id, e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                                />
                                <span className={`text-sm ${
                                  item.completed
                                    ? isDark ? 'text-gray-500 line-through' : 'text-gray-400 line-through'
                                    : isDark ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {item.task}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'
                                }`}>
                                  {item.category}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="p-6">
              {showForm && (
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingId ? t('tools.cleaningService.editService', 'Edit Service') : t('tools.cleaningService.scheduleNewService', 'Schedule New Service')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.client2', 'Client *')}</label>
                      <select
                        value={serviceForm.clientId || ''}
                        onChange={(e) => {
                          setServiceForm({ ...serviceForm, clientId: e.target.value, propertyId: '' });
                        }}
                        className={inputStyle}
                      >
                        <option value="">{t('tools.cleaningService.selectClient2', 'Select client')}</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.property', 'Property *')}</label>
                      <select
                        value={serviceForm.propertyId || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, propertyId: e.target.value })}
                        className={inputStyle}
                        disabled={!serviceForm.clientId}
                      >
                        <option value="">{t('tools.cleaningService.selectProperty', 'Select property')}</option>
                        {properties
                          .filter(p => p.clientId === serviceForm.clientId)
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.serviceType', 'Service Type')}</label>
                      <select
                        value={serviceForm.type || 'one-time'}
                        onChange={(e) => setServiceForm({ ...serviceForm, type: e.target.value as Service['type'] })}
                        className={inputStyle}
                      >
                        <option value="one-time">{t('tools.cleaningService.oneTime', 'One-time')}</option>
                        <option value="weekly">{t('tools.cleaningService.weekly', 'Weekly')}</option>
                        <option value="bi-weekly">{t('tools.cleaningService.biWeekly', 'Bi-weekly')}</option>
                        <option value="monthly">{t('tools.cleaningService.monthly', 'Monthly')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.date', 'Date *')}</label>
                      <input
                        type="date"
                        value={serviceForm.scheduledDate || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, scheduledDate: e.target.value })}
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.time', 'Time')}</label>
                      <input
                        type="time"
                        value={serviceForm.scheduledTime || '09:00'}
                        onChange={(e) => setServiceForm({ ...serviceForm, scheduledTime: e.target.value })}
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.assignedTeam', 'Assigned Team')}</label>
                      <select
                        multiple
                        value={serviceForm.assignedTeam || []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setServiceForm({ ...serviceForm, assignedTeam: selected });
                        }}
                        className={`${inputStyle} min-h-[80px]`}
                      >
                        {team.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className={labelStyle}>{t('tools.cleaningService.specialRequests', 'Special Requests')}</label>
                      <textarea
                        value={serviceForm.specialRequests || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, specialRequests: e.target.value })}
                        className={`${inputStyle} min-h-[80px]`}
                        placeholder={t('tools.cleaningService.anySpecialRequestsOrInstructions', 'Any special requests or instructions...')}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveService} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.cleaningService.scheduleService', 'Schedule Service')}
                    </button>
                    <button onClick={resetForms} className={buttonSecondary}>
                      {t('tools.cleaningService.cancel3', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {services.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.noServicesScheduledScheduleYour', 'No services scheduled. Schedule your first cleaning job.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map(service => {
                    const client = clients.find(c => c.id === service.clientId);
                    const property = properties.find(p => p.id === service.propertyId);
                    const assignedMembers = team.filter(t => service.assignedTeam.includes(t.id));
                    const isActive = activeTimer === service.id;

                    return (
                      <div
                        key={service.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} ${
                          isActive ? 'ring-2 ring-[#0D9488]' : ''
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {client?.name || 'Unknown Client'}
                              </h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                service.status === 'completed' ? 'bg-green-500 text-white' :
                                service.status === 'in-progress' ? 'bg-blue-500 text-white' :
                                service.status === 'cancelled' ? 'bg-red-500 text-white' :
                                'bg-yellow-500 text-white'
                              }`}>
                                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Home className="w-4 h-4" />
                                {property?.name || 'Unknown Property'}
                              </span>
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Calendar className="w-4 h-4" />
                                {formatDate(service.scheduledDate)}
                              </span>
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Clock className="w-4 h-4" />
                                {formatTime(service.scheduledTime)}
                              </span>
                              {assignedMembers.length > 0 && (
                                <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <Users className="w-4 h-4" />
                                  {assignedMembers.map(m => m.name).join(', ')}
                                </span>
                              )}
                            </div>
                            {service.specialRequests && (
                              <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className="font-medium">{t('tools.cleaningService.notes3', 'Notes:')}</span> {service.specialRequests}
                              </p>
                            )}
                            {service.actualDuration && (
                              <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className="font-medium">{t('tools.cleaningService.duration', 'Duration:')}</span> {service.actualDuration} minutes
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {service.status === 'scheduled' && (
                              <button
                                onClick={() => handleStartTimer(service.id)}
                                className={buttonPrimary}
                              >
                                <Timer className="w-4 h-4" />
                                {t('tools.cleaningService.start', 'Start')}
                              </button>
                            )}
                            {isActive && (
                              <div className="flex items-center gap-3">
                                <span className={`text-xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {formatElapsedTime(elapsedTime)}
                                </span>
                                <button
                                  onClick={() => handleStopTimer(service.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                                >
                                  <Timer className="w-4 h-4" />
                                  {t('tools.cleaningService.stop', 'Stop')}
                                </button>
                              </div>
                            )}
                            {service.status === 'completed' && !invoices.find(i => i.serviceId === service.id) && (
                              <button
                                onClick={() => handleGenerateInvoice(service)}
                                className={buttonSecondary}
                              >
                                <FileText className="w-4 h-4" />
                                {t('tools.cleaningService.generateInvoice', 'Generate Invoice')}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setServiceForm(service);
                                setEditingId(service.id);
                                setShowForm(true);
                              }}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
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

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="p-6">
              {showForm && (
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingId ? t('tools.cleaningService.editTeamMember', 'Edit Team Member') : t('tools.cleaningService.addTeamMember', 'Add Team Member')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.name2', 'Name *')}</label>
                      <input
                        type="text"
                        value={teamForm.name || ''}
                        onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                        className={inputStyle}
                        placeholder={t('tools.cleaningService.fullName', 'Full name')}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.email2', 'Email *')}</label>
                      <input
                        type="email"
                        value={teamForm.email || ''}
                        onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })}
                        className={inputStyle}
                        placeholder={t('tools.cleaningService.teamEmailCom', 'team@email.com')}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.phone2', 'Phone')}</label>
                      <input
                        type="tel"
                        value={teamForm.phone || ''}
                        onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                        className={inputStyle}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.role', 'Role')}</label>
                      <select
                        value={teamForm.role || 'cleaner'}
                        onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value as TeamMember['role'] })}
                        className={inputStyle}
                      >
                        <option value="cleaner">{t('tools.cleaningService.cleaner', 'Cleaner')}</option>
                        <option value="supervisor">{t('tools.cleaningService.supervisor', 'Supervisor')}</option>
                        <option value="manager">{t('tools.cleaningService.manager', 'Manager')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveTeamMember} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.cleaningService.saveTeamMember', 'Save Team Member')}
                    </button>
                    <button onClick={resetForms} className={buttonSecondary}>
                      {t('tools.cleaningService.cancel4', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {team.length === 0 ? (
                <div className="text-center py-12">
                  <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.noTeamMembersYetAdd', 'No team members yet. Add your first team member.')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.map(member => (
                    <div
                      key={member.id}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {member.name}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            member.role === 'manager' ? 'bg-purple-500 text-white' :
                            member.role === 'supervisor' ? 'bg-blue-500 text-white' :
                            'bg-green-500 text-white'
                          }`}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setTeamForm(member);
                              setEditingId(member.id);
                              setShowForm(true);
                            }}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeamMember(member.id)}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Phone className="w-4 h-4" />
                            {member.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= member.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Supplies Tab */}
          {activeTab === 'supplies' && (
            <div className="p-6">
              {showForm && (
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingId ? t('tools.cleaningService.editSupplyItem', 'Edit Supply Item') : t('tools.cleaningService.addSupplyItem', 'Add Supply Item')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.itemName', 'Item Name *')}</label>
                      <input
                        type="text"
                        value={supplyForm.name || ''}
                        onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })}
                        className={inputStyle}
                        placeholder={t('tools.cleaningService.cleaningSprayMopEtc', 'Cleaning spray, mop, etc.')}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.category', 'Category')}</label>
                      <select
                        value={supplyForm.category || 'General'}
                        onChange={(e) => setSupplyForm({ ...supplyForm, category: e.target.value })}
                        className={inputStyle}
                      >
                        <option value="General">{t('tools.cleaningService.general', 'General')}</option>
                        <option value="Cleaning Solutions">{t('tools.cleaningService.cleaningSolutions', 'Cleaning Solutions')}</option>
                        <option value="Tools">{t('tools.cleaningService.tools', 'Tools')}</option>
                        <option value="Equipment">{t('tools.cleaningService.equipment', 'Equipment')}</option>
                        <option value="Safety">{t('tools.cleaningService.safety', 'Safety')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.quantity', 'Quantity')}</label>
                      <input
                        type="number"
                        value={supplyForm.quantity || ''}
                        onChange={(e) => setSupplyForm({ ...supplyForm, quantity: parseInt(e.target.value) })}
                        className={inputStyle}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.unit', 'Unit')}</label>
                      <input
                        type="text"
                        value={supplyForm.unit || ''}
                        onChange={(e) => setSupplyForm({ ...supplyForm, unit: e.target.value })}
                        className={inputStyle}
                        placeholder={t('tools.cleaningService.bottlesUnitsBoxes', 'bottles, units, boxes')}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.minimumStockLevel', 'Minimum Stock Level')}</label>
                      <input
                        type="number"
                        value={supplyForm.minStock || ''}
                        onChange={(e) => setSupplyForm({ ...supplyForm, minStock: parseInt(e.target.value) })}
                        className={inputStyle}
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveSupply} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.cleaningService.saveSupplyItem', 'Save Supply Item')}
                    </button>
                    <button onClick={resetForms} className={buttonSecondary}>
                      {t('tools.cleaningService.cancel5', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {supplies.length === 0 ? (
                <div className="text-center py-12">
                  <Package className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.noSupplyItemsTrackedAdd', 'No supply items tracked. Add your first item.')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`text-left ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <th className="px-4 py-3 font-medium">{t('tools.cleaningService.item', 'Item')}</th>
                        <th className="px-4 py-3 font-medium">{t('tools.cleaningService.category2', 'Category')}</th>
                        <th className="px-4 py-3 font-medium">{t('tools.cleaningService.quantity2', 'Quantity')}</th>
                        <th className="px-4 py-3 font-medium">{t('tools.cleaningService.status', 'Status')}</th>
                        <th className="px-4 py-3 font-medium">{t('tools.cleaningService.lastRestocked', 'Last Restocked')}</th>
                        <th className="px-4 py-3 font-medium">{t('tools.cleaningService.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {supplies.map(supply => {
                        const isLow = supply.quantity <= supply.minStock;
                        return (
                          <tr key={supply.id} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            <td className="px-4 py-3 font-medium">{supply.name}</td>
                            <td className="px-4 py-3">{supply.category}</td>
                            <td className="px-4 py-3">
                              {supply.quantity} {supply.unit}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                isLow ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                              }`}>
                                {isLow ? t('tools.cleaningService.lowStock2', 'Low Stock') : t('tools.cleaningService.inStock', 'In Stock')}
                              </span>
                            </td>
                            <td className="px-4 py-3">{formatDate(supply.lastRestocked)}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSupplyForm(supply);
                                    setEditingId(supply.id);
                                    setShowForm(true);
                                  }}
                                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                >
                                  <Edit2 className="w-4 h-4 text-blue-500" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSupply(supply.id)}
                                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
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
                </div>
              )}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.cleaningService.pricingConfiguration', 'Pricing Configuration')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className={labelStyle}>{t('tools.cleaningService.baseRate', 'Base Rate ($)')}</label>
                  <input
                    type="number"
                    value={pricing.baseRate}
                    onChange={(e) => setPricing({ ...pricing, baseRate: parseFloat(e.target.value) })}
                    className={inputStyle}
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.startingPriceForAnyCleaning', 'Starting price for any cleaning job')}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className={labelStyle}>{t('tools.cleaningService.perRoomRate', 'Per Room Rate ($)')}</label>
                  <input
                    type="number"
                    value={pricing.perRoom}
                    onChange={(e) => setPricing({ ...pricing, perRoom: parseFloat(e.target.value) })}
                    className={inputStyle}
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.additionalCostPerBedroomBathroom', 'Additional cost per bedroom/bathroom')}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className={labelStyle}>{t('tools.cleaningService.perSqftRate', 'Per Sqft Rate ($)')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricing.perSqft}
                    onChange={(e) => setPricing({ ...pricing, perSqft: parseFloat(e.target.value) })}
                    className={inputStyle}
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.costPerSquareFoot', 'Cost per square foot')}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className={labelStyle}>{t('tools.cleaningService.hourlyRate', 'Hourly Rate ($)')}</label>
                  <input
                    type="number"
                    value={pricing.hourlyRate}
                    onChange={(e) => setPricing({ ...pricing, hourlyRate: parseFloat(e.target.value) })}
                    className={inputStyle}
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.forTimeBasedBilling', 'For time-based billing')}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className={labelStyle}>{t('tools.cleaningService.deepCleanMultiplier', 'Deep Clean Multiplier')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pricing.deepCleanMultiplier}
                    onChange={(e) => setPricing({ ...pricing, deepCleanMultiplier: parseFloat(e.target.value) })}
                    className={inputStyle}
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.priceMultiplierForDeepCleaning', 'Price multiplier for deep cleaning')}
                  </p>
                </div>
              </div>

              <h4 className={`text-md font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.cleaningService.specialAreaRates', 'Special Area Rates')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {Object.entries(pricing.specialAreaRates).map(([area, rate]) => (
                  <div key={area} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </label>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>$</span>
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) => setPricing({
                          ...pricing,
                          specialAreaRates: {
                            ...pricing.specialAreaRates,
                            [area]: parseFloat(e.target.value),
                          },
                        })}
                        className={`${inputStyle} text-sm`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculator */}
              {properties.length > 0 && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-md font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.cleaningService.priceEstimatesByProperty', 'Price Estimates by Property')}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`text-left ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <th className="px-4 py-2 font-medium">{t('tools.cleaningService.property2', 'Property')}</th>
                          <th className="px-4 py-2 font-medium">{t('tools.cleaningService.client3', 'Client')}</th>
                          <th className="px-4 py-2 font-medium">{t('tools.cleaningService.standardClean', 'Standard Clean')}</th>
                          <th className="px-4 py-2 font-medium">{t('tools.cleaningService.deepClean', 'Deep Clean')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600">
                        {properties.map(property => {
                          const client = clients.find(c => c.id === property.clientId);
                          const standardPrice = calculatePrice(property, false);
                          const deepPrice = calculatePrice(property, true);
                          return (
                            <tr key={property.id} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                              <td className="px-4 py-2 font-medium">{property.name}</td>
                              <td className="px-4 py-2">{client?.name || 'Unknown'}</td>
                              <td className="px-4 py-2 text-[#0D9488] font-semibold">${standardPrice.toFixed(2)}</td>
                              <td className="px-4 py-2 text-[#0D9488] font-semibold">${deepPrice.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="p-6">
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.noInvoicesYetCompleteServices', 'No invoices yet. Complete services to generate invoices.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map(invoice => {
                    const client = clients.find(c => c.id === invoice.clientId);
                    return (
                      <div
                        key={invoice.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Invoice #{invoice.id.slice(0, 6).toUpperCase()}
                              </h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                invoice.status === 'paid' ? 'bg-green-500 text-white' :
                                invoice.status === 'sent' ? 'bg-blue-500 text-white' :
                                invoice.status === 'overdue' ? 'bg-red-500 text-white' :
                                'bg-gray-500 text-white'
                              }`}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                Client: {client?.name || 'Unknown'}
                              </span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                Date: {formatDate(invoice.date)}
                              </span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                Due: {formatDate(invoice.dueDate)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningService.total', 'Total')}</p>
                              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ${invoice.total.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {invoice.status === 'draft' && (
                                <button
                                  onClick={() => handleUpdateInvoiceStatus(invoice.id, 'sent')}
                                  className={buttonPrimary}
                                >
                                  {t('tools.cleaningService.send', 'Send')}
                                </button>
                              )}
                              {invoice.status === 'sent' && (
                                <button
                                  onClick={() => handleUpdateInvoiceStatus(invoice.id, 'paid')}
                                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                                >
                                  {t('tools.cleaningService.markPaid', 'Mark Paid')}
                                </button>
                              )}
                              <button className={buttonSecondary}>
                                <Printer className="w-4 h-4" />
                              </button>
                              <button className={buttonSecondary}>
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {expandedId === invoice.id && (
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                  <th className="text-left py-2">{t('tools.cleaningService.description', 'Description')}</th>
                                  <th className="text-right py-2">{t('tools.cleaningService.qty', 'Qty')}</th>
                                  <th className="text-right py-2">{t('tools.cleaningService.rate', 'Rate')}</th>
                                  <th className="text-right py-2">{t('tools.cleaningService.amount', 'Amount')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoice.items.map((item, idx) => (
                                  <tr key={idx} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                    <td className="py-2">{item.description}</td>
                                    <td className="text-right py-2">{item.quantity}</td>
                                    <td className="text-right py-2">${item.rate.toFixed(2)}</td>
                                    <td className="text-right py-2">${item.amount.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                <tr>
                                  <td colSpan={3} className="text-right py-2 font-medium">{t('tools.cleaningService.subtotal', 'Subtotal:')}</td>
                                  <td className="text-right py-2">${invoice.subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td colSpan={3} className="text-right py-2 font-medium">{t('tools.cleaningService.tax10', 'Tax (10%):')}</td>
                                  <td className="text-right py-2">${invoice.tax.toFixed(2)}</td>
                                </tr>
                                <tr className="font-bold">
                                  <td colSpan={3} className="text-right py-2">{t('tools.cleaningService.total2', 'Total:')}</td>
                                  <td className="text-right py-2">${invoice.total.toFixed(2)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}

                        <button
                          onClick={() => setExpandedId(expandedId === invoice.id ? null : invoice.id)}
                          className={`mt-3 text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                        >
                          {expandedId === invoice.id ? t('tools.cleaningService.hideDetails', 'Hide details') : t('tools.cleaningService.viewDetails', 'View details')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Revenue Summary */}
              {invoices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningService.totalRevenue', 'Total Revenue')}</p>
                    <p className="text-2xl font-bold text-green-500">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningService.pendingPayments', 'Pending Payments')}</p>
                    <p className="text-2xl font-bold text-yellow-500">${stats.pendingPayments.toFixed(2)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningService.totalInvoices', 'Total Invoices')}</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{invoices.length}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="p-6">
              {showForm && (
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.cleaningService.addClientFeedback', 'Add Client Feedback')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.client4', 'Client *')}</label>
                      <select
                        value={feedbackForm.clientId || ''}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, clientId: e.target.value })}
                        className={inputStyle}
                      >
                        <option value="">{t('tools.cleaningService.selectClient3', 'Select client')}</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.service', 'Service')}</label>
                      <select
                        value={feedbackForm.serviceId || ''}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, serviceId: e.target.value })}
                        className={inputStyle}
                      >
                        <option value="">{t('tools.cleaningService.selectService', 'Select service')}</option>
                        {services
                          .filter(s => s.clientId === feedbackForm.clientId && s.status === 'completed')
                          .map(s => {
                            const property = properties.find(p => p.id === s.propertyId);
                            return (
                              <option key={s.id} value={s.id}>
                                {property?.name} - {formatDate(s.scheduledDate)}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>{t('tools.cleaningService.rating', 'Rating *')}</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                            className="p-1"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= (feedbackForm.rating || 0)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : isDark ? 'text-gray-600' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelStyle}>{t('tools.cleaningService.comment', 'Comment')}</label>
                      <textarea
                        value={feedbackForm.comment || ''}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                        className={`${inputStyle} min-h-[100px]`}
                        placeholder={t('tools.cleaningService.clientFeedback', 'Client feedback...')}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveFeedback} className={buttonPrimary}>
                      <Save className="w-4 h-4" />
                      {t('tools.cleaningService.saveFeedback', 'Save Feedback')}
                    </button>
                    <button onClick={resetForms} className={buttonSecondary}>
                      {t('tools.cleaningService.cancel6', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {feedback.length === 0 ? (
                <div className="text-center py-12">
                  <Star className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.cleaningService.noFeedbackYetCollectFeedback', 'No feedback yet. Collect feedback from your clients.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map(fb => {
                    const client = clients.find(c => c.id === fb.clientId);
                    const service = services.find(s => s.id === fb.serviceId);
                    const property = service ? properties.find(p => p.id === service.propertyId) : null;

                    return (
                      <div
                        key={fb.id}
                        className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {client?.name || 'Unknown Client'}
                              </h3>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {property && (
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {property.name} - {formatDate(fb.date)}
                              </p>
                            )}
                            {fb.comment && (
                              <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                "{fb.comment}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Feedback Summary */}
              {feedback.length > 0 && (
                <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-md font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.cleaningService.ratingDistribution', 'Rating Distribution')}
                  </h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = feedback.filter(f => f.rating === rating).length;
                      const percentage = (count / feedback.length) * 100;
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-20">
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{rating}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className={`text-sm w-12 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.cleaningService.aboutCleaningServiceManager', 'About Cleaning Service Manager')}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            A comprehensive tool for managing your cleaning service business. Track clients and their properties,
            schedule recurring and one-time cleaning jobs, assign team members, manage inventory, generate invoices,
            and collect client feedback. All data is stored locally in your browser for privacy and offline access.
          </p>
        </div>
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default CleaningServiceTool;
