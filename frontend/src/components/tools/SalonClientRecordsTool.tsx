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
import { type ColumnConfig } from '../../lib/toolDataUtils';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Palette,
  Scissors,
  FileText,
  AlertTriangle,
  Image,
  Star,
  DollarSign,
  Crown,
  Users,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  Sparkles,
  Droplets,
  Loader2,
} from 'lucide-react';
import { useConfirmDialog } from '../ui/ConfirmDialog';

// Types
interface ColorFormula {
  id: string;
  date: string;
  formula: string;
  developer: string;
  processingTime: string;
  notes: string;
}

interface ServiceRecord {
  id: string;
  date: string;
  service: string;
  stylist: string;
  price: number;
  duration: string;
  notes: string;
  colorFormula?: ColorFormula;
}

interface HairProfile {
  naturalColor: string;
  currentColor: string;
  texture: string;
  condition: string;
  porosity: string;
  density: string;
  notes: string;
  colorHistory: string[];
}

interface PhotoRecord {
  id: string;
  date: string;
  type: 'before' | 'after';
  description: string;
  placeholder: boolean;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthday: string;
  hairProfile: HairProfile;
  serviceHistory: ServiceRecord[];
  productPreferences: string[];
  allergies: string[];
  skinSensitivities: string[];
  photos: PhotoRecord[];
  preferredStylist: string;
  totalSpent: number;
  visitCount: number;
  loyaltyStatus: 'regular' | 'silver' | 'gold' | 'platinum' | 'vip';
  referralSource: string;
  referredBy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const defaultHairProfile: HairProfile = {
  naturalColor: '',
  currentColor: '',
  texture: '',
  condition: '',
  porosity: '',
  density: '',
  notes: '',
  colorHistory: [],
};

const defaultClient: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  birthday: '',
  hairProfile: defaultHairProfile,
  serviceHistory: [],
  productPreferences: [],
  allergies: [],
  skinSensitivities: [],
  photos: [],
  preferredStylist: '',
  totalSpent: 0,
  visitCount: 0,
  loyaltyStatus: 'regular',
  referralSource: '',
  referredBy: '',
  notes: '',
};

const loyaltyColors = {
  regular: 'bg-gray-500',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-purple-500',
  vip: 'bg-gradient-to-r from-pink-500 to-purple-500',
};

const textureOptions = ['Straight', 'Wavy', 'Curly', 'Coily', 'Mixed'];
const conditionOptions = ['Healthy', 'Dry', 'Oily', 'Damaged', 'Chemically Treated', 'Color Treated'];
const porosityOptions = ['Low', 'Medium', 'High'];
const densityOptions = ['Fine', 'Medium', 'Thick'];
const referralSources = ['Walk-in', 'Referral', 'Social Media', 'Google', 'Yelp', 'Website', 'Other'];

interface SalonClientRecordsToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'birthday', header: 'Birthday', type: 'date' },
  { key: 'preferredStylist', header: 'Preferred Stylist', type: 'string' },
  { key: 'loyaltyStatus', header: 'Loyalty Status', type: 'string' },
  { key: 'totalSpent', header: 'Total Spent', type: 'currency' },
  { key: 'visitCount', header: 'Visit Count', type: 'number' },
  { key: 'naturalColor', header: 'Natural Hair Color', type: 'string' },
  { key: 'currentColor', header: 'Current Hair Color', type: 'string' },
  { key: 'hairTexture', header: 'Hair Texture', type: 'string' },
  { key: 'hairCondition', header: 'Hair Condition', type: 'string' },
  { key: 'hairPorosity', header: 'Hair Porosity', type: 'string' },
  { key: 'hairDensity', header: 'Hair Density', type: 'string' },
  { key: 'allergies', header: 'Allergies', type: 'string' },
  { key: 'skinSensitivities', header: 'Skin Sensitivities', type: 'string' },
  { key: 'productPreferences', header: 'Product Preferences', type: 'string' },
  { key: 'referralSource', header: 'Referral Source', type: 'string' },
  { key: 'referredBy', header: 'Referred By', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

// Helper function to flatten client data for export
const flattenClientForExport = (client: Client) => ({
  firstName: client.firstName,
  lastName: client.lastName,
  phone: client.phone,
  email: client.email,
  birthday: client.birthday,
  preferredStylist: client.preferredStylist,
  loyaltyStatus: client.loyaltyStatus,
  totalSpent: client.totalSpent,
  visitCount: client.visitCount,
  naturalColor: client.hairProfile.naturalColor,
  currentColor: client.hairProfile.currentColor,
  hairTexture: client.hairProfile.texture,
  hairCondition: client.hairProfile.condition,
  hairPorosity: client.hairProfile.porosity,
  hairDensity: client.hairProfile.density,
  allergies: client.allergies.join(', '),
  skinSensitivities: client.skinSensitivities.join(', '),
  productPreferences: client.productPreferences.join(', '),
  referralSource: client.referralSource,
  referredBy: client.referredBy,
  notes: client.notes,
  createdAt: client.createdAt,
  updatedAt: client.updatedAt,
});

export const SalonClientRecordsTool = ({
  uiConfig }: SalonClientRecordsToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: clients,
    setData: setClients,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<Client>('salon-client-records', [], COLUMNS);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'hair' | 'services' | 'photos' | 'notes'>('profile');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    allergies: true,
    sensitivities: true,
    products: true,
  });

  // New service form state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [newService, setNewService] = useState<Partial<ServiceRecord>>({
    date: new Date().toISOString().split('T')[0],
    service: '',
    stylist: '',
    price: 0,
    duration: '',
    notes: '',
  });
  const [newColorFormula, setNewColorFormula] = useState<Partial<ColorFormula>>({
    formula: '',
    developer: '',
    processingTime: '',
    notes: '',
  });
  const [includeColorFormula, setIncludeColorFormula] = useState(false);

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.clientName || params.firstName) {
        // Could open client form with prefilled name
        hasChanges = true;
      }
      if (params.phone) {
        hasChanges = true;
      }
      if (params.email) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(
      (c) =>
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  // Handlers
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createNewClient = () => {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...defaultClient,
      id: generateId(),
      hairProfile: { ...defaultHairProfile },
      createdAt: now,
      updatedAt: now,
    };
    addItem(newClient);
    setSelectedClient(newClient);
    setEditingClient(newClient);
    setIsEditing(true);
  };

  const saveClient = () => {
    if (!editingClient) return;
    const updatedClient = { ...editingClient, updatedAt: new Date().toISOString() };
    updateItem(editingClient.id, updatedClient);
    setSelectedClient(updatedClient);
    setEditingClient(null);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditingClient(null);
    setIsEditing(false);
  };

  const handleDeleteClient = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedClient?.id === id) {
        setSelectedClient(null);
        setEditingClient(null);
        setIsEditing(false);
      }
    }
  };

  const updateEditingClient = (updates: Partial<Client>) => {
    if (!editingClient) return;
    setEditingClient({ ...editingClient, ...updates });
  };

  const updateHairProfile = (updates: Partial<HairProfile>) => {
    if (!editingClient) return;
    setEditingClient({
      ...editingClient,
      hairProfile: { ...editingClient.hairProfile, ...updates },
    });
  };

  const addListItem = (field: 'productPreferences' | 'allergies' | 'skinSensitivities' | 'colorHistory', value: string) => {
    if (!editingClient || !value.trim()) return;
    if (field === 'colorHistory') {
      updateHairProfile({
        colorHistory: [...editingClient.hairProfile.colorHistory, value.trim()],
      });
    } else {
      updateEditingClient({
        [field]: [...editingClient[field], value.trim()],
      });
    }
  };

  const removeListItem = (field: 'productPreferences' | 'allergies' | 'skinSensitivities' | 'colorHistory', index: number) => {
    if (!editingClient) return;
    if (field === 'colorHistory') {
      updateHairProfile({
        colorHistory: editingClient.hairProfile.colorHistory.filter((_, i) => i !== index),
      });
    } else {
      updateEditingClient({
        [field]: editingClient[field].filter((_, i) => i !== index),
      });
    }
  };

  const addService = () => {
    if (!editingClient || !newService.service) return;
    const service: ServiceRecord = {
      id: generateId(),
      date: newService.date || new Date().toISOString().split('T')[0],
      service: newService.service || '',
      stylist: newService.stylist || '',
      price: newService.price || 0,
      duration: newService.duration || '',
      notes: newService.notes || '',
    };

    if (includeColorFormula && newColorFormula.formula) {
      service.colorFormula = {
        id: generateId(),
        date: service.date,
        formula: newColorFormula.formula || '',
        developer: newColorFormula.developer || '',
        processingTime: newColorFormula.processingTime || '',
        notes: newColorFormula.notes || '',
      };
    }

    updateEditingClient({
      serviceHistory: [service, ...editingClient.serviceHistory],
      totalSpent: editingClient.totalSpent + (service.price || 0),
      visitCount: editingClient.visitCount + 1,
    });

    // Reset form
    setNewService({
      date: new Date().toISOString().split('T')[0],
      service: '',
      stylist: '',
      price: 0,
      duration: '',
      notes: '',
    });
    setNewColorFormula({
      formula: '',
      developer: '',
      processingTime: '',
      notes: '',
    });
    setIncludeColorFormula(false);
    setShowServiceForm(false);
  };

  const removeService = (serviceId: string) => {
    if (!editingClient) return;
    const service = editingClient.serviceHistory.find((s) => s.id === serviceId);
    if (!service) return;
    updateEditingClient({
      serviceHistory: editingClient.serviceHistory.filter((s) => s.id !== serviceId),
      totalSpent: Math.max(0, editingClient.totalSpent - service.price),
      visitCount: Math.max(0, editingClient.visitCount - 1),
    });
  };

  const addPhoto = (type: 'before' | 'after') => {
    if (!editingClient) return;
    const photo: PhotoRecord = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      type,
      description: '',
      placeholder: true,
    };
    updateEditingClient({
      photos: [...editingClient.photos, photo],
    });
  };

  const removePhoto = (photoId: string) => {
    if (!editingClient) return;
    updateEditingClient({
      photos: editingClient.photos.filter((p) => p.id !== photoId),
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const currentClient = isEditing ? editingClient : selectedClient;

  const getLoyaltyBadge = (status: Client['loyaltyStatus']) => {
    const badges = {
      regular: { icon: Star, label: 'Regular' },
      silver: { icon: Star, label: 'Silver' },
      gold: { icon: Star, label: 'Gold' },
      platinum: { icon: Crown, label: 'Platinum' },
      vip: { icon: Crown, label: 'VIP' },
    };
    return badges[status];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0D9488] mx-auto mb-4" />
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.salonClientRecords.loadingClientRecords', 'Loading client records...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.salonClientRecords.salonClientRecords', 'Salon Client Records')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.salonClientRecords.manageClientProfilesServiceHistory', 'Manage client profiles, service history, and color formulas')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="salon-client-records" toolName="Salon Client Records" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'salon_client_records' })}
                onExportExcel={() => exportExcel({ filename: 'salon_client_records' })}
                onExportJSON={() => exportJSON({ filename: 'salon_client_records' })}
                onExportPDF={() => exportPDF({
                  filename: 'salon_client_records',
                  title: 'Salon Client Records',
                  subtitle: `${clients.length} clients`,
                  orientation: 'landscape',
                })}
                onPrint={() => print('Salon Client Records')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                disabled={clients.length === 0}
                theme={theme}
              />
              <button
                onClick={createNewClient}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.salonClientRecords.newClient', 'New Client')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Client List Sidebar */}
          <div className={`lg:col-span-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
            <div className="mb-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.salonClientRecords.searchClients', 'Search clients...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('tools.salonClientRecords.noClientsFound', 'No clients found')}</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setIsEditing(false);
                      setEditingClient(null);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedClient?.id === client.id
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {client.firstName} {client.lastName}
                        </p>
                        <p className={`text-sm ${selectedClient?.id === client.id ? 'text-white/70' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {client.phone || 'No phone'}
                        </p>
                      </div>
                      {client.loyaltyStatus !== 'regular' && (
                        <div className={`px-2 py-1 rounded-full text-xs text-white ${loyaltyColors[client.loyaltyStatus]}`}>
                          {client.loyaltyStatus.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {!currentClient ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
                <Users className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.salonClientRecords.selectAClient', 'Select a Client')}
                </h2>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  {t('tools.salonClientRecords.chooseAClientFromThe', 'Choose a client from the list or create a new one to get started.')}
                </p>
              </div>
            ) : (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
                {/* Client Header */}
                <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${loyaltyColors[currentClient.loyaltyStatus]} text-white`}>
                        {currentClient.firstName?.[0]?.toUpperCase() || 'C'}
                        {currentClient.lastName?.[0]?.toUpperCase() || ''}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {currentClient.firstName} {currentClient.lastName}
                          </h2>
                          {currentClient.loyaltyStatus !== 'regular' && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${loyaltyColors[currentClient.loyaltyStatus]}`}>
                              {(() => {
                                const badge = getLoyaltyBadge(currentClient.loyaltyStatus);
                                const IconComponent = badge.icon;
                                return (
                                  <>
                                    <IconComponent className="w-3 h-3" />
                                    {badge.label}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Total: ${currentClient.totalSpent.toFixed(2)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {currentClient.visitCount} visits
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveClient}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <Save className="w-5 h-5" />
                            {t('tools.salonClientRecords.save', 'Save')}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          >
                            <X className="w-5 h-5" />
                            {t('tools.salonClientRecords.cancel', 'Cancel')}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingClient(currentClient);
                              setIsEditing(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                            {t('tools.salonClientRecords.edit', 'Edit')}
                          </button>
                          <button
                            onClick={() => handleDeleteClient(currentClient.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
                  {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'hair', label: 'Hair Profile', icon: Palette },
                    { id: 'services', label: 'Services', icon: Scissors },
                    { id: 'photos', label: 'Photos', icon: Image },
                    { id: 'notes', label: 'Notes', icon: FileText },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as typeof activeTab)}
                      className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                        activeTab === id
                          ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-gray-300'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Contact Information */}
                      <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                        <CardHeader>
                          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <User className="w-5 h-5 text-[#0D9488]" />
                            {t('tools.salonClientRecords.contactInformation', 'Contact Information')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.firstName', 'First Name')}</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingClient?.firstName || ''}
                                  onChange={(e) => updateEditingClient({ firstName: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.firstName || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.lastName', 'Last Name')}</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingClient?.lastName || ''}
                                  onChange={(e) => updateEditingClient({ lastName: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.lastName || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                <Phone className="w-4 h-4 inline mr-1" />
                                {t('tools.salonClientRecords.phone', 'Phone')}
                              </label>
                              {isEditing ? (
                                <input
                                  type="tel"
                                  value={editingClient?.phone || ''}
                                  onChange={(e) => updateEditingClient({ phone: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.phone || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                <Mail className="w-4 h-4 inline mr-1" />
                                {t('tools.salonClientRecords.email', 'Email')}
                              </label>
                              {isEditing ? (
                                <input
                                  type="email"
                                  value={editingClient?.email || ''}
                                  onChange={(e) => updateEditingClient({ email: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.email || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {t('tools.salonClientRecords.birthday', 'Birthday')}
                              </label>
                              {isEditing ? (
                                <input
                                  type="date"
                                  value={editingClient?.birthday || ''}
                                  onChange={(e) => updateEditingClient({ birthday: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.birthday || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                <Heart className="w-4 h-4 inline mr-1" />
                                {t('tools.salonClientRecords.preferredStylist', 'Preferred Stylist')}
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingClient?.preferredStylist || ''}
                                  onChange={(e) => updateEditingClient({ preferredStylist: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.preferredStylist || '-'}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Loyalty & Referral */}
                      <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                        <CardHeader>
                          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <Crown className="w-5 h-5 text-[#0D9488]" />
                            {t('tools.salonClientRecords.loyaltyReferral', 'Loyalty & Referral')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.loyaltyStatus', 'Loyalty Status')}</label>
                              {isEditing ? (
                                <select
                                  value={editingClient?.loyaltyStatus || 'regular'}
                                  onChange={(e) => updateEditingClient({ loyaltyStatus: e.target.value as Client['loyaltyStatus'] })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                >
                                  <option value="regular">{t('tools.salonClientRecords.regular', 'Regular')}</option>
                                  <option value="silver">{t('tools.salonClientRecords.silver', 'Silver')}</option>
                                  <option value="gold">{t('tools.salonClientRecords.gold', 'Gold')}</option>
                                  <option value="platinum">{t('tools.salonClientRecords.platinum', 'Platinum')}</option>
                                  <option value="vip">{t('tools.salonClientRecords.vip', 'VIP')}</option>
                                </select>
                              ) : (
                                <p className={`capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{currentClient.loyaltyStatus}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.referralSource', 'Referral Source')}</label>
                              {isEditing ? (
                                <select
                                  value={editingClient?.referralSource || ''}
                                  onChange={(e) => updateEditingClient({ referralSource: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                >
                                  <option value="">{t('tools.salonClientRecords.select', 'Select...')}</option>
                                  {referralSources.map((src) => (
                                    <option key={src} value={src}>{src}</option>
                                  ))}
                                </select>
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.referralSource || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.referredBy', 'Referred By')}</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingClient?.referredBy || ''}
                                  onChange={(e) => updateEditingClient({ referredBy: e.target.value })}
                                  placeholder={t('tools.salonClientRecords.clientName', 'Client name...')}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.referredBy || '-'}</p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salonClientRecords.totalSpent', 'Total Spent')}</p>
                              <p className={`text-2xl font-bold text-[#0D9488]`}>${currentClient.totalSpent.toFixed(2)}</p>
                            </div>
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salonClientRecords.totalVisits', 'Total Visits')}</p>
                              <p className={`text-2xl font-bold text-[#0D9488]`}>{currentClient.visitCount}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Allergies & Sensitivities */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                          <CardHeader className="cursor-pointer" onClick={() => toggleSection('allergies')}>
                            <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <span className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                {t('tools.salonClientRecords.allergies', 'Allergies')}
                              </span>
                              {expandedSections.allergies ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </CardTitle>
                          </CardHeader>
                          {expandedSections.allergies && (
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {currentClient.allergies.map((allergy, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm dark:bg-red-900/30 dark:text-red-400">
                                    {allergy}
                                    {isEditing && (
                                      <button onClick={() => removeListItem('allergies', idx)} className="ml-1 hover:text-red-900">
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </span>
                                ))}
                                {currentClient.allergies.length === 0 && (
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salonClientRecords.noAllergiesRecorded', 'No allergies recorded')}</p>
                                )}
                              </div>
                              {isEditing && (
                                <div className="mt-3 flex gap-2">
                                  <input
                                    type="text"
                                    placeholder={t('tools.salonClientRecords.addAllergy', 'Add allergy...')}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        addListItem('allergies', (e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }}
                                    className={`flex-1 px-3 py-1 rounded-lg border text-sm ${
                                      theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                  />
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>

                        <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                          <CardHeader className="cursor-pointer" onClick={() => toggleSection('sensitivities')}>
                            <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <span className="flex items-center gap-2">
                                <Droplets className="w-5 h-5 text-orange-500" />
                                {t('tools.salonClientRecords.skinSensitivities', 'Skin Sensitivities')}
                              </span>
                              {expandedSections.sensitivities ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </CardTitle>
                          </CardHeader>
                          {expandedSections.sensitivities && (
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {currentClient.skinSensitivities.map((sensitivity, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm dark:bg-orange-900/30 dark:text-orange-400">
                                    {sensitivity}
                                    {isEditing && (
                                      <button onClick={() => removeListItem('skinSensitivities', idx)} className="ml-1 hover:text-orange-900">
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </span>
                                ))}
                                {currentClient.skinSensitivities.length === 0 && (
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salonClientRecords.noSensitivitiesRecorded', 'No sensitivities recorded')}</p>
                                )}
                              </div>
                              {isEditing && (
                                <div className="mt-3 flex gap-2">
                                  <input
                                    type="text"
                                    placeholder={t('tools.salonClientRecords.addSensitivity', 'Add sensitivity...')}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        addListItem('skinSensitivities', (e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }}
                                    className={`flex-1 px-3 py-1 rounded-lg border text-sm ${
                                      theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                  />
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      </div>

                      {/* Product Preferences */}
                      <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                        <CardHeader className="cursor-pointer" onClick={() => toggleSection('products')}>
                          <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-[#0D9488]" />
                              {t('tools.salonClientRecords.productPreferences', 'Product Preferences')}
                            </span>
                            {expandedSections.products ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </CardTitle>
                        </CardHeader>
                        {expandedSections.products && (
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {currentClient.productPreferences.map((product, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm dark:bg-teal-900/30 dark:text-teal-400">
                                  {product}
                                  {isEditing && (
                                    <button onClick={() => removeListItem('productPreferences', idx)} className="ml-1 hover:text-teal-900">
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </span>
                              ))}
                              {currentClient.productPreferences.length === 0 && (
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salonClientRecords.noProductPreferencesRecorded', 'No product preferences recorded')}</p>
                              )}
                            </div>
                            {isEditing && (
                              <div className="mt-3 flex gap-2">
                                <input
                                  type="text"
                                  placeholder={t('tools.salonClientRecords.addProductPreference', 'Add product preference...')}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      addListItem('productPreferences', (e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                  className={`flex-1 px-3 py-1 rounded-lg border text-sm ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    </div>
                  )}

                  {/* Hair Profile Tab */}
                  {activeTab === 'hair' && (
                    <div className="space-y-6">
                      <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                        <CardHeader>
                          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <Palette className="w-5 h-5 text-[#0D9488]" />
                            {t('tools.salonClientRecords.hairCharacteristics', 'Hair Characteristics')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.naturalColor', 'Natural Color')}</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingClient?.hairProfile.naturalColor || ''}
                                  onChange={(e) => updateHairProfile({ naturalColor: e.target.value })}
                                  placeholder={t('tools.salonClientRecords.eGDarkBrown', 'e.g., Dark Brown')}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.hairProfile.naturalColor || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.currentColor', 'Current Color')}</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingClient?.hairProfile.currentColor || ''}
                                  onChange={(e) => updateHairProfile({ currentColor: e.target.value })}
                                  placeholder={t('tools.salonClientRecords.eGBalayageBlonde', 'e.g., Balayage Blonde')}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.hairProfile.currentColor || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.texture', 'Texture')}</label>
                              {isEditing ? (
                                <select
                                  value={editingClient?.hairProfile.texture || ''}
                                  onChange={(e) => updateHairProfile({ texture: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                >
                                  <option value="">{t('tools.salonClientRecords.select2', 'Select...')}</option>
                                  {textureOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.hairProfile.texture || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.condition', 'Condition')}</label>
                              {isEditing ? (
                                <select
                                  value={editingClient?.hairProfile.condition || ''}
                                  onChange={(e) => updateHairProfile({ condition: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                >
                                  <option value="">{t('tools.salonClientRecords.select3', 'Select...')}</option>
                                  {conditionOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.hairProfile.condition || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.porosity', 'Porosity')}</label>
                              {isEditing ? (
                                <select
                                  value={editingClient?.hairProfile.porosity || ''}
                                  onChange={(e) => updateHairProfile({ porosity: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                >
                                  <option value="">{t('tools.salonClientRecords.select4', 'Select...')}</option>
                                  {porosityOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.hairProfile.porosity || '-'}</p>
                              )}
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.density', 'Density')}</label>
                              {isEditing ? (
                                <select
                                  value={editingClient?.hairProfile.density || ''}
                                  onChange={(e) => updateHairProfile({ density: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                >
                                  <option value="">{t('tools.salonClientRecords.select5', 'Select...')}</option>
                                  {densityOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.hairProfile.density || '-'}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.hairNotes', 'Hair Notes')}</label>
                            {isEditing ? (
                              <textarea
                                value={editingClient?.hairProfile.notes || ''}
                                onChange={(e) => updateHairProfile({ notes: e.target.value })}
                                rows={3}
                                placeholder={t('tools.salonClientRecords.anyAdditionalNotesAboutHair', 'Any additional notes about hair condition, treatments, etc.')}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] resize-none`}
                              />
                            ) : (
                              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{currentClient.hairProfile.notes || '-'}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Color History */}
                      <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                        <CardHeader>
                          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <Palette className="w-5 h-5 text-purple-500" />
                            {t('tools.salonClientRecords.colorHistory', 'Color History')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {currentClient.hairProfile.colorHistory.map((color, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm dark:bg-purple-900/30 dark:text-purple-400">
                                {color}
                                {isEditing && (
                                  <button onClick={() => removeListItem('colorHistory', idx)} className="ml-1 hover:text-purple-900">
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </span>
                            ))}
                            {currentClient.hairProfile.colorHistory.length === 0 && (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salonClientRecords.noColorHistoryRecorded', 'No color history recorded')}</p>
                            )}
                          </div>
                          {isEditing && (
                            <div className="mt-3 flex gap-2">
                              <input
                                type="text"
                                placeholder={t('tools.salonClientRecords.addPastColorEG', 'Add past color (e.g., Ash Blonde 8A - Jan 2024)...')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addListItem('colorHistory', (e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }}
                                className={`flex-1 px-3 py-1 rounded-lg border text-sm ${
                                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Services Tab */}
                  {activeTab === 'services' && (
                    <div className="space-y-6">
                      {isEditing && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowServiceForm(!showServiceForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                            {t('tools.salonClientRecords.addService', 'Add Service')}
                          </button>
                        </div>
                      )}

                      {/* Add Service Form */}
                      {showServiceForm && isEditing && (
                        <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                          <CardHeader>
                            <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Plus className="w-5 h-5 text-[#0D9488]" />
                              {t('tools.salonClientRecords.newServiceRecord', 'New Service Record')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.date', 'Date')}</label>
                                <input
                                  type="date"
                                  value={newService.date || ''}
                                  onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.service', 'Service')}</label>
                                <input
                                  type="text"
                                  value={newService.service || ''}
                                  onChange={(e) => setNewService({ ...newService, service: e.target.value })}
                                  placeholder={t('tools.salonClientRecords.eGHaircutColorHighlights', 'e.g., Haircut, Color, Highlights')}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.stylist', 'Stylist')}</label>
                                <input
                                  type="text"
                                  value={newService.stylist || ''}
                                  onChange={(e) => setNewService({ ...newService, stylist: e.target.value })}
                                  placeholder={t('tools.salonClientRecords.stylistName', 'Stylist name')}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.price', 'Price ($)')}</label>
                                <input
                                  type="number"
                                  value={newService.price || ''}
                                  onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.duration', 'Duration')}</label>
                                <input
                                  type="text"
                                  value={newService.duration || ''}
                                  onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                  placeholder={t('tools.salonClientRecords.eG2Hours', 'e.g., 2 hours')}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                />
                              </div>
                            </div>
                            <div className="mt-4">
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.serviceNotes', 'Service Notes')}</label>
                              <textarea
                                value={newService.notes || ''}
                                onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
                                rows={2}
                                placeholder={t('tools.salonClientRecords.notesAboutThisVisit', 'Notes about this visit...')}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] resize-none`}
                              />
                            </div>

                            {/* Color Formula Toggle */}
                            <div className="mt-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={includeColorFormula}
                                  onChange={(e) => setIncludeColorFormula(e.target.checked)}
                                  className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]"
                                />
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.includeColorFormula', 'Include Color Formula')}</span>
                              </label>
                            </div>

                            {/* Color Formula Fields */}
                            {includeColorFormula && (
                              <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.salonClientRecords.colorFormulaDetails', 'Color Formula Details')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.formulaMixture', 'Formula/Mixture')}</label>
                                    <input
                                      type="text"
                                      value={newColorFormula.formula || ''}
                                      onChange={(e) => setNewColorFormula({ ...newColorFormula, formula: e.target.value })}
                                      placeholder="e.g., 8A + 9N (1:1)"
                                      className={`w-full px-3 py-2 rounded-lg border ${
                                        theme === 'dark' ? 'bg-gray-700 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.developer', 'Developer')}</label>
                                    <input
                                      type="text"
                                      value={newColorFormula.developer || ''}
                                      onChange={(e) => setNewColorFormula({ ...newColorFormula, developer: e.target.value })}
                                      placeholder={t('tools.salonClientRecords.eG20Vol', 'e.g., 20 Vol')}
                                      className={`w-full px-3 py-2 rounded-lg border ${
                                        theme === 'dark' ? 'bg-gray-700 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.processingTime', 'Processing Time')}</label>
                                    <input
                                      type="text"
                                      value={newColorFormula.processingTime || ''}
                                      onChange={(e) => setNewColorFormula({ ...newColorFormula, processingTime: e.target.value })}
                                      placeholder={t('tools.salonClientRecords.eG35Minutes', 'e.g., 35 minutes')}
                                      className={`w-full px-3 py-2 rounded-lg border ${
                                        theme === 'dark' ? 'bg-gray-700 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salonClientRecords.formulaNotes', 'Formula Notes')}</label>
                                    <input
                                      type="text"
                                      value={newColorFormula.notes || ''}
                                      onChange={(e) => setNewColorFormula({ ...newColorFormula, notes: e.target.value })}
                                      placeholder={t('tools.salonClientRecords.anyNotes', 'Any notes...')}
                                      className={`w-full px-3 py-2 rounded-lg border ${
                                        theme === 'dark' ? 'bg-gray-700 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={addService}
                                disabled={!newService.service}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Save className="w-5 h-5" />
                                {t('tools.salonClientRecords.saveService', 'Save Service')}
                              </button>
                              <button
                                onClick={() => setShowServiceForm(false)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                              >
                                {t('tools.salonClientRecords.cancel2', 'Cancel')}
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Service History List */}
                      {currentClient.serviceHistory.length === 0 ? (
                        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Scissors className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">{t('tools.salonClientRecords.noServiceHistoryYet', 'No service history yet')}</p>
                          <p className="text-sm mt-1">{t('tools.salonClientRecords.addAServiceRecordTo', 'Add a service record to track client visits')}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {currentClient.serviceHistory.map((service) => (
                            <Card key={service.id} className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{service.service}</span>
                                      <span className="text-[#0D9488] font-medium">${service.price.toFixed(2)}</span>
                                    </div>
                                    <div className={`flex flex-wrap items-center gap-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {service.date}
                                      </span>
                                      {service.stylist && (
                                        <span className="flex items-center gap-1">
                                          <User className="w-4 h-4" />
                                          {service.stylist}
                                        </span>
                                      )}
                                      {service.duration && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {service.duration}
                                        </span>
                                      )}
                                    </div>
                                    {service.notes && (
                                      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{service.notes}</p>
                                    )}

                                    {/* Color Formula Display */}
                                    {service.colorFormula && (
                                      <div className={`mt-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-purple-50'}`}>
                                        <h5 className={`text-sm font-medium mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>
                                          <Palette className="w-4 h-4" />
                                          {t('tools.salonClientRecords.colorFormula', 'Color Formula')}
                                        </h5>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                          <div>
                                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.salonClientRecords.formula', 'Formula:')}</span>
                                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{service.colorFormula.formula}</span>
                                          </div>
                                          {service.colorFormula.developer && (
                                            <div>
                                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.salonClientRecords.developer2', 'Developer:')}</span>
                                              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{service.colorFormula.developer}</span>
                                            </div>
                                          )}
                                          {service.colorFormula.processingTime && (
                                            <div>
                                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.salonClientRecords.time', 'Time:')}</span>
                                              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{service.colorFormula.processingTime}</span>
                                            </div>
                                          )}
                                          {service.colorFormula.notes && (
                                            <div>
                                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.salonClientRecords.notes', 'Notes:')}</span>
                                              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{service.colorFormula.notes}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {isEditing && (
                                    <button
                                      onClick={() => removeService(service.id)}
                                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Photos Tab */}
                  {activeTab === 'photos' && (
                    <div className="space-y-6">
                      {isEditing && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => addPhoto('before')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          >
                            <Plus className="w-5 h-5" />
                            {t('tools.salonClientRecords.addBeforePhoto', 'Add Before Photo')}
                          </button>
                          <button
                            onClick={() => addPhoto('after')}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                            {t('tools.salonClientRecords.addAfterPhoto', 'Add After Photo')}
                          </button>
                        </div>
                      )}

                      {currentClient.photos.length === 0 ? (
                        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">{t('tools.salonClientRecords.noPhotosYet', 'No photos yet')}</p>
                          <p className="text-sm mt-1">{t('tools.salonClientRecords.addBeforeAfterPhotosTo', 'Add before/after photos to track transformations')}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {currentClient.photos.map((photo) => (
                            <div
                              key={photo.id}
                              className={`relative rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                            >
                              <div className="aspect-square flex items-center justify-center">
                                <div className="text-center">
                                  <Image className={`w-16 h-16 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salonClientRecords.photoPlaceholder', 'Photo Placeholder')}</p>
                                </div>
                              </div>
                              <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                                photo.type === 'before' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                              }`}>
                                {photo.type.toUpperCase()}
                              </div>
                              <div className={`absolute bottom-0 left-0 right-0 p-2 ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'}`}>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{photo.date}</p>
                              </div>
                              {isEditing && (
                                <button
                                  onClick={() => removePhoto(photo.id)}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <div className="space-y-6">
                      <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                        <CardHeader>
                          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <FileText className="w-5 h-5 text-[#0D9488]" />
                            {t('tools.salonClientRecords.generalNotes', 'General Notes')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isEditing ? (
                            <textarea
                              value={editingClient?.notes || ''}
                              onChange={(e) => updateEditingClient({ notes: e.target.value })}
                              rows={10}
                              placeholder={t('tools.salonClientRecords.addAnyGeneralNotesAbout', 'Add any general notes about this client...')}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-[#0D9488] resize-none`}
                            />
                          ) : (
                            <div className={`min-h-[200px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {currentClient.notes ? (
                                <p className="whitespace-pre-wrap">{currentClient.notes}</p>
                              ) : (
                                <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{t('tools.salonClientRecords.noNotesRecorded', 'No notes recorded')}</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Quick Notes from Services */}
                      {currentClient.serviceHistory.filter((s) => s.notes).length > 0 && (
                        <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}>
                          <CardHeader>
                            <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <Scissors className="w-5 h-5 text-[#0D9488]" />
                              {t('tools.salonClientRecords.notesFromVisits', 'Notes from Visits')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {currentClient.serviceHistory
                                .filter((s) => s.notes)
                                .map((service) => (
                                  <div key={service.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                                    <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {service.date} - {service.service}
                                    </div>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{service.notes}</p>
                                  </div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.salonClientRecords.aboutSalonClientRecords', 'About Salon Client Records')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.salonClientRecords.manageYourSalonClientDatabase', 'Manage your salon client database with comprehensive profiles including hair characteristics, color formulas, service history, product preferences, allergies, and skin sensitivities. Track client spending, loyalty status, and referral sources. Data is automatically synced to the cloud when signed in, with local backup for offline access.')}
          </p>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default SalonClientRecordsTool;
