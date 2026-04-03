'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shirt,
  Tag,
  Calendar,
  DollarSign,
  User,
  Clock,
  Plus,
  Trash2,
  Search,
  Filter,
  Edit2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Package,
  Printer,
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

interface GarmentTicketToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type GarmentType = 'shirt' | 'pants' | 'suit' | 'dress' | 'coat' | 'jacket' | 'skirt' | 'blouse' | 'sweater' | 'other';
type ServiceType = 'dry_clean' | 'laundry' | 'press' | 'starch' | 'alterations' | 'specialty';
type TicketStatus = 'received' | 'in_process' | 'ready' | 'picked_up' | 'issue';

interface GarmentItem {
  id: string;
  type: GarmentType;
  color: string;
  brand: string;
  quantity: number;
  services: ServiceType[];
  specialInstructions: string;
  price: number;
}

interface GarmentTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: GarmentItem[];
  status: TicketStatus;
  receivedDate: string;
  promisedDate: string;
  completedDate: string;
  pickedUpDate: string;
  totalPrice: number;
  deposit: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const GARMENT_TYPES: { type: GarmentType; label: string }[] = [
  { type: 'shirt', label: 'Shirt' },
  { type: 'pants', label: 'Pants' },
  { type: 'suit', label: 'Suit' },
  { type: 'dress', label: 'Dress' },
  { type: 'coat', label: 'Coat' },
  { type: 'jacket', label: 'Jacket' },
  { type: 'skirt', label: 'Skirt' },
  { type: 'blouse', label: 'Blouse' },
  { type: 'sweater', label: 'Sweater' },
  { type: 'other', label: 'Other' },
];

const SERVICE_TYPES: { type: ServiceType; label: string; price: number }[] = [
  { type: 'dry_clean', label: 'Dry Clean', price: 8.99 },
  { type: 'laundry', label: 'Laundry', price: 4.99 },
  { type: 'press', label: 'Press Only', price: 3.99 },
  { type: 'starch', label: 'Starch', price: 1.50 },
  { type: 'alterations', label: 'Alterations', price: 15.00 },
  { type: 'specialty', label: 'Specialty Care', price: 12.99 },
];

const STATUS_OPTIONS: { status: TicketStatus; label: string; color: string }[] = [
  { status: 'received', label: 'Received', color: 'bg-blue-500' },
  { status: 'in_process', label: 'In Process', color: 'bg-yellow-500' },
  { status: 'ready', label: 'Ready', color: 'bg-green-500' },
  { status: 'picked_up', label: 'Picked Up', color: 'bg-gray-500' },
  { status: 'issue', label: 'Issue', color: 'bg-red-500' },
];

// Column config for exports
const TICKET_COLUMNS: ColumnConfig[] = [
  { key: 'ticketNumber', header: 'Ticket #', width: 15 },
  { key: 'customerName', header: 'Customer', width: 20 },
  { key: 'customerPhone', header: 'Phone', width: 15 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'totalPrice', header: 'Total', width: 10, format: (v) => `$${Number(v).toFixed(2)}` },
  { key: 'receivedDate', header: 'Received', width: 15 },
  { key: 'promisedDate', header: 'Promised', width: 15 },
];

// Generate unique ID
const generateId = () => `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateTicketNumber = () => `GT${Date.now().toString().slice(-6)}`;

export function GarmentTicketTool({ uiConfig }: GarmentTicketToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const isPrefilled = uiConfig?.prefillData && Object.keys(uiConfig.prefillData).length > 0;

  // Use the useToolData hook for backend sync
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
  } = useToolData<GarmentTicket>('garment-ticket', [], TICKET_COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<'tickets' | 'new' | 'search'>('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [editingTicket, setEditingTicket] = useState<GarmentTicket | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // New ticket form state
  const [newTicket, setNewTicket] = useState<Partial<GarmentTicket>>({
    customerName: '',
    customerPhone: '',
    items: [],
    status: 'received',
    receivedDate: new Date().toISOString().split('T')[0],
    promisedDate: '',
    deposit: 0,
    notes: '',
  });

  const [newItem, setNewItem] = useState<Partial<GarmentItem>>({
    type: 'shirt',
    color: '',
    brand: '',
    quantity: 1,
    services: [],
    specialInstructions: '',
    price: 0,
  });

  // Calculate item price based on services
  const calculateItemPrice = (services: ServiceType[], quantity: number): number => {
    const serviceTotal = services.reduce((sum, service) => {
      const serviceInfo = SERVICE_TYPES.find(s => s.type === service);
      return sum + (serviceInfo?.price || 0);
    }, 0);
    return serviceTotal * quantity;
  };

  // Add item to new ticket
  const addItemToTicket = () => {
    if (!newItem.type || newItem.services?.length === 0) {
      setValidationMessage('Please select a garment type and at least one service');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const price = calculateItemPrice(newItem.services || [], newItem.quantity || 1);
    const item: GarmentItem = {
      id: generateId(),
      type: newItem.type as GarmentType,
      color: newItem.color || '',
      brand: newItem.brand || '',
      quantity: newItem.quantity || 1,
      services: newItem.services || [],
      specialInstructions: newItem.specialInstructions || '',
      price,
    };

    setNewTicket(prev => ({
      ...prev,
      items: [...(prev.items || []), item],
    }));

    setNewItem({
      type: 'shirt',
      color: '',
      brand: '',
      quantity: 1,
      services: [],
      specialInstructions: '',
      price: 0,
    });
  };

  // Remove item from new ticket
  const removeItemFromTicket = (itemId: string) => {
    setNewTicket(prev => ({
      ...prev,
      items: (prev.items || []).filter(i => i.id !== itemId),
    }));
  };

  // Create new ticket
  const createTicket = () => {
    if (!newTicket.customerName || !newTicket.customerPhone) {
      setValidationMessage('Please enter customer name and phone number');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (!newTicket.items || newTicket.items.length === 0) {
      setValidationMessage('Please add at least one garment');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const totalPrice = newTicket.items.reduce((sum, item) => sum + item.price, 0);
    const ticket: GarmentTicket = {
      id: generateId(),
      ticketNumber: generateTicketNumber(),
      customerId: generateId(),
      customerName: newTicket.customerName,
      customerPhone: newTicket.customerPhone,
      items: newTicket.items,
      status: 'received',
      receivedDate: newTicket.receivedDate || new Date().toISOString().split('T')[0],
      promisedDate: newTicket.promisedDate || '',
      completedDate: '',
      pickedUpDate: '',
      totalPrice,
      deposit: newTicket.deposit || 0,
      notes: newTicket.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTicketToBackend(ticket);

    // Reset form
    setNewTicket({
      customerName: '',
      customerPhone: '',
      items: [],
      status: 'received',
      receivedDate: new Date().toISOString().split('T')[0],
      promisedDate: '',
      deposit: 0,
      notes: '',
    });

    setActiveTab('tickets');
  };

  // Update ticket status
  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    const updates: Partial<GarmentTicket> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'ready') {
      updates.completedDate = new Date().toISOString().split('T')[0];
    } else if (status === 'picked_up') {
      updates.pickedUpDate = new Date().toISOString().split('T')[0];
    }

    updateTicketBackend(ticketId, updates);
  };

  // Delete ticket
  const deleteTicket = async (ticketId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this ticket? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteTicketBackend(ticketId);
    }
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch =
        searchTerm === '' ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerPhone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: tickets.length,
      received: tickets.filter(t => t.status === 'received').length,
      inProcess: tickets.filter(t => t.status === 'in_process').length,
      ready: tickets.filter(t => t.status === 'ready').length,
      todayReceived: tickets.filter(t => t.receivedDate === today).length,
      todayRevenue: tickets
        .filter(t => t.pickedUpDate === today)
        .reduce((sum, t) => sum + t.totalPrice, 0),
    };
  }, [tickets]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.garmentTicket.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.garmentTicket.garmentTicketTool', 'Garment Ticket Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.garmentTicket.trackGarmentsServicesAndCustomer', 'Track garments, services, and customer orders')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="garment-ticket" toolName="Garment Ticket" />

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
                onExportCSV={() => exportToCSV(tickets, TICKET_COLUMNS, { filename: 'garment-tickets' })}
                onExportExcel={() => exportToExcel(tickets, TICKET_COLUMNS, { filename: 'garment-tickets' })}
                onExportJSON={() => exportToJSON(tickets, { filename: 'garment-tickets' })}
                onExportPDF={async () => {
                  await exportToPDF(tickets, TICKET_COLUMNS, {
                    filename: 'garment-tickets',
                    title: 'Garment Tickets Report',
                    subtitle: `${tickets.length} tickets`,
                  });
                }}
                onPrint={() => printData(tickets, TICKET_COLUMNS, { title: 'Garment Tickets' })}
                onCopyToClipboard={async () => await copyUtil(tickets, TICKET_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.garmentTicket.totalTickets', 'Total Tickets')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{t('tools.garmentTicket.received', 'Received')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>{stats.received}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.garmentTicket.inProcess', 'In Process')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>{stats.inProcess}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{t('tools.garmentTicket.ready', 'Ready')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>{stats.ready}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{t('tools.garmentTicket.todayReceived', 'Today Received')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>{stats.todayReceived}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>{t('tools.garmentTicket.todayRevenue', 'Today Revenue')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-teal-300' : 'text-teal-700'}`}>${stats.todayRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'tickets', label: 'All Tickets', icon: <Package className="w-4 h-4" /> },
              { id: 'new', label: 'New Ticket', icon: <Plus className="w-4 h-4" /> },
              { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
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

        {/* New Ticket Tab */}
        {activeTab === 'new' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.garmentTicket.createNewTicket', 'Create New Ticket')}
            </h2>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.garmentTicket.customerName', 'Customer Name *')}
                </label>
                <input
                  type="text"
                  value={newTicket.customerName || ''}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, customerName: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.garmentTicket.enterCustomerName', 'Enter customer name')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.garmentTicket.phoneNumber', 'Phone Number *')}
                </label>
                <input
                  type="tel"
                  value={newTicket.customerPhone || ''}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.garmentTicket.promisedDate', 'Promised Date')}
                </label>
                <input
                  type="date"
                  value={newTicket.promisedDate || ''}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, promisedDate: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.garmentTicket.deposit', 'Deposit')}
                </label>
                <input
                  type="number"
                  value={newTicket.deposit || 0}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, deposit: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Add Garment */}
            <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.garmentTicket.addGarment', 'Add Garment')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.garmentTicket.garmentType', 'Garment Type')}
                  </label>
                  <select
                    value={newItem.type || 'shirt'}
                    onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as GarmentType }))}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {GARMENT_TYPES.map(g => (
                      <option key={g.type} value={g.type}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.garmentTicket.color', 'Color')}
                  </label>
                  <input
                    type="text"
                    value={newItem.color || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, color: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.garmentTicket.eGBlue', 'e.g., Blue')}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.garmentTicket.brand', 'Brand')}
                  </label>
                  <input
                    type="text"
                    value={newItem.brand || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, brand: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('tools.garmentTicket.eGRalphLauren', 'e.g., Ralph Lauren')}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.garmentTicket.quantity', 'Quantity')}
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity || 1}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="1"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.garmentTicket.services', 'Services')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_TYPES.map(service => (
                    <label
                      key={service.type}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-sm ${
                        (newItem.services || []).includes(service.type)
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(newItem.services || []).includes(service.type)}
                        onChange={(e) => {
                          setNewItem(prev => ({
                            ...prev,
                            services: e.target.checked
                              ? [...(prev.services || []), service.type]
                              : (prev.services || []).filter(s => s !== service.type),
                          }));
                        }}
                        className="hidden"
                      />
                      {service.label} (${service.price.toFixed(2)})
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.garmentTicket.specialInstructions', 'Special Instructions')}
                </label>
                <input
                  type="text"
                  value={newItem.specialInstructions || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.garmentTicket.eGHandleWithCare', 'e.g., Handle with care, missing button')}
                />
              </div>

              <button
                onClick={addItemToTicket}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.garmentTicket.addGarment2', 'Add Garment')}
              </button>
            </div>

            {/* Added Items */}
            {(newTicket.items || []).length > 0 && (
              <div className="mb-4">
                <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Added Garments ({newTicket.items?.length})
                </h3>
                <div className="space-y-2">
                  {(newTicket.items || []).map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Shirt className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {GARMENT_TYPES.find(g => g.type === item.type)?.label} ({item.quantity}x)
                            {item.color && ` - ${item.color}`}
                            {item.brand && ` - ${item.brand}`}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.services.map(s => SERVICE_TYPES.find(st => st.type === s)?.label).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItemFromTicket(item.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`flex justify-between items-center mt-3 pt-3 border-t ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.garmentTicket.total', 'Total')}</span>
                  <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${(newTicket.items || []).reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.garmentTicket.notes', 'Notes')}
              </label>
              <textarea
                value={newTicket.notes || ''}
                onChange={(e) => setNewTicket(prev => ({ ...prev, notes: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                rows={3}
                placeholder={t('tools.garmentTicket.additionalNotes', 'Additional notes...')}
              />
            </div>

            {/* Create Button */}
            <button
              onClick={createTicket}
              className="w-full py-3 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0D9488]/90 transition-colors"
            >
              {t('tools.garmentTicket.createTicket', 'Create Ticket')}
            </button>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('tools.garmentTicket.searchByTicketNameOr', 'Search by ticket #, name, or phone...')}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status.status}
                    onClick={() => setStatusFilter(statusFilter === status.status ? 'all' : status.status)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status.status
                        ? `${status.color} text-white`
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tickets List */}
        {(activeTab === 'tickets' || activeTab === 'search') && (
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
                <Tag className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.garmentTicket.noTicketsFound', 'No tickets found')}
                </h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {searchTerm || statusFilter !== 'all'
                    ? t('tools.garmentTicket.tryAdjustingYourSearchOr', 'Try adjusting your search or filters') : t('tools.garmentTicket.createANewTicketTo', 'Create a new ticket to get started')}
                </p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        STATUS_OPTIONS.find(s => s.status === ticket.status)?.color
                      }`}>
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          #{ticket.ticketNumber}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {ticket.customerName} - {ticket.customerPhone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={ticket.status}
                        onChange={(e) => updateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                        className={`px-3 py-1.5 rounded-lg text-sm border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status.status} value={status.status}>{status.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Ticket Items */}
                  <div className="space-y-2 mb-4">
                    {ticket.items.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Shirt className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {GARMENT_TYPES.find(g => g.type === item.type)?.label}
                            {item.quantity > 1 && ` (${item.quantity}x)`}
                            {item.color && ` - ${item.color}`}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ticket Footer */}
                  <div className={`flex items-center justify-between pt-4 border-t ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Received: {ticket.receivedDate}
                      </span>
                      {ticket.promisedDate && (
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          <Clock className="w-4 h-4 inline mr-1" />
                          Promised: {ticket.promisedDate}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {ticket.deposit > 0 && (
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Deposit: ${ticket.deposit.toFixed(2)}
                        </span>
                      )}
                      <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${ticket.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 max-w-sm z-50">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-700/50 text-red-300'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{validationMessage}</p>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
}

export default GarmentTicketTool;
