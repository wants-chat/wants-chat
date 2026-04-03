'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Plus,
  Trash2,
  Save,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Camera,
  Package,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface RepairTicketJewelryToolProps {
  uiConfig?: UIConfig;
}

// Types
type TicketStatus = 'received' | 'in_progress' | 'waiting_parts' | 'ready' | 'completed' | 'cancelled';
type RepairType = 'ring_sizing' | 'prong_repair' | 'chain_repair' | 'clasp_repair' | 'stone_replacement' | 'cleaning' | 'engraving' | 'restoration' | 'watch_battery' | 'watch_repair' | 'other';

interface RepairTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  itemDescription: string;
  itemType: string;
  metal: string;
  stones: string;
  repairType: RepairType;
  repairDescription: string;
  estimatedCost: number;
  actualCost: number;
  depositPaid: number;
  status: TicketStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  receivedDate: string;
  promisedDate: string;
  completedDate: string;
  technicianNotes: string;
  beforePhotos: string[];
  afterPhotos: string[];
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

// Constants
const REPAIR_TYPES: { type: RepairType; label: string }[] = [
  { type: 'ring_sizing', label: 'Ring Sizing' },
  { type: 'prong_repair', label: 'Prong Repair' },
  { type: 'chain_repair', label: 'Chain Repair' },
  { type: 'clasp_repair', label: 'Clasp Repair' },
  { type: 'stone_replacement', label: 'Stone Replacement' },
  { type: 'cleaning', label: 'Cleaning & Polishing' },
  { type: 'engraving', label: 'Engraving' },
  { type: 'restoration', label: 'Restoration' },
  { type: 'watch_battery', label: 'Watch Battery' },
  { type: 'watch_repair', label: 'Watch Repair' },
  { type: 'other', label: 'Other' },
];

const STATUS_OPTIONS: { status: TicketStatus; label: string; color: string }[] = [
  { status: 'received', label: 'Received', color: 'bg-blue-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { status: 'waiting_parts', label: 'Waiting Parts', color: 'bg-orange-500' },
  { status: 'ready', label: 'Ready for Pickup', color: 'bg-green-500' },
  { status: 'completed', label: 'Completed', color: 'bg-gray-500' },
  { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

// Column configurations for exports
const TICKET_COLUMNS: ColumnConfig[] = [
  { key: 'ticketNumber', header: 'Ticket #', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'itemDescription', header: 'Item', type: 'string' },
  { key: 'repairType', header: 'Repair Type', type: 'string' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
  { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'receivedDate', header: 'Received', type: 'date' },
  { key: 'promisedDate', header: 'Promised', type: 'date' },
];

const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateTicketNumber = () => `JR-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const RepairTicketJewelryTool: React.FC<RepairTicketJewelryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: tickets,
    addItem: addTicketToBackend,
    updateItem: updateTicketBackend,
    deleteItem: deleteTicketBackend,
    isSynced: ticketsSynced,
    isSaving: ticketsSaving,
    lastSaved: ticketsLastSaved,
    syncError: ticketsSyncError,
    forceSync: forceTicketsSync,
  } = useToolData<RepairTicket>('jewelry-repair-tickets', [], TICKET_COLUMNS);

  const {
    data: customers,
    addItem: addCustomerToBackend,
    updateItem: updateCustomerBackend,
    deleteItem: deleteCustomerBackend,
  } = useToolData<Customer>('jewelry-repair-customers', [], CUSTOMER_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'tickets' | 'customers'>('tickets');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<RepairTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // New ticket form state
  const [newTicket, setNewTicket] = useState<Partial<RepairTicket>>({
    customerId: '',
    itemDescription: '',
    itemType: '',
    metal: '',
    stones: '',
    repairType: 'other',
    repairDescription: '',
    estimatedCost: 0,
    depositPaid: 0,
    priority: 'normal',
    promisedDate: '',
  });

  // New customer form state
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  // Add new ticket
  const addTicket = () => {
    if (!newTicket.customerId || !newTicket.itemDescription) {
      setValidationMessage('Please select a customer and enter item description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const ticket: RepairTicket = {
      id: generateId(),
      ticketNumber: generateTicketNumber(),
      customerId: newTicket.customerId || '',
      itemDescription: newTicket.itemDescription || '',
      itemType: newTicket.itemType || '',
      metal: newTicket.metal || '',
      stones: newTicket.stones || '',
      repairType: newTicket.repairType || 'other',
      repairDescription: newTicket.repairDescription || '',
      estimatedCost: newTicket.estimatedCost || 0,
      actualCost: 0,
      depositPaid: newTicket.depositPaid || 0,
      status: 'received',
      priority: newTicket.priority || 'normal',
      receivedDate: new Date().toISOString(),
      promisedDate: newTicket.promisedDate || '',
      completedDate: '',
      technicianNotes: '',
      beforePhotos: [],
      afterPhotos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTicketToBackend(ticket);
    setShowTicketForm(false);
    resetTicketForm();
  };

  // Update ticket
  const updateTicket = () => {
    if (!editingTicket) return;

    const updates = {
      ...editingTicket,
      updatedAt: new Date().toISOString(),
    };

    if (editingTicket.status === 'completed' && !editingTicket.completedDate) {
      updates.completedDate = new Date().toISOString();
    }

    updateTicketBackend(editingTicket.id, updates);
    setEditingTicket(null);
  };

  // Delete ticket
  const deleteTicket = async (ticketId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this repair ticket?');
    if (confirmed) {
      deleteTicketBackend(ticketId);
    }
  };

  // Add new customer
  const addCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName) {
      setValidationMessage('Please enter customer first and last name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const customer: Customer = {
      id: generateId(),
      firstName: newCustomer.firstName || '',
      lastName: newCustomer.lastName || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      address: newCustomer.address || '',
      createdAt: new Date().toISOString(),
    };

    addCustomerToBackend(customer);
    setShowCustomerForm(false);
    setNewCustomer({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  };

  // Delete customer
  const deleteCustomer = async (customerId: string) => {
    const hasTickets = tickets.some((t) => t.customerId === customerId);
    if (hasTickets) {
      setValidationMessage('Cannot delete customer with existing repair tickets');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const confirmed = await confirm('Are you sure you want to delete this customer?');
    if (confirmed) {
      deleteCustomerBackend(customerId);
    }
  };

  // Reset ticket form
  const resetTicketForm = () => {
    setNewTicket({
      customerId: '',
      itemDescription: '',
      itemType: '',
      metal: '',
      stones: '',
      repairType: 'other',
      repairDescription: '',
      estimatedCost: 0,
      depositPaid: 0,
      priority: 'normal',
      promisedDate: '',
    });
  };

  // Get customer name
  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const customer = customers.find((c) => c.id === ticket.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';
      const matchesSearch =
        searchTerm === '' ||
        customerName.includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.itemDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, customers, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const activeTickets = tickets.filter((t) => !['completed', 'cancelled'].includes(t.status));
    const readyForPickup = tickets.filter((t) => t.status === 'ready');
    const totalRevenue = tickets
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + (t.actualCost || t.estimatedCost), 0);
    const pendingPayments = tickets
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + Math.max(0, (t.actualCost || t.estimatedCost) - t.depositPaid), 0);

    return { activeTickets: activeTickets.length, readyForPickup: readyForPickup.length, totalRevenue, pendingPayments };
  }, [tickets]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.repairTicketJewelry.jewelryRepairTickets', 'Jewelry Repair Tickets')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.repairTicketJewelry.manageRepairOrdersAndTrack', 'Manage repair orders and track customer items')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="repair-ticket-jewelry" toolName="Repair Ticket Jewelry" />

              <SyncStatus
                isSynced={ticketsSynced}
                isSaving={ticketsSaving}
                lastSaved={ticketsLastSaved}
                syncError={ticketsSyncError}
                onForceSync={forceTicketsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = tickets.map((t) => ({
                    ...t,
                    customerName: getCustomerName(t.customerId),
                  }));
                  exportToCSV(exportData, TICKET_COLUMNS, { filename: 'jewelry-repair-tickets' });
                }}
                onExportExcel={() => {
                  const exportData = tickets.map((t) => ({
                    ...t,
                    customerName: getCustomerName(t.customerId),
                  }));
                  exportToExcel(exportData, TICKET_COLUMNS, { filename: 'jewelry-repair-tickets' });
                }}
                onExportJSON={() => {
                  const exportData = tickets.map((t) => ({
                    ...t,
                    customerName: getCustomerName(t.customerId),
                  }));
                  exportToJSON(exportData, { filename: 'jewelry-repair-tickets' });
                }}
                onExportPDF={async () => {
                  const exportData = tickets.map((t) => ({
                    ...t,
                    customerName: getCustomerName(t.customerId),
                  }));
                  await exportToPDF(exportData, TICKET_COLUMNS, {
                    filename: 'jewelry-repair-tickets',
                    title: 'Jewelry Repair Tickets Report',
                    subtitle: `${tickets.length} total tickets`,
                  });
                }}
                onPrint={() => {
                  const exportData = tickets.map((t) => ({
                    ...t,
                    customerName: getCustomerName(t.customerId),
                  }));
                  printData(exportData, TICKET_COLUMNS, { title: 'Jewelry Repair Tickets' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = tickets.map((t) => ({
                    ...t,
                    customerName: getCustomerName(t.customerId),
                  }));
                  return await copyUtil(exportData, TICKET_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'tickets', label: 'Repair Tickets', icon: <FileText className="w-4 h-4" /> },
              { id: 'customers', label: 'Customers', icon: <User className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.repairTicketJewelry.activeTickets', 'Active Tickets')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activeTickets}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.repairTicketJewelry.readyForPickup', 'Ready for Pickup')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.readyForPickup}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.repairTicketJewelry.totalRevenue', 'Total Revenue')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#0D9488]" />
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.repairTicketJewelry.pendingPayments', 'Pending Payments')}</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.pendingPayments)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.repairTicketJewelry.searchTickets', 'Search tickets...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                >
                  <option value="all">{t('tools.repairTicketJewelry.allStatus', 'All Status')}</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.status} value={opt.status}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowTicketForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.repairTicketJewelry.newTicket', 'New Ticket')}
              </button>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.repairTicketJewelry.noRepairTicketsFound', 'No repair tickets found')}</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border rounded-lg p-4 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.ticketNumber}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${
                              STATUS_OPTIONS.find((s) => s.status === ticket.status)?.color || 'bg-gray-500'
                            }`}>
                              {STATUS_OPTIONS.find((s) => s.status === ticket.status)?.label}
                            </span>
                            {ticket.priority === 'urgent' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-500 text-white">{t('tools.repairTicketJewelry.urgent', 'Urgent')}</span>
                            )}
                            {ticket.priority === 'high' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-orange-500 text-white">{t('tools.repairTicketJewelry.high', 'High')}</span>
                            )}
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getCustomerName(ticket.customerId)} - {ticket.itemDescription}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(ticket.estimatedCost)}
                        </span>
                        <button
                          onClick={() => setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          {expandedTicketId === ticket.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingTicket(ticket)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedTicketId === ticket.id && (
                      <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.repairTicketJewelry.itemType', 'Item Type')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.itemType || '-'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.repairTicketJewelry.metal', 'Metal')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.metal || '-'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.repairTicketJewelry.stones', 'Stones')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.stones || '-'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.repairTicketJewelry.repairType', 'Repair Type')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {REPAIR_TYPES.find((r) => r.type === ticket.repairType)?.label}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.repairTicketJewelry.receivedDate', 'Received Date')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(ticket.receivedDate)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.repairTicketJewelry.promisedDate', 'Promised Date')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(ticket.promisedDate)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.repairTicketJewelry.depositPaid', 'Deposit Paid')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(ticket.depositPaid)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.repairTicketJewelry.balanceDue', 'Balance Due')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(Math.max(0, ticket.estimatedCost - ticket.depositPaid))}
                            </p>
                          </div>
                        </div>
                        {ticket.repairDescription && (
                          <div className="mt-4">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.repairTicketJewelry.repairDescription', 'Repair Description')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.repairDescription}
                            </p>
                          </div>
                        )}
                        {ticket.technicianNotes && (
                          <div className="mt-4">
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.repairTicketJewelry.technicianNotes', 'Technician Notes')}</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.technicianNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.repairTicketJewelry.customers', 'Customers')}</h2>
              <button
                onClick={() => setShowCustomerForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.repairTicketJewelry.addCustomer2', 'Add Customer')}
              </button>
            </div>

            <div className="space-y-4">
              {customers.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.repairTicketJewelry.noCustomersFound', 'No customers found')}</p>
                </div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {customer.firstName} {customer.lastName}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          {customer.email && (
                            <span className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Mail className="w-3 h-3" /> {customer.email}
                            </span>
                          )}
                          {customer.phone && (
                            <span className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Phone className="w-3 h-3" /> {customer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {tickets.filter((t) => t.customerId === customer.id).length} tickets
                        </span>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* New Ticket Modal */}
        {showTicketForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.repairTicketJewelry.newRepairTicket', 'New Repair Ticket')}</h2>
                <button onClick={() => { setShowTicketForm(false); resetTicketForm(); }}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.customer', 'Customer *')}
                  </label>
                  <select
                    value={newTicket.customerId}
                    onChange={(e) => setNewTicket({ ...newTicket, customerId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.repairTicketJewelry.selectCustomer', 'Select Customer')}</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.itemDescription', 'Item Description *')}
                  </label>
                  <input
                    type="text"
                    value={newTicket.itemDescription}
                    onChange={(e) => setNewTicket({ ...newTicket, itemDescription: e.target.value })}
                    placeholder={t('tools.repairTicketJewelry.eGGoldEngagementRing', 'e.g., Gold engagement ring with diamond')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.itemType2', 'Item Type')}
                  </label>
                  <input
                    type="text"
                    value={newTicket.itemType}
                    onChange={(e) => setNewTicket({ ...newTicket, itemType: e.target.value })}
                    placeholder={t('tools.repairTicketJewelry.eGRingNecklaceWatch', 'e.g., Ring, Necklace, Watch')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.metal2', 'Metal')}
                  </label>
                  <input
                    type="text"
                    value={newTicket.metal}
                    onChange={(e) => setNewTicket({ ...newTicket, metal: e.target.value })}
                    placeholder={t('tools.repairTicketJewelry.eG14kGoldSilver', 'e.g., 14K Gold, Silver, Platinum')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.stones2', 'Stones')}
                  </label>
                  <input
                    type="text"
                    value={newTicket.stones}
                    onChange={(e) => setNewTicket({ ...newTicket, stones: e.target.value })}
                    placeholder={t('tools.repairTicketJewelry.eGDiamondRubySapphire', 'e.g., Diamond, Ruby, Sapphire')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.repairType2', 'Repair Type')}
                  </label>
                  <select
                    value={newTicket.repairType}
                    onChange={(e) => setNewTicket({ ...newTicket, repairType: e.target.value as RepairType })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {REPAIR_TYPES.map((r) => (
                      <option key={r.type} value={r.type}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.repairDescription2', 'Repair Description')}
                  </label>
                  <textarea
                    value={newTicket.repairDescription}
                    onChange={(e) => setNewTicket({ ...newTicket, repairDescription: e.target.value })}
                    rows={3}
                    placeholder={t('tools.repairTicketJewelry.describeTheRepairWorkNeeded', 'Describe the repair work needed...')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.estimatedCost', 'Estimated Cost')}
                  </label>
                  <input
                    type="number"
                    value={newTicket.estimatedCost}
                    onChange={(e) => setNewTicket({ ...newTicket, estimatedCost: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.depositPaid2', 'Deposit Paid')}
                  </label>
                  <input
                    type="number"
                    value={newTicket.depositPaid}
                    onChange={(e) => setNewTicket({ ...newTicket, depositPaid: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.priority', 'Priority')}
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as 'low' | 'normal' | 'high' | 'urgent' })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="low">{t('tools.repairTicketJewelry.low', 'Low')}</option>
                    <option value="normal">{t('tools.repairTicketJewelry.normal', 'Normal')}</option>
                    <option value="high">{t('tools.repairTicketJewelry.high2', 'High')}</option>
                    <option value="urgent">{t('tools.repairTicketJewelry.urgent2', 'Urgent')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.promisedDate2', 'Promised Date')}
                  </label>
                  <input
                    type="date"
                    value={newTicket.promisedDate}
                    onChange={(e) => setNewTicket({ ...newTicket, promisedDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowTicketForm(false); resetTicketForm(); }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.repairTicketJewelry.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addTicket}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.repairTicketJewelry.createTicket', 'Create Ticket')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Customer Modal */}
        {showCustomerForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.repairTicketJewelry.addCustomer', 'Add Customer')}</h2>
                <button onClick={() => setShowCustomerForm(false)}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.repairTicketJewelry.firstName', 'First Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.firstName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.repairTicketJewelry.lastName', 'Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.address', 'Address')}
                  </label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCustomerForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.repairTicketJewelry.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addCustomer}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.repairTicketJewelry.addCustomer3', 'Add Customer')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Ticket Modal */}
        {editingTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Edit Ticket - {editingTicket.ticketNumber}
                </h2>
                <button onClick={() => setEditingTicket(null)}>
                  <X className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.status', 'Status')}
                  </label>
                  <select
                    value={editingTicket.status}
                    onChange={(e) => setEditingTicket({ ...editingTicket, status: e.target.value as TicketStatus })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.status} value={opt.status}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.priority2', 'Priority')}
                  </label>
                  <select
                    value={editingTicket.priority}
                    onChange={(e) => setEditingTicket({ ...editingTicket, priority: e.target.value as 'low' | 'normal' | 'high' | 'urgent' })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="low">{t('tools.repairTicketJewelry.low2', 'Low')}</option>
                    <option value="normal">{t('tools.repairTicketJewelry.normal2', 'Normal')}</option>
                    <option value="high">{t('tools.repairTicketJewelry.high3', 'High')}</option>
                    <option value="urgent">{t('tools.repairTicketJewelry.urgent3', 'Urgent')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.actualCost', 'Actual Cost')}
                  </label>
                  <input
                    type="number"
                    value={editingTicket.actualCost}
                    onChange={(e) => setEditingTicket({ ...editingTicket, actualCost: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.depositPaid3', 'Deposit Paid')}
                  </label>
                  <input
                    type="number"
                    value={editingTicket.depositPaid}
                    onChange={(e) => setEditingTicket({ ...editingTicket, depositPaid: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.repairTicketJewelry.technicianNotes2', 'Technician Notes')}
                  </label>
                  <textarea
                    value={editingTicket.technicianNotes}
                    onChange={(e) => setEditingTicket({ ...editingTicket, technicianNotes: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingTicket(null)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.repairTicketJewelry.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={updateTicket}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C73] transition-colors"
                >
                  {t('tools.repairTicketJewelry.saveChanges', 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50">
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default RepairTicketJewelryTool;
