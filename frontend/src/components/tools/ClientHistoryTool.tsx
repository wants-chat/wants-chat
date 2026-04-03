'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Star,
  Heart,
  Plus,
  Trash2,
  Edit,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  History,
  Award,
  AlertTriangle,
  MessageSquare,
  Gift,
  TrendingUp,
  FileText,
  Tag,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientHistoryToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  preferredStylist?: string;
  notes: string;
  allergies: string[];
  preferences: string[];
  tags: string[];
  membershipTier: 'regular' | 'silver' | 'gold' | 'platinum';
  totalVisits: number;
  totalSpent: number;
  noShowCount: number;
  referralSource?: string;
  referredBy?: string;
  createdAt: string;
  lastVisit?: string;
}

interface ServiceHistory {
  id: string;
  clientId: string;
  date: string;
  services: string[];
  stylist: string;
  totalAmount: number;
  tipAmount: number;
  rating?: number;
  feedback?: string;
  photos?: string[];
  colorFormula?: string;
  notes: string;
}

interface ClientNote {
  id: string;
  clientId: string;
  date: string;
  type: 'general' | 'preference' | 'alert' | 'follow-up';
  content: string;
  createdBy: string;
}

// Constants
const MEMBERSHIP_TIERS = [
  { id: 'regular', name: 'Regular', color: 'gray', discount: 0 },
  { id: 'silver', name: 'Silver', color: 'slate', discount: 5 },
  { id: 'gold', name: 'Gold', color: 'yellow', discount: 10 },
  { id: 'platinum', name: 'Platinum', color: 'purple', discount: 15 },
];

const CLIENT_TAGS = [
  'VIP', 'Sensitive Scalp', 'Color Allergies', 'Always Late',
  'Prefers Silence', 'Chatty', 'Brings Kids', 'New Client',
  'Referral Source', 'Wedding Client', 'Special Needs',
];

// Column configuration
const CLIENT_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'membershipTier', header: 'Membership', type: 'string' },
  { key: 'totalVisits', header: 'Total Visits', type: 'number' },
  { key: 'totalSpent', header: 'Total Spent', type: 'currency' },
  { key: 'lastVisit', header: 'Last Visit', type: 'date' },
  { key: 'createdAt', header: 'Client Since', type: 'date' },
];

const HISTORY_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'services', header: 'Services', type: 'string' },
  { key: 'stylist', header: 'Stylist', type: 'string' },
  { key: 'totalAmount', header: 'Amount', type: 'currency' },
  { key: 'tipAmount', header: 'Tip', type: 'currency' },
  { key: 'rating', header: 'Rating', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getMembershipColor = (tier: Client['membershipTier']) => {
  const tierInfo = MEMBERSHIP_TIERS.find(t => t.id === tier);
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    slate: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colorMap[tierInfo?.color || 'gray'];
};

// Sample data
const sampleClients: Client[] = [
  {
    id: generateId(),
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1990-05-15',
    preferredStylist: 'Sarah Johnson',
    notes: 'Prefers warm tones for coloring. Sensitive to ammonia.',
    allergies: ['Ammonia-based products'],
    preferences: ['Warm colors', 'Organic products', 'Scalp massage'],
    tags: ['VIP', 'Sensitive Scalp'],
    membershipTier: 'gold',
    totalVisits: 24,
    totalSpent: 2850,
    noShowCount: 0,
    referralSource: 'Instagram',
    createdAt: '2022-03-10',
    lastVisit: '2024-01-15',
  },
  {
    id: generateId(),
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.b@email.com',
    phone: '(555) 234-5678',
    preferredStylist: 'Mike Chen',
    notes: 'Regular haircut every 3 weeks',
    allergies: [],
    preferences: ['Classic cut', 'Quick service'],
    tags: ['Regular'],
    membershipTier: 'silver',
    totalVisits: 18,
    totalSpent: 720,
    noShowCount: 1,
    createdAt: '2022-08-20',
    lastVisit: '2024-01-20',
  },
  {
    id: generateId(),
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@email.com',
    phone: '(555) 345-6789',
    preferredStylist: 'Emma Davis',
    notes: 'Getting married June 2024 - bridal party booking',
    allergies: [],
    preferences: ['Gel nails', 'Natural look makeup'],
    tags: ['Wedding Client', 'VIP'],
    membershipTier: 'platinum',
    totalVisits: 32,
    totalSpent: 4200,
    noShowCount: 0,
    referredBy: 'Emily Johnson',
    createdAt: '2021-06-05',
    lastVisit: '2024-01-18',
  },
];

const sampleHistory: ServiceHistory[] = [
  {
    id: generateId(),
    clientId: sampleClients[0].id,
    date: '2024-01-15',
    services: ['Hair Coloring', 'Blowout'],
    stylist: 'Sarah Johnson',
    totalAmount: 130,
    tipAmount: 26,
    rating: 5,
    feedback: 'Love the new color! Sarah is amazing.',
    colorFormula: '6N + 7G (1:1) 20vol',
    notes: 'Covered 15% gray',
  },
  {
    id: generateId(),
    clientId: sampleClients[1].id,
    date: '2024-01-20',
    services: ['Haircut'],
    stylist: 'Mike Chen',
    totalAmount: 35,
    tipAmount: 7,
    rating: 5,
    notes: 'Same as usual - #2 sides, finger length top',
  },
];

const sampleNotes: ClientNote[] = [
  {
    id: generateId(),
    clientId: sampleClients[0].id,
    date: '2024-01-15',
    type: 'preference',
    content: 'Switched from cool to warm tones - likes the change',
    createdBy: 'Sarah Johnson',
  },
  {
    id: generateId(),
    clientId: sampleClients[2].id,
    date: '2024-01-10',
    type: 'follow-up',
    content: 'Schedule bridal trial for March',
    createdBy: 'Emma Davis',
  },
];

// Main Component
export const ClientHistoryTool: React.FC<ClientHistoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hooks for backend sync
  const {
    data: clients,
    addItem: addClient,
    updateItem: updateClient,
    deleteItem: deleteClient,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Client>('salon-clients', sampleClients, CLIENT_COLUMNS);

  const {
    data: history,
    addItem: addHistory,
    updateItem: updateHistory,
    deleteItem: deleteHistory,
  } = useToolData<ServiceHistory>('salon-client-history', sampleHistory, HISTORY_COLUMNS);

  const {
    data: notes,
    addItem: addNote,
    deleteItem: deleteNote,
  } = useToolData<ClientNote>('salon-client-notes', sampleNotes, []);

  // Local UI state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMembership, setFilterMembership] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  // Client form state
  const [clientForm, setClientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    preferredStylist: '',
    notes: '',
    allergies: '',
    preferences: '',
    tags: [] as string[],
    membershipTier: 'regular' as Client['membershipTier'],
    referralSource: '',
  });

  // History form state
  const [historyForm, setHistoryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    services: '',
    stylist: '',
    totalAmount: 0,
    tipAmount: 0,
    rating: 5,
    feedback: '',
    colorFormula: '',
    notes: '',
  });

  // Note form state
  const [noteForm, setNoteForm] = useState({
    type: 'general' as ClientNote['type'],
    content: '',
  });

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm);
      const matchesMembership = filterMembership === 'all' || client.membershipTier === filterMembership;
      const matchesTag = filterTag === 'all' || client.tags.includes(filterTag);
      return matchesSearch && matchesMembership && matchesTag;
    });
  }, [clients, searchTerm, filterMembership, filterTag]);

  // Get client history
  const getClientHistory = (clientId: string) => {
    return history.filter(h => h.clientId === clientId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Get client notes
  const getClientNotes = (clientId: string) => {
    return notes.filter(n => n.clientId === clientId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Stats
  const stats = useMemo(() => {
    return {
      totalClients: clients.length,
      vipClients: clients.filter(c => c.tags.includes('VIP')).length,
      avgSpent: clients.length > 0
        ? clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length
        : 0,
      avgVisits: clients.length > 0
        ? clients.reduce((sum, c) => sum + c.totalVisits, 0) / clients.length
        : 0,
    };
  }, [clients]);

  // Handle client form submission
  const handleClientSubmit = () => {
    const now = new Date().toISOString();
    const clientData: Client = {
      id: editingClient?.id || generateId(),
      firstName: clientForm.firstName,
      lastName: clientForm.lastName,
      email: clientForm.email,
      phone: clientForm.phone,
      dateOfBirth: clientForm.dateOfBirth || undefined,
      preferredStylist: clientForm.preferredStylist || undefined,
      notes: clientForm.notes,
      allergies: clientForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
      preferences: clientForm.preferences.split(',').map(s => s.trim()).filter(Boolean),
      tags: clientForm.tags,
      membershipTier: clientForm.membershipTier,
      totalVisits: editingClient?.totalVisits || 0,
      totalSpent: editingClient?.totalSpent || 0,
      noShowCount: editingClient?.noShowCount || 0,
      referralSource: clientForm.referralSource || undefined,
      createdAt: editingClient?.createdAt || now.split('T')[0],
      lastVisit: editingClient?.lastVisit,
    };

    if (editingClient) {
      updateClient(clientData);
    } else {
      addClient(clientData);
    }

    resetClientForm();
  };

  const resetClientForm = () => {
    setClientForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      preferredStylist: '',
      notes: '',
      allergies: '',
      preferences: '',
      tags: [],
      membershipTier: 'regular',
      referralSource: '',
    });
    setShowClientForm(false);
    setEditingClient(null);
  };

  const handleEditClient = (client: Client) => {
    setClientForm({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      dateOfBirth: client.dateOfBirth || '',
      preferredStylist: client.preferredStylist || '',
      notes: client.notes,
      allergies: client.allergies.join(', '),
      preferences: client.preferences.join(', '),
      tags: client.tags,
      membershipTier: client.membershipTier,
      referralSource: client.referralSource || '',
    });
    setEditingClient(client);
    setShowClientForm(true);
  };

  // Handle history form submission
  const handleHistorySubmit = () => {
    if (!selectedClient) return;

    const historyData: ServiceHistory = {
      id: generateId(),
      clientId: selectedClient.id,
      date: historyForm.date,
      services: historyForm.services.split(',').map(s => s.trim()).filter(Boolean),
      stylist: historyForm.stylist,
      totalAmount: historyForm.totalAmount,
      tipAmount: historyForm.tipAmount,
      rating: historyForm.rating,
      feedback: historyForm.feedback || undefined,
      colorFormula: historyForm.colorFormula || undefined,
      notes: historyForm.notes,
    };

    addHistory(historyData);

    // Update client stats
    updateClient({
      ...selectedClient,
      totalVisits: selectedClient.totalVisits + 1,
      totalSpent: selectedClient.totalSpent + historyForm.totalAmount,
      lastVisit: historyForm.date,
    });

    setHistoryForm({
      date: new Date().toISOString().split('T')[0],
      services: '',
      stylist: '',
      totalAmount: 0,
      tipAmount: 0,
      rating: 5,
      feedback: '',
      colorFormula: '',
      notes: '',
    });
    setShowHistoryForm(false);
  };

  // Handle note form submission
  const handleNoteSubmit = () => {
    if (!selectedClient) return;

    const noteData: ClientNote = {
      id: generateId(),
      clientId: selectedClient.id,
      date: new Date().toISOString().split('T')[0],
      type: noteForm.type,
      content: noteForm.content,
      createdBy: 'Current User', // Would come from auth context
    };

    addNote(noteData);
    setNoteForm({ type: 'general', content: '' });
    setShowNoteForm(false);
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = clients.map(c => ({
      ...c,
      allergies: c.allergies.join(', '),
      preferences: c.preferences.join(', '),
      tags: c.tags.join(', '),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, CLIENT_COLUMNS, 'salon-clients');
        break;
      case 'excel':
        exportToExcel(exportData, CLIENT_COLUMNS, 'salon-clients');
        break;
      case 'json':
        exportToJSON(exportData, 'salon-clients');
        break;
      case 'pdf':
        exportToPDF(exportData, CLIENT_COLUMNS, 'Salon Client History');
        break;
    }
  };

  const getNoteTypeIcon = (type: ClientNote['type']) => {
    switch (type) {
      case 'preference': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'follow-up': return <Calendar className="w-4 h-4 text-blue-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              {t('tools.clientHistory.clientHistory', 'Client History')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.clientHistory.manageClientProfilesAndService', 'Manage client profiles and service history')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="client-history" toolName="Client History" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
            <button
              onClick={() => setShowClientForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('tools.clientHistory.addClient', 'Add Client')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.clientHistory.totalClients', 'Total Clients')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.clientHistory.vipClients', 'VIP Clients')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.vipClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.clientHistory.avgSpent', 'Avg Spent')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.avgSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.clientHistory.avgVisits', 'Avg Visits')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.avgVisits.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.clientHistory.searchClients', 'Search clients...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterMembership}
                    onChange={(e) => setFilterMembership(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  >
                    <option value="all">{t('tools.clientHistory.allTiers', 'All Tiers')}</option>
                    {MEMBERSHIP_TIERS.map(tier => (
                      <option key={tier.id} value={tier.id}>{tier.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  >
                    <option value="all">{t('tools.clientHistory.allTags', 'All Tags')}</option>
                    {CLIENT_TAGS.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Client List */}
            <Card>
              <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">{t('tools.clientHistory.noClientsFound', 'No clients found')}</p>
                  </div>
                ) : (
                  <div className="divide-y dark:divide-gray-700">
                    {filteredClients.map(client => (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          selectedClient?.id === client.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">
                              {client.firstName[0]}{client.lastName[0]}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {client.firstName} {client.lastName}
                              </h3>
                              <p className="text-xs text-gray-500">{client.phone}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getMembershipColor(client.membershipTier)}`}>
                            {client.membershipTier}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{client.totalVisits} visits</span>
                          <span>{formatCurrency(client.totalSpent)}</span>
                          {client.lastVisit && (
                            <span>Last: {formatDate(client.lastVisit)}</span>
                          )}
                        </div>
                        {client.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {client.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Client Details */}
          <div className="lg:col-span-2">
            {selectedClient ? (
              <div className="space-y-4">
                {/* Client Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 text-xl font-bold">
                          {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">
                            {selectedClient.firstName} {selectedClient.lastName}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Client since {formatDate(selectedClient.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClient(selectedClient)}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            deleteClient(selectedClient.id);
                            setSelectedClient(null);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedClient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{selectedClient.email}</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 py-4 border-y dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{selectedClient.totalVisits}</p>
                        <p className="text-xs text-gray-500">{t('tools.clientHistory.totalVisits', 'Total Visits')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedClient.totalSpent)}</p>
                        <p className="text-xs text-gray-500">{t('tools.clientHistory.totalSpent', 'Total Spent')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedClient.totalVisits > 0
                            ? formatCurrency(selectedClient.totalSpent / selectedClient.totalVisits)
                            : formatCurrency(0)}
                        </p>
                        <p className="text-xs text-gray-500">{t('tools.clientHistory.avgVisit', 'Avg Visit')}</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${selectedClient.noShowCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {selectedClient.noShowCount}
                        </p>
                        <p className="text-xs text-gray-500">{t('tools.clientHistory.noShows', 'No Shows')}</p>
                      </div>
                    </div>

                    {/* Preferences & Allergies */}
                    {(selectedClient.allergies.length > 0 || selectedClient.preferences.length > 0) && (
                      <div className="space-y-2">
                        {selectedClient.allergies.length > 0 && (
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-600">{t('tools.clientHistory.allergies', 'Allergies')}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedClient.allergies.join(', ')}
                              </p>
                            </div>
                          </div>
                        )}
                        {selectedClient.preferences.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Heart className="w-4 h-4 text-pink-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-pink-600">{t('tools.clientHistory.preferences', 'Preferences')}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedClient.preferences.join(', ')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {selectedClient.notes && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedClient.notes}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedClient.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedClient.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Service History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {t('tools.clientHistory.serviceHistory', 'Service History')}
                      </span>
                      <button
                        onClick={() => setShowHistoryForm(true)}
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        {t('tools.clientHistory.addVisit', 'Add Visit')}
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getClientHistory(selectedClient.id).length === 0 ? (
                      <p className="text-center text-gray-500 py-8">{t('tools.clientHistory.noServiceHistory', 'No service history')}</p>
                    ) : (
                      <div className="space-y-4">
                        {getClientHistory(selectedClient.id).map(visit => (
                          <div
                            key={visit.id}
                            className="p-4 border rounded-lg dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">{formatDate(visit.date)}</p>
                                <p className="text-sm text-gray-500">with {visit.stylist}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">{formatCurrency(visit.totalAmount)}</p>
                                {visit.tipAmount > 0 && (
                                  <p className="text-xs text-gray-500">Tip: {formatCurrency(visit.tipAmount)}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {visit.services.map(service => (
                                <span
                                  key={service}
                                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                                >
                                  {service}
                                </span>
                              ))}
                            </div>
                            {visit.rating && (
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < visit.rating!
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                            {visit.colorFormula && (
                              <p className="text-xs text-gray-500">
                                Formula: <span className="font-mono">{visit.colorFormula}</span>
                              </p>
                            )}
                            {visit.feedback && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                "{visit.feedback}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Client Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {t('tools.clientHistory.notes', 'Notes')}
                      </span>
                      <button
                        onClick={() => setShowNoteForm(true)}
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        {t('tools.clientHistory.addNote', 'Add Note')}
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getClientNotes(selectedClient.id).length === 0 ? (
                      <p className="text-center text-gray-500 py-8">{t('tools.clientHistory.noNotes', 'No notes')}</p>
                    ) : (
                      <div className="space-y-3">
                        {getClientNotes(selectedClient.id).map(note => (
                          <div
                            key={note.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            {getNoteTypeIcon(note.type)}
                            <div className="flex-1">
                              <p className="text-sm">{note.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(note.date)} by {note.createdBy}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">{t('tools.clientHistory.selectAClientToView', 'Select a client to view details')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Client Form Modal */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingClient ? t('tools.clientHistory.editClient', 'Edit Client') : t('tools.clientHistory.addClient2', 'Add Client')}</span>
                  <button onClick={resetClientForm} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.firstName', 'First Name *')}
                    </label>
                    <input
                      type="text"
                      value={clientForm.firstName}
                      onChange={(e) => setClientForm({ ...clientForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.lastName', 'Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={clientForm.lastName}
                      onChange={(e) => setClientForm({ ...clientForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.email', 'Email *')}
                    </label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.phone', 'Phone *')}
                    </label>
                    <input
                      type="tel"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.dateOfBirth', 'Date of Birth')}
                    </label>
                    <input
                      type="date"
                      value={clientForm.dateOfBirth}
                      onChange={(e) => setClientForm({ ...clientForm, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.membershipTier', 'Membership Tier')}
                    </label>
                    <select
                      value={clientForm.membershipTier}
                      onChange={(e) => setClientForm({ ...clientForm, membershipTier: e.target.value as Client['membershipTier'] })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {MEMBERSHIP_TIERS.map(tier => (
                        <option key={tier.id} value={tier.id}>{tier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.allergiesCommaSeparated', 'Allergies (comma separated)')}
                    </label>
                    <input
                      type="text"
                      value={clientForm.allergies}
                      onChange={(e) => setClientForm({ ...clientForm, allergies: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('tools.clientHistory.eGAmmoniaParabens', 'e.g., Ammonia, Parabens')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.preferencesCommaSeparated', 'Preferences (comma separated)')}
                    </label>
                    <input
                      type="text"
                      value={clientForm.preferences}
                      onChange={(e) => setClientForm({ ...clientForm, preferences: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('tools.clientHistory.eGOrganicProductsWarm', 'e.g., Organic products, Warm colors')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.tags', 'Tags')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CLIENT_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (clientForm.tags.includes(tag)) {
                              setClientForm({ ...clientForm, tags: clientForm.tags.filter(t => t !== tag) });
                            } else {
                              setClientForm({ ...clientForm, tags: [...clientForm.tags, tag] });
                            }
                          }}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            clientForm.tags.includes(tag)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.notes2', 'Notes')}
                    </label>
                    <textarea
                      value={clientForm.notes}
                      onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={resetClientForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.clientHistory.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleClientSubmit}
                    disabled={!clientForm.firstName || !clientForm.lastName || !clientForm.email || !clientForm.phone}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {editingClient ? t('tools.clientHistory.updateClient', 'Update Client') : t('tools.clientHistory.addClient3', 'Add Client')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Form Modal */}
        {showHistoryForm && selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Add Visit for {selectedClient.firstName}</span>
                  <button onClick={() => setShowHistoryForm(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={historyForm.date}
                      onChange={(e) => setHistoryForm({ ...historyForm, date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.stylist', 'Stylist *')}
                    </label>
                    <input
                      type="text"
                      value={historyForm.stylist}
                      onChange={(e) => setHistoryForm({ ...historyForm, stylist: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.clientHistory.servicesCommaSeparated', 'Services (comma separated) *')}
                  </label>
                  <input
                    type="text"
                    value={historyForm.services}
                    onChange={(e) => setHistoryForm({ ...historyForm, services: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('tools.clientHistory.eGHaircutColoring', 'e.g., Haircut, Coloring')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.totalAmount', 'Total Amount *')}
                    </label>
                    <input
                      type="number"
                      value={historyForm.totalAmount}
                      onChange={(e) => setHistoryForm({ ...historyForm, totalAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.clientHistory.tipAmount', 'Tip Amount')}
                    </label>
                    <input
                      type="number"
                      value={historyForm.tipAmount}
                      onChange={(e) => setHistoryForm({ ...historyForm, tipAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.clientHistory.colorFormula', 'Color Formula')}
                  </label>
                  <input
                    type="text"
                    value={historyForm.colorFormula}
                    onChange={(e) => setHistoryForm({ ...historyForm, colorFormula: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                    placeholder={t('tools.clientHistory.eG6n7g1', 'e.g., 6N + 7G (1:1) 20vol')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.clientHistory.rating', 'Rating')}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setHistoryForm({ ...historyForm, rating: n })}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            n <= historyForm.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.clientHistory.notes3', 'Notes')}
                  </label>
                  <textarea
                    value={historyForm.notes}
                    onChange={(e) => setHistoryForm({ ...historyForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowHistoryForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.clientHistory.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={handleHistorySubmit}
                    disabled={!historyForm.services || !historyForm.stylist || historyForm.totalAmount <= 0}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {t('tools.clientHistory.addVisit2', 'Add Visit')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Note Form Modal */}
        {showNoteForm && selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Add Note for {selectedClient.firstName}</span>
                  <button onClick={() => setShowNoteForm(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.clientHistory.noteType', 'Note Type')}
                  </label>
                  <select
                    value={noteForm.type}
                    onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value as ClientNote['type'] })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="general">{t('tools.clientHistory.general', 'General')}</option>
                    <option value="preference">{t('tools.clientHistory.preference', 'Preference')}</option>
                    <option value="alert">{t('tools.clientHistory.alert', 'Alert')}</option>
                    <option value="follow-up">{t('tools.clientHistory.followUp', 'Follow-up')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.clientHistory.note', 'Note *')}
                  </label>
                  <textarea
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={4}
                    placeholder={t('tools.clientHistory.enterNote', 'Enter note...')}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowNoteForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.clientHistory.cancel3', 'Cancel')}
                  </button>
                  <button
                    onClick={handleNoteSubmit}
                    disabled={!noteForm.content}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {t('tools.clientHistory.addNote2', 'Add Note')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientHistoryTool;
