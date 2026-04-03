'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData, { type UseToolDataReturn } from '../../hooks/useToolData';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ServiceTicketToolProps {
  uiConfig?: UIConfig;
}

// TypeScript interfaces
interface ServiceTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  equipmentId: string;
  equipmentName: string;
  serviceType: 'tune' | 'wax' | 'mount' | 'binding-adjustment' | 'repair' | 'boot-fitting';
  status: 'pending' | 'in-progress' | 'completed' | 'awaiting-pickup';
  priority: 'low' | 'normal' | 'high' | 'rush';
  estimatedCost: number;
  actualCost: number;
  createdAt: string;
  completedAt: string;
  notes: string;
}

type ServiceType = ServiceTicket['serviceType'];
type TicketStatus = ServiceTicket['status'];
type PriorityLevel = ServiceTicket['priority'];
type TabType = 'tickets' | 'reports';

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'tune', label: 'Tune Up' },
  { value: 'wax', label: 'Wax Service' },
  { value: 'mount', label: 'Binding Mount' },
  { value: 'binding-adjustment', label: 'Binding Adjustment' },
  { value: 'repair', label: 'Repair' },
  { value: 'boot-fitting', label: 'Boot Fitting' },
];

const TICKET_STATUSES: { value: TicketStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'awaiting-pickup', label: 'Awaiting Pickup', color: 'orange' },
];

const PRIORITY_LEVELS: { value: PriorityLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'rush', label: 'Rush', color: 'red' },
];

// Column configurations for export
const ticketColumns: ColumnConfig[] = [
  { key: 'ticketNumber', header: 'Ticket #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'equipmentName', header: 'Equipment', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
  { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'completedAt', header: 'Completed', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Generate sample data
const generateSampleTickets = (): ServiceTicket[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  const tomorrow = new Date(now.getTime() + 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  return [
    {
      id: 'ticket-1',
      ticketNumber: 'SVT-2025-001',
      customerId: 'cust-1',
      customerName: 'John Anderson',
      equipmentId: 'eq-1',
      equipmentName: 'K2 Skis',
      serviceType: 'tune',
      status: 'completed',
      priority: 'normal',
      estimatedCost: 75,
      actualCost: 75,
      createdAt: twoWeeksAgo.toISOString(),
      completedAt: yesterday.toISOString(),
      notes: 'Edge tune and wax service',
    },
    {
      id: 'ticket-2',
      ticketNumber: 'SVT-2025-002',
      customerId: 'cust-2',
      customerName: 'Sarah Mitchell',
      equipmentId: 'eq-2',
      equipmentName: 'Salomon Boots',
      serviceType: 'boot-fitting',
      status: 'in-progress',
      priority: 'high',
      estimatedCost: 50,
      actualCost: 0,
      createdAt: now.toISOString(),
      completedAt: '',
      notes: 'Custom insole fitting required',
    },
    {
      id: 'ticket-3',
      ticketNumber: 'SVT-2025-003',
      customerId: 'cust-3',
      customerName: 'Michael Chen',
      equipmentId: 'eq-3',
      equipmentName: 'Burton Snowboard',
      serviceType: 'repair',
      status: 'pending',
      priority: 'rush',
      estimatedCost: 120,
      actualCost: 0,
      createdAt: now.toISOString(),
      completedAt: '',
      notes: 'Delamination repair on base',
    },
    {
      id: 'ticket-4',
      ticketNumber: 'SVT-2025-004',
      customerId: 'cust-4',
      customerName: 'Emma Rodriguez',
      equipmentId: 'eq-4',
      equipmentName: 'Rossignol Skis',
      serviceType: 'binding-adjustment',
      status: 'awaiting-pickup',
      priority: 'normal',
      estimatedCost: 45,
      actualCost: 45,
      createdAt: yesterday.toISOString(),
      completedAt: now.toISOString(),
      notes: 'DIN settings adjusted per customer request',
    },
    {
      id: 'ticket-5',
      ticketNumber: 'SVT-2025-005',
      customerId: 'cust-5',
      customerName: 'Robert Thompson',
      equipmentId: 'eq-5',
      equipmentName: 'Atomic Boots',
      serviceType: 'wax',
      status: 'pending',
      priority: 'low',
      estimatedCost: 35,
      actualCost: 0,
      createdAt: tomorrow.toISOString(),
      completedAt: '',
      notes: 'Full wax service',
    },
  ];
};

export const ServiceTicketTool: React.FC<ServiceTicketToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize hook for service tickets with backend sync
  const ticketsData = useToolData<ServiceTicket>(
    'service-tickets',
    generateSampleTickets(),
    ticketColumns,
    { autoSave: true }
  );

  // Use data from hook
  const tickets = ticketsData.data;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<ServiceTicket | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | ''>('');
  const [filterServiceType, setFilterServiceType] = useState<ServiceType | ''>('');

  // New ticket form
  const [newTicket, setNewTicket] = useState<Partial<ServiceTicket>>({
    customerId: '',
    customerName: '',
    equipmentId: '',
    equipmentName: '',
    serviceType: 'tune',
    status: 'pending',
    priority: 'normal',
    estimatedCost: 0,
    actualCost: 0,
    notes: '',
  });

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description || params.firstName || params.lastName) {
        setNewTicket(prev => ({
          ...prev,
          customerName: params.firstName && params.lastName
            ? `${params.firstName} ${params.lastName}`
            : params.title || prev.customerName,
          equipmentName: params.description || prev.equipmentName,
          notes: params.description || prev.notes,
        }));
        setShowForm(true);
        setActiveTab('tickets');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Generate next ticket number
  const getNextTicketNumber = (): string => {
    if (tickets.length === 0) return 'SVT-2025-001';
    const lastTicket = tickets[tickets.length - 1];
    const match = lastTicket.ticketNumber.match(/SVT-\d+-(\d+)/);
    if (match) {
      const num = parseInt(match[1]) + 1;
      return `SVT-${new Date().getFullYear()}-${String(num).padStart(3, '0')}`;
    }
    return `SVT-${new Date().getFullYear()}-001`;
  };

  // CRUD handlers
  const handleAddTicket = () => {
    if (!newTicket.customerName || !newTicket.equipmentName || !newTicket.serviceType) return;

    const ticket: ServiceTicket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: getNextTicketNumber(),
      customerId: newTicket.customerId || `cust-${Date.now()}`,
      customerName: newTicket.customerName || '',
      equipmentId: newTicket.equipmentId || `eq-${Date.now()}`,
      equipmentName: newTicket.equipmentName || '',
      serviceType: newTicket.serviceType as ServiceType || 'tune',
      status: newTicket.status as TicketStatus || 'pending',
      priority: newTicket.priority as PriorityLevel || 'normal',
      estimatedCost: newTicket.estimatedCost || 0,
      actualCost: newTicket.actualCost || 0,
      createdAt: new Date().toISOString(),
      completedAt: '',
      notes: newTicket.notes || '',
    };

    ticketsData.addItem(ticket);
    setNewTicket({
      customerId: '',
      customerName: '',
      equipmentId: '',
      equipmentName: '',
      serviceType: 'tune',
      status: 'pending',
      priority: 'normal',
      estimatedCost: 0,
      actualCost: 0,
      notes: '',
    });
    setShowForm(false);
  };

  const handleUpdateTicket = () => {
    if (!editingTicket) return;
    ticketsData.updateItem(editingTicket.id, editingTicket);
    setEditingTicket(null);
  };

  const handleDeleteTicket = async (id: string) => {
    const result = await confirm('Are you sure you want to delete this service ticket?');
    if (result) {
      ticketsData.deleteItem(id);
    }
  };

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    const updatedData: Partial<ServiceTicket> = {
      status: newStatus,
    };
    if (newStatus === 'completed') {
      updatedData.completedAt = new Date().toISOString();
    }
    ticketsData.updateItem(ticketId, updatedData);
  };

  // Reset all data
  const handleReset = async () => {
    const result = await confirm('Are you sure you want to reset all data? This will load sample data.');
    if (result) {
      ticketsData.resetToDefault(generateSampleTickets());
    }
  };

  // Export handlers using hook methods
  const handleExportCSV = () => {
    ticketsData.exportCSV({ filename: 'service-tickets' });
  };

  const handleExportExcel = () => {
    ticketsData.exportExcel({ filename: 'service-tickets' });
  };

  const handleExportJSON = () => {
    ticketsData.exportJSON({ filename: 'service-tickets-full' });
  };

  const handleExportPDF = async () => {
    await ticketsData.exportPDF({
      filename: 'service-tickets',
      title: 'Service Tickets Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      orientation: 'landscape'
    });
  };

  const handlePrint = () => {
    ticketsData.print('Service Tickets Report');
  };

  const handleCopyToClipboard = async () => {
    return ticketsData.copyToClipboard('tab');
  };

  const handleImportCSV = async (file: File) => {
    const result = await ticketsData.importCSV(file);
    if (result.success) {
      setValidationMessage(`Successfully imported ${result.rowCount} tickets!`);
      setTimeout(() => setValidationMessage(null), 3000);
    } else {
      setValidationMessage('Failed to import CSV file');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleImportJSON = async (file: File) => {
    const result = await ticketsData.importJSON(file);
    if (result.success) {
      setValidationMessage('Successfully imported tickets!');
      setTimeout(() => setValidationMessage(null), 3000);
    } else {
      setValidationMessage('Failed to import JSON file');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  // Filtered data
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (!ticket.customerName.toLowerCase().includes(searchLower) &&
            !ticket.ticketNumber.toLowerCase().includes(searchLower) &&
            !ticket.equipmentName.toLowerCase().includes(searchLower)) return false;
      }
      if (filterStatus && ticket.status !== filterStatus) return false;
      if (filterPriority && ticket.priority !== filterPriority) return false;
      if (filterServiceType && ticket.serviceType !== filterServiceType) return false;
      return true;
    });
  }, [tickets, searchQuery, filterStatus, filterPriority, filterServiceType]);

  // Reports calculations
  const reports = useMemo(() => {
    const totalTickets = tickets.length;
    const completedTickets = tickets.filter(t => t.status === 'completed').length;
    const pendingTickets = tickets.filter(t => t.status === 'pending').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;

    const totalRevenue = tickets
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.actualCost || 0), 0);

    const estimatedRevenue = tickets
      .filter(t => t.status !== 'completed')
      .reduce((sum, t) => sum + (t.estimatedCost || 0), 0);

    const statusCounts = TICKET_STATUSES.reduce((acc, status) => {
      acc[status.value] = tickets.filter(t => t.status === status.value).length;
      return acc;
    }, {} as Record<TicketStatus, number>);

    const serviceCounts = SERVICE_TYPES.reduce((acc, service) => {
      acc[service.value] = tickets.filter(t => t.serviceType === service.value).length;
      return acc;
    }, {} as Record<ServiceType, number>);

    const avgCompletionTime = completedTickets > 0
      ? Math.round(
          tickets
            .filter(t => t.status === 'completed' && t.completedAt)
            .reduce((sum, t) => {
              const created = new Date(t.createdAt).getTime();
              const completed = new Date(t.completedAt).getTime();
              return sum + (completed - created);
            }, 0) / completedTickets / (1000 * 60 * 60)
        )
      : 0;

    return {
      totalTickets,
      completedTickets,
      pendingTickets,
      inProgressTickets,
      totalRevenue,
      estimatedRevenue,
      statusCounts,
      serviceCounts,
      avgCompletionTime,
      completionRate: totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0,
    };
  }, [tickets]);

  // Styling classes
  const inputClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const tabClass = (tab: TabType) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    activeTab === tab
      ? 'bg-[#0D9488] text-white'
      : isDark
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;

  const getStatusColor = (status: TicketStatus) => {
    const statusInfo = TICKET_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      green: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      orange: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
    };
    return colors[statusInfo?.color || 'gray'];
  };

  const getPriorityColor = (priority: PriorityLevel) => {
    const priorityInfo = PRIORITY_LEVELS.find(p => p.value === priority);
    const colors: Record<string, string> = {
      gray: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
      blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      orange: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
      red: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    };
    return colors[priorityInfo?.color || 'gray'];
  };

  const getServiceTypeLabel = (type: ServiceType) => {
    return SERVICE_TYPES.find(t => t.value === type)?.label || type;
  };

  // Render Ticket Form
  const renderTicketForm = (ticket: Partial<ServiceTicket>, isEditing: boolean = false) => {
    const setTicketData = isEditing
      ? (updates: Partial<ServiceTicket>) => setEditingTicket({ ...editingTicket!, ...updates })
      : (updates: Partial<ServiceTicket>) => setNewTicket({ ...newTicket, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.serviceTicket.customerName', 'Customer Name *')}
            </label>
            <input
              type="text"
              value={ticket.customerName || ''}
              onChange={(e) => setTicketData({ customerName: e.target.value })}
              placeholder={t('tools.serviceTicket.fullName', 'Full name')}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.serviceTicket.equipmentName', 'Equipment Name *')}
            </label>
            <input
              type="text"
              value={ticket.equipmentName || ''}
              onChange={(e) => setTicketData({ equipmentName: e.target.value })}
              placeholder={t('tools.serviceTicket.eGK2SkisBurton', 'e.g., K2 Skis, Burton Snowboard')}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.serviceTicket.serviceType3', 'Service Type *')}
            </label>
            <select
              value={ticket.serviceType || 'tune'}
              onChange={(e) => setTicketData({ serviceType: e.target.value as ServiceType })}
              className={inputClass}
            >
              {SERVICE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.serviceTicket.priority', 'Priority')}
            </label>
            <select
              value={ticket.priority || 'normal'}
              onChange={(e) => setTicketData({ priority: e.target.value as PriorityLevel })}
              className={inputClass}
            >
              {PRIORITY_LEVELS.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.serviceTicket.status', 'Status')}
            </label>
            <select
              value={ticket.status || 'pending'}
              onChange={(e) => setTicketData({ status: e.target.value as TicketStatus })}
              className={inputClass}
            >
              {TICKET_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.serviceTicket.estimatedCost', 'Estimated Cost ($)')}
            </label>
            <input
              type="number"
              value={ticket.estimatedCost || ''}
              onChange={(e) => setTicketData({ estimatedCost: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.serviceTicket.actualCost', 'Actual Cost ($)')}
            </label>
            <input
              type="number"
              value={ticket.actualCost || ''}
              onChange={(e) => setTicketData({ actualCost: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.serviceTicket.notes', 'Notes')}
          </label>
          <textarea
            value={ticket.notes || ''}
            onChange={(e) => setTicketData({ notes: e.target.value })}
            placeholder={t('tools.serviceTicket.additionalNotesOrSpecialRequests', 'Additional notes or special requests...')}
            rows={3}
            className={inputClass}
          />
        </div>
      </div>
    );
  };

  // Render Tickets Tab
  const renderTicketsTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.serviceTicket.searchTicketsCustomers', 'Search tickets, customers...')}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TicketStatus | '')}
          className={`${inputClass} w-auto`}
        >
          <option value="">{t('tools.serviceTicket.allStatuses', 'All Statuses')}</option>
          {TICKET_STATUSES.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as PriorityLevel | '')}
          className={`${inputClass} w-auto`}
        >
          <option value="">{t('tools.serviceTicket.allPriorities', 'All Priorities')}</option>
          {PRIORITY_LEVELS.map(priority => (
            <option key={priority.value} value={priority.value}>{priority.label}</option>
          ))}
        </select>
        <select
          value={filterServiceType}
          onChange={(e) => setFilterServiceType(e.target.value as ServiceType | '')}
          className={`${inputClass} w-auto`}
        >
          <option value="">{t('tools.serviceTicket.allServices', 'All Services')}</option>
          {SERVICE_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('tools.serviceTicket.newTicket', 'New Ticket')}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showForm || editingTicket) && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingTicket ? t('tools.serviceTicket.editServiceTicket', 'Edit Service Ticket') : t('tools.serviceTicket.createNewServiceTicket', 'Create New Service Ticket')}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingTicket(null);
              }}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          {renderTicketForm(editingTicket || newTicket, !!editingTicket)}
          <div className="flex gap-3 mt-4">
            <button
              onClick={editingTicket ? handleUpdateTicket : handleAddTicket}
              disabled={!((editingTicket || newTicket).customerName && (editingTicket || newTicket).equipmentName)}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {editingTicket ? t('tools.serviceTicket.updateTicket', 'Update Ticket') : t('tools.serviceTicket.createTicket', 'Create Ticket')}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingTicket(null);
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.serviceTicket.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map(ticket => (
          <div key={ticket.id} className={cardClass}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {ticket.ticketNumber}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                    {TICKET_STATUSES.find(s => s.value === ticket.status)?.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                    {PRIORITY_LEVELS.find(p => p.value === ticket.priority)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-2">
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.serviceTicket.customer', 'Customer')}</span>
                    <p className="font-medium">{ticket.customerName}</p>
                  </div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.serviceTicket.equipment', 'Equipment')}</span>
                    <p className="font-medium">{ticket.equipmentName}</p>
                  </div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.serviceTicket.serviceType', 'Service Type')}</span>
                    <p className="font-medium">{getServiceTypeLabel(ticket.serviceType)}</p>
                  </div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.serviceTicket.created', 'Created')}</span>
                    <p className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Est: ${ticket.estimatedCost.toFixed(2)}
                    </span>
                  </div>
                  {ticket.actualCost > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className="text-[#0D9488] font-medium">
                        Actual: ${ticket.actualCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {ticket.notes && (
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Notes: {ticket.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                {/* Quick Status Actions */}
                {ticket.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(ticket.id, 'in-progress')}
                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                    title={t('tools.serviceTicket.startWork', 'Start Work')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                {ticket.status === 'in-progress' && (
                  <button
                    onClick={() => handleStatusChange(ticket.id, 'completed')}
                    className="p-2 rounded-lg text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20"
                    title={t('tools.serviceTicket.complete', 'Complete')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                {ticket.status === 'completed' && (
                  <button
                    onClick={() => handleStatusChange(ticket.id, 'awaiting-pickup')}
                    className="p-2 rounded-lg text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                    title={t('tools.serviceTicket.awaitingPickup', 'Awaiting Pickup')}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditingTicket(ticket)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={() => handleDeleteTicket(ticket.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className={`text-center py-12 ${cardClass}`}>
          <Wrench className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {t('tools.serviceTicket.noServiceTicketsFoundCreate', 'No service tickets found. Create your first ticket to get started.')}
          </p>
        </div>
      )}
    </div>
  );

  // Render Reports Tab
  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0D9488]/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-[#0D9488]" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceTicket.totalTickets', 'Total Tickets')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {reports.totalTickets}
              </p>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceTicket.completed', 'Completed')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {reports.completedTickets} ({reports.completionRate}%)
              </p>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceTicket.inProgress', 'In Progress')}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {reports.inProgressTickets}
              </p>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceTicket.totalRevenue', 'Total Revenue')}</p>
              <p className="text-2xl font-bold text-green-500">
                ${reports.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.serviceTicket.ticketStatusDistribution', 'Ticket Status Distribution')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TICKET_STATUSES.map(status => (
            <div key={status.value} className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                status.color === 'yellow' ? 'text-yellow-500' :
                status.color === 'blue' ? 'text-blue-500' :
                status.color === 'green' ? 'text-green-500' :
                status.color === 'orange' ? 'text-orange-500' :
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {reports.statusCounts[status.value] || 0}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {status.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Type Distribution */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.serviceTicket.serviceTypeDistribution', 'Service Type Distribution')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceTicket.serviceType2', 'Service Type')}</th>
                <th className={`text-right py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.serviceTicket.count', 'Count')}</th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_TYPES.map(type => (
                <tr key={type.value} className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-100'}>
                  <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {type.label}
                  </td>
                  <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {reports.serviceCounts[type.value] || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={cardClass}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.serviceTicket.pendingTickets', 'Pending Tickets')}
          </h3>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {reports.pendingTickets}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
            {t('tools.serviceTicket.awaitingWorkToStart', 'Awaiting work to start')}
          </p>
        </div>

        <div className={cardClass}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.serviceTicket.estimatedRevenue', 'Estimated Revenue')}
          </h3>
          <p className="text-3xl font-bold text-orange-500">
            ${reports.estimatedRevenue.toFixed(2)}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
            {t('tools.serviceTicket.fromPendingInProgress', 'From pending & in-progress')}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.serviceTicket.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                <Wrench className="w-6 h-6 text-[#0D9488]" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.serviceTicket.serviceTicketManagement', 'Service Ticket Management')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.serviceTicket.trackAndManageServiceRequests', 'Track and manage service requests')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="service-ticket" toolName="Service Ticket" />

              <SyncStatus
                isSynced={ticketsData.isSynced}
                isSaving={ticketsData.isSaving}
                lastSaved={ticketsData.lastSaved}
                syncError={ticketsData.syncError}
                onForceSync={() => ticketsData.forceSync()}
                theme={isDark ? 'dark' : 'light'}
                showLabel={true}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                onImportCSV={handleImportCSV}
                onImportJSON={handleImportJSON}
                theme={isDark ? 'dark' : 'light'}
              />
              <button
                onClick={handleReset}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                  isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {t('tools.serviceTicket.reset', 'Reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('tickets')} className={tabClass('tickets')}>
            <Wrench className="w-4 h-4 inline mr-2" />
            Tickets ({tickets.length})
          </button>
          <button onClick={() => setActiveTab('reports')} className={tabClass('reports')}>
            <BarChart3 className="w-4 h-4 inline mr-2" />
            {t('tools.serviceTicket.reports', 'Reports')}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'tickets' && renderTicketsTab()}
        {activeTab === 'reports' && renderReportsTab()}

        {/* Validation Toast */}
        {validationMessage && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white animate-fade-in-out ${
            validationMessage.includes('Successfully') || validationMessage.includes('imported')
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}>
            {validationMessage}
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default ServiceTicketTool;
