'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Search,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  CloudRain,
  Truck,
  Shield,
  FileText,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HardHat,
  Wrench,
  Package,
  ClipboardList,
  BarChart3,
  Sun,
  Cloud,
  CloudSnow,
  Wind,
  Loader2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface JobSiteManagerToolProps {
  uiConfig?: UIConfig;
}

// Types
interface JobSite {
  id: string;
  name: string;
  address: string;
  client: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  description: string;
  contactPerson: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

interface DailyLog {
  id: string;
  siteId: string;
  date: string;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  temperature: number;
  workersPresent: number;
  activities: string;
  notes: string;
  delays: string;
  createdAt: string;
}

interface Equipment {
  id: string;
  siteId: string;
  name: string;
  type: string;
  status: 'in-use' | 'available' | 'maintenance' | 'rented';
  lastInspection: string;
  nextInspection: string;
  assignedTo: string;
  notes: string;
}

interface SafetyIncident {
  id: string;
  siteId: string;
  date: string;
  type: 'injury' | 'near-miss' | 'property-damage' | 'environmental' | 'other';
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  personInvolved: string;
  actionTaken: string;
  reportedBy: string;
  resolved: boolean;
  createdAt: string;
}

interface MaterialDelivery {
  id: string;
  siteId: string;
  date: string;
  supplier: string;
  materials: string;
  quantity: string;
  status: 'scheduled' | 'delivered' | 'partial' | 'cancelled';
  receivedBy: string;
  notes: string;
  cost: number;
}

type TabType = 'sites' | 'daily-logs' | 'equipment' | 'safety' | 'reports';

// Constants
const SITE_STATUSES: { value: JobSite['status']; label: string; color: string }[] = [
  { value: 'planning', label: 'Planning', color: '#8B5CF6' },
  { value: 'active', label: 'Active', color: '#10B981' },
  { value: 'on-hold', label: 'On Hold', color: '#F59E0B' },
  { value: 'completed', label: 'Completed', color: '#6B7280' },
];

const WEATHER_OPTIONS: { value: DailyLog['weather']; label: string; icon: React.ElementType }[] = [
  { value: 'sunny', label: 'Sunny', icon: Sun },
  { value: 'cloudy', label: 'Cloudy', icon: Cloud },
  { value: 'rainy', label: 'Rainy', icon: CloudRain },
  { value: 'snowy', label: 'Snowy', icon: CloudSnow },
  { value: 'windy', label: 'Windy', icon: Wind },
];

const EQUIPMENT_TYPES = [
  'Excavator',
  'Bulldozer',
  'Crane',
  'Concrete Mixer',
  'Scaffolding',
  'Generator',
  'Compressor',
  'Forklift',
  'Dump Truck',
  'Backhoe',
  'Skid Steer',
  'Power Tools',
  'Safety Equipment',
  'Other',
];

const INCIDENT_TYPES: { value: SafetyIncident['type']; label: string }[] = [
  { value: 'injury', label: 'Injury' },
  { value: 'near-miss', label: 'Near Miss' },
  { value: 'property-damage', label: 'Property Damage' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_LEVELS: { value: SafetyIncident['severity']; label: string; color: string }[] = [
  { value: 'minor', label: 'Minor', color: '#10B981' },
  { value: 'moderate', label: 'Moderate', color: '#F59E0B' },
  { value: 'serious', label: 'Serious', color: '#EF4444' },
  { value: 'critical', label: 'Critical', color: '#7F1D1D' },
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Site Name', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'client', header: 'Client', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'budget', header: 'Budget', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'contactPerson', header: 'Contact Person', type: 'string' },
  { key: 'contactPhone', header: 'Contact Phone', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

// Composite data structure for storing all job site data
interface JobSiteData {
  id: string;
  sites: JobSite[];
  dailyLogs: DailyLog[];
  equipment: Equipment[];
  incidents: SafetyIncident[];
  deliveries: MaterialDelivery[];
}

// Create the composite data wrapper
const createDataWrapper = (
  sites: JobSite[],
  dailyLogs: DailyLog[],
  equipment: Equipment[],
  incidents: SafetyIncident[],
  deliveries: MaterialDelivery[]
): JobSiteData => ({
  id: 'jobsite-data',
  sites,
  dailyLogs,
  equipment,
  incidents,
  deliveries,
});

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Sample data generator
const generateSampleData = () => {
  const sites: JobSite[] = [
    {
      id: generateId(),
      name: 'Downtown Office Complex',
      address: '123 Main Street, Downtown',
      client: 'ABC Corporation',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      budget: 2500000,
      status: 'active',
      description: 'New 10-story office building construction',
      contactPerson: 'John Smith',
      contactPhone: '(555) 123-4567',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Riverside Apartments',
      address: '456 River Road, Riverside',
      client: 'Riverside Development LLC',
      startDate: '2024-03-01',
      endDate: '2025-06-30',
      budget: 4500000,
      status: 'planning',
      description: 'Multi-family residential complex with 50 units',
      contactPerson: 'Sarah Johnson',
      contactPhone: '(555) 987-6543',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const dailyLogs: DailyLog[] = [
    {
      id: generateId(),
      siteId: sites[0].id,
      date: new Date().toISOString().split('T')[0],
      weather: 'sunny',
      temperature: 72,
      workersPresent: 25,
      activities: 'Continued foundation work on the east wing. Poured concrete for footings.',
      notes: 'Inspection scheduled for tomorrow at 9 AM.',
      delays: '',
      createdAt: new Date().toISOString(),
    },
  ];

  const equipment: Equipment[] = [
    {
      id: generateId(),
      siteId: sites[0].id,
      name: 'CAT 320 Excavator',
      type: 'Excavator',
      status: 'in-use',
      lastInspection: '2024-01-01',
      nextInspection: '2024-04-01',
      assignedTo: 'Mike Rodriguez',
      notes: 'Rented from ABC Equipment',
    },
  ];

  const incidents: SafetyIncident[] = [];

  const deliveries: MaterialDelivery[] = [
    {
      id: generateId(),
      siteId: sites[0].id,
      date: new Date().toISOString().split('T')[0],
      supplier: 'Acme Building Supplies',
      materials: 'Concrete, Rebar, Forms',
      quantity: '50 cubic yards concrete, 200 pieces rebar',
      status: 'delivered',
      receivedBy: 'Tom Wilson',
      notes: '',
      cost: 15000,
    },
  ];

  return { sites, dailyLogs, equipment, incidents, deliveries };
};

export const JobSiteManagerTool = ({ uiConfig }: JobSiteManagerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use the useToolData hook for backend persistence
  const {
    data: toolData,
    setData: setToolData,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<JobSiteData>('jobsite-manager', [createDataWrapper([], [], [], [], [])], COLUMNS);

  // Extract data from the composite structure
  const currentData = toolData[0] || createDataWrapper([], [], [], [], []);
  const sites = currentData.sites || [];
  const dailyLogs = currentData.dailyLogs || [];
  const equipment = currentData.equipment || [];
  const incidents = currentData.incidents || [];
  const deliveries = currentData.deliveries || [];

  // Helper to update the composite data
  const updateData = (updates: Partial<Omit<JobSiteData, 'id'>>) => {
    setToolData([{
      ...currentData,
      ...updates,
    }]);
  };

  // Setters for each data type
  const setSites = (newSites: JobSite[] | ((prev: JobSite[]) => JobSite[])) => {
    const updatedSites = typeof newSites === 'function' ? newSites(sites) : newSites;
    updateData({ sites: updatedSites });
  };

  const setDailyLogs = (newLogs: DailyLog[] | ((prev: DailyLog[]) => DailyLog[])) => {
    const updatedLogs = typeof newLogs === 'function' ? newLogs(dailyLogs) : newLogs;
    updateData({ dailyLogs: updatedLogs });
  };

  const setEquipment = (newEquipment: Equipment[] | ((prev: Equipment[]) => Equipment[])) => {
    const updatedEquipment = typeof newEquipment === 'function' ? newEquipment(equipment) : newEquipment;
    updateData({ equipment: updatedEquipment });
  };

  const setIncidents = (newIncidents: SafetyIncident[] | ((prev: SafetyIncident[]) => SafetyIncident[])) => {
    const updatedIncidents = typeof newIncidents === 'function' ? newIncidents(incidents) : newIncidents;
    updateData({ incidents: updatedIncidents });
  };

  const setDeliveries = (newDeliveries: MaterialDelivery[] | ((prev: MaterialDelivery[]) => MaterialDelivery[])) => {
    const updatedDeliveries = typeof newDeliveries === 'function' ? newDeliveries(deliveries) : newDeliveries;
    updateData({ deliveries: updatedDeliveries });
  };

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('sites');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobSite['status'] | 'all'>('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  // Form state
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Site form
  const [siteForm, setSiteForm] = useState<Omit<JobSite, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    address: '',
    client: '',
    startDate: '',
    endDate: '',
    budget: 0,
    status: 'planning',
    description: '',
    contactPerson: '',
    contactPhone: '',
  });

  // Daily log form
  const [logForm, setLogForm] = useState<Omit<DailyLog, 'id' | 'createdAt'>>({
    siteId: '',
    date: new Date().toISOString().split('T')[0],
    weather: 'sunny',
    temperature: 70,
    workersPresent: 0,
    activities: '',
    notes: '',
    delays: '',
  });

  // Equipment form
  const [equipmentForm, setEquipmentForm] = useState<Omit<Equipment, 'id'>>({
    siteId: '',
    name: '',
    type: 'Excavator',
    status: 'available',
    lastInspection: '',
    nextInspection: '',
    assignedTo: '',
    notes: '',
  });

  // Incident form
  const [incidentForm, setIncidentForm] = useState<Omit<SafetyIncident, 'id' | 'createdAt'>>({
    siteId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'near-miss',
    severity: 'minor',
    description: '',
    personInvolved: '',
    actionTaken: '',
    reportedBy: '',
    resolved: false,
  });

  // Delivery form
  const [deliveryForm, setDeliveryForm] = useState<Omit<MaterialDelivery, 'id'>>({
    siteId: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    materials: '',
    quantity: '',
    status: 'scheduled',
    receivedBy: '',
    notes: '',
    cost: 0,
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.projectName || params.title || params.client || params.address) {
        setSiteForm({
          ...siteForm,
          name: params.projectName || params.title || '',
          address: params.address || params.location || '',
          client: params.client || '',
          description: params.description || '',
        });
        setShowSiteForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Generate sample data
  const handleGenerateSampleData = async () => {
    const confirmed = await confirm({
      title: 'Add Sample Data',
      message: 'This will add sample data. Continue?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'default',
    });
    if (confirmed) {
      const sample = generateSampleData();
      setSites([...sites, ...sample.sites]);
      setDailyLogs([...dailyLogs, ...sample.dailyLogs]);
      setEquipment([...equipment, ...sample.equipment]);
      setIncidents([...incidents, ...sample.incidents]);
      setDeliveries([...deliveries, ...sample.deliveries]);
    }
  };

  // Filter sites
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchesSearch =
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
      const matchesDateRange =
        (!dateRangeStart || site.startDate >= dateRangeStart) &&
        (!dateRangeEnd || site.endDate <= dateRangeEnd);
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [sites, searchTerm, statusFilter, dateRangeStart, dateRangeEnd]);

  // Get data for selected site
  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const siteLogs = dailyLogs.filter((l) => l.siteId === selectedSiteId);
  const siteEquipment = equipment.filter((e) => e.siteId === selectedSiteId);
  const siteIncidents = incidents.filter((i) => i.siteId === selectedSiteId);
  const siteDeliveries = deliveries.filter((d) => d.siteId === selectedSiteId);

  // Statistics
  const stats = useMemo(() => {
    const activeSites = sites.filter((s) => s.status === 'active').length;
    const totalBudget = sites.reduce((sum, s) => sum + s.budget, 0);
    const totalIncidents = incidents.length;
    const unresolvedIncidents = incidents.filter((i) => !i.resolved).length;
    const totalDeliveryCost = deliveries.reduce((sum, d) => sum + d.cost, 0);

    return { activeSites, totalBudget, totalIncidents, unresolvedIncidents, totalDeliveryCost };
  }, [sites, incidents, deliveries]);

  // Site handlers
  const handleSaveSite = () => {
    if (!siteForm.name || !siteForm.address) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingItem) {
      setSites(
        sites.map((s) =>
          s.id === editingItem.id
            ? { ...s, ...siteForm, updatedAt: new Date().toISOString() }
            : s
        )
      );
    } else {
      const newSite: JobSite = {
        ...siteForm,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSites([...sites, newSite]);
    }

    resetSiteForm();
  };

  const resetSiteForm = () => {
    setSiteForm({
      name: '',
      address: '',
      client: '',
      startDate: '',
      endDate: '',
      budget: 0,
      status: 'planning',
      description: '',
      contactPerson: '',
      contactPhone: '',
    });
    setShowSiteForm(false);
    setEditingItem(null);
  };

  const handleDeleteSite = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Site',
      message: 'Delete this site and all associated data?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setSites(sites.filter((s) => s.id !== id));
      setDailyLogs(dailyLogs.filter((l) => l.siteId !== id));
      setEquipment(equipment.filter((e) => e.siteId !== id));
      setIncidents(incidents.filter((i) => i.siteId !== id));
      setDeliveries(deliveries.filter((d) => d.siteId !== id));
      if (selectedSiteId === id) setSelectedSiteId(null);
    }
  };

  // Daily log handlers
  const handleSaveLog = () => {
    if (!logForm.siteId || !logForm.date) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingItem) {
      setDailyLogs(dailyLogs.map((l) => (l.id === editingItem.id ? { ...l, ...logForm } : l)));
    } else {
      const newLog: DailyLog = {
        ...logForm,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setDailyLogs([newLog, ...dailyLogs]);
    }

    resetLogForm();
  };

  const resetLogForm = () => {
    setLogForm({
      siteId: selectedSiteId || '',
      date: new Date().toISOString().split('T')[0],
      weather: 'sunny',
      temperature: 70,
      workersPresent: 0,
      activities: '',
      notes: '',
      delays: '',
    });
    setShowLogForm(false);
    setEditingItem(null);
  };

  // Equipment handlers
  const handleSaveEquipment = () => {
    if (!equipmentForm.siteId || !equipmentForm.name) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingItem) {
      setEquipment(equipment.map((e) => (e.id === editingItem.id ? { ...e, ...equipmentForm } : e)));
    } else {
      const newEquipment: Equipment = {
        ...equipmentForm,
        id: generateId(),
      };
      setEquipment([...equipment, newEquipment]);
    }

    resetEquipmentForm();
  };

  const resetEquipmentForm = () => {
    setEquipmentForm({
      siteId: selectedSiteId || '',
      name: '',
      type: 'Excavator',
      status: 'available',
      lastInspection: '',
      nextInspection: '',
      assignedTo: '',
      notes: '',
    });
    setShowEquipmentForm(false);
    setEditingItem(null);
  };

  // Incident handlers
  const handleSaveIncident = () => {
    if (!incidentForm.siteId || !incidentForm.date || !incidentForm.description) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingItem) {
      setIncidents(incidents.map((i) => (i.id === editingItem.id ? { ...i, ...incidentForm } : i)));
    } else {
      const newIncident: SafetyIncident = {
        ...incidentForm,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setIncidents([newIncident, ...incidents]);
    }

    resetIncidentForm();
  };

  const resetIncidentForm = () => {
    setIncidentForm({
      siteId: selectedSiteId || '',
      date: new Date().toISOString().split('T')[0],
      type: 'near-miss',
      severity: 'minor',
      description: '',
      personInvolved: '',
      actionTaken: '',
      reportedBy: '',
      resolved: false,
    });
    setShowIncidentForm(false);
    setEditingItem(null);
  };

  // Delivery handlers
  const handleSaveDelivery = () => {
    if (!deliveryForm.siteId || !deliveryForm.date || !deliveryForm.supplier) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingItem) {
      setDeliveries(deliveries.map((d) => (d.id === editingItem.id ? { ...d, ...deliveryForm } : d)));
    } else {
      const newDelivery: MaterialDelivery = {
        ...deliveryForm,
        id: generateId(),
      };
      setDeliveries([newDelivery, ...deliveries]);
    }

    resetDeliveryForm();
  };

  const resetDeliveryForm = () => {
    setDeliveryForm({
      siteId: selectedSiteId || '',
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      materials: '',
      quantity: '',
      status: 'scheduled',
      receivedBy: '',
      notes: '',
      cost: 0,
    });
    setShowDeliveryForm(false);
    setEditingItem(null);
  };

  // Prepare export data (transform to flat site structure for exports)
  const exportableSites = useMemo(() => filteredSites, [filteredSites]);

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const selectClass = `px-3 py-2 rounded-lg border ${
    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const getStatusColor = (status: JobSite['status']) => {
    return SITE_STATUSES.find((s) => s.value === status)?.color || '#6B7280';
  };

  const getStatusIcon = (status: JobSite['status']) => {
    switch (status) {
      case 'active':
        return Play;
      case 'planning':
        return Clock;
      case 'on-hold':
        return Pause;
      case 'completed':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const WeatherIcon = ({ weather }: { weather: DailyLog['weather'] }) => {
    const option = WEATHER_OPTIONS.find((w) => w.value === weather);
    const Icon = option?.icon || Sun;
    return <Icon className="w-4 h-4" />;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.jobSiteManager.loadingJobSites', 'Loading job sites...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.jobSiteManager.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <HardHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {t('tools.jobSiteManager.jobSiteManager', 'Job Site Manager')}
                  </CardTitle>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.jobSiteManager.constructionSiteManagementAndTracking', 'Construction site management and tracking')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <WidgetEmbedButton toolSlug="job-site-manager" toolName="Job Site Manager" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  size="sm"
                />
                <button
                  onClick={handleGenerateSampleData}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.jobSiteManager.addSampleData', 'Add Sample Data')}
                </button>
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'job-sites' })}
                  onExportExcel={() => exportExcel({ filename: 'job-sites' })}
                  onExportJSON={() => exportJSON({ filename: 'job-sites' })}
                  onExportPDF={() => exportPDF({
                    filename: 'job-sites',
                    title: 'Job Site Report',
                    subtitle: `${filteredSites.length} sites | Generated from Job Site Manager`,
                  })}
                  onPrint={() => print('Job Site Report')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  disabled={filteredSites.length === 0}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Building2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jobSiteManager.activeSites', 'Active Sites')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activeSites}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jobSiteManager.totalBudget', 'Total Budget')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.totalBudget)}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jobSiteManager.openIncidents', 'Open Incidents')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.unresolvedIncidents}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Package className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jobSiteManager.deliveryCosts', 'Delivery Costs')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.totalDeliveryCost)}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <ClipboardList className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.jobSiteManager.totalSites', 'Total Sites')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {sites.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-1 flex flex-wrap gap-1`}>
          {[
            { id: 'sites', label: 'Sites', icon: Building2 },
            { id: 'daily-logs', label: 'Daily Logs', icon: FileText },
            { id: 'equipment', label: 'Equipment', icon: Wrench },
            { id: 'safety', label: 'Safety', icon: Shield },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sites Tab */}
        {activeTab === 'sites' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.search', 'Search')}
                    </label>
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('tools.jobSiteManager.searchSites', 'Search sites...')}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div className="w-40">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.status', 'Status')}
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as JobSite['status'] | 'all')}
                      className={`${selectClass} w-full`}
                    >
                      <option value="all">{t('tools.jobSiteManager.allStatuses', 'All Statuses')}</option>
                      {SITE_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.dateRange', 'Date Range')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={dateRangeStart}
                        onChange={(e) => setDateRangeStart(e.target.value)}
                        className={`${inputClass} w-36`}
                      />
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>to</span>
                      <input
                        type="date"
                        value={dateRangeEnd}
                        onChange={(e) => setDateRangeEnd(e.target.value)}
                        className={`${inputClass} w-36`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      resetSiteForm();
                      setShowSiteForm(true);
                    }}
                    className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.jobSiteManager.addSite', 'Add Site')}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Sites List */}
            {filteredSites.length === 0 ? (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="p-12 text-center">
                  <Building2 className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.jobSiteManager.noJobSitesFoundAdd', 'No job sites found. Add your first site to get started.')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSites.map((site) => {
                  const StatusIcon = getStatusIcon(site.status);
                  return (
                    <Card
                      key={site.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        theme === 'dark' ? t('tools.jobSiteManager.bgGray800BorderGray', 'bg-gray-800 border-gray-700 hover:border-[#0D9488]') : t('tools.jobSiteManager.bgWhiteBorderGray200', 'bg-white border-gray-200 hover:border-[#0D9488]')
                      } ${selectedSiteId === site.id ? 'ring-2 ring-[#0D9488]' : ''}`}
                      onClick={() => setSelectedSiteId(site.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-1 text-xs rounded-full text-white flex items-center gap-1"
                              style={{ backgroundColor: getStatusColor(site.status) }}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {SITE_STATUSES.find((s) => s.value === site.status)?.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(site);
                                setSiteForm({
                                  name: site.name,
                                  address: site.address,
                                  client: site.client,
                                  startDate: site.startDate,
                                  endDate: site.endDate,
                                  budget: site.budget,
                                  status: site.status,
                                  description: site.description,
                                  contactPerson: site.contactPerson,
                                  contactPhone: site.contactPhone,
                                });
                                setShowSiteForm(true);
                              }}
                              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSite(site.id);
                              }}
                              className="p-1 rounded hover:bg-red-500/10 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className={`font-semibold text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {site.name}
                        </h3>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{site.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{site.client}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {formatDate(site.startDate)} - {formatDate(site.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`font-medium text-[#0D9488]`}>{formatCurrency(site.budget)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Daily Logs Tab */}
        {activeTab === 'daily-logs' && (
          <div className="space-y-4">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end justify-between">
                  <div className="w-64">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.filterBySite', 'Filter by Site')}
                    </label>
                    <select
                      value={selectedSiteId || ''}
                      onChange={(e) => setSelectedSiteId(e.target.value || null)}
                      className={`${selectClass} w-full`}
                    >
                      <option value="">{t('tools.jobSiteManager.allSites', 'All Sites')}</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      resetLogForm();
                      setShowLogForm(true);
                    }}
                    className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.jobSiteManager.addDailyLog', 'Add Daily Log')}
                  </button>
                </div>
              </CardContent>
            </Card>

            {(selectedSiteId ? siteLogs : dailyLogs).length === 0 ? (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="p-12 text-center">
                  <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.jobSiteManager.noDailyLogsFoundAdd', 'No daily logs found. Add your first log entry.')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {(selectedSiteId ? siteLogs : dailyLogs).map((log) => {
                  const site = sites.find((s) => s.id === log.siteId);
                  return (
                    <Card
                      key={log.id}
                      className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatDate(log.date)}
                              </span>
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {site?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <WeatherIcon weather={log.weather} />
                                {log.temperature}F
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {log.workersPresent} workers
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingItem(log);
                                setLogForm({
                                  siteId: log.siteId,
                                  date: log.date,
                                  weather: log.weather,
                                  temperature: log.temperature,
                                  workersPresent: log.workersPresent,
                                  activities: log.activities,
                                  notes: log.notes,
                                  delays: log.delays,
                                });
                                setShowLogForm(true);
                              }}
                              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Delete Log Entry',
                                  message: 'Delete this log entry?',
                                  confirmText: 'Delete',
                                  cancelText: 'Cancel',
                                  variant: 'danger',
                                });
                                if (confirmed) {
                                  setDailyLogs(dailyLogs.filter((l) => l.id !== log.id));
                                }
                              }}
                              className="p-1 rounded hover:bg-red-500/10 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p className="mb-2"><strong>{t('tools.jobSiteManager.activities', 'Activities:')}</strong> {log.activities}</p>
                          {log.notes && <p className="mb-2"><strong>{t('tools.jobSiteManager.notes', 'Notes:')}</strong> {log.notes}</p>}
                          {log.delays && (
                            <p className="text-amber-500">
                              <strong>{t('tools.jobSiteManager.delays', 'Delays:')}</strong> {log.delays}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="space-y-4">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end justify-between">
                  <div className="w-64">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.filterBySite2', 'Filter by Site')}
                    </label>
                    <select
                      value={selectedSiteId || ''}
                      onChange={(e) => setSelectedSiteId(e.target.value || null)}
                      className={`${selectClass} w-full`}
                    >
                      <option value="">{t('tools.jobSiteManager.allSites2', 'All Sites')}</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      resetEquipmentForm();
                      setShowEquipmentForm(true);
                    }}
                    className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.jobSiteManager.addEquipment', 'Add Equipment')}
                  </button>
                </div>
              </CardContent>
            </Card>

            {(selectedSiteId ? siteEquipment : equipment).length === 0 ? (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="p-12 text-center">
                  <Wrench className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.jobSiteManager.noEquipmentTrackedAddEquipment', 'No equipment tracked. Add equipment to monitor on site.')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedSiteId ? siteEquipment : equipment).map((item) => {
                  const site = sites.find((s) => s.id === item.siteId);
                  const statusColors = {
                    'in-use': 'bg-green-500',
                    'available': 'bg-blue-500',
                    'maintenance': 'bg-amber-500',
                    'rented': 'bg-purple-500',
                  };
                  return (
                    <Card
                      key={item.id}
                      className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <span className={`px-2 py-1 text-xs rounded-full text-white ${statusColors[item.status]}`}>
                            {item.status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setEquipmentForm({ ...item });
                                setShowEquipmentForm(true);
                              }}
                              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Delete Equipment',
                                  message: 'Delete this equipment?',
                                  confirmText: 'Delete',
                                  cancelText: 'Cancel',
                                  variant: 'danger',
                                });
                                if (confirmed) {
                                  setEquipment(equipment.filter((e) => e.id !== item.id));
                                }
                              }}
                              className="p-1 rounded hover:bg-red-500/10 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>

                        <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p><strong>{t('tools.jobSiteManager.type', 'Type:')}</strong> {item.type}</p>
                          <p><strong>{t('tools.jobSiteManager.site', 'Site:')}</strong> {site?.name || 'Unknown'}</p>
                          {item.assignedTo && <p><strong>{t('tools.jobSiteManager.assigned', 'Assigned:')}</strong> {item.assignedTo}</p>}
                          <p><strong>{t('tools.jobSiteManager.nextInspection', 'Next Inspection:')}</strong> {formatDate(item.nextInspection)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Safety Tab */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end justify-between">
                  <div className="w-64">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.filterBySite3', 'Filter by Site')}
                    </label>
                    <select
                      value={selectedSiteId || ''}
                      onChange={(e) => setSelectedSiteId(e.target.value || null)}
                      className={`${selectClass} w-full`}
                    >
                      <option value="">{t('tools.jobSiteManager.allSites3', 'All Sites')}</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      resetIncidentForm();
                      setShowIncidentForm(true);
                    }}
                    className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.jobSiteManager.reportIncident', 'Report Incident')}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Material Deliveries Section */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Truck className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.jobSiteManager.materialDeliveries', 'Material Deliveries')}
                  </CardTitle>
                  <button
                    onClick={() => {
                      resetDeliveryForm();
                      setShowDeliveryForm(true);
                    }}
                    className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.jobSiteManager.addDelivery', 'Add Delivery')}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {(selectedSiteId ? siteDeliveries : deliveries).length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.jobSiteManager.noDeliveriesRecorded', 'No deliveries recorded.')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(selectedSiteId ? siteDeliveries : deliveries).slice(0, 5).map((delivery) => {
                      const site = sites.find((s) => s.id === delivery.siteId);
                      const statusColors = {
                        'scheduled': 'bg-blue-500',
                        'delivered': 'bg-green-500',
                        'partial': 'bg-amber-500',
                        'cancelled': 'bg-red-500',
                      };
                      return (
                        <div
                          key={delivery.id}
                          className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 text-xs rounded text-white ${statusColors[delivery.status]}`}>
                                  {delivery.status}
                                </span>
                                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {delivery.supplier}
                                </span>
                              </div>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {delivery.materials}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(delivery.date)} | {site?.name} | {formatCurrency(delivery.cost)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingItem(delivery);
                                  setDeliveryForm({ ...delivery });
                                  setShowDeliveryForm(true);
                                }}
                                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  const confirmed = await confirm({
                                    title: 'Delete Delivery',
                                    message: 'Delete this delivery?',
                                    confirmText: 'Delete',
                                    cancelText: 'Cancel',
                                    variant: 'danger',
                                  });
                                  if (confirmed) {
                                    setDeliveries(deliveries.filter((d) => d.id !== delivery.id));
                                  }
                                }}
                                className="p-1 rounded hover:bg-red-500/10 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Safety Incidents */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {t('tools.jobSiteManager.safetyIncidents', 'Safety Incidents')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(selectedSiteId ? siteIncidents : incidents).length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className={`w-12 h-12 mx-auto mb-3 text-green-500`} />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {t('tools.jobSiteManager.noSafetyIncidentsReportedKeep', 'No safety incidents reported. Keep up the good work!')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(selectedSiteId ? siteIncidents : incidents).map((incident) => {
                      const site = sites.find((s) => s.id === incident.siteId);
                      const severityInfo = SEVERITY_LEVELS.find((s) => s.value === incident.severity);
                      return (
                        <div
                          key={incident.id}
                          className={`p-4 rounded-lg border-l-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                          style={{ borderLeftColor: severityInfo?.color }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 text-xs rounded text-white"
                                style={{ backgroundColor: severityInfo?.color }}
                              >
                                {severityInfo?.label}
                              </span>
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {INCIDENT_TYPES.find((t) => t.value === incident.type)?.label}
                              </span>
                              {incident.resolved && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingItem(incident);
                                  setIncidentForm({
                                    siteId: incident.siteId,
                                    date: incident.date,
                                    type: incident.type,
                                    severity: incident.severity,
                                    description: incident.description,
                                    personInvolved: incident.personInvolved,
                                    actionTaken: incident.actionTaken,
                                    reportedBy: incident.reportedBy,
                                    resolved: incident.resolved,
                                  });
                                  setShowIncidentForm(true);
                                }}
                                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  const confirmed = await confirm({
                                    title: 'Delete Incident Report',
                                    message: 'Delete this incident report?',
                                    confirmText: 'Delete',
                                    cancelText: 'Cancel',
                                    variant: 'danger',
                                  });
                                  if (confirmed) {
                                    setIncidents(incidents.filter((i) => i.id !== incident.id));
                                  }
                                }}
                                className="p-1 rounded hover:bg-red-500/10 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                            {incident.description}
                          </p>

                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(incident.date)} | {site?.name} | Reported by: {incident.reportedBy}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {t('tools.jobSiteManager.summaryReports', 'Summary Reports')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sites by Status */}
                  <div>
                    <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.jobSiteManager.sitesByStatus', 'Sites by Status')}
                    </h4>
                    <div className="space-y-2">
                      {SITE_STATUSES.map((status) => {
                        const count = sites.filter((s) => s.status === status.value).length;
                        const percentage = sites.length > 0 ? (count / sites.length) * 100 : 0;
                        return (
                          <div key={status.value}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {status.label}
                              </span>
                              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {count}
                              </span>
                            </div>
                            <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${percentage}%`, backgroundColor: status.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Safety Overview */}
                  <div>
                    <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.jobSiteManager.safetyOverview', 'Safety Overview')}
                    </h4>
                    <div className="space-y-2">
                      {SEVERITY_LEVELS.map((severity) => {
                        const count = incidents.filter((i) => i.severity === severity.value).length;
                        return (
                          <div key={severity.value} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: severity.color }}
                              />
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {severity.label} Incidents
                              </span>
                            </div>
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Site Form Modal */}
        {showSiteForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingItem ? t('tools.jobSiteManager.editJobSite', 'Edit Job Site') : t('tools.jobSiteManager.addNewJobSite', 'Add New Job Site')}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.siteName', 'Site Name *')}
                    </label>
                    <input
                      type="text"
                      value={siteForm.name}
                      onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.jobSiteManager.eGDowntownOfficeComplex', 'e.g., Downtown Office Complex')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.client', 'Client')}
                    </label>
                    <input
                      type="text"
                      value={siteForm.client}
                      onChange={(e) => setSiteForm({ ...siteForm, client: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.jobSiteManager.clientName', 'Client name')}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.address', 'Address *')}
                  </label>
                  <input
                    type="text"
                    value={siteForm.address}
                    onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.jobSiteManager.fullAddress', 'Full address')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.startDate', 'Start Date')}
                    </label>
                    <input
                      type="date"
                      value={siteForm.startDate}
                      onChange={(e) => setSiteForm({ ...siteForm, startDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.endDate', 'End Date')}
                    </label>
                    <input
                      type="date"
                      value={siteForm.endDate}
                      onChange={(e) => setSiteForm({ ...siteForm, endDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.status2', 'Status')}
                    </label>
                    <select
                      value={siteForm.status}
                      onChange={(e) => setSiteForm({ ...siteForm, status: e.target.value as JobSite['status'] })}
                      className={`${selectClass} w-full`}
                    >
                      {SITE_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.budget', 'Budget')}
                  </label>
                  <input
                    type="number"
                    value={siteForm.budget || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, budget: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.description', 'Description')}
                  </label>
                  <textarea
                    value={siteForm.description}
                    onChange={(e) => setSiteForm({ ...siteForm, description: e.target.value })}
                    className={inputClass}
                    rows={3}
                    placeholder={t('tools.jobSiteManager.projectDescription', 'Project description...')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.contactPerson', 'Contact Person')}
                    </label>
                    <input
                      type="text"
                      value={siteForm.contactPerson}
                      onChange={(e) => setSiteForm({ ...siteForm, contactPerson: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.jobSiteManager.contactName', 'Contact name')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.contactPhone', 'Contact Phone')}
                    </label>
                    <input
                      type="tel"
                      value={siteForm.contactPhone}
                      onChange={(e) => setSiteForm({ ...siteForm, contactPhone: e.target.value })}
                      className={inputClass}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-2`}>
                <button
                  onClick={resetSiteForm}
                  className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  {t('tools.jobSiteManager.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveSite}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingItem ? t('tools.jobSiteManager.updateSite', 'Update Site') : t('tools.jobSiteManager.addSite2', 'Add Site')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Log Form Modal */}
        {showLogForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingItem ? t('tools.jobSiteManager.editDailyLog', 'Edit Daily Log') : t('tools.jobSiteManager.addDailyLog2', 'Add Daily Log')}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.site2', 'Site *')}
                    </label>
                    <select
                      value={logForm.siteId}
                      onChange={(e) => setLogForm({ ...logForm, siteId: e.target.value })}
                      className={`${selectClass} w-full`}
                    >
                      <option value="">{t('tools.jobSiteManager.selectSite', 'Select site...')}</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={logForm.date}
                      onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.weather', 'Weather')}
                    </label>
                    <select
                      value={logForm.weather}
                      onChange={(e) => setLogForm({ ...logForm, weather: e.target.value as DailyLog['weather'] })}
                      className={`${selectClass} w-full`}
                    >
                      {WEATHER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.temperatureF', 'Temperature (F)')}
                    </label>
                    <input
                      type="number"
                      value={logForm.temperature}
                      onChange={(e) => setLogForm({ ...logForm, temperature: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.workersPresent', 'Workers Present')}
                    </label>
                    <input
                      type="number"
                      value={logForm.workersPresent || ''}
                      onChange={(e) => setLogForm({ ...logForm, workersPresent: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.activities2', 'Activities')}
                  </label>
                  <textarea
                    value={logForm.activities}
                    onChange={(e) => setLogForm({ ...logForm, activities: e.target.value })}
                    className={inputClass}
                    rows={3}
                    placeholder={t('tools.jobSiteManager.describeWorkCompletedToday', 'Describe work completed today...')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.delays2', 'Delays')}
                  </label>
                  <input
                    type="text"
                    value={logForm.delays}
                    onChange={(e) => setLogForm({ ...logForm, delays: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.jobSiteManager.anyDelaysOrIssues', 'Any delays or issues...')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={logForm.notes}
                    onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                    className={inputClass}
                    rows={2}
                    placeholder={t('tools.jobSiteManager.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-2`}>
                <button
                  onClick={resetLogForm}
                  className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  {t('tools.jobSiteManager.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveLog}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingItem ? t('tools.jobSiteManager.updateLog', 'Update Log') : t('tools.jobSiteManager.addLog', 'Add Log')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Equipment Form Modal */}
        {showEquipmentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingItem ? t('tools.jobSiteManager.editEquipment', 'Edit Equipment') : t('tools.jobSiteManager.addEquipment2', 'Add Equipment')}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.site3', 'Site *')}
                  </label>
                  <select
                    value={equipmentForm.siteId}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, siteId: e.target.value })}
                    className={`${selectClass} w-full`}
                  >
                    <option value="">{t('tools.jobSiteManager.selectSite2', 'Select site...')}</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.equipmentName', 'Equipment Name *')}
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.name}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.jobSiteManager.eGCat320Excavator', 'e.g., CAT 320 Excavator')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.type2', 'Type')}
                    </label>
                    <select
                      value={equipmentForm.type}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, type: e.target.value })}
                      className={`${selectClass} w-full`}
                    >
                      {EQUIPMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.status3', 'Status')}
                    </label>
                    <select
                      value={equipmentForm.status}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, status: e.target.value as Equipment['status'] })}
                      className={`${selectClass} w-full`}
                    >
                      <option value="available">{t('tools.jobSiteManager.available', 'Available')}</option>
                      <option value="in-use">{t('tools.jobSiteManager.inUse', 'In Use')}</option>
                      <option value="maintenance">{t('tools.jobSiteManager.maintenance', 'Maintenance')}</option>
                      <option value="rented">{t('tools.jobSiteManager.rented', 'Rented')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.assignedTo', 'Assigned To')}
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.assignedTo}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, assignedTo: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.jobSiteManager.operatorName', 'Operator name')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.lastInspection', 'Last Inspection')}
                    </label>
                    <input
                      type="date"
                      value={equipmentForm.lastInspection}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, lastInspection: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.nextInspection2', 'Next Inspection')}
                    </label>
                    <input
                      type="date"
                      value={equipmentForm.nextInspection}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, nextInspection: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.notes3', 'Notes')}
                  </label>
                  <textarea
                    value={equipmentForm.notes}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, notes: e.target.value })}
                    className={inputClass}
                    rows={2}
                    placeholder={t('tools.jobSiteManager.additionalNotes2', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-2`}>
                <button
                  onClick={resetEquipmentForm}
                  className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  {t('tools.jobSiteManager.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveEquipment}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingItem ? t('tools.jobSiteManager.updateEquipment', 'Update Equipment') : t('tools.jobSiteManager.addEquipment3', 'Add Equipment')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Incident Form Modal */}
        {showIncidentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingItem ? t('tools.jobSiteManager.editIncidentReport', 'Edit Incident Report') : t('tools.jobSiteManager.reportSafetyIncident', 'Report Safety Incident')}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.site4', 'Site *')}
                    </label>
                    <select
                      value={incidentForm.siteId}
                      onChange={(e) => setIncidentForm({ ...incidentForm, siteId: e.target.value })}
                      className={`${selectClass} w-full`}
                    >
                      <option value="">{t('tools.jobSiteManager.selectSite3', 'Select site...')}</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.date2', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={incidentForm.date}
                      onChange={(e) => setIncidentForm({ ...incidentForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.incidentType', 'Incident Type')}
                    </label>
                    <select
                      value={incidentForm.type}
                      onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value as SafetyIncident['type'] })}
                      className={`${selectClass} w-full`}
                    >
                      {INCIDENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.severity', 'Severity')}
                    </label>
                    <select
                      value={incidentForm.severity}
                      onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value as SafetyIncident['severity'] })}
                      className={`${selectClass} w-full`}
                    >
                      {SEVERITY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.description2', 'Description *')}
                  </label>
                  <textarea
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                    className={inputClass}
                    rows={3}
                    placeholder={t('tools.jobSiteManager.describeTheIncident', 'Describe the incident...')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.personInvolved', 'Person Involved')}
                    </label>
                    <input
                      type="text"
                      value={incidentForm.personInvolved}
                      onChange={(e) => setIncidentForm({ ...incidentForm, personInvolved: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.jobSiteManager.name', 'Name')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.reportedBy', 'Reported By')}
                    </label>
                    <input
                      type="text"
                      value={incidentForm.reportedBy}
                      onChange={(e) => setIncidentForm({ ...incidentForm, reportedBy: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.jobSiteManager.yourName', 'Your name')}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.actionTaken', 'Action Taken')}
                  </label>
                  <textarea
                    value={incidentForm.actionTaken}
                    onChange={(e) => setIncidentForm({ ...incidentForm, actionTaken: e.target.value })}
                    className={inputClass}
                    rows={2}
                    placeholder={t('tools.jobSiteManager.whatActionsWereTaken', 'What actions were taken...')}
                  />
                </div>

                <div>
                  <label className={`flex items-center gap-2 cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input
                      type="checkbox"
                      checked={incidentForm.resolved}
                      onChange={(e) => setIncidentForm({ ...incidentForm, resolved: e.target.checked })}
                      className="rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                    />
                    <span className="text-sm font-medium">{t('tools.jobSiteManager.resolved', 'Resolved')}</span>
                  </label>
                </div>
              </div>
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-2`}>
                <button
                  onClick={resetIncidentForm}
                  className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  {t('tools.jobSiteManager.cancel4', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveIncident}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingItem ? t('tools.jobSiteManager.updateReport', 'Update Report') : t('tools.jobSiteManager.submitReport', 'Submit Report')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Form Modal */}
        {showDeliveryForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingItem ? t('tools.jobSiteManager.editDelivery', 'Edit Delivery') : t('tools.jobSiteManager.addMaterialDelivery', 'Add Material Delivery')}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.site5', 'Site *')}
                    </label>
                    <select
                      value={deliveryForm.siteId}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, siteId: e.target.value })}
                      className={`${selectClass} w-full`}
                    >
                      <option value="">{t('tools.jobSiteManager.selectSite4', 'Select site...')}</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.date3', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={deliveryForm.date}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.supplier', 'Supplier *')}
                  </label>
                  <input
                    type="text"
                    value={deliveryForm.supplier}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, supplier: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.jobSiteManager.supplierName', 'Supplier name')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.materials', 'Materials')}
                  </label>
                  <input
                    type="text"
                    value={deliveryForm.materials}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, materials: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.jobSiteManager.eGConcreteRebarLumber', 'e.g., Concrete, Rebar, Lumber')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.quantity', 'Quantity')}
                    </label>
                    <input
                      type="text"
                      value={deliveryForm.quantity}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, quantity: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.jobSiteManager.eG50CubicYards', 'e.g., 50 cubic yards')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.cost', 'Cost')}
                    </label>
                    <input
                      type="number"
                      value={deliveryForm.cost || ''}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, cost: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.status4', 'Status')}
                    </label>
                    <select
                      value={deliveryForm.status}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, status: e.target.value as MaterialDelivery['status'] })}
                      className={`${selectClass} w-full`}
                    >
                      <option value="scheduled">{t('tools.jobSiteManager.scheduled', 'Scheduled')}</option>
                      <option value="delivered">{t('tools.jobSiteManager.delivered', 'Delivered')}</option>
                      <option value="partial">{t('tools.jobSiteManager.partial', 'Partial')}</option>
                      <option value="cancelled">{t('tools.jobSiteManager.cancelled', 'Cancelled')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jobSiteManager.receivedBy', 'Received By')}
                    </label>
                    <input
                      type="text"
                      value={deliveryForm.receivedBy}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, receivedBy: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.jobSiteManager.name2', 'Name')}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.jobSiteManager.notes4', 'Notes')}
                  </label>
                  <textarea
                    value={deliveryForm.notes}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                    className={inputClass}
                    rows={2}
                    placeholder={t('tools.jobSiteManager.additionalNotes3', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-2`}>
                <button
                  onClick={resetDeliveryForm}
                  className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  {t('tools.jobSiteManager.cancel5', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveDelivery}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingItem ? t('tools.jobSiteManager.updateDelivery', 'Update Delivery') : t('tools.jobSiteManager.addDelivery2', 'Add Delivery')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.jobSiteManager.aboutJobSiteManager', 'About Job Site Manager')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                {t('tools.jobSiteManager.comprehensiveConstructionJobSiteManagement', 'Comprehensive construction job site management tool for tracking projects, daily activities, equipment, safety, and deliveries.')}
              </p>
              <p>
                <strong>{t('tools.jobSiteManager.features', 'Features:')}</strong> Site management with status tracking, daily work logs with weather conditions, equipment tracking and inspection schedules, safety incident reporting, material delivery tracking, and project reports.
              </p>
              <p className="text-xs italic">
                {t('tools.jobSiteManager.noteYourDataIsAutomatically', 'Note: Your data is automatically synced to the cloud when signed in, with local backup for offline access.')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 bg-red-500 text-white rounded-lg shadow-lg flex items-center gap-2 z-40 animate-in slide-in-from-bottom-5 duration-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{validationMessage}</span>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default JobSiteManagerTool;
