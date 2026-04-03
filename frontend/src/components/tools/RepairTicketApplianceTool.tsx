'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
} from '../../lib/toolDataUtils';
import {
  Ticket,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  AlertCircle,
  ClipboardList,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Sparkles,
  Edit3,
  Filter,
  Tag,
  MessageSquare,
  History,
  Loader2,
  Settings,
} from 'lucide-react';

// Types
interface TicketNote {
  id: string;
  date: string;
  author: string;
  content: string;
  type: 'note' | 'update' | 'customer-contact';
}

interface RepairTicket {
  id: string;
  ticketNumber: string;
  createdAt: string;
  updatedAt: string;
  // Customer Information
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  // Appliance Details
  applianceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  // Issue Details
  issueCategory: string;
  issueDescription: string;
  reportedSymptoms: string[];
  // Priority & Status
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in-progress' | 'pending-parts' | 'scheduled' | 'completed' | 'cancelled';
  // Assignment
  assignedTechId: string;
  assignedTechName: string;
  // Scheduling
  scheduledDate: string;
  scheduledTimeSlot: string;
  estimatedDuration: number;
  // Resolution
  resolutionNotes: string;
  completedDate: string;
  // Notes & History
  notes: TicketNote[];
  // Tags
  tags: string[];
}

// Constants
const APPLIANCE_TYPES = [
  'Refrigerator',
  'Washing Machine',
  'Dryer',
  'Dishwasher',
  'Oven/Range',
  'Microwave',
  'Air Conditioner',
  'Freezer',
  'Garbage Disposal',
  'Ice Maker',
  'Water Heater',
  'HVAC System',
  'Other',
];

const ISSUE_CATEGORIES = [
  'Not Working',
  'Strange Noise',
  'Leaking Water',
  'Not Cooling',
  'Not Heating',
  'Electrical Issue',
  'Control Panel Issue',
  'Door/Seal Problem',
  'Drainage Issue',
  'Ice/Frost Buildup',
  'Performance Issue',
  'Error Code Display',
  'Other',
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'yellow' },
  { value: 'assigned', label: 'Assigned', color: 'blue' },
  { value: 'in-progress', label: 'In Progress', color: 'purple' },
  { value: 'pending-parts', label: 'Pending Parts', color: 'orange' },
  { value: 'scheduled', label: 'Scheduled', color: 'cyan' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const TIME_SLOTS = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
];

const TECHNICIANS = [
  { id: 'tech-001', name: 'John Smith', specialties: ['HVAC', 'Refrigeration'] },
  { id: 'tech-002', name: 'Maria Garcia', specialties: ['Washers', 'Dryers'] },
  { id: 'tech-003', name: 'David Johnson', specialties: ['General Appliances'] },
  { id: 'tech-004', name: 'Sarah Williams', specialties: ['Electronics', 'Control Boards'] },
];

const COMMON_SYMPTOMS = [
  'Not turning on',
  'Making unusual sounds',
  'Leaking water',
  'Not cooling properly',
  'Not heating properly',
  'Displaying error code',
  'Door not closing',
  'Vibrating excessively',
  'Smells unusual',
  'Cycles not completing',
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'ticketNumber', header: 'Ticket #', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'customerPhone', header: 'Phone', type: 'string' },
  { key: 'customerEmail', header: 'Email', type: 'string' },
  { key: 'customerAddress', header: 'Address', type: 'string' },
  { key: 'applianceType', header: 'Appliance Type', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'model', header: 'Model', type: 'string' },
  { key: 'issueCategory', header: 'Issue Category', type: 'string' },
  { key: 'issueDescription', header: 'Issue Description', type: 'string' },
  { key: 'assignedTechName', header: 'Assigned Tech', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'updatedAt', header: 'Updated', type: 'date' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateTicketNumber = () => `TKT-${Date.now().toString(36).toUpperCase()}`;

const createEmptyTicket = (): RepairTicket => ({
  id: generateId(),
  ticketNumber: generateTicketNumber(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerAddress: '',
  applianceType: '',
  brand: '',
  model: '',
  serialNumber: '',
  issueCategory: '',
  issueDescription: '',
  reportedSymptoms: [],
  priority: 'medium',
  status: 'open',
  assignedTechId: '',
  assignedTechName: '',
  scheduledDate: '',
  scheduledTimeSlot: '',
  estimatedDuration: 60,
  resolutionNotes: '',
  completedDate: '',
  notes: [],
  tags: [],
});

interface RepairTicketApplianceToolProps {
  uiConfig?: UIConfig;
}

export const RepairTicketApplianceTool = ({ uiConfig }: RepairTicketApplianceToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: tickets,
    addItem,
    updateItem,
    deleteItem,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<RepairTicket>('appliance-repair-tickets', [], COLUMNS);

  const [currentTicket, setCurrentTicket] = useState<RepairTicket>(createEmptyTicket());
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        customerName?: string;
        applianceType?: string;
        issueDescription?: string;
        phone?: string;
        email?: string;
      };
      if (params.customerName || params.applianceType || params.issueDescription) {
        const newTicket = createEmptyTicket();
        if (params.customerName) newTicket.customerName = params.customerName;
        if (params.applianceType) newTicket.applianceType = params.applianceType;
        if (params.issueDescription) newTicket.issueDescription = params.issueDescription;
        if (params.phone) newTicket.customerPhone = params.phone;
        if (params.email) newTicket.customerEmail = params.email;
        setCurrentTicket(newTicket);
        setActiveTab('create');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        !searchQuery.trim() ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerPhone.includes(searchQuery) ||
        ticket.applianceType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  // Stats
  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'open').length;
    const inProgress = tickets.filter((t) => ['assigned', 'in-progress', 'scheduled'].includes(t.status)).length;
    const pendingParts = tickets.filter((t) => t.status === 'pending-parts').length;
    const completed = tickets.filter((t) => t.status === 'completed').length;
    const urgent = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length;
    return { open, inProgress, pendingParts, completed, urgent, total: tickets.length };
  }, [tickets]);

  // Handlers
  const handleSaveTicket = () => {
    const updatedTicket = { ...currentTicket, updatedAt: new Date().toISOString() };
    const existingTicket = tickets.find((t) => t.id === currentTicket.id);

    if (existingTicket) {
      updateItem(currentTicket.id, updatedTicket);
    } else {
      addItem(updatedTicket);
    }

    setCurrentTicket(updatedTicket);
    setActiveTab('list');
  };

  const handleNewTicket = () => {
    setCurrentTicket(createEmptyTicket());
    setActiveTab('create');
  };

  const handleEditTicket = (ticket: RepairTicket) => {
    setCurrentTicket(ticket);
    setActiveTab('edit');
  };

  const handleDeleteTicket = async (ticketId: string) => {
    const confirmed = await confirm({
      title: 'Delete Ticket',
      message: 'Are you sure you want to delete this ticket?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(ticketId);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: TicketNote = {
      id: generateId(),
      date: new Date().toISOString(),
      author: 'Current User',
      content: newNote,
      type: 'note',
    };
    setCurrentTicket({ ...currentTicket, notes: [...currentTicket.notes, note] });
    setNewNote('');
  };

  const handleAddTag = () => {
    if (!newTag.trim() || currentTicket.tags.includes(newTag.trim())) return;
    setCurrentTicket({ ...currentTicket, tags: [...currentTicket.tags, newTag.trim()] });
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setCurrentTicket({ ...currentTicket, tags: currentTicket.tags.filter((t) => t !== tag) });
  };

  const toggleSymptom = (symptom: string) => {
    const symptoms = currentTicket.reportedSymptoms.includes(symptom)
      ? currentTicket.reportedSymptoms.filter((s) => s !== symptom)
      : [...currentTicket.reportedSymptoms, symptom];
    setCurrentTicket({ ...currentTicket, reportedSymptoms: symptoms });
  };

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    const colorMap: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200',
      purple: isDark ? 'bg-purple-900/30 text-purple-400 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200',
      orange: isDark ? 'bg-orange-900/30 text-orange-400 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-200',
      cyan: isDark ? 'bg-cyan-900/30 text-cyan-400 border-cyan-700' : 'bg-cyan-100 text-cyan-800 border-cyan-200',
      green: isDark ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-200',
      red: isDark ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-200',
    };
    return colorMap[option?.color || 'gray'] || colorMap.gray;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: isDark ? 'text-gray-400' : 'text-gray-600',
      medium: isDark ? 'text-blue-400' : 'text-blue-600',
      high: isDark ? 'text-orange-400' : 'text-orange-600',
      urgent: isDark ? 'text-red-400' : 'text-red-600',
    };
    return colorMap[priority] || colorMap.medium;
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.repairTicketAppliance.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.repairTicketAppliance.repairTicketSystem', 'Repair Ticket System')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.repairTicketAppliance.createAndManageApplianceRepair', 'Create and manage appliance repair tickets')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WidgetEmbedButton toolSlug="repair-ticket-appliance" toolName="Repair Ticket Appliance" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={theme}
                  showLabel={true}
                  size="md"
                />
                <ExportDropdown
                  onExportCSV={() => exportToCSV(tickets, COLUMNS, { filename: 'repair-tickets' })}
                  onExportExcel={() => exportToExcel(tickets, COLUMNS, { filename: 'repair-tickets' })}
                  onExportJSON={() => exportToJSON(tickets, { filename: 'repair-tickets' })}
                  onExportPDF={async () =>
                    await exportToPDF(tickets, COLUMNS, {
                      filename: 'repair-tickets',
                      title: 'Appliance Repair Tickets',
                      subtitle: `${tickets.length} tickets`,
                    })
                  }
                  onPrint={() => printData(tickets, COLUMNS, { title: 'Repair Tickets' })}
                  onCopyToClipboard={async () => await copyUtil(tickets, COLUMNS, 'tab')}
                  showImport={false}
                  theme={theme}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          {[
            { label: 'Open', value: stats.open, color: 'yellow' },
            { label: 'In Progress', value: stats.inProgress, color: 'blue' },
            { label: 'Pending Parts', value: stats.pendingParts, color: 'orange' },
            { label: 'Completed', value: stats.completed, color: 'green' },
            { label: 'Urgent', value: stats.urgent, color: 'red' },
            { label: 'Total', value: stats.total, color: 'gray' },
          ].map((stat) => (
            <Card key={stat.label} className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-[#0D9488] text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-2" />
            {t('tools.repairTicketAppliance.allTickets', 'All Tickets')}
          </button>
          <button
            onClick={handleNewTicket}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-[#0D9488] text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            {t('tools.repairTicketAppliance.newTicket', 'New Ticket')}
          </button>
        </div>

        {/* Ticket List View */}
        {activeTab === 'list' && (
          <Card className={`mt-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.repairTicketAppliance.searchTickets', 'Search tickets...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={inputClass}
                  style={{ width: 'auto' }}
                >
                  <option value="all">{t('tools.repairTicketAppliance.allStatuses', 'All Statuses')}</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className={inputClass}
                  style={{ width: 'auto' }}
                >
                  <option value="all">{t('tools.repairTicketAppliance.allPriorities', 'All Priorities')}</option>
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Ticket List */}
              <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.repairTicketAppliance.noTicketsFound', 'No tickets found')}</p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.ticketNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                              {STATUS_OPTIONS.find((s) => s.value === ticket.status)?.label}
                            </span>
                            <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                              {PRIORITY_OPTIONS.find((p) => p.value === ticket.priority)?.label}
                            </span>
                          </div>
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {ticket.customerName}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {ticket.applianceType} {ticket.brand && `- ${ticket.brand}`} {ticket.model && `(${ticket.model})`}
                          </p>
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {ticket.issueCategory}: {ticket.issueDescription.substring(0, 100)}
                            {ticket.issueDescription.length > 100 && '...'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                              Created: {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                            {ticket.assignedTechName && (
                              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                Tech: {ticket.assignedTechName}
                              </span>
                            )}
                            {ticket.scheduledDate && (
                              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                Scheduled: {new Date(ticket.scheduledDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditTicket(ticket)}
                            className="p-2 rounded-lg hover:bg-gray-600/50"
                            title={t('tools.repairTicketAppliance.edit', 'Edit')}
                          >
                            <Edit3 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-2 rounded-lg hover:bg-red-600/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Ticket Form */}
        {(activeTab === 'create' || activeTab === 'edit') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-5 h-5" />
                    {t('tools.repairTicketAppliance.customerInformation', 'Customer Information')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.repairTicketAppliance.customerName', 'Customer Name *')}</label>
                      <input
                        type="text"
                        value={currentTicket.customerName}
                        onChange={(e) => setCurrentTicket({ ...currentTicket, customerName: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.repairTicketAppliance.fullName', 'Full name')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.repairTicketAppliance.phoneNumber', 'Phone Number *')}</label>
                      <input
                        type="tel"
                        value={currentTicket.customerPhone}
                        onChange={(e) => setCurrentTicket({ ...currentTicket, customerPhone: e.target.value })}
                        className={inputClass}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.repairTicketAppliance.emailAddress', 'Email Address')}</label>
                      <input
                        type="email"
                        value={currentTicket.customerEmail}
                        onChange={(e) => setCurrentTicket({ ...currentTicket, customerEmail: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.repairTicketAppliance.customerEmailCom', 'customer@email.com')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.repairTicketAppliance.serviceAddress', 'Service Address *')}</label>
                      <input
                        type="text"
                        value={currentTicket.customerAddress}
                        onChange={(e) => setCurrentTicket({ ...currentTicket, customerAddress: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.repairTicketAppliance.123MainStCityState', '123 Main St, City, State ZIP')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appliance Details */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Package className="w-5 h-5" />
                    {t('tools.repairTicketAppliance.applianceDetails', 'Appliance Details')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.repairTicketAppliance.applianceType', 'Appliance Type *')}</label>
                      <select
                        value={currentTicket.applianceType}
                        onChange={(e) => setCurrentTicket({ ...currentTicket, applianceType: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">{t('tools.repairTicketAppliance.selectType', 'Select type...')}</option>
                        {APPLIANCE_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.repairTicketAppliance.brand', 'Brand')}</label>
                      <input
                        type="text"
                        value={currentTicket.brand}
                        onChange={(e) => setCurrentTicket({ ...currentTicket, brand: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.repairTicketAppliance.eGSamsungLgWhirlpool', 'e.g., Samsung, LG, Whirlpool')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.repairTicketAppliance.modelNumber', 'Model Number')}</label>
                      <input
                        type="text"
                        value={currentTicket.model}
                        onChange={(e) => setCurrentTicket({ ...currentTicket, model: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.repairTicketAppliance.modelNumber2', 'Model number')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.repairTicketAppliance.serialNumber', 'Serial Number')}</label>
                      <input
                        type="text"
                        value={currentTicket.serialNumber}
                        onChange={(e) => setCurrentTicket({ ...currentTicket, serialNumber: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.repairTicketAppliance.serialNumber2', 'Serial number')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Issue Details */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <AlertCircle className="w-5 h-5" />
                    {t('tools.repairTicketAppliance.issueDetails', 'Issue Details')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.repairTicketAppliance.issueCategory', 'Issue Category *')}</label>
                    <select
                      value={currentTicket.issueCategory}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, issueCategory: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.repairTicketAppliance.selectCategory', 'Select category...')}</option>
                      {ISSUE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.repairTicketAppliance.issueDescription', 'Issue Description *')}</label>
                    <textarea
                      value={currentTicket.issueDescription}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, issueDescription: e.target.value })}
                      className={`${inputClass} min-h-24`}
                      placeholder={t('tools.repairTicketAppliance.describeTheIssueInDetail', 'Describe the issue in detail...')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.repairTicketAppliance.reportedSymptoms', 'Reported Symptoms')}</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {COMMON_SYMPTOMS.map((symptom) => (
                        <button
                          key={symptom}
                          onClick={() => toggleSymptom(symptom)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            currentTicket.reportedSymptoms.includes(symptom)
                              ? 'bg-[#0D9488] text-white'
                              : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {symptom}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Section */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <MessageSquare className="w-5 h-5" />
                    {t('tools.repairTicketAppliance.notes', 'Notes')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={t('tools.repairTicketAppliance.addANote', 'Add a note...')}
                      className={inputClass}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
                    >
                      {t('tools.repairTicketAppliance.add', 'Add')}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentTicket.notes.map((note) => (
                      <div key={note.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{note.author}</span>
                          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                            {new Date(note.date).toLocaleString()}
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{note.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ticket Info */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.repairTicketAppliance.ticketInfo', 'Ticket Info')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.repairTicketAppliance.ticketNumber', 'Ticket Number')}</label>
                    <p className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentTicket.ticketNumber}
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.repairTicketAppliance.status', 'Status')}</label>
                    <select
                      value={currentTicket.status}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, status: e.target.value as RepairTicket['status'] })}
                      className={inputClass}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.repairTicketAppliance.priority', 'Priority')}</label>
                    <select
                      value={currentTicket.priority}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, priority: e.target.value as RepairTicket['priority'] })}
                      className={inputClass}
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.repairTicketAppliance.assignment', 'Assignment')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.repairTicketAppliance.assignedTechnician', 'Assigned Technician')}</label>
                    <select
                      value={currentTicket.assignedTechId}
                      onChange={(e) => {
                        const tech = TECHNICIANS.find((t) => t.id === e.target.value);
                        setCurrentTicket({
                          ...currentTicket,
                          assignedTechId: e.target.value,
                          assignedTechName: tech?.name || '',
                        });
                      }}
                      className={inputClass}
                    >
                      <option value="">{t('tools.repairTicketAppliance.notAssigned', 'Not assigned')}</option>
                      {TECHNICIANS.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} ({tech.specialties.join(', ')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.repairTicketAppliance.scheduledDate', 'Scheduled Date')}</label>
                    <input
                      type="date"
                      value={currentTicket.scheduledDate}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, scheduledDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.repairTicketAppliance.timeSlot', 'Time Slot')}</label>
                    <select
                      value={currentTicket.scheduledTimeSlot}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, scheduledTimeSlot: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.repairTicketAppliance.selectTime', 'Select time...')}</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.repairTicketAppliance.estimatedDurationMinutes', 'Estimated Duration (minutes)')}</label>
                    <input
                      type="number"
                      value={currentTicket.estimatedDuration}
                      onChange={(e) => setCurrentTicket({ ...currentTicket, estimatedDuration: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      min="15"
                      step="15"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.repairTicketAppliance.tags', 'Tags')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder={t('tools.repairTicketAppliance.addTag', 'Add tag...')}
                      className={inputClass}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentTicket.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-500">
                          <XCircle className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSaveTicket}
                  disabled={!currentTicket.customerName || !currentTicket.applianceType}
                  className="w-full px-4 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {activeTab === 'create' ? t('tools.repairTicketAppliance.createTicket', 'Create Ticket') : t('tools.repairTicketAppliance.saveChanges', 'Save Changes')}
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.repairTicketAppliance.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default RepairTicketApplianceTool;
