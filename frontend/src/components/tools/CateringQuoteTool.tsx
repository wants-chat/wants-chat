'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UtensilsCrossed,
  Users,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  Save,
  Edit2,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
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

interface CateringQuoteToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type EventType = 'wedding' | 'corporate' | 'birthday' | 'graduation' | 'holiday' | 'other';
type ServiceStyle = 'buffet' | 'plated' | 'family-style' | 'cocktail' | 'food-stations';
type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  notes: string;
  createdAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: 'appetizer' | 'entree' | 'side' | 'dessert' | 'beverage';
  pricePerPerson: number;
  description: string;
  dietary: string[];
}

interface QuoteLineItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  pricePerPerson: number;
  subtotal: number;
}

interface CateringQuote {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientName: string;
  eventType: EventType;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  guestCount: number;
  serviceStyle: ServiceStyle;
  lineItems: QuoteLineItem[];
  subtotal: number;
  serviceFee: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  deposit: number;
  notes: string;
  status: QuoteStatus;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const EVENT_TYPES: { type: EventType; label: string }[] = [
  { type: 'wedding', label: 'Wedding' },
  { type: 'corporate', label: 'Corporate Event' },
  { type: 'birthday', label: 'Birthday Party' },
  { type: 'graduation', label: 'Graduation' },
  { type: 'holiday', label: 'Holiday Party' },
  { type: 'other', label: 'Other' },
];

const SERVICE_STYLES: { style: ServiceStyle; label: string; description: string }[] = [
  { style: 'buffet', label: 'Buffet', description: 'Self-service with multiple stations' },
  { style: 'plated', label: 'Plated Service', description: 'Individual plates served to guests' },
  { style: 'family-style', label: 'Family Style', description: 'Large platters shared at tables' },
  { style: 'cocktail', label: 'Cocktail Reception', description: 'Passed hors d\'oeuvres and finger foods' },
  { style: 'food-stations', label: 'Food Stations', description: 'Interactive themed stations' },
];

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'app-1', name: 'Bruschetta Trio', category: 'appetizer', pricePerPerson: 4.50, description: 'Tomato, mushroom, and olive tapenade', dietary: ['vegetarian'] },
  { id: 'app-2', name: 'Shrimp Cocktail', category: 'appetizer', pricePerPerson: 8.00, description: 'Chilled shrimp with cocktail sauce', dietary: ['gluten-free'] },
  { id: 'app-3', name: 'Caprese Skewers', category: 'appetizer', pricePerPerson: 5.00, description: 'Fresh mozzarella, tomato, basil', dietary: ['vegetarian', 'gluten-free'] },
  { id: 'ent-1', name: 'Grilled Salmon', category: 'entree', pricePerPerson: 28.00, description: 'Atlantic salmon with lemon dill sauce', dietary: ['gluten-free'] },
  { id: 'ent-2', name: 'Filet Mignon', category: 'entree', pricePerPerson: 42.00, description: '8oz beef tenderloin with red wine reduction', dietary: ['gluten-free'] },
  { id: 'ent-3', name: 'Chicken Marsala', category: 'entree', pricePerPerson: 24.00, description: 'Pan-seared chicken with mushroom marsala sauce', dietary: [] },
  { id: 'ent-4', name: 'Vegetable Wellington', category: 'entree', pricePerPerson: 22.00, description: 'Seasonal vegetables in puff pastry', dietary: ['vegetarian'] },
  { id: 'side-1', name: 'Roasted Vegetables', category: 'side', pricePerPerson: 6.00, description: 'Seasonal medley', dietary: ['vegan', 'gluten-free'] },
  { id: 'side-2', name: 'Garlic Mashed Potatoes', category: 'side', pricePerPerson: 5.00, description: 'Creamy with roasted garlic', dietary: ['vegetarian', 'gluten-free'] },
  { id: 'side-3', name: 'Caesar Salad', category: 'side', pricePerPerson: 7.00, description: 'Romaine, parmesan, croutons', dietary: ['vegetarian'] },
  { id: 'des-1', name: 'Chocolate Mousse', category: 'dessert', pricePerPerson: 8.00, description: 'Rich dark chocolate', dietary: ['vegetarian', 'gluten-free'] },
  { id: 'des-2', name: 'Tiramisu', category: 'dessert', pricePerPerson: 9.00, description: 'Classic Italian dessert', dietary: ['vegetarian'] },
  { id: 'bev-1', name: 'Coffee & Tea Service', category: 'beverage', pricePerPerson: 4.00, description: 'Regular and decaf', dietary: ['vegan', 'gluten-free'] },
  { id: 'bev-2', name: 'Soft Drinks', category: 'beverage', pricePerPerson: 3.00, description: 'Assorted sodas and juices', dietary: ['vegan', 'gluten-free'] },
];

const SERVICE_FEE_RATE = 0.20; // 20% service fee
const DEFAULT_TAX_RATE = 0.08; // 8% tax
const DEPOSIT_RATE = 0.50; // 50% deposit required

// Column configurations for exports
const QUOTE_COLUMNS: ColumnConfig[] = [
  { key: 'quoteNumber', header: 'Quote #', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'eventType', header: 'Event Type', type: 'string' },
  { key: 'eventDate', header: 'Event Date', type: 'date' },
  { key: 'guestCount', header: 'Guests', type: 'number' },
  { key: 'serviceStyle', header: 'Service Style', type: 'string' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'validUntil', header: 'Valid Until', type: 'date' },
];

const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'company', header: 'Company', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);
const generateQuoteNumber = () => `CQ-${Date.now().toString(36).toUpperCase()}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const CateringQuoteTool: React.FC<CateringQuoteToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [quoteErrors, setQuoteErrors] = useState<Record<string, string>>({});

  // useToolData hooks for backend sync
  const {
    data: clients,
    addItem: addClientToBackend,
    updateItem: updateClientBackend,
    deleteItem: deleteClientBackend,
    isSynced: clientsSynced,
    isSaving: clientsSaving,
    lastSaved: clientsLastSaved,
    syncError: clientsSyncError,
    forceSync: forceClientsSync,
  } = useToolData<Client>('catering-clients', [], CLIENT_COLUMNS);

  const {
    data: quotes,
    addItem: addQuoteToBackend,
    updateItem: updateQuoteBackend,
    deleteItem: deleteQuoteBackend,
    isSynced: quotesSynced,
    isSaving: quotesSaving,
    lastSaved: quotesLastSaved,
    syncError: quotesSyncError,
    forceSync: forceQuotesSync,
  } = useToolData<CateringQuote>('catering-quotes', [], QUOTE_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'quotes' | 'clients' | 'menu'>('quotes');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<CateringQuote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    clientId: '',
    eventType: 'corporate' as EventType,
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    guestCount: 50,
    serviceStyle: 'buffet' as ServiceStyle,
    notes: '',
  });

  const [selectedMenuItems, setSelectedMenuItems] = useState<QuoteLineItem[]>([]);

  // Client form state
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.client || params.eventType || params.guestCount) {
        setQuoteForm(prev => ({
          ...prev,
          eventType: (params.eventType as EventType) || prev.eventType,
          guestCount: params.guestCount || prev.guestCount,
          eventDate: params.eventDate || prev.eventDate,
          eventLocation: params.eventLocation || prev.eventLocation,
        }));
        if (params.client) {
          setClientForm(prev => ({
            ...prev,
            name: params.client || '',
            email: params.email || '',
            phone: params.phone || '',
          }));
          setShowClientForm(true);
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate quote totals
  const calculateQuoteTotals = (items: QuoteLineItem[], guestCount: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.pricePerPerson * guestCount), 0);
    const serviceFee = subtotal * SERVICE_FEE_RATE;
    const taxAmount = (subtotal + serviceFee) * DEFAULT_TAX_RATE;
    const total = subtotal + serviceFee + taxAmount;
    const deposit = total * DEPOSIT_RATE;

    return { subtotal, serviceFee, taxAmount, total, deposit };
  };

  // Add menu item to quote
  const addMenuItemToQuote = (menuItem: MenuItem) => {
    const existingIndex = selectedMenuItems.findIndex(item => item.menuItemId === menuItem.id);

    if (existingIndex === -1) {
      const newItem: QuoteLineItem = {
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity: 1,
        pricePerPerson: menuItem.pricePerPerson,
        subtotal: menuItem.pricePerPerson * quoteForm.guestCount,
      };
      setSelectedMenuItems([...selectedMenuItems, newItem]);
      if (quoteErrors.menuItems) setQuoteErrors(prev => ({ ...prev, menuItems: '' }));
    }
  };

  // Remove menu item from quote
  const removeMenuItemFromQuote = (menuItemId: string) => {
    setSelectedMenuItems(selectedMenuItems.filter(item => item.menuItemId !== menuItemId));
  };

  // Validation functions
  const validateClient = (): boolean => {
    const errors: Record<string, string> = {};
    if (!clientForm.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!clientForm.email?.trim()) {
      errors.email = 'Email is required';
    }
    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateQuote = (): boolean => {
    const errors: Record<string, string> = {};
    if (!quoteForm.clientId) {
      errors.clientId = 'Please select a client';
    }
    if (!quoteForm.eventDate) {
      errors.eventDate = 'Event date is required';
    }
    if (selectedMenuItems.length === 0) {
      errors.menuItems = 'Please select at least one menu item';
    }
    setQuoteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save client
  const saveClient = () => {
    if (!validateClient()) return;

    const client: Client = {
      id: generateId(),
      ...clientForm,
      createdAt: new Date().toISOString(),
    };

    addClientToBackend(client);
    setQuoteForm(prev => ({ ...prev, clientId: client.id }));
    setShowClientForm(false);
    setClientForm({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
    setClientErrors({});
  };

  // Save quote
  const saveQuote = () => {
    if (!validateQuote()) return;

    const client = clients.find(c => c.id === quoteForm.clientId);
    const totals = calculateQuoteTotals(selectedMenuItems, quoteForm.guestCount);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const quote: CateringQuote = {
      id: editingQuote?.id || generateId(),
      quoteNumber: editingQuote?.quoteNumber || generateQuoteNumber(),
      clientId: quoteForm.clientId,
      clientName: client?.name || '',
      eventType: quoteForm.eventType,
      eventDate: quoteForm.eventDate,
      eventTime: quoteForm.eventTime,
      eventLocation: quoteForm.eventLocation,
      guestCount: quoteForm.guestCount,
      serviceStyle: quoteForm.serviceStyle,
      lineItems: selectedMenuItems,
      subtotal: totals.subtotal,
      serviceFee: totals.serviceFee,
      taxRate: DEFAULT_TAX_RATE,
      taxAmount: totals.taxAmount,
      total: totals.total,
      deposit: totals.deposit,
      notes: quoteForm.notes,
      status: editingQuote?.status || 'draft',
      validUntil: validUntil.toISOString(),
      createdAt: editingQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingQuote) {
      updateQuoteBackend(quote.id, quote);
    } else {
      addQuoteToBackend(quote);
    }

    resetQuoteForm();
  };

  // Reset quote form
  const resetQuoteForm = () => {
    setShowQuoteForm(false);
    setEditingQuote(null);
    setQuoteForm({
      clientId: '',
      eventType: 'corporate',
      eventDate: '',
      eventTime: '',
      eventLocation: '',
      guestCount: 50,
      serviceStyle: 'buffet',
      notes: '',
    });
    setSelectedMenuItems([]);
    setQuoteErrors({});
  };

  // Edit quote
  const editQuote = (quote: CateringQuote) => {
    setEditingQuote(quote);
    setQuoteForm({
      clientId: quote.clientId,
      eventType: quote.eventType,
      eventDate: quote.eventDate,
      eventTime: quote.eventTime,
      eventLocation: quote.eventLocation,
      guestCount: quote.guestCount,
      serviceStyle: quote.serviceStyle,
      notes: quote.notes,
    });
    setSelectedMenuItems([...quote.lineItems]);
    setShowQuoteForm(true);
  };

  // Update quote status
  const updateQuoteStatus = (quoteId: string, status: QuoteStatus) => {
    updateQuoteBackend(quoteId, { status, updatedAt: new Date().toISOString() });
  };

  // Delete quote
  const deleteQuote = async (quoteId: string) => {
    const confirmed = await confirm({
      title: 'Delete Quote',
      message: 'Are you sure you want to delete this quote?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteQuoteBackend(quoteId);
    }
  };

  // Delete client
  const deleteClient = async (clientId: string) => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteClientBackend(clientId);
    }
  };

  // Filtered quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const matchesSearch = searchTerm === '' ||
        quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const totalQuotes = quotes.length;
    const pendingQuotes = quotes.filter(q => q.status === 'sent').length;
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
    const totalRevenue = quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total, 0);
    return { totalQuotes, pendingQuotes, acceptedQuotes, totalRevenue };
  }, [quotes]);

  const currentTotals = calculateQuoteTotals(selectedMenuItems, quoteForm.guestCount);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.cateringQuote.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.cateringQuote.cateringQuoteTool', 'Catering Quote Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.cateringQuote.createAndManageCateringQuotes', 'Create and manage catering quotes for events')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="catering-quote" toolName="Catering Quote" />

              <SyncStatus
                isSynced={quotesSynced}
                isSaving={quotesSaving}
                lastSaved={quotesLastSaved}
                syncError={quotesSyncError}
                onForceSync={forceQuotesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(quotes, QUOTE_COLUMNS, { filename: 'catering-quotes' })}
                onExportExcel={() => exportToExcel(quotes, QUOTE_COLUMNS, { filename: 'catering-quotes' })}
                onExportJSON={() => exportToJSON(quotes, { filename: 'catering-quotes' })}
                onExportPDF={async () => {
                  await exportToPDF(quotes, QUOTE_COLUMNS, {
                    filename: 'catering-quotes',
                    title: 'Catering Quotes Report',
                    subtitle: `${quotes.length} quotes | ${formatCurrency(stats.totalRevenue)} accepted revenue`,
                  });
                }}
                onPrint={() => printData(quotes, QUOTE_COLUMNS, { title: 'Catering Quotes' })}
                onCopyToClipboard={async () => await copyUtil(quotes, QUOTE_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cateringQuote.totalQuotes', 'Total Quotes')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalQuotes}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cateringQuote.pending', 'Pending')}</p>
              <p className={`text-2xl font-bold text-yellow-500`}>{stats.pendingQuotes}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cateringQuote.accepted', 'Accepted')}</p>
              <p className={`text-2xl font-bold text-green-500`}>{stats.acceptedQuotes}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cateringQuote.revenue', 'Revenue')}</p>
              <p className={`text-2xl font-bold text-[#0D9488]`}>{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'quotes', label: 'Quotes', icon: <FileText className="w-4 h-4" /> },
              { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
              { id: 'menu', label: 'Menu Items', icon: <UtensilsCrossed className="w-4 h-4" /> },
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

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.cateringQuote.searchQuotes', 'Search quotes...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.cateringQuote.allStatus', 'All Status')}</option>
                  <option value="draft">{t('tools.cateringQuote.draft', 'Draft')}</option>
                  <option value="sent">{t('tools.cateringQuote.sent', 'Sent')}</option>
                  <option value="accepted">{t('tools.cateringQuote.accepted2', 'Accepted')}</option>
                  <option value="declined">{t('tools.cateringQuote.declined', 'Declined')}</option>
                  <option value="expired">{t('tools.cateringQuote.expired', 'Expired')}</option>
                </select>
              </div>
              <button
                onClick={() => setShowQuoteForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.cateringQuote.newQuote', 'New Quote')}
              </button>
            </div>

            {/* Quote Form Modal */}
            {showQuoteForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {editingQuote ? t('tools.cateringQuote.editQuote', 'Edit Quote') : t('tools.cateringQuote.createNewQuote', 'Create New Quote')}
                      </h2>
                      <button onClick={resetQuoteForm} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Client Selection */}
                    <div className="mb-6">
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.cateringQuote.client', 'Client *')}
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={quoteForm.clientId}
                          onChange={(e) => {
                            setQuoteForm({ ...quoteForm, clientId: e.target.value });
                            if (quoteErrors.clientId) setQuoteErrors(prev => ({ ...prev, clientId: '' }));
                          }}
                          className={`flex-1 px-4 py-2 rounded-lg border ${
                            quoteErrors.clientId ? 'border-red-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                          } ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                        >
                          <option value="">{t('tools.cateringQuote.selectAClient', 'Select a client')}</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setShowClientForm(true)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {quoteErrors.clientId && <p className="text-red-500 text-xs mt-1">{quoteErrors.clientId}</p>}
                    </div>

                    {/* Event Details */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.cateringQuote.eventType2', 'Event Type')}
                        </label>
                        <select
                          value={quoteForm.eventType}
                          onChange={(e) => setQuoteForm({ ...quoteForm, eventType: e.target.value as EventType })}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          {EVENT_TYPES.map(type => (
                            <option key={type.type} value={type.type}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.cateringQuote.serviceStyle2', 'Service Style')}
                        </label>
                        <select
                          value={quoteForm.serviceStyle}
                          onChange={(e) => setQuoteForm({ ...quoteForm, serviceStyle: e.target.value as ServiceStyle })}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          {SERVICE_STYLES.map(style => (
                            <option key={style.style} value={style.style}>{style.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.cateringQuote.eventDate', 'Event Date *')}
                        </label>
                        <input
                          type="date"
                          value={quoteForm.eventDate}
                          onChange={(e) => {
                            setQuoteForm({ ...quoteForm, eventDate: e.target.value });
                            if (quoteErrors.eventDate) setQuoteErrors(prev => ({ ...prev, eventDate: '' }));
                          }}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            quoteErrors.eventDate ? 'border-red-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                          } ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                        />
                        {quoteErrors.eventDate && <p className="text-red-500 text-xs mt-1">{quoteErrors.eventDate}</p>}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.cateringQuote.eventTime', 'Event Time')}
                        </label>
                        <input
                          type="time"
                          value={quoteForm.eventTime}
                          onChange={(e) => setQuoteForm({ ...quoteForm, eventTime: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.cateringQuote.guestCount', 'Guest Count *')}
                        </label>
                        <input
                          type="number"
                          value={quoteForm.guestCount}
                          onChange={(e) => setQuoteForm({ ...quoteForm, guestCount: parseInt(e.target.value) || 0 })}
                          min="1"
                          className={`w-full px-4 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.cateringQuote.eventLocation', 'Event Location')}
                        </label>
                        <input
                          type="text"
                          value={quoteForm.eventLocation}
                          onChange={(e) => setQuoteForm({ ...quoteForm, eventLocation: e.target.value })}
                          placeholder={t('tools.cateringQuote.venueAddress', 'Venue address')}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Menu Selection */}
                    <div className="mb-6">
                      <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.cateringQuote.selectMenuItems', 'Select Menu Items *')}
                      </h3>
                      {quoteErrors.menuItems && <p className="text-red-500 text-xs mb-2">{quoteErrors.menuItems}</p>}
                      <div className={`grid grid-cols-2 gap-4 ${quoteErrors.menuItems ? 'border border-red-500 rounded-lg p-2' : ''}`}>
                        <div className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cateringQuote.availableItems', 'Available Items')}</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {DEFAULT_MENU_ITEMS.map(item => (
                              <div
                                key={item.id}
                                onClick={() => addMenuItemToQuote(item)}
                                className={`p-2 rounded cursor-pointer ${
                                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                } ${selectedMenuItems.some(i => i.menuItemId === item.id) ? 'opacity-50' : ''}`}
                              >
                                <div className="flex justify-between">
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{item.name}</span>
                                  <span className="text-[#0D9488]">{formatCurrency(item.pricePerPerson)}/pp</span>
                                </div>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.category}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cateringQuote.selectedItems', 'Selected Items')}</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedMenuItems.map(item => (
                              <div key={item.menuItemId} className={`p-2 rounded flex justify-between items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{item.menuItemName}</span>
                                <button onClick={() => removeMenuItemFromQuote(item.menuItemId)} className="text-red-500 hover:text-red-700">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {selectedMenuItems.length === 0 && (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cateringQuote.clickItemsToAddThem', 'Click items to add them')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quote Summary */}
                    <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.cateringQuote.quoteSummary', 'Quote Summary')}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Subtotal ({quoteForm.guestCount} guests)</span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(currentTotals.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.cateringQuote.serviceFee20', 'Service Fee (20%)')}</span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(currentTotals.serviceFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.cateringQuote.tax8', 'Tax (8%)')}</span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(currentTotals.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{t('tools.cateringQuote.total', 'Total')}</span>
                          <span className="text-[#0D9488]">{formatCurrency(currentTotals.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('tools.cateringQuote.depositRequired50', 'Deposit Required (50%)')}</span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(currentTotals.deposit)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.cateringQuote.notes', 'Notes')}
                      </label>
                      <textarea
                        value={quoteForm.notes}
                        onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                        rows={3}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('tools.cateringQuote.specialRequestsDietaryNotesEtc', 'Special requests, dietary notes, etc.')}
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={resetQuoteForm}
                        className={`px-4 py-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {t('tools.cateringQuote.cancel', 'Cancel')}
                      </button>
                      <button
                        onClick={saveQuote}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                      >
                        <Save className="w-4 h-4" />
                        {editingQuote ? t('tools.cateringQuote.updateQuote', 'Update Quote') : t('tools.cateringQuote.createQuote', 'Create Quote')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Client Form Modal */}
            {showClientForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.cateringQuote.addNewClient', 'Add New Client')}</h2>
                      <button onClick={() => setShowClientForm(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cateringQuote.name', 'Name *')}</label>
                        <input
                          type="text"
                          value={clientForm.name}
                          onChange={(e) => {
                            setClientForm({ ...clientForm, name: e.target.value });
                            if (clientErrors.name) setClientErrors(prev => ({ ...prev, name: '' }));
                          }}
                          className={`w-full px-4 py-2 rounded-lg border ${clientErrors.name ? 'border-red-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                        />
                        {clientErrors.name && <p className="text-red-500 text-xs mt-1">{clientErrors.name}</p>}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cateringQuote.email', 'Email *')}</label>
                        <input
                          type="email"
                          value={clientForm.email}
                          onChange={(e) => {
                            setClientForm({ ...clientForm, email: e.target.value });
                            if (clientErrors.email) setClientErrors(prev => ({ ...prev, email: '' }));
                          }}
                          className={`w-full px-4 py-2 rounded-lg border ${clientErrors.email ? 'border-red-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                        />
                        {clientErrors.email && <p className="text-red-500 text-xs mt-1">{clientErrors.email}</p>}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cateringQuote.phone', 'Phone')}</label>
                        <input
                          type="tel"
                          value={clientForm.phone}
                          onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cateringQuote.company', 'Company')}</label>
                        <input
                          type="text"
                          value={clientForm.company}
                          onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cateringQuote.address', 'Address')}</label>
                        <input
                          type="text"
                          value={clientForm.address}
                          onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => { setShowClientForm(false); setClientErrors({}); }} className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        {t('tools.cateringQuote.cancel2', 'Cancel')}
                      </button>
                      <button onClick={saveClient} className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90">
                        <Plus className="w-4 h-4" />
                        {t('tools.cateringQuote.addClient', 'Add Client')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quotes List */}
            <div className="space-y-4">
              {filteredQuotes.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.cateringQuote.noQuotesFoundCreateYour', 'No quotes found. Create your first quote!')}</p>
                </div>
              ) : (
                filteredQuotes.map(quote => (
                  <div key={quote.id} className={`border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div
                      className={`p-4 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                      onClick={() => setExpandedQuoteId(expandedQuoteId === quote.id ? null : quote.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{quote.quoteNumber}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{quote.clientName}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            quote.status === 'declined' ? 'bg-red-100 text-red-700' :
                            quote.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-semibold text-[#0D9488]`}>{formatCurrency(quote.total)}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(quote.eventDate)} | {quote.guestCount} guests
                            </p>
                          </div>
                          {expandedQuoteId === quote.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {expandedQuoteId === quote.id && (
                      <div className={`border-t p-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cateringQuote.eventType', 'Event Type')}</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{EVENT_TYPES.find(t => t.type === quote.eventType)?.label}</p>
                          </div>
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cateringQuote.serviceStyle', 'Service Style')}</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{SERVICE_STYLES.find(s => s.style === quote.serviceStyle)?.label}</p>
                          </div>
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cateringQuote.location', 'Location')}</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{quote.eventLocation || 'TBD'}</p>
                          </div>
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cateringQuote.validUntil', 'Valid Until')}</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatDate(quote.validUntil)}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cateringQuote.menuItems', 'Menu Items')}</p>
                          <div className="space-y-1">
                            {quote.lineItems.map(item => (
                              <div key={item.menuItemId} className="flex justify-between text-sm">
                                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{item.menuItemName}</span>
                                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatCurrency(item.pricePerPerson)}/pp</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          {quote.status === 'draft' && (
                            <button
                              onClick={() => updateQuoteStatus(quote.id, 'sent')}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              <Send className="w-3 h-3" />
                              {t('tools.cateringQuote.send', 'Send')}
                            </button>
                          )}
                          {quote.status === 'sent' && (
                            <>
                              <button
                                onClick={() => updateQuoteStatus(quote.id, 'accepted')}
                                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                              >
                                <CheckCircle className="w-3 h-3" />
                                {t('tools.cateringQuote.accept', 'Accept')}
                              </button>
                              <button
                                onClick={() => updateQuoteStatus(quote.id, 'declined')}
                                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                              >
                                <X className="w-3 h-3" />
                                {t('tools.cateringQuote.decline', 'Decline')}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => editQuote(quote)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                          >
                            <Edit2 className="w-3 h-3" />
                            {t('tools.cateringQuote.edit', 'Edit')}
                          </button>
                          <button
                            onClick={() => deleteQuote(quote.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.cateringQuote.clients', 'Clients')}</h2>
              <button
                onClick={() => setShowClientForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.cateringQuote.addClient2', 'Add Client')}
              </button>
            </div>

            <div className="space-y-4">
              {clients.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.cateringQuote.noClientsYetAddYour', 'No clients yet. Add your first client!')}</p>
                </div>
              ) : (
                clients.map(client => (
                  <div key={client.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{client.name}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{client.email} | {client.phone}</p>
                        {client.company && <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{client.company}</p>}
                      </div>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.cateringQuote.menuItems2', 'Menu Items')}</h2>

            {['appetizer', 'entree', 'side', 'dessert', 'beverage'].map(category => (
              <div key={category} className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{category}s</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DEFAULT_MENU_ITEMS.filter(item => item.category === category).map(item => (
                    <div key={item.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                        <span className="text-[#0D9488] font-semibold">{formatCurrency(item.pricePerPerson)}</span>
                      </div>
                      <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                      {item.dietary.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {item.dietary.map(d => (
                            <span key={d} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">{d}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default CateringQuoteTool;
