'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Monitor,
  Wrench,
  User,
  ClipboardList,
  Clock,
  DollarSign,
  Shield,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  HardDrive,
  Cpu,
  Wifi,
  Bug,
  Database,
  Phone,
  Mail,
  Calendar,
  FileText,
  Settings,
  Play,
  Pause,
  Square,
  Timer,
  Package,
  RefreshCw,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Laptop,
  Smartphone,
  Printer,
  Server,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
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
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData } from '../../hooks/useToolData';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Types
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  notes?: string;
}

interface DeviceInfo {
  type: 'desktop' | 'laptop' | 'smartphone' | 'tablet' | 'printer' | 'server' | 'network' | 'other';
  brand: string;
  model: string;
  serialNumber?: string;
  operatingSystem?: string;
  password?: string;
  accessories?: string[];
}

interface IntakeChecklist {
  physicalDamage: boolean;
  powersTurnOn: boolean;
  hasCharger: boolean;
  hasCase: boolean;
  dataBackedUp: boolean;
  customerAwareOfDataRisk: boolean;
  notes?: string;
}

interface Part {
  id: string;
  name: string;
  partNumber?: string;
  cost: number;
  quantity: number;
  status: 'ordered' | 'received' | 'installed';
  supplier?: string;
}

interface TimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  description: string;
  technicianId: string;
}

interface RemoteSession {
  id: string;
  date: Date;
  duration: number; // in minutes
  tool: string;
  notes: string;
  technicianId: string;
}

interface DiagnosticNote {
  id: string;
  date: Date;
  note: string;
  technicianId: string;
}

interface SLA {
  type: 'standard' | 'priority' | 'enterprise';
  responseTime: number; // hours
  resolutionTime: number; // hours
}

interface Warranty {
  hasWarranty: boolean;
  warrantyType?: 'manufacturer' | 'extended' | 'in-house';
  expirationDate?: Date;
  coverage?: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  createdAt: Date;
  updatedAt: Date;
  customer: Customer;
  device: DeviceInfo;
  intakeChecklist: IntakeChecklist;
  issue: string;
  repairType: 'hardware' | 'software' | 'virus-removal' | 'data-recovery' | 'network' | 'upgrade' | 'maintenance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'intake' | 'queued' | 'in-progress' | 'waiting-parts' | 'waiting-customer' | 'completed' | 'cancelled';
  assignedTechnician?: string;
  diagnosticNotes: DiagnosticNote[];
  parts: Part[];
  timeEntries: TimeEntry[];
  remoteSessions: RemoteSession[];
  sla: SLA;
  pricing: {
    type: 'flat' | 'hourly';
    laborRate: number;
    flatRate?: number;
    estimatedHours?: number;
    discount?: number;
  };
  warranty: Warranty;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  benchPosition?: number;
  totalCost?: number;
}

interface Technician {
  id: string;
  name: string;
  specialties: string[];
  active: boolean;
}

// Column configuration for export
const ticketColumns: ColumnConfig[] = [
  { key: 'ticketNumber', header: 'Ticket #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'deviceType', header: 'Device Type', type: 'string' },
  { key: 'deviceBrand', header: 'Brand', type: 'string' },
  { key: 'deviceModel', header: 'Model', type: 'string' },
  { key: 'issue', header: 'Issue', type: 'string' },
  { key: 'repairType', header: 'Repair Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'assignedTechnician', header: 'Technician', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'estimatedCompletion', header: 'Est. Completion', type: 'date' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
];

const STORAGE_KEY = 'it-support-tool-data';

const defaultTechnicians: Technician[] = [
  { id: 'tech-1', name: 'John Smith', specialties: ['hardware', 'networking'], active: true },
  { id: 'tech-2', name: 'Sarah Johnson', specialties: ['software', 'data-recovery'], active: true },
  { id: 'tech-3', name: 'Mike Chen', specialties: ['virus-removal', 'security'], active: true },
];

const deviceTypeIcons = {
  desktop: Monitor,
  laptop: Laptop,
  smartphone: Smartphone,
  tablet: Smartphone,
  printer: Printer,
  server: Server,
  network: Wifi,
  other: HardDrive,
};

const repairTypeLabels: Record<Ticket['repairType'], string> = {
  hardware: 'Hardware Repair',
  software: 'Software Issue',
  'virus-removal': 'Virus Removal',
  'data-recovery': 'Data Recovery',
  network: 'Network Issue',
  upgrade: 'Upgrade',
  maintenance: 'Maintenance',
  other: 'Other',
};

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusColors = {
  intake: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  queued: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'waiting-parts': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'waiting-customer': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const generateTicketNumber = (): string => {
  const date = new Date();
  const prefix = 'TKT';
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
};

interface ITSupportToolProps {
  uiConfig?: UIConfig;
}

export const ITSupportTool: React.FC<ITSupportToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Use useToolData hook for ticket management with backend sync
  const {
    data: tickets,
    addItem: addTicket,
    updateItem: updateTicket,
    deleteItem: deleteTicket,
    exportCSV: exportTicketsCSV,
    exportExcel: exportTicketsExcel,
    exportJSON: exportTicketsJSON,
    exportPDF: exportTicketsPDF,
    importCSV: importTicketsCSV,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Ticket>('it-support-tickets', [], ticketColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // State
  const [technicians, setTechnicians] = useState<Technician[]>(defaultTechnicians);
  const [activeView, setActiveView] = useState<'dashboard' | 'tickets' | 'queue' | 'create'>('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Ticket['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Ticket['priority'] | 'all'>('all');
  const [activeTimeEntry, setActiveTimeEntry] = useState<{ ticketId: string; startTime: Date } | null>(null);

  // Form state for new ticket
  const [newTicket, setNewTicket] = useState<Partial<Ticket>>({
    customer: {
      id: '',
      name: '',
      email: '',
      phone: '',
    },
    device: {
      type: 'laptop',
      brand: '',
      model: '',
    },
    intakeChecklist: {
      physicalDamage: false,
      powersTurnOn: true,
      hasCharger: false,
      hasCase: false,
      dataBackedUp: false,
      customerAwareOfDataRisk: false,
    },
    issue: '',
    repairType: 'software',
    priority: 'medium',
    status: 'intake',
    sla: {
      type: 'standard',
      responseTime: 24,
      resolutionTime: 72,
    },
    pricing: {
      type: 'hourly',
      laborRate: 75,
    },
    warranty: {
      hasWarranty: false,
    },
    diagnosticNotes: [],
    parts: [],
    timeEntries: [],
    remoteSessions: [],
  });

  // Load technicians from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.technicians) {
          setTechnicians(data.technicians);
        }
      } catch (e) {
        console.error('Failed to parse technicians data', e);
      }
    }
  }, []);

  // Save technicians to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ technicians }));
  }, [technicians]);

  // Computed values
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        searchQuery === '' ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.issue.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, filterStatus, filterPriority]);

  const benchQueue = useMemo(() => {
    return tickets
      .filter((t) => ['queued', 'in-progress', 'waiting-parts'].includes(t.status))
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.createdAt.getTime() - b.createdAt.getTime();
      });
  }, [tickets]);

  const dashboardStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      totalActive: tickets.filter((t) => !['completed', 'cancelled'].includes(t.status)).length,
      inProgress: tickets.filter((t) => t.status === 'in-progress').length,
      waitingParts: tickets.filter((t) => t.status === 'waiting-parts').length,
      completedToday: tickets.filter((t) => t.status === 'completed' && t.actualCompletion && new Date(t.actualCompletion) >= today).length,
      criticalCount: tickets.filter((t) => t.priority === 'critical' && !['completed', 'cancelled'].includes(t.status)).length,
      averageResolutionTime: (() => {
        const completed = tickets.filter((t) => t.status === 'completed' && t.actualCompletion);
        if (completed.length === 0) return 0;
        const total = completed.reduce((sum, t) => {
          const duration = new Date(t.actualCompletion!).getTime() - new Date(t.createdAt).getTime();
          return sum + duration;
        }, 0);
        return Math.round(total / completed.length / (1000 * 60 * 60)); // hours
      })(),
    };
  }, [tickets]);

  // Handlers
  const createTicket = () => {
    if (!newTicket.customer?.name || !newTicket.issue) {
      setValidationMessage('Please fill in required fields (Customer Name and Issue Description)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const ticket: Ticket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: generateTicketNumber(),
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: {
        id: `customer-${Date.now()}`,
        ...newTicket.customer,
      } as Customer,
      device: newTicket.device as DeviceInfo,
      intakeChecklist: newTicket.intakeChecklist as IntakeChecklist,
      issue: newTicket.issue || '',
      repairType: newTicket.repairType || 'software',
      priority: newTicket.priority || 'medium',
      status: 'intake',
      sla: newTicket.sla as SLA,
      pricing: newTicket.pricing as Ticket['pricing'],
      warranty: newTicket.warranty as Warranty,
      diagnosticNotes: [],
      parts: [],
      timeEntries: [],
      remoteSessions: [],
      benchPosition: benchQueue.length + 1,
    };

    addTicket(ticket);
    setNewTicket({
      customer: { id: '', name: '', email: '', phone: '' },
      device: { type: 'laptop', brand: '', model: '' },
      intakeChecklist: {
        physicalDamage: false,
        powersTurnOn: true,
        hasCharger: false,
        hasCase: false,
        dataBackedUp: false,
        customerAwareOfDataRisk: false,
      },
      issue: '',
      repairType: 'software',
      priority: 'medium',
      status: 'intake',
      sla: { type: 'standard', responseTime: 24, resolutionTime: 72 },
      pricing: { type: 'hourly', laborRate: 75 },
      warranty: { hasWarranty: false },
      diagnosticNotes: [],
      parts: [],
      timeEntries: [],
      remoteSessions: [],
    });
    setActiveView('tickets');
  };

  // Wrapper for updateTicket to handle additional logic
  const handleUpdateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
      actualCompletion: updates.status === 'completed' ? new Date() : undefined,
    };
    updateTicket(ticketId, updateData);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, ...updateData });
    }
  };

  // Wrapper for deleteTicket to handle confirmation
  const handleDeleteTicket = async (ticketId: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this ticket?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteTicket(ticketId);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    }
  };

  const addDiagnosticNote = (ticketId: string, note: string, technicianId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      const newNote: DiagnosticNote = {
        id: `note-${Date.now()}`,
        date: new Date(),
        note,
        technicianId,
      };
      handleUpdateTicket(ticketId, {
        diagnosticNotes: [...ticket.diagnosticNotes, newNote],
      });
    }
  };

  const addPart = (ticketId: string, part: Omit<Part, 'id'>) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      const newPart: Part = {
        id: `part-${Date.now()}`,
        ...part,
      };
      handleUpdateTicket(ticketId, {
        parts: [...ticket.parts, newPart],
      });
    }
  };

  const startTimeTracking = (ticketId: string) => {
    setActiveTimeEntry({ ticketId, startTime: new Date() });
  };

  const stopTimeTracking = (description: string, technicianId: string) => {
    if (activeTimeEntry) {
      const ticket = tickets.find((t) => t.id === activeTimeEntry.ticketId);
      if (ticket) {
        const newEntry: TimeEntry = {
          id: `time-${Date.now()}`,
          startTime: activeTimeEntry.startTime,
          endTime: new Date(),
          description,
          technicianId,
        };
        handleUpdateTicket(activeTimeEntry.ticketId, {
          timeEntries: [...ticket.timeEntries, newEntry],
        });
      }
      setActiveTimeEntry(null);
    }
  };

  const addRemoteSession = (ticketId: string, session: Omit<RemoteSession, 'id'>) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      const newSession: RemoteSession = {
        id: `session-${Date.now()}`,
        ...session,
      };
      handleUpdateTicket(ticketId, {
        remoteSessions: [...ticket.remoteSessions, newSession],
      });
    }
  };

  const calculateTotalCost = (ticket: Ticket): number => {
    const partsTotal = ticket.parts.reduce((sum, p) => sum + p.cost * p.quantity, 0);
    let laborTotal = 0;

    if (ticket.pricing.type === 'flat') {
      laborTotal = ticket.pricing.flatRate || 0;
    } else {
      const totalMinutes = ticket.timeEntries.reduce((sum, e) => {
        if (e.endTime) {
          return sum + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 60000;
        }
        return sum;
      }, 0);
      laborTotal = (totalMinutes / 60) * ticket.pricing.laborRate;
    }

    const subtotal = partsTotal + laborTotal;
    const discount = ticket.pricing.discount || 0;
    return subtotal - (subtotal * discount) / 100;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Prepare export data with flattened structure
  const exportData = useMemo(() => {
    return tickets.map(ticket => ({
      ticketNumber: ticket.ticketNumber,
      customerName: ticket.customer.name,
      customerEmail: ticket.customer.email,
      customerPhone: ticket.customer.phone,
      deviceType: ticket.device.type,
      deviceBrand: ticket.device.brand,
      deviceModel: ticket.device.model,
      issue: ticket.issue,
      repairType: repairTypeLabels[ticket.repairType] || ticket.repairType,
      priority: ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1),
      status: ticket.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      assignedTechnician: technicians.find(t => t.id === ticket.assignedTechnician)?.name || 'Unassigned',
      createdAt: ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : ticket.createdAt,
      estimatedCompletion: ticket.estimatedCompletion ? (ticket.estimatedCompletion instanceof Date ? ticket.estimatedCompletion.toISOString() : ticket.estimatedCompletion) : '',
      totalCost: ticket.totalCost || calculateTotalCost(ticket),
    }));
  }, [tickets, technicians]);

  // Render functions
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Active Tickets</span>
          </div>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {dashboardStats.totalActive}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-purple-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</span>
          </div>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {dashboardStats.inProgress}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Waiting Parts</span>
          </div>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {dashboardStats.waitingParts}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Completed Today</span>
          </div>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {dashboardStats.completedToday}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Critical</span>
          </div>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {dashboardStats.criticalCount}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-cyan-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Avg Resolution</span>
          </div>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {dashboardStats.averageResolutionTime}h
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveView('create')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
          <button
            onClick={() => setActiveView('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            View Bench Queue
          </button>
        </div>
      </div>

      {/* Recent Critical Tickets */}
      {tickets.filter((t) => t.priority === 'critical' && !['completed', 'cancelled'].includes(t.status)).length > 0 && (
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow border-l-4 border-red-500`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <AlertCircle className="w-5 h-5 text-red-500" />
            Critical Tickets Requiring Attention
          </h3>
          <div className="space-y-3">
            {tickets
              .filter((t) => t.priority === 'critical' && !['completed', 'cancelled'].includes(t.status))
              .slice(0, 5)
              .map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setActiveView('tickets');
                  }}
                  className={`p-3 rounded-lg cursor-pointer ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {ticket.ticketNumber}
                      </span>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.customer.name}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{ticket.issue.substring(0, 50)}...</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[ticket.status]}`}>
                      {ticket.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Technician Workload */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Technician Workload</h3>
        <div className="space-y-3">
          {technicians.map((tech) => {
            const assignedCount = tickets.filter(
              (t) => t.assignedTechnician === tech.id && !['completed', 'cancelled'].includes(t.status)
            ).length;
            return (
              <div key={tech.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <User className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tech.name}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{tech.specialties.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{assignedCount}</span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>tickets</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTicketList = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={t('tools.iTSupport.searchTickets', 'Search tickets...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Ticket['status'] | 'all')}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            >
              <option value="all">{t('tools.iTSupport.allStatus', 'All Status')}</option>
              <option value="intake">{t('tools.iTSupport.intake', 'Intake')}</option>
              <option value="queued">{t('tools.iTSupport.queued', 'Queued')}</option>
              <option value="in-progress">{t('tools.iTSupport.inProgress', 'In Progress')}</option>
              <option value="waiting-parts">{t('tools.iTSupport.waitingParts', 'Waiting Parts')}</option>
              <option value="waiting-customer">{t('tools.iTSupport.waitingCustomer', 'Waiting Customer')}</option>
              <option value="completed">{t('tools.iTSupport.completed', 'Completed')}</option>
              <option value="cancelled">{t('tools.iTSupport.cancelled', 'Cancelled')}</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Ticket['priority'] | 'all')}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            >
              <option value="all">{t('tools.iTSupport.allPriority', 'All Priority')}</option>
              <option value="low">{t('tools.iTSupport.low', 'Low')}</option>
              <option value="medium">{t('tools.iTSupport.medium', 'Medium')}</option>
              <option value="high">{t('tools.iTSupport.high', 'High')}</option>
              <option value="critical">{t('tools.iTSupport.critical', 'Critical')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket Cards */}
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <ClipboardList className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.iTSupport.noTicketsFound', 'No tickets found')}</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const DeviceIcon = deviceTypeIcons[ticket.device.type];
            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  theme === 'dark' ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                } shadow ${selectedTicket?.id === ticket.id ? 'ring-2 ring-[#0D9488]' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <DeviceIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {ticket.ticketNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[ticket.priority]}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[ticket.status]}`}>
                          {ticket.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.customer.name}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {ticket.device.brand} {ticket.device.model} - {repairTypeLabels[ticket.repairType]}
                      </p>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {ticket.issue.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Created {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    {ticket.assignedTechnician && (
                      <span className={`text-xs flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <User className="w-3 h-3" />
                        {technicians.find((t) => t.id === ticket.assignedTechnician)?.name}
                      </span>
                    )}
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      ${calculateTotalCost(ticket).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderTicketDetail = () => {
    if (!selectedTicket) return null;

    const DeviceIcon = deviceTypeIcons[selectedTicket.device.type];
    const [showAddNote, setShowAddNote] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [showAddPart, setShowAddPart] = useState(false);
    const [newPart, setNewPart] = useState<Omit<Part, 'id'>>({ name: '', cost: 0, quantity: 1, status: 'ordered' });
    const [showAddSession, setShowAddSession] = useState(false);
    const [newSession, setNewSession] = useState<Omit<RemoteSession, 'id'>>({
      date: new Date(),
      duration: 30,
      tool: 'TeamViewer',
      notes: '',
      technicianId: technicians[0]?.id || '',
    });
    const [timeDescription, setTimeDescription] = useState('');

    const totalTime = selectedTicket.timeEntries.reduce((sum, e) => {
      if (e.endTime) {
        return sum + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 60000;
      }
      return sum;
    }, 0);

    return (
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <DeviceIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedTicket.ticketNumber}
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{selectedTicket.customer.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs ${priorityColors[selectedTicket.priority]}`}>
                  {selectedTicket.priority.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${statusColors[selectedTicket.status]}`}>
                  {selectedTicket.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTicket(null)}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteTicket(selectedTicket.id)}
              className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Update */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.iTSupport.updateStatus', 'Update Status')}
          </label>
          <div className="flex flex-wrap gap-2">
            {(['intake', 'queued', 'in-progress', 'waiting-parts', 'waiting-customer', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleUpdateTicket(selectedTicket.id, { status })}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedTicket.status === status ? statusColors[status] : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Assign Technician */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.iTSupport.assignedTechnician', 'Assigned Technician')}
          </label>
          <select
            value={selectedTicket.assignedTechnician || ''}
            onChange={(e) => handleUpdateTicket(selectedTicket.id, { assignedTechnician: e.target.value || undefined })}
            className={`w-full md:w-auto px-4 py-2 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">{t('tools.iTSupport.unassigned', 'Unassigned')}</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <User className="w-4 h-4" /> Customer Information
            </h3>
            <div className="space-y-2">
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                <strong>{t('tools.iTSupport.name', 'Name:')}</strong> {selectedTicket.customer.name}
              </p>
              <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Mail className="w-4 h-4" /> {selectedTicket.customer.email}
              </p>
              <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Phone className="w-4 h-4" /> {selectedTicket.customer.phone}
              </p>
              {selectedTicket.customer.company && (
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>{t('tools.iTSupport.company', 'Company:')}</strong> {selectedTicket.customer.company}
                </p>
              )}
            </div>
          </div>

          {/* Device Info */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Monitor className="w-4 h-4" /> Device Information
            </h3>
            <div className="space-y-2">
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                <strong>{t('tools.iTSupport.type', 'Type:')}</strong> {selectedTicket.device.type}
              </p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                <strong>{t('tools.iTSupport.brandModel', 'Brand/Model:')}</strong> {selectedTicket.device.brand} {selectedTicket.device.model}
              </p>
              {selectedTicket.device.serialNumber && (
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>S/N:</strong> {selectedTicket.device.serialNumber}
                </p>
              )}
              {selectedTicket.device.operatingSystem && (
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>{t('tools.iTSupport.os', 'OS:')}</strong> {selectedTicket.device.operatingSystem}
                </p>
              )}
            </div>
          </div>

          {/* Issue Description */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} md:col-span-2`}>
            <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-4 h-4" /> Issue Description
            </h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{selectedTicket.issue}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                <Wrench className="w-3 h-3" /> {repairTypeLabels[selectedTicket.repairType]}
              </span>
            </div>
          </div>

          {/* Intake Checklist */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <ClipboardList className="w-4 h-4" /> Intake Checklist
            </h3>
            <div className="space-y-2">
              {Object.entries(selectedTicket.intakeChecklist).map(([key, value]) => {
                if (key === 'notes') return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
                return (
                  <div key={key} className="flex items-center gap-2">
                    {value ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SLA & Warranty */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Shield className="w-4 h-4" /> SLA & Warranty
            </h3>
            <div className="space-y-2">
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                <strong>{t('tools.iTSupport.sla', 'SLA:')}</strong> {selectedTicket.sla.type} (Response: {selectedTicket.sla.responseTime}h, Resolution: {selectedTicket.sla.resolutionTime}h)
              </p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                <strong>{t('tools.iTSupport.warranty', 'Warranty:')}</strong> {selectedTicket.warranty.hasWarranty ? `${selectedTicket.warranty.warrantyType} - ${selectedTicket.warranty.coverage}` : 'No warranty'}
              </p>
            </div>
          </div>
        </div>

        {/* Time Tracking */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Clock className="w-4 h-4" /> Time Tracking
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatDuration(totalTime)}
            </span>
            {activeTimeEntry?.ticketId === selectedTicket.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t('tools.iTSupport.description', 'Description...')}
                  value={timeDescription}
                  onChange={(e) => setTimeDescription(e.target.value)}
                  className={`px-3 py-1 rounded border ${
                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={() => {
                    stopTimeTracking(timeDescription, technicians[0]?.id || '');
                    setTimeDescription('');
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Square className="w-4 h-4" /> Stop
                </button>
              </div>
            ) : (
              <button
                onClick={() => startTimeTracking(selectedTicket.id)}
                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Play className="w-4 h-4" /> Start
              </button>
            )}
          </div>
          {selectedTicket.timeEntries.length > 0 && (
            <div className="space-y-2">
              {selectedTicket.timeEntries.map((entry) => (
                <div key={entry.id} className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{entry.description || 'Work session'}</span>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {entry.endTime
                        ? formatDuration((new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / 60000)
                        : 'In progress...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diagnostic Notes */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-4 h-4" /> Diagnostic Notes
            </h3>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="flex items-center gap-1 px-3 py-1 bg-[#0D9488] text-white rounded hover:bg-[#0F766E]"
            >
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </div>
          {showAddNote && (
            <div className="mb-4 space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={t('tools.iTSupport.enterDiagnosticNote', 'Enter diagnostic note...')}
                className={`w-full p-3 rounded border ${
                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                }`}
                rows={3}
              />
              <button
                onClick={() => {
                  if (newNote.trim()) {
                    addDiagnosticNote(selectedTicket.id, newNote, technicians[0]?.id || '');
                    setNewNote('');
                    setShowAddNote(false);
                  }
                }}
                className="px-4 py-2 bg-[#0D9488] text-white rounded hover:bg-[#0F766E]"
              >
                {t('tools.iTSupport.saveNote', 'Save Note')}
              </button>
            </div>
          )}
          <div className="space-y-2">
            {selectedTicket.diagnosticNotes.map((note) => (
              <div key={note.id} className={`p-3 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{note.note}</p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {new Date(note.date).toLocaleString()} - {technicians.find((t) => t.id === note.technicianId)?.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Parts */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Package className="w-4 h-4" /> Parts
            </h3>
            <button
              onClick={() => setShowAddPart(!showAddPart)}
              className="flex items-center gap-1 px-3 py-1 bg-[#0D9488] text-white rounded hover:bg-[#0F766E]"
            >
              <Plus className="w-4 h-4" /> Add Part
            </button>
          </div>
          {showAddPart && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder={t('tools.iTSupport.partName', 'Part name')}
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="number"
                placeholder={t('tools.iTSupport.cost', 'Cost')}
                value={newPart.cost || ''}
                onChange={(e) => setNewPart({ ...newPart, cost: parseFloat(e.target.value) || 0 })}
                className={`px-3 py-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="number"
                placeholder={t('tools.iTSupport.qty', 'Qty')}
                value={newPart.quantity}
                onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
                className={`px-3 py-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <button
                onClick={() => {
                  if (newPart.name) {
                    addPart(selectedTicket.id, newPart);
                    setNewPart({ name: '', cost: 0, quantity: 1, status: 'ordered' });
                    setShowAddPart(false);
                  }
                }}
                className="px-4 py-2 bg-[#0D9488] text-white rounded hover:bg-[#0F766E]"
              >
                {t('tools.iTSupport.add', 'Add')}
              </button>
            </div>
          )}
          {selectedTicket.parts.length > 0 ? (
            <div className="space-y-2">
              {selectedTicket.parts.map((part) => (
                <div key={part.id} className={`p-3 rounded flex justify-between items-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{part.name}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      ${part.cost.toFixed(2)} x {part.quantity}
                    </p>
                  </div>
                  <select
                    value={part.status}
                    onChange={(e) => {
                      const updatedParts = selectedTicket.parts.map((p) =>
                        p.id === part.id ? { ...p, status: e.target.value as Part['status'] } : p
                      );
                      handleUpdateTicket(selectedTicket.id, { parts: updatedParts });
                    }}
                    className={`px-2 py-1 rounded text-sm ${
                      part.status === 'installed'
                        ? 'bg-green-100 text-green-800'
                        : part.status === 'received'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <option value="ordered">{t('tools.iTSupport.ordered', 'Ordered')}</option>
                    <option value="received">{t('tools.iTSupport.received', 'Received')}</option>
                    <option value="installed">{t('tools.iTSupport.installed', 'Installed')}</option>
                  </select>
                </div>
              ))}
              <div className={`p-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                <p className={`text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Parts Total: ${selectedTicket.parts.reduce((sum, p) => sum + p.cost * p.quantity, 0).toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.iTSupport.noPartsAdded', 'No parts added')}</p>
          )}
        </div>

        {/* Remote Sessions */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <ExternalLink className="w-4 h-4" /> Remote Sessions
            </h3>
            <button
              onClick={() => setShowAddSession(!showAddSession)}
              className="flex items-center gap-1 px-3 py-1 bg-[#0D9488] text-white rounded hover:bg-[#0F766E]"
            >
              <Plus className="w-4 h-4" /> Log Session
            </button>
          </div>
          {showAddSession && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <select
                value={newSession.tool}
                onChange={(e) => setNewSession({ ...newSession, tool: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="TeamViewer">{t('tools.iTSupport.teamviewer', 'TeamViewer')}</option>
                <option value="AnyDesk">{t('tools.iTSupport.anydesk', 'AnyDesk')}</option>
                <option value="Chrome Remote">{t('tools.iTSupport.chromeRemote', 'Chrome Remote')}</option>
                <option value="RDP">{t('tools.iTSupport.rdp', 'RDP')}</option>
                <option value="Other">{t('tools.iTSupport.other', 'Other')}</option>
              </select>
              <input
                type="number"
                placeholder={t('tools.iTSupport.durationMin', 'Duration (min)')}
                value={newSession.duration}
                onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) || 0 })}
                className={`px-3 py-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                placeholder={t('tools.iTSupport.notes', 'Notes')}
                value={newSession.notes}
                onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                className={`px-3 py-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <button
                onClick={() => {
                  addRemoteSession(selectedTicket.id, newSession);
                  setNewSession({ date: new Date(), duration: 30, tool: 'TeamViewer', notes: '', technicianId: technicians[0]?.id || '' });
                  setShowAddSession(false);
                }}
                className="px-4 py-2 bg-[#0D9488] text-white rounded hover:bg-[#0F766E]"
              >
                {t('tools.iTSupport.add2', 'Add')}
              </button>
            </div>
          )}
          {selectedTicket.remoteSessions.length > 0 ? (
            <div className="space-y-2">
              {selectedTicket.remoteSessions.map((session) => (
                <div key={session.id} className={`p-3 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div className="flex justify-between">
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{session.tool}</span>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{session.duration} min</span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{session.notes}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {new Date(session.date).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.iTSupport.noRemoteSessionsLogged', 'No remote sessions logged')}</p>
          )}
        </div>

        {/* Pricing Summary */}
        <div className={`mt-6 p-4 rounded-lg border-2 border-[#0D9488] ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4" /> Pricing Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.iTSupport.pricingType', 'Pricing Type:')}</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedTicket.pricing.type === 'flat' ? t('tools.iTSupport.flatRate4', 'Flat Rate') : t('tools.iTSupport.hourly', 'Hourly')}
              </span>
            </div>
            {selectedTicket.pricing.type === 'hourly' && (
              <>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.iTSupport.laborRate', 'Labor Rate:')}</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${selectedTicket.pricing.laborRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.iTSupport.timeWorked', 'Time Worked:')}</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatDuration(totalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.iTSupport.laborTotal', 'Labor Total:')}</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    ${((totalTime / 60) * selectedTicket.pricing.laborRate).toFixed(2)}
                  </span>
                </div>
              </>
            )}
            {selectedTicket.pricing.type === 'flat' && (
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.iTSupport.flatRate', 'Flat Rate:')}</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${selectedTicket.pricing.flatRate?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.iTSupport.partsTotal', 'Parts Total:')}</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                ${selectedTicket.parts.reduce((sum, p) => sum + p.cost * p.quantity, 0).toFixed(2)}
              </span>
            </div>
            {selectedTicket.pricing.discount && selectedTicket.pricing.discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>{t('tools.iTSupport.discount', 'Discount:')}</span>
                <span>-{selectedTicket.pricing.discount}%</span>
              </div>
            )}
            <div className={`flex justify-between pt-2 border-t text-lg font-bold ${theme === 'dark' ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-900'}`}>
              <span>{t('tools.iTSupport.total', 'Total:')}</span>
              <span className="text-[#0D9488]">${calculateTotalCost(selectedTicket).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBenchQueue = () => (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Bench Queue ({benchQueue.length} devices)
        </h3>
        {benchQueue.length === 0 ? (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.iTSupport.noDevicesInQueue', 'No devices in queue')}</p>
        ) : (
          <div className="space-y-3">
            {benchQueue.map((ticket, index) => {
              const DeviceIcon = deviceTypeIcons[ticket.device.type];
              return (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-lg flex items-center gap-4 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    ticket.priority === 'critical' ? 'bg-red-500 text-white' :
                    ticket.priority === 'high' ? 'bg-orange-500 text-white' :
                    theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <DeviceIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {ticket.ticketNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${statusColors[ticket.status]}`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {ticket.customer.name} - {ticket.device.brand} {ticket.device.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {technicians.find((t) => t.id === ticket.assignedTechnician)?.name || 'Unassigned'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setActiveView('tickets');
                    }}
                    className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderCreateTicket = () => (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
      <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.iTSupport.createNewTicket', 'Create New Ticket')}</h2>

      <div className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <User className="w-4 h-4" /> Customer Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.name2', 'Name *')}
              </label>
              <input
                type="text"
                value={newTicket.customer?.name || ''}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    customer: { ...newTicket.customer!, name: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.email', 'Email')}
              </label>
              <input
                type="email"
                value={newTicket.customer?.email || ''}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    customer: { ...newTicket.customer!, email: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.phone', 'Phone')}
              </label>
              <input
                type="tel"
                value={newTicket.customer?.phone || ''}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    customer: { ...newTicket.customer!, phone: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.company2', 'Company')}
              </label>
              <input
                type="text"
                value={newTicket.customer?.company || ''}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    customer: { ...newTicket.customer!, company: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Device Information */}
        <div>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Monitor className="w-4 h-4" /> Device Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.deviceType', 'Device Type')}
              </label>
              <select
                value={newTicket.device?.type || 'laptop'}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    device: { ...newTicket.device!, type: e.target.value as DeviceInfo['type'] },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              >
                <option value="desktop">{t('tools.iTSupport.desktop', 'Desktop')}</option>
                <option value="laptop">{t('tools.iTSupport.laptop', 'Laptop')}</option>
                <option value="smartphone">{t('tools.iTSupport.smartphone', 'Smartphone')}</option>
                <option value="tablet">{t('tools.iTSupport.tablet', 'Tablet')}</option>
                <option value="printer">{t('tools.iTSupport.printer', 'Printer')}</option>
                <option value="server">{t('tools.iTSupport.server', 'Server')}</option>
                <option value="network">{t('tools.iTSupport.networkDevice', 'Network Device')}</option>
                <option value="other">{t('tools.iTSupport.other2', 'Other')}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.brand', 'Brand')}
              </label>
              <input
                type="text"
                value={newTicket.device?.brand || ''}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    device: { ...newTicket.device!, brand: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.model', 'Model')}
              </label>
              <input
                type="text"
                value={newTicket.device?.model || ''}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    device: { ...newTicket.device!, model: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.serialNumber', 'Serial Number')}
              </label>
              <input
                type="text"
                value={newTicket.device?.serialNumber || ''}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    device: { ...newTicket.device!, serialNumber: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.operatingSystem', 'Operating System')}
              </label>
              <input
                type="text"
                value={newTicket.device?.operatingSystem || ''}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    device: { ...newTicket.device!, operatingSystem: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.devicePassword', 'Device Password')}
              </label>
              <input
                type="text"
                value={newTicket.device?.password || ''}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    device: { ...newTicket.device!, password: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Intake Checklist */}
        <div>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <ClipboardList className="w-4 h-4" /> Intake Checklist
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { key: 'physicalDamage', label: 'Physical Damage Present' },
              { key: 'powersTurnOn', label: 'Powers On' },
              { key: 'hasCharger', label: 'Charger Included' },
              { key: 'hasCase', label: 'Case Included' },
              { key: 'dataBackedUp', label: 'Data Backed Up' },
              { key: 'customerAwareOfDataRisk', label: 'Customer Aware of Data Risk' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(newTicket.intakeChecklist as Record<string, boolean>)?.[item.key] || false}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      intakeChecklist: {
                        ...newTicket.intakeChecklist!,
                        [item.key]: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Issue Details */}
        <div>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FileText className="w-4 h-4" /> Issue Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.issueDescription', 'Issue Description *')}
              </label>
              <textarea
                value={newTicket.issue || ''}
                onChange={(e) => setNewTicket({ ...newTicket, issue: e.target.value })}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
                placeholder={t('tools.iTSupport.describeTheIssueInDetail', 'Describe the issue in detail...')}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.iTSupport.repairType', 'Repair Type')}
                </label>
                <select
                  value={newTicket.repairType || 'software'}
                  onChange={(e) => setNewTicket({ ...newTicket, repairType: e.target.value as Ticket['repairType'] })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
                >
                  {Object.entries(repairTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.iTSupport.priority', 'Priority')}
                </label>
                <select
                  value={newTicket.priority || 'medium'}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as Ticket['priority'] })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
                >
                  <option value="low">{t('tools.iTSupport.low2', 'Low')}</option>
                  <option value="medium">{t('tools.iTSupport.medium2', 'Medium')}</option>
                  <option value="high">{t('tools.iTSupport.high2', 'High')}</option>
                  <option value="critical">{t('tools.iTSupport.critical2', 'Critical')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SLA */}
        <div>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Shield className="w-4 h-4" /> Service Level Agreement
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.slaType', 'SLA Type')}
              </label>
              <select
                value={newTicket.sla?.type || 'standard'}
                onChange={(e) => {
                  const type = e.target.value as SLA['type'];
                  const slaDefaults = {
                    standard: { responseTime: 24, resolutionTime: 72 },
                    priority: { responseTime: 4, resolutionTime: 24 },
                    enterprise: { responseTime: 1, resolutionTime: 8 },
                  };
                  setNewTicket({
                    ...newTicket,
                    sla: { type, ...slaDefaults[type] },
                  });
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              >
                <option value="standard">{t('tools.iTSupport.standard24h72h', 'Standard (24h / 72h)')}</option>
                <option value="priority">{t('tools.iTSupport.priority4h24h', 'Priority (4h / 24h)')}</option>
                <option value="enterprise">{t('tools.iTSupport.enterprise1h8h', 'Enterprise (1h / 8h)')}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.responseTimeHours', 'Response Time (hours)')}
              </label>
              <input
                type="number"
                value={newTicket.sla?.responseTime || 24}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    sla: { ...newTicket.sla!, responseTime: parseInt(e.target.value) || 24 },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.resolutionTimeHours', 'Resolution Time (hours)')}
              </label>
              <input
                type="number"
                value={newTicket.sla?.resolutionTime || 72}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    sla: { ...newTicket.sla!, resolutionTime: parseInt(e.target.value) || 72 },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4" /> Pricing
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.pricingType2', 'Pricing Type')}
              </label>
              <select
                value={newTicket.pricing?.type || 'hourly'}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    pricing: { ...newTicket.pricing!, type: e.target.value as 'flat' | 'hourly' },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              >
                <option value="hourly">{t('tools.iTSupport.hourlyRate', 'Hourly Rate')}</option>
                <option value="flat">{t('tools.iTSupport.flatRate2', 'Flat Rate')}</option>
              </select>
            </div>
            {newTicket.pricing?.type === 'hourly' ? (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.iTSupport.laborRateHr', 'Labor Rate ($/hr)')}
                </label>
                <input
                  type="number"
                  value={newTicket.pricing?.laborRate || 75}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      pricing: { ...newTicket.pricing!, laborRate: parseFloat(e.target.value) || 75 },
                    })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
                />
              </div>
            ) : (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.iTSupport.flatRate3', 'Flat Rate ($)')}
                </label>
                <input
                  type="number"
                  value={newTicket.pricing?.flatRate || 0}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      pricing: { ...newTicket.pricing!, flatRate: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
                />
              </div>
            )}
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.iTSupport.discount2', 'Discount (%)')}
              </label>
              <input
                type="number"
                value={newTicket.pricing?.discount || 0}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    pricing: { ...newTicket.pricing!, discount: parseFloat(e.target.value) || 0 },
                  })
                }
                min="0"
                max="100"
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Warranty */}
        <div>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Shield className="w-4 h-4" /> Warranty Information
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newTicket.warranty?.hasWarranty || false}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    warranty: { ...newTicket.warranty!, hasWarranty: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.iTSupport.deviceHasWarranty', 'Device has warranty')}</span>
            </label>
            {newTicket.warranty?.hasWarranty && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.iTSupport.warrantyType', 'Warranty Type')}
                  </label>
                  <select
                    value={newTicket.warranty?.warrantyType || 'manufacturer'}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        warranty: { ...newTicket.warranty!, warrantyType: e.target.value as Warranty['warrantyType'] },
                      })
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
                  >
                    <option value="manufacturer">{t('tools.iTSupport.manufacturer', 'Manufacturer')}</option>
                    <option value="extended">{t('tools.iTSupport.extended', 'Extended')}</option>
                    <option value="in-house">{t('tools.iTSupport.inHouse', 'In-House')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.iTSupport.coverage', 'Coverage')}
                  </label>
                  <input
                    type="text"
                    value={newTicket.warranty?.coverage || ''}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        warranty: { ...newTicket.warranty!, coverage: e.target.value },
                      })
                    }
                    placeholder={t('tools.iTSupport.eGPartsAndLabor', 'e.g., Parts and labor')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-[#0D9488] focus:outline-none`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={createTicket}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            {t('tools.iTSupport.createTicket', 'Create Ticket')}
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('tools.iTSupport.cancel', 'Cancel')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.iTSupport.itSupportManagement', 'IT Support Management')}
            </h1>
          </div>

          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.iTSupport.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Monitor },
                { id: 'tickets', label: 'Tickets', icon: ClipboardList },
                { id: 'queue', label: 'Bench Queue', icon: Users },
                { id: 'create', label: 'New Ticket', icon: Plus },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveView(id as typeof activeView);
                    if (id !== 'tickets') setSelectedTicket(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === id
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="i-t-support" toolName="I T Support" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme === 'dark' ? 'dark' : 'light'}
                showLabel
                size="sm"
              />
              <ExportDropdown
                onExportCSV={exportTicketsCSV}
                onExportExcel={exportTicketsExcel}
                onExportJSON={exportTicketsJSON}
                onExportPDF={exportTicketsPDF}
                onPrint={() => printData(exportData, ticketColumns, { title: 'IT Support Tickets Report' })}
                onCopyToClipboard={async () => copyUtil(exportData, ticketColumns)}
                disabled={tickets.length === 0}
                showImport={false}
                theme={theme === 'dark' ? 'dark' : 'light'}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className={`${selectedTicket && activeView === 'tickets' ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            {activeView === 'dashboard' && renderDashboard()}
            {activeView === 'tickets' && renderTicketList()}
            {activeView === 'queue' && renderBenchQueue()}
            {activeView === 'create' && renderCreateTicket()}
          </div>
          {selectedTicket && activeView === 'tickets' && (
            <div className="lg:col-span-2">{renderTicketDetail()}</div>
          )}
        </div>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{validationMessage}</span>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ITSupportTool;
