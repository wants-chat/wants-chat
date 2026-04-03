'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  Home,
  Building,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Phone,
  Mail,
  MapPin,
  Key,
  Ruler,
  Camera,
  FileText,
  Star,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientPropertyToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone: string;
  preferredContact: 'email' | 'phone' | 'text';
  billingAddress: string;
  notes: string;
  status: 'active' | 'inactive' | 'prospect';
  source: string;
  createdAt: string;
  totalSpent: number;
  lastServiceDate: string;
}

interface Property {
  id: string;
  clientId: string;
  name: string;
  address: string;
  type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'office' | 'retail' | 'warehouse' | 'other';
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  hasGarage: boolean;
  hasBasement: boolean;
  hasAttic: boolean;
  hasPets: boolean;
  petDetails: string;
  accessCode: string;
  accessInstructions: string;
  specialInstructions: string;
  preferredDay: string;
  preferredTime: string;
  basePrice: number;
  photos: string[];
  notes: string;
  createdAt: string;
  lastCleaned: string;
}

interface ServiceHistory {
  id: string;
  clientId: string;
  propertyId: string;
  date: string;
  serviceType: string;
  amount: number;
  notes: string;
  rating: number;
}

// Column configurations for export
const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'billingAddress', header: 'Billing Address', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'totalSpent', header: 'Total Spent', type: 'currency' },
  { key: 'lastServiceDate', header: 'Last Service', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const PROPERTY_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'name', header: 'Property Name', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'squareFeet', header: 'Sq Ft', type: 'number' },
  { key: 'bedrooms', header: 'Beds', type: 'number' },
  { key: 'bathrooms', header: 'Baths', type: 'number' },
  { key: 'basePrice', header: 'Base Price', type: 'currency' },
  { key: 'lastCleaned', header: 'Last Cleaned', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getStatusColor = (status: Client['status'], theme: string) => {
  const colors: Record<Client['status'], string> = {
    active: theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
    inactive: theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700',
    prospect: theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
  };
  return colors[status];
};

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'other', label: 'Other' },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Main Component
export const ClientPropertyTool: React.FC<ClientPropertyToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

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
  } = useToolData<Client>('client-property-clients', [], CLIENT_COLUMNS);

  const {
    data: properties,
    addItem: addPropertyToBackend,
    updateItem: updatePropertyBackend,
    deleteItem: deletePropertyBackend,
  } = useToolData<Property>('client-property-properties', [], PROPERTY_COLUMNS);

  const {
    data: serviceHistory,
    addItem: addServiceHistoryToBackend,
  } = useToolData<ServiceHistory>('client-property-history', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'clients' | 'properties'>('clients');
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Form states
  const [newClient, setNewClient] = useState<Partial<Client>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    altPhone: '',
    preferredContact: 'email',
    billingAddress: '',
    notes: '',
    status: 'prospect',
    source: '',
  });

  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    clientId: '',
    name: '',
    address: '',
    type: 'house',
    squareFeet: 0,
    bedrooms: 0,
    bathrooms: 0,
    floors: 1,
    hasGarage: false,
    hasBasement: false,
    hasAttic: false,
    hasPets: false,
    petDetails: '',
    accessCode: '',
    accessInstructions: '',
    specialInstructions: '',
    preferredDay: '',
    preferredTime: '',
    basePrice: 0,
    photos: [],
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.client || params.firstName || params.lastName) {
        setNewClient({
          ...newClient,
          firstName: params.firstName || '',
          lastName: params.lastName || params.client?.split(' ').pop() || '',
          email: params.email || '',
          phone: params.phone || '',
        });
        setShowClientForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        fullName.includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, filterStatus]);

  // Get properties for a client
  const getClientProperties = (clientId: string) => {
    return properties.filter((p) => p.clientId === clientId);
  };

  // Statistics
  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === 'active').length;
    const totalProperties = properties.length;
    const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
    return { totalClients, activeClients, totalProperties, totalRevenue };
  }, [clients, properties]);

  // Add client
  const addClient = () => {
    if (!newClient.firstName || !newClient.lastName) {
      setValidationMessage('Please enter first and last name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const client: Client = {
      id: generateId(),
      firstName: newClient.firstName || '',
      lastName: newClient.lastName || '',
      email: newClient.email || '',
      phone: newClient.phone || '',
      altPhone: newClient.altPhone || '',
      preferredContact: newClient.preferredContact || 'email',
      billingAddress: newClient.billingAddress || '',
      notes: newClient.notes || '',
      status: newClient.status || 'prospect',
      source: newClient.source || '',
      createdAt: new Date().toISOString(),
      totalSpent: 0,
      lastServiceDate: '',
    };

    addClientToBackend(client);
    setShowClientForm(false);
    resetClientForm();
  };

  // Update client
  const saveEditingClient = () => {
    if (!editingClient) return;
    updateClientBackend(editingClient.id, editingClient);
    setEditingClient(null);
  };

  // Delete client
  const deleteClient = async (clientId: string) => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client and all their properties?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      // Delete associated properties
      properties.filter((p) => p.clientId === clientId).forEach((p) => deletePropertyBackend(p.id));
      deleteClientBackend(clientId);
    }
  };

  // Add property
  const addProperty = () => {
    if (!newProperty.clientId || !newProperty.address) {
      setValidationMessage('Please select a client and enter an address');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const property: Property = {
      id: generateId(),
      clientId: newProperty.clientId || '',
      name: newProperty.name || newProperty.address?.split(',')[0] || '',
      address: newProperty.address || '',
      type: newProperty.type || 'house',
      squareFeet: newProperty.squareFeet || 0,
      bedrooms: newProperty.bedrooms || 0,
      bathrooms: newProperty.bathrooms || 0,
      floors: newProperty.floors || 1,
      hasGarage: newProperty.hasGarage || false,
      hasBasement: newProperty.hasBasement || false,
      hasAttic: newProperty.hasAttic || false,
      hasPets: newProperty.hasPets || false,
      petDetails: newProperty.petDetails || '',
      accessCode: newProperty.accessCode || '',
      accessInstructions: newProperty.accessInstructions || '',
      specialInstructions: newProperty.specialInstructions || '',
      preferredDay: newProperty.preferredDay || '',
      preferredTime: newProperty.preferredTime || '',
      basePrice: newProperty.basePrice || 0,
      photos: newProperty.photos || [],
      notes: newProperty.notes || '',
      createdAt: new Date().toISOString(),
      lastCleaned: '',
    };

    addPropertyToBackend(property);
    setShowPropertyForm(false);
    resetPropertyForm();
  };

  // Reset forms
  const resetClientForm = () => {
    setNewClient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      altPhone: '',
      preferredContact: 'email',
      billingAddress: '',
      notes: '',
      status: 'prospect',
      source: '',
    });
  };

  const resetPropertyForm = () => {
    setNewProperty({
      clientId: '',
      name: '',
      address: '',
      type: 'house',
      squareFeet: 0,
      bedrooms: 0,
      bathrooms: 0,
      floors: 1,
      hasGarage: false,
      hasBasement: false,
      hasAttic: false,
      hasPets: false,
      petDetails: '',
      accessCode: '',
      accessInstructions: '',
      specialInstructions: '',
      preferredDay: '',
      preferredTime: '',
      basePrice: 0,
      photos: [],
      notes: '',
    });
  };

  // Export data preparation
  const prepareClientExportData = () => {
    return clients.map((client) => ({
      ...client,
      propertiesCount: getClientProperties(client.id).length,
    }));
  };

  const preparePropertyExportData = () => {
    return properties.map((property) => {
      const client = clients.find((c) => c.id === property.clientId);
      return {
        ...property,
        clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown',
      };
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.clientProperty.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.clientProperty.clientPropertyManager', 'Client & Property Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.clientProperty.manageClientsPropertiesAndService', 'Manage clients, properties, and service details')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="client-property" toolName="Client Property" />

              <SyncStatus
                isSynced={clientsSynced}
                isSaving={clientsSaving}
                lastSaved={clientsLastSaved}
                syncError={clientsSyncError}
                onForceSync={forceClientsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(
                  activeTab === 'clients' ? prepareClientExportData() : preparePropertyExportData(),
                  activeTab === 'clients' ? CLIENT_COLUMNS : PROPERTY_COLUMNS,
                  { filename: `${activeTab}-data` }
                )}
                onExportExcel={() => exportToExcel(
                  activeTab === 'clients' ? prepareClientExportData() : preparePropertyExportData(),
                  activeTab === 'clients' ? CLIENT_COLUMNS : PROPERTY_COLUMNS,
                  { filename: `${activeTab}-data` }
                )}
                onExportJSON={() => exportToJSON(
                  activeTab === 'clients' ? prepareClientExportData() : preparePropertyExportData(),
                  { filename: `${activeTab}-data` }
                )}
                onExportPDF={async () => {
                  await exportToPDF(
                    activeTab === 'clients' ? prepareClientExportData() : preparePropertyExportData(),
                    activeTab === 'clients' ? CLIENT_COLUMNS : PROPERTY_COLUMNS,
                    {
                      filename: `${activeTab}-data`,
                      title: activeTab === 'clients' ? t('tools.clientProperty.clientReport', 'Client Report') : t('tools.clientProperty.propertyReport', 'Property Report'),
                      subtitle: `${activeTab === 'clients' ? clients.length : properties.length} records`,
                    }
                  );
                }}
                onPrint={() => printData(
                  activeTab === 'clients' ? prepareClientExportData() : preparePropertyExportData(),
                  activeTab === 'clients' ? CLIENT_COLUMNS : PROPERTY_COLUMNS,
                  { title: activeTab === 'clients' ? t('tools.clientProperty.clients', 'Clients') : t('tools.clientProperty.properties3', 'Properties') }
                )}
                onCopyToClipboard={async () => await copyUtil(
                  activeTab === 'clients' ? prepareClientExportData() : preparePropertyExportData(),
                  activeTab === 'clients' ? CLIENT_COLUMNS : PROPERTY_COLUMNS,
                  'tab'
                )}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
              { id: 'properties', label: 'Properties', icon: <Home className="w-4 h-4" /> },
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientProperty.totalClients', 'Total Clients')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalClients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientProperty.activeClients', 'Active Clients')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.activeClients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0D9488]/20 rounded-lg">
                  <Home className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientProperty.properties', 'Properties')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalProperties}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientProperty.totalRevenue', 'Total Revenue')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.clientProperty.searchClients', 'Search clients...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-9 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.clientProperty.allStatus', 'All Status')}</option>
                    <option value="active">{t('tools.clientProperty.active', 'Active')}</option>
                    <option value="inactive">{t('tools.clientProperty.inactive', 'Inactive')}</option>
                    <option value="prospect">{t('tools.clientProperty.prospect', 'Prospect')}</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowClientForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.clientProperty.addClient', 'Add Client')}
                </button>
              </div>
            </div>

            {/* Client List */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-0">
                {filteredClients.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.clientProperty.noClientsFoundAddYour', 'No clients found. Add your first client to get started.')}
                  </p>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredClients.map((client) => {
                      const clientProperties = getClientProperties(client.id);
                      const isExpanded = expandedClientId === client.id;
                      return (
                        <div key={client.id} className={theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {client.firstName} {client.lastName}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status, theme)}`}>
                                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    {client.email && (
                                      <span className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <Mail className="w-3 h-3" />
                                        {client.email}
                                      </span>
                                    )}
                                    {client.phone && (
                                      <span className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <Phone className="w-3 h-3" />
                                        {client.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {clientProperties.length} propert{clientProperties.length === 1 ? 'y' : 'ies'}
                                  </p>
                                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {formatCurrency(client.totalSpent)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                                    className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => setEditingClient(client)}
                                    className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteClient(client.id)}
                                    className="p-2 rounded text-red-500 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Properties */}
                          {isExpanded && (
                            <div className={`px-4 pb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {t('tools.clientProperty.properties2', 'Properties')}
                                </h4>
                                <button
                                  onClick={() => {
                                    setNewProperty({ ...newProperty, clientId: client.id });
                                    setShowPropertyForm(true);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1 text-sm bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                                >
                                  <Plus className="w-3 h-3" />
                                  {t('tools.clientProperty.addProperty', 'Add Property')}
                                </button>
                              </div>
                              {clientProperties.length === 0 ? (
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {t('tools.clientProperty.noPropertiesForThisClient', 'No properties for this client yet.')}
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {clientProperties.map((property) => (
                                    <div
                                      key={property.id}
                                      className={`p-3 rounded-lg border ${
                                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          {property.type === 'office' || property.type === 'retail' || property.type === 'warehouse' ? (
                                            <Building className="w-4 h-4 text-[#0D9488]" />
                                          ) : (
                                            <Home className="w-4 h-4 text-[#0D9488]" />
                                          )}
                                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            {property.name || property.address.split(',')[0]}
                                          </span>
                                        </div>
                                        <button
                                          onClick={() => deletePropertyBackend(property.id)}
                                          className="p-1 rounded text-red-500 hover:bg-red-500/10"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {property.address}
                                      </p>
                                      <div className={`flex items-center gap-3 mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {property.bedrooms > 0 && <span>{property.bedrooms} bed</span>}
                                        {property.bathrooms > 0 && <span>{property.bathrooms} bath</span>}
                                        {property.squareFeet > 0 && <span>{property.squareFeet} sqft</span>}
                                      </div>
                                      {property.basePrice > 0 && (
                                        <p className={`mt-2 font-medium ${theme === 'dark' ? t('tools.clientProperty.text0d9488', 'text-[#0D9488]') : t('tools.clientProperty.text0d94882', 'text-[#0D9488]')}`}>
                                          {formatCurrency(property.basePrice)}/service
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.clientProperty.searchProperties', 'Search properties...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-9 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <button
                  onClick={() => setShowPropertyForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.clientProperty.addProperty2', 'Add Property')}
                </button>
              </div>
            </div>

            {/* Properties Grid */}
            {properties.length === 0 ? (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-8">
                  <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.clientProperty.noPropertiesFoundAddA', 'No properties found. Add a client first, then add their properties.')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties
                  .filter((p) =>
                    searchTerm === '' ||
                    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((property) => {
                    const client = clients.find((c) => c.id === property.clientId);
                    return (
                      <Card
                        key={property.id}
                        className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                {property.type === 'office' || property.type === 'retail' || property.type === 'warehouse' ? (
                                  <Building className="w-5 h-5 text-[#0D9488]" />
                                ) : (
                                  <Home className="w-5 h-5 text-[#0D9488]" />
                                )}
                              </div>
                              <div>
                                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {property.name || property.address.split(',')[0]}
                                </h3>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => deletePropertyBackend(property.id)}
                              className="p-1 rounded text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className={`flex items-center gap-1 text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <MapPin className="w-3 h-3" />
                            {property.address}
                          </div>

                          <div className={`flex flex-wrap gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className={`px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              {PROPERTY_TYPES.find((t) => t.value === property.type)?.label}
                            </span>
                            {property.bedrooms > 0 && (
                              <span className={`px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                {property.bedrooms} bed
                              </span>
                            )}
                            {property.bathrooms > 0 && (
                              <span className={`px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                {property.bathrooms} bath
                              </span>
                            )}
                            {property.squareFeet > 0 && (
                              <span className={`px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                {property.squareFeet} sqft
                              </span>
                            )}
                          </div>

                          {(property.hasPets || property.accessCode) && (
                            <div className={`flex items-center gap-2 mt-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {property.hasPets && (
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {t('tools.clientProperty.hasPets2', 'Has pets')}
                                </span>
                              )}
                              {property.accessCode && (
                                <span className="flex items-center gap-1">
                                  <Key className="w-3 h-3" />
                                  {t('tools.clientProperty.accessCodeSet', 'Access code set')}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-3 border-t dark:border-gray-700">
                            {property.basePrice > 0 ? (
                              <span className={`font-semibold ${theme === 'dark' ? t('tools.clientProperty.text0d94883', 'text-[#0D9488]') : t('tools.clientProperty.text0d94884', 'text-[#0D9488]')}`}>
                                {formatCurrency(property.basePrice)}
                              </span>
                            ) : (
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                {t('tools.clientProperty.noPriceSet', 'No price set')}
                              </span>
                            )}
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Last: {formatDate(property.lastCleaned)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Client Form Modal */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.clientProperty.addClient2', 'Add Client')}
                </h2>
                <button onClick={() => { setShowClientForm(false); resetClientForm(); }} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientProperty.firstName', 'First Name *')}
                    </label>
                    <input
                      type="text"
                      value={newClient.firstName}
                      onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientProperty.lastName', 'Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={newClient.lastName}
                      onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.clientProperty.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientProperty.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientProperty.status', 'Status')}
                    </label>
                    <select
                      value={newClient.status}
                      onChange={(e) => setNewClient({ ...newClient, status: e.target.value as Client['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="prospect">{t('tools.clientProperty.prospect2', 'Prospect')}</option>
                      <option value="active">{t('tools.clientProperty.active2', 'Active')}</option>
                      <option value="inactive">{t('tools.clientProperty.inactive2', 'Inactive')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.clientProperty.billingAddress', 'Billing Address')}
                  </label>
                  <input
                    type="text"
                    value={newClient.billingAddress}
                    onChange={(e) => setNewClient({ ...newClient, billingAddress: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.clientProperty.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => { setShowClientForm(false); resetClientForm(); }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.clientProperty.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={addClient}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.clientProperty.addClient3', 'Add Client')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Property Form Modal */}
        {showPropertyForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.clientProperty.addProperty3', 'Add Property')}
                </h2>
                <button onClick={() => { setShowPropertyForm(false); resetPropertyForm(); }} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.clientProperty.client', 'Client *')}
                  </label>
                  <select
                    value={newProperty.clientId}
                    onChange={(e) => setNewProperty({ ...newProperty, clientId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.clientProperty.selectAClient', 'Select a client')}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.clientProperty.address', 'Address *')}
                  </label>
                  <input
                    type="text"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientProperty.propertyType', 'Property Type')}
                    </label>
                    <select
                      value={newProperty.type}
                      onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value as Property['type'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      {PROPERTY_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientProperty.squareFeet', 'Square Feet')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newProperty.squareFeet}
                      onChange={(e) => setNewProperty({ ...newProperty, squareFeet: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientProperty.bedrooms', 'Bedrooms')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newProperty.bedrooms}
                      onChange={(e) => setNewProperty({ ...newProperty, bedrooms: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientProperty.bathrooms', 'Bathrooms')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={newProperty.bathrooms}
                      onChange={(e) => setNewProperty({ ...newProperty, bathrooms: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientProperty.basePrice', 'Base Price')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={newProperty.basePrice}
                      onChange={(e) => setNewProperty({ ...newProperty, basePrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newProperty.hasPets}
                      onChange={(e) => setNewProperty({ ...newProperty, hasPets: e.target.checked })}
                      className="rounded"
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.clientProperty.hasPets', 'Has Pets')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newProperty.hasGarage}
                      onChange={(e) => setNewProperty({ ...newProperty, hasGarage: e.target.checked })}
                      className="rounded"
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.clientProperty.garage', 'Garage')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newProperty.hasBasement}
                      onChange={(e) => setNewProperty({ ...newProperty, hasBasement: e.target.checked })}
                      className="rounded"
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.clientProperty.basement', 'Basement')}</span>
                  </label>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.clientProperty.accessCode', 'Access Code')}
                  </label>
                  <input
                    type="text"
                    value={newProperty.accessCode}
                    onChange={(e) => setNewProperty({ ...newProperty, accessCode: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.clientProperty.specialInstructions', 'Special Instructions')}
                  </label>
                  <textarea
                    value={newProperty.specialInstructions}
                    onChange={(e) => setNewProperty({ ...newProperty, specialInstructions: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => { setShowPropertyForm(false); resetPropertyForm(); }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.clientProperty.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={addProperty}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.clientProperty.addProperty4', 'Add Property')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.clientProperty.aboutThisTool', 'About This Tool')}
          </h3>
          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              Manage your cleaning clients and their properties efficiently. Store contact information,
              property details, access codes, and special instructions all in one place.
            </p>
            <p>
              {t('tools.clientProperty.allDataIsSyncedTo', 'All data is synced to your account for access across devices.')}
            </p>
          </div>
        </div>

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-40">
            <AlertCircle className="w-4 h-4" />
            {validationMessage}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ClientPropertyTool;
