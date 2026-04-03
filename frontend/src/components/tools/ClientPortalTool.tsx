'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import {
  Users,
  Building2,
  Mail,
  Phone,
  Globe,
  Briefcase,
  MessageSquare,
  FileText,
  DollarSign,
  Star,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Tag,
  ListTodo,
  History,
  X,
  Save,
  Eye,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ClientPortalToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  description: string;
}

interface Communication {
  id: string;
  type: 'meeting' | 'call' | 'email';
  date: string;
  notes: string;
  followUp?: string;
}

interface Contract {
  id: string;
  name: string;
  type: 'retainer' | 'project' | 'hourly' | 'fixed';
  startDate: string;
  endDate?: string;
  value: number;
  status: 'draft' | 'active' | 'expired' | 'terminated';
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  description: string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  industry: string;
  status: 'active' | 'inactive' | 'prospect';
  leadSource: string;
  rating: number;
  notes?: string;
  createdAt: string;
  projects: Project[];
  communications: Communication[];
  contracts: Contract[];
  invoices: Invoice[];
  tasks: Task[];
}

type ViewMode = 'list' | 'detail' | 'timeline';
type TabType = 'overview' | 'projects' | 'communications' | 'contracts' | 'invoices' | 'tasks';

const STORAGE_KEY = 'client_portal_data';

const leadSources = [
  'Referral',
  'Website',
  'Social Media',
  'Cold Outreach',
  'Networking Event',
  'Advertisement',
  'Other',
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Marketing',
  'Consulting',
  'Other',
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Column configuration for export
const clientColumns: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'company', header: 'Company', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'website', header: 'Website', type: 'string' },
  { key: 'industry', header: 'Industry', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'leadSource', header: 'Lead Source', type: 'string' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'totalRevenue', header: 'Total Revenue', type: 'currency' },
  { key: 'projectCount', header: 'Projects', type: 'number' },
  { key: 'invoiceCount', header: 'Invoices', type: 'number' },
];

export const ClientPortalTool = ({ uiConfig }: ClientPortalToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  const [modalFormData, setModalFormData] = useState<Record<string, any>>({});
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'revenue' | 'rating' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form states
  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    industry: industries[0],
    status: 'prospect' as const,
    leadSource: leadSources[0],
    rating: 3,
    notes: '',
  });

  // Use useToolData hook for backend sync
  const {
    data: clients,
    setData: setClients,
    addItem: addClient,
    updateItem: updateClient,
    deleteItem: deleteClient,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Client>(
    'client-portal',
    [],
    clientColumns,
    { autoSave: true, autoSaveDelay: 1000 }
  );

  // Confirm dialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.client || params.company || params.email) {
        setNewClient({
          ...newClient,
          name: params.client || '',
          company: params.company || '',
          email: params.email || '',
          phone: params.phone || '',
        });
        setShowAddClient(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate total revenue for a client
  const getClientRevenue = (client: Client) => {
    return client.invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  // Filtered and sorted clients
  const filteredClients = useMemo(() => {
    let result = clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'revenue':
          comparison = getClientRevenue(a) - getClientRevenue(b);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [clients, searchQuery, statusFilter, sortBy, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((sum, client) => sum + getClientRevenue(client), 0);
    const activeClients = clients.filter((c) => c.status === 'active').length;
    const prospects = clients.filter((c) => c.status === 'prospect').length;
    const avgRating =
      clients.length > 0
        ? clients.reduce((sum, c) => sum + c.rating, 0) / clients.length
        : 0;
    return { totalRevenue, activeClients, prospects, avgRating };
  }, [clients]);

  // Add new client
  const handleAddClient = () => {
    if (!newClient.name || !newClient.email) return;

    const client: Client = {
      id: generateId(),
      ...newClient,
      createdAt: new Date().toISOString(),
      projects: [],
      communications: [],
      contracts: [],
      invoices: [],
      tasks: [],
    };

    addClient(client);
    setNewClient({
      name: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      industry: industries[0],
      status: 'prospect',
      leadSource: leadSources[0],
      rating: 3,
      notes: '',
    });
    setShowAddClient(false);
  };

  // Update client
  const handleUpdateClient = () => {
    if (!editingClient) return;
    updateClient(editingClient.id, editingClient);
    setEditingClient(null);
  };

  // Delete client
  const handleDeleteClient = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteClient(id);
      if (selectedClient?.id === id) {
        setSelectedClient(null);
        setViewMode('list');
      }
    }
  };

  // Add project
  const handleAddProject = (clientId: string, project: Omit<Project, 'id'>) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      updateClient(clientId, {
        projects: [...client.projects, { ...project, id: generateId() }],
      });
    }
    setShowAddModal(null);
  };

  // Add communication
  const handleAddCommunication = (clientId: string, comm: Omit<Communication, 'id'>) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      updateClient(clientId, {
        communications: [...client.communications, { ...comm, id: generateId() }],
      });
    }
    setShowAddModal(null);
  };

  // Add contract
  const handleAddContract = (clientId: string, contract: Omit<Contract, 'id'>) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      updateClient(clientId, {
        contracts: [...client.contracts, { ...contract, id: generateId() }],
      });
    }
    setShowAddModal(null);
  };

  // Add invoice
  const handleAddInvoice = (clientId: string, invoice: Omit<Invoice, 'id'>) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      updateClient(clientId, {
        invoices: [...client.invoices, { ...invoice, id: generateId() }],
      });
    }
    setShowAddModal(null);
  };

  // Add task
  const handleAddTask = (clientId: string, task: Omit<Task, 'id'>) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      updateClient(clientId, {
        tasks: [...client.tasks, { ...task, id: generateId() }],
      });
    }
    setShowAddModal(null);
  };

  // Delete item from client
  const handleDeleteItem = (
    clientId: string,
    itemType: 'projects' | 'communications' | 'contracts' | 'invoices' | 'tasks',
    itemId: string
  ) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      const filteredItems = client[itemType].filter((item: { id: string }) => item.id !== itemId);
      updateClient(clientId, {
        [itemType]: filteredItems,
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'paid':
        return 'text-green-500 bg-green-500/10';
      case 'inactive':
      case 'cancelled':
      case 'terminated':
        return 'text-red-500 bg-red-500/10';
      case 'prospect':
      case 'draft':
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'in_progress':
      case 'sent':
        return 'text-blue-500 bg-blue-500/10';
      case 'on_hold':
      case 'overdue':
      case 'expired':
        return 'text-orange-500 bg-orange-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  // Render star rating
  const renderStars = (rating: number, editable = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => editable && onChange && onChange(star)}
            className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!editable}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Timeline events from a client
  const getTimelineEvents = (client: Client) => {
    const events: { date: string; type: string; title: string; description: string }[] = [];

    events.push({
      date: client.createdAt,
      type: 'client',
      title: 'Client Added',
      description: `${client.name} was added as a ${client.status}`,
    });

    client.projects.forEach((p) => {
      events.push({
        date: p.startDate,
        type: 'project',
        title: `Project: ${p.name}`,
        description: p.description,
      });
    });

    client.communications.forEach((c) => {
      events.push({
        date: c.date,
        type: 'communication',
        title: `${c.type.charAt(0).toUpperCase() + c.type.slice(1)}`,
        description: c.notes,
      });
    });

    client.contracts.forEach((c) => {
      events.push({
        date: c.startDate,
        type: 'contract',
        title: `Contract: ${c.name}`,
        description: `${c.type} - ${formatCurrency(c.value)}`,
      });
    });

    client.invoices.forEach((i) => {
      events.push({
        date: i.date,
        type: 'invoice',
        title: `Invoice #${i.number}`,
        description: `${formatCurrency(i.amount)} - ${i.status}`,
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Client List View
  const renderClientList = () => (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.clientPortal.totalRevenue', 'Total Revenue')}
            </span>
          </div>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.clientPortal.activeClients', 'Active Clients')}
            </span>
          </div>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.activeClients}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.clientPortal.prospects', 'Prospects')}
            </span>
          </div>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.prospects}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.clientPortal.avgRating', 'Avg Rating')}
            </span>
          </div>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.avgRating.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('tools.clientPortal.searchClients', 'Search clients...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
        >
          <option value="all">{t('tools.clientPortal.allStatus', 'All Status')}</option>
          <option value="active">{t('tools.clientPortal.active', 'Active')}</option>
          <option value="inactive">{t('tools.clientPortal.inactive', 'Inactive')}</option>
          <option value="prospect">{t('tools.clientPortal.prospect', 'Prospect')}</option>
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-');
            setSortBy(by as typeof sortBy);
            setSortOrder(order as typeof sortOrder);
          }}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
        >
          <option value="name-asc">{t('tools.clientPortal.nameAZ', 'Name A-Z')}</option>
          <option value="name-desc">{t('tools.clientPortal.nameZA', 'Name Z-A')}</option>
          <option value="revenue-desc">{t('tools.clientPortal.highestRevenue', 'Highest Revenue')}</option>
          <option value="revenue-asc">{t('tools.clientPortal.lowestRevenue', 'Lowest Revenue')}</option>
          <option value="rating-desc">{t('tools.clientPortal.highestRating', 'Highest Rating')}</option>
          <option value="rating-asc">{t('tools.clientPortal.lowestRating', 'Lowest Rating')}</option>
          <option value="date-desc">{t('tools.clientPortal.newestFirst', 'Newest First')}</option>
          <option value="date-asc">{t('tools.clientPortal.oldestFirst', 'Oldest First')}</option>
        </select>
        <button
          onClick={() => setShowAddClient(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('tools.clientPortal.addClient', 'Add Client')}
        </button>
      </div>

      {/* Client Cards */}
      {filteredClients.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('tools.clientPortal.noClientsFoundAddYour', 'No clients found. Add your first client to get started.')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className={`p-4 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } transition-colors cursor-pointer`}
              onClick={() => {
                setSelectedClient(client);
                setViewMode('detail');
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {client.name}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {client.company}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(client.status)}`}
                      >
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                      {renderStars(client.rating)}
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {client.industry}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(getClientRevenue(client))}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.clientPortal.totalRevenue2', 'Total Revenue')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClient(client);
                      }}
                      className={`p-1 rounded ${
                        theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id);
                      }}
                      className={`p-1 rounded text-red-500 ${
                        theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Client Detail View
  const renderClientDetail = () => {
    if (!selectedClient) return null;

    const client = clients.find((c) => c.id === selectedClient.id) || selectedClient;
    const revenue = getClientRevenue(client);
    const pendingInvoices = client.invoices.filter((i) => i.status === 'sent' || i.status === 'overdue');
    const upcomingTasks = client.tasks.filter((t) => t.status !== 'completed');

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedClient(null);
                setViewMode('list');
              }}
              className={`p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {client.name}
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {client.company}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(client.status)}`}>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </span>
                {renderStars(client.rating)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <History className="w-4 h-4" />
              {t('tools.clientPortal.timeline', 'Timeline')}
            </button>
            <button
              onClick={() => setEditingClient(client)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Edit2 className="w-4 h-4" />
              {t('tools.clientPortal.edit', 'Edit')}
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {client.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {client.phone || 'No phone'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {client.website || 'No website'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {client.leadSource}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <DollarSign className="w-5 h-5 text-green-500 mb-2" />
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(revenue)}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.clientPortal.totalRevenue3', 'Total Revenue')}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Briefcase className="w-5 h-5 text-blue-500 mb-2" />
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {client.projects.length}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.clientPortal.projects', 'Projects')}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <FileText className="w-5 h-5 text-yellow-500 mb-2" />
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {pendingInvoices.length}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.clientPortal.pendingInvoices', 'Pending Invoices')}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <ListTodo className="w-5 h-5 text-purple-500 mb-2" />
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {upcomingTasks.length}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.clientPortal.pendingTasks', 'Pending Tasks')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-4 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: Eye },
              { key: 'projects', label: 'Projects', icon: Briefcase },
              { key: 'communications', label: 'Communications', icon: MessageSquare },
              { key: 'contracts', label: 'Contracts', icon: FileText },
              { key: 'invoices', label: 'Invoices', icon: DollarSign },
              { key: 'tasks', label: 'Tasks', icon: ListTodo },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? 'border-[#0D9488] text-[#0D9488]'
                    : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {client.notes && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.clientPortal.notes', 'Notes')}
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {client.notes}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.clientPortal.recentProjects', 'Recent Projects')}
                  </h4>
                  {client.projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between py-2">
                      <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {project.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                  {client.projects.length === 0 && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.clientPortal.noProjectsYet', 'No projects yet')}
                    </p>
                  )}
                </div>

                {/* Recent Communications */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.clientPortal.recentCommunications', 'Recent Communications')}
                  </h4>
                  {client.communications.slice(0, 3).map((comm) => (
                    <div key={comm.id} className="flex items-center justify-between py-2">
                      <div>
                        <span className={`capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {comm.type}
                        </span>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(comm.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {client.communications.length === 0 && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.clientPortal.noCommunicationsYet', 'No communications yet')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => { setModalFormData({}); setShowAddModal('project'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.clientPortal.addProject', 'Add Project')}
                </button>
              </div>
              {client.projects.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.clientPortal.noProjectsYet2', 'No projects yet')}
                </p>
              ) : (
                <div className="grid gap-4">
                  {client.projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {project.name}
                          </h4>
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {project.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatDate(project.startDate)}
                              {project.endDate && ` - ${formatDate(project.endDate)}`}
                            </span>
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {formatCurrency(project.budget)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(client.id, 'projects', project.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => { setModalFormData({}); setShowAddModal('communication'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.clientPortal.logCommunication', 'Log Communication')}
                </button>
              </div>
              {client.communications.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.clientPortal.noCommunicationsLogged', 'No communications logged')}
                </p>
              ) : (
                <div className="space-y-3">
                  {client.communications.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              comm.type === 'meeting'
                                ? 'bg-blue-500/10 text-blue-500'
                                : comm.type === 'call'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-purple-500/10 text-purple-500'
                            }`}
                          >
                            {comm.type === 'meeting' ? (
                              <Users className="w-4 h-4" />
                            ) : comm.type === 'call' ? (
                              <Phone className="w-4 h-4" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className={`font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {comm.type}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatDate(comm.date)}
                            </p>
                            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {comm.notes}
                            </p>
                            {comm.followUp && (
                              <p className={`text-sm mt-2 italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Follow-up: {comm.followUp}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteItem(client.id, 'communications', comm.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => { setModalFormData({}); setShowAddModal('contract'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.clientPortal.addContract', 'Add Contract')}
                </button>
              </div>
              {client.contracts.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.clientPortal.noContractsYet', 'No contracts yet')}
                </p>
              ) : (
                <div className="grid gap-4">
                  {client.contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {contract.name}
                          </h4>
                          <p className={`text-sm capitalize mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {contract.type} Contract
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatDate(contract.startDate)}
                              {contract.endDate && ` - ${formatDate(contract.endDate)}`}
                            </span>
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {formatCurrency(contract.value)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(contract.status)}`}>
                            {contract.status}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(client.id, 'contracts', contract.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => { setModalFormData({}); setShowAddModal('invoice'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.clientPortal.addInvoice', 'Add Invoice')}
                </button>
              </div>
              {client.invoices.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.clientPortal.noInvoicesYet', 'No invoices yet')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t('tools.clientPortal.invoice', 'Invoice #')}
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t('tools.clientPortal.date', 'Date')}
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t('tools.clientPortal.dueDate', 'Due Date')}
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t('tools.clientPortal.amount', 'Amount')}
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t('tools.clientPortal.status', 'Status')}
                        </th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}
                        >
                          <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            #{invoice.number}
                          </td>
                          <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {formatDate(invoice.date)}
                          </td>
                          <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className={`py-3 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(invoice.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteItem(client.id, 'invoices', invoice.id)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => { setModalFormData({}); setShowAddModal('task'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.clientPortal.addTask', 'Add Task')}
                </button>
              </div>
              {client.tasks.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.clientPortal.noTasksYet', 'No tasks yet')}
                </p>
              ) : (
                <div className="space-y-3">
                  {client.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                              setClients(
                                clients.map((c) => {
                                  if (c.id === client.id) {
                                    return {
                                      ...c,
                                      tasks: c.tasks.map((t) =>
                                        t.id === task.id ? { ...t, status: newStatus } : t
                                      ),
                                    };
                                  }
                                  return c;
                                })
                              );
                            }}
                            className={`w-5 h-5 rounded border ${
                              task.status === 'completed'
                                ? 'bg-green-500 border-green-500 text-white'
                                : theme === 'dark'
                                ? 'border-gray-500'
                                : 'border-gray-300'
                            } flex items-center justify-center`}
                          >
                            {task.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                          </button>
                          <div>
                            <h4
                              className={`font-medium ${
                                task.status === 'completed'
                                  ? 'line-through text-gray-400'
                                  : theme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {task.title}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Due: {formatDate(task.dueDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              task.priority === 'high'
                                ? 'bg-red-500/10 text-red-500'
                                : task.priority === 'medium'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-blue-500/10 text-blue-500'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(client.id, 'tasks', task.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Timeline View
  const renderTimeline = () => {
    if (!selectedClient) return null;

    const client = clients.find((c) => c.id === selectedClient.id) || selectedClient;
    const events = getTimelineEvents(client);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('detail')}
              className={`p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.clientPortal.relationshipTimeline', 'Relationship Timeline')}
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {client.name} - {client.company}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div
            className={`absolute left-4 top-0 bottom-0 w-0.5 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          />
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={index} className="relative pl-12">
                <div
                  className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                  } flex items-center justify-center`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      event.type === 'client'
                        ? 'bg-blue-500'
                        : event.type === 'project'
                        ? 'bg-green-500'
                        : event.type === 'communication'
                        ? 'bg-purple-500'
                        : event.type === 'contract'
                        ? 'bg-yellow-500'
                        : 'bg-teal-500'
                    }`}
                  />
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {event.title}
                    </h4>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Add Client Modal
  const renderAddClientModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.clientPortal.addNewClient', 'Add New Client')}
          </h3>
          <button
            onClick={() => setShowAddClient(false)}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.clientPortal.name', 'Name *')}
            </label>
            <input
              type="text"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.clientPortal.company', 'Company')}
            </label>
            <input
              type="text"
              value={newClient.company}
              onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.clientPortal.email2', 'Email *')}
            </label>
            <input
              type="email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.clientPortal.phone', 'Phone')}
            </label>
            <input
              type="tel"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.clientPortal.website', 'Website')}
            </label>
            <input
              type="url"
              value={newClient.website}
              onChange={(e) => setNewClient({ ...newClient, website: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.clientPortal.industry', 'Industry')}
            </label>
            <select
              value={newClient.industry}
              onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.clientPortal.status2', 'Status')}
            </label>
            <select
              value={newClient.status}
              onChange={(e) =>
                setNewClient({ ...newClient, status: e.target.value as Client['status'] })
              }
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
            >
              <option value="prospect">{t('tools.clientPortal.prospect2', 'Prospect')}</option>
              <option value="active">{t('tools.clientPortal.active2', 'Active')}</option>
              <option value="inactive">{t('tools.clientPortal.inactive2', 'Inactive')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.clientPortal.leadSource', 'Lead Source')}
            </label>
            <select
              value={newClient.leadSource}
              onChange={(e) => setNewClient({ ...newClient, leadSource: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
            >
              {leadSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.clientPortal.rating', 'Rating')}
            </label>
            <div className="pt-2">
              {renderStars(newClient.rating, true, (r) => setNewClient({ ...newClient, rating: r }))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.clientPortal.notes2', 'Notes')}
            </label>
            <textarea
              value={newClient.notes}
              onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 resize-none`}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowAddClient(false)}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.clientPortal.cancel', 'Cancel')}
          </button>
          <button
            onClick={handleAddClient}
            disabled={!newClient.name || !newClient.email}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {t('tools.clientPortal.addClient2', 'Add Client')}
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Client Modal
  const renderEditClientModal = () => {
    if (!editingClient) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.clientPortal.editClient', 'Edit Client')}
            </h3>
            <button
              onClick={() => setEditingClient(null)}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.clientPortal.name2', 'Name *')}
              </label>
              <input
                type="text"
                value={editingClient.name}
                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.clientPortal.company2', 'Company')}
              </label>
              <input
                type="text"
                value={editingClient.company}
                onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.clientPortal.email3', 'Email *')}
              </label>
              <input
                type="email"
                value={editingClient.email}
                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.clientPortal.phone2', 'Phone')}
              </label>
              <input
                type="tel"
                value={editingClient.phone}
                onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.clientPortal.website2', 'Website')}
              </label>
              <input
                type="url"
                value={editingClient.website || ''}
                onChange={(e) => setEditingClient({ ...editingClient, website: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.clientPortal.industry2', 'Industry')}
              </label>
              <select
                value={editingClient.industry}
                onChange={(e) => setEditingClient({ ...editingClient, industry: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.clientPortal.status3', 'Status')}
              </label>
              <select
                value={editingClient.status}
                onChange={(e) =>
                  setEditingClient({ ...editingClient, status: e.target.value as Client['status'] })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
              >
                <option value="prospect">{t('tools.clientPortal.prospect3', 'Prospect')}</option>
                <option value="active">{t('tools.clientPortal.active3', 'Active')}</option>
                <option value="inactive">{t('tools.clientPortal.inactive3', 'Inactive')}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.clientPortal.leadSource2', 'Lead Source')}
              </label>
              <select
                value={editingClient.leadSource}
                onChange={(e) => setEditingClient({ ...editingClient, leadSource: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20`}
              >
                {leadSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.clientPortal.rating2', 'Rating')}
              </label>
              <div className="pt-2">
                {renderStars(editingClient.rating, true, (r) =>
                  setEditingClient({ ...editingClient, rating: r })
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.clientPortal.notes3', 'Notes')}
              </label>
              <textarea
                value={editingClient.notes || ''}
                onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 resize-none`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setEditingClient(null)}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {t('tools.clientPortal.cancel2', 'Cancel')}
            </button>
            <button
              onClick={handleUpdateClient}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg"
            >
              <Save className="w-4 h-4" />
              {t('tools.clientPortal.saveChanges', 'Save Changes')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Item Modal
  const renderAddItemModal = () => {
    if (!showAddModal || !selectedClient) return null;

    const client = clients.find((c) => c.id === selectedClient.id);
    if (!client) return null;

    const handleSubmit = () => {
      switch (showAddModal) {
        case 'project':
          handleAddProject(client.id, {
            name: modalFormData.name || '',
            status: modalFormData.status || 'planning',
            startDate: modalFormData.startDate || new Date().toISOString().split('T')[0],
            endDate: modalFormData.endDate,
            budget: parseFloat(modalFormData.budget) || 0,
            description: modalFormData.description || '',
          });
          break;
        case 'communication':
          handleAddCommunication(client.id, {
            type: modalFormData.type || 'meeting',
            date: modalFormData.date || new Date().toISOString().split('T')[0],
            notes: modalFormData.notes || '',
            followUp: modalFormData.followUp,
          });
          break;
        case 'contract':
          handleAddContract(client.id, {
            name: modalFormData.name || '',
            type: modalFormData.type || 'project',
            startDate: modalFormData.startDate || new Date().toISOString().split('T')[0],
            endDate: modalFormData.endDate,
            value: parseFloat(modalFormData.value) || 0,
            status: modalFormData.status || 'draft',
          });
          break;
        case 'invoice':
          handleAddInvoice(client.id, {
            number: modalFormData.number || `INV-${Date.now()}`,
            date: modalFormData.date || new Date().toISOString().split('T')[0],
            dueDate: modalFormData.dueDate || new Date().toISOString().split('T')[0],
            amount: parseFloat(modalFormData.amount) || 0,
            status: modalFormData.status || 'draft',
            description: modalFormData.description || '',
          });
          break;
        case 'task':
          handleAddTask(client.id, {
            title: modalFormData.title || '',
            dueDate: modalFormData.dueDate || new Date().toISOString().split('T')[0],
            priority: modalFormData.priority || 'medium',
            status: 'pending',
          });
          break;
      }
    };

    const renderFields = () => {
      switch (showAddModal) {
        case 'project':
          return (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.projectName', 'Project Name *')}
                </label>
                <input
                  type="text"
                  value={modalFormData.name || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.status4', 'Status')}
                </label>
                <select
                  value={modalFormData.status || 'planning'}
                  onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="planning">{t('tools.clientPortal.planning', 'Planning')}</option>
                  <option value="in_progress">{t('tools.clientPortal.inProgress', 'In Progress')}</option>
                  <option value="completed">{t('tools.clientPortal.completed', 'Completed')}</option>
                  <option value="on_hold">{t('tools.clientPortal.onHold', 'On Hold')}</option>
                  <option value="cancelled">{t('tools.clientPortal.cancelled', 'Cancelled')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.startDate', 'Start Date')}
                </label>
                <input
                  type="date"
                  value={modalFormData.startDate || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, startDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.budget', 'Budget')}
                </label>
                <input
                  type="number"
                  value={modalFormData.budget || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, budget: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.description', 'Description')}
                </label>
                <textarea
                  value={modalFormData.description || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </>
          );
        case 'communication':
          return (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.type', 'Type')}
                </label>
                <select
                  value={modalFormData.type || 'meeting'}
                  onChange={(e) => setModalFormData({ ...modalFormData, type: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="meeting">{t('tools.clientPortal.meeting', 'Meeting')}</option>
                  <option value="call">{t('tools.clientPortal.call', 'Call')}</option>
                  <option value="email">{t('tools.clientPortal.email', 'Email')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.date2', 'Date')}
                </label>
                <input
                  type="date"
                  value={modalFormData.date || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, date: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.notes4', 'Notes *')}
                </label>
                <textarea
                  value={modalFormData.notes || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.followUp', 'Follow-up')}
                </label>
                <input
                  type="text"
                  value={modalFormData.followUp || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, followUp: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </>
          );
        case 'contract':
          return (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.contractName', 'Contract Name *')}
                </label>
                <input
                  type="text"
                  value={modalFormData.name || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.type2', 'Type')}
                </label>
                <select
                  value={modalFormData.type || 'project'}
                  onChange={(e) => setModalFormData({ ...modalFormData, type: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="retainer">{t('tools.clientPortal.retainer', 'Retainer')}</option>
                  <option value="project">{t('tools.clientPortal.project', 'Project')}</option>
                  <option value="hourly">{t('tools.clientPortal.hourly', 'Hourly')}</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.startDate2', 'Start Date')}
                </label>
                <input
                  type="date"
                  value={modalFormData.startDate || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, startDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.value', 'Value')}
                </label>
                <input
                  type="number"
                  value={modalFormData.value || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, value: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.status5', 'Status')}
                </label>
                <select
                  value={modalFormData.status || 'draft'}
                  onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="draft">{t('tools.clientPortal.draft', 'Draft')}</option>
                  <option value="active">{t('tools.clientPortal.active4', 'Active')}</option>
                  <option value="expired">{t('tools.clientPortal.expired', 'Expired')}</option>
                  <option value="terminated">{t('tools.clientPortal.terminated', 'Terminated')}</option>
                </select>
              </div>
            </>
          );
        case 'invoice':
          return (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.invoiceNumber', 'Invoice Number')}
                </label>
                <input
                  type="text"
                  value={modalFormData.number || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, number: e.target.value })}
                  placeholder={t('tools.clientPortal.inv001', 'INV-001')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.amount2', 'Amount *')}
                </label>
                <input
                  type="number"
                  value={modalFormData.amount || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, amount: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.date3', 'Date')}
                </label>
                <input
                  type="date"
                  value={modalFormData.date || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, date: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.dueDate2', 'Due Date')}
                </label>
                <input
                  type="date"
                  value={modalFormData.dueDate || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, dueDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.status6', 'Status')}
                </label>
                <select
                  value={modalFormData.status || 'draft'}
                  onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="draft">{t('tools.clientPortal.draft2', 'Draft')}</option>
                  <option value="sent">{t('tools.clientPortal.sent', 'Sent')}</option>
                  <option value="paid">{t('tools.clientPortal.paid', 'Paid')}</option>
                  <option value="overdue">{t('tools.clientPortal.overdue', 'Overdue')}</option>
                  <option value="cancelled">{t('tools.clientPortal.cancelled2', 'Cancelled')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.description2', 'Description')}
                </label>
                <textarea
                  value={modalFormData.description || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, description: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </>
          );
        case 'task':
          return (
            <>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.taskTitle', 'Task Title *')}
                </label>
                <input
                  type="text"
                  value={modalFormData.title || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, title: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.dueDate3', 'Due Date')}
                </label>
                <input
                  type="date"
                  value={modalFormData.dueDate || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, dueDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.clientPortal.priority', 'Priority')}
                </label>
                <select
                  value={modalFormData.priority || 'medium'}
                  onChange={(e) => setModalFormData({ ...modalFormData, priority: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="low">{t('tools.clientPortal.low', 'Low')}</option>
                  <option value="medium">{t('tools.clientPortal.medium', 'Medium')}</option>
                  <option value="high">{t('tools.clientPortal.high', 'High')}</option>
                </select>
              </div>
            </>
          );
        default:
          return null;
      }
    };

    const getTitle = () => {
      switch (showAddModal) {
        case 'project':
          return 'Add Project';
        case 'communication':
          return 'Log Communication';
        case 'contract':
          return 'Add Contract';
        case 'invoice':
          return 'Add Invoice';
        case 'task':
          return 'Add Task';
        default:
          return 'Add';
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          className={`w-full max-w-lg rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {getTitle()}
            </h3>
            <button
              onClick={() => setShowAddModal(null)}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{renderFields()}</div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAddModal(null)}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {t('tools.clientPortal.cancel3', 'Cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
              {t('tools.clientPortal.add', 'Add')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.clientPortal.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Users className="w-6 h-6 text-[#0D9488]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.clientPortal.clientPortal', 'Client Portal')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.clientPortal.manageYourClientRelationshipsAnd', 'Manage your client relationships and projects')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <WidgetEmbedButton toolSlug="client-portal" toolName="Client Portal" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme === 'dark' ? 'dark' : 'light'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => {
              const exportData = clients.map((client) => ({
                ...client,
                totalRevenue: getClientRevenue(client),
                projectCount: client.projects.length,
                invoiceCount: client.invoices.length,
              }));
              exportToCSV(exportData, clientColumns, { filename: 'clients' });
            }}
            onExportExcel={() => {
              const exportData = clients.map((client) => ({
                ...client,
                totalRevenue: getClientRevenue(client),
                projectCount: client.projects.length,
                invoiceCount: client.invoices.length,
              }));
              exportToExcel(exportData, clientColumns, { filename: 'clients' });
            }}
            onExportJSON={() => {
              const exportData = clients.map((client) => ({
                ...client,
                totalRevenue: getClientRevenue(client),
                projectCount: client.projects.length,
                invoiceCount: client.invoices.length,
              }));
              exportToJSON(exportData, { filename: 'clients' });
            }}
            onExportPDF={async () => {
              const exportData = clients.map((client) => ({
                ...client,
                totalRevenue: getClientRevenue(client),
                projectCount: client.projects.length,
                invoiceCount: client.invoices.length,
              }));
              await exportToPDF(exportData, clientColumns, { filename: 'clients', title: 'Client Portal Report' });
            }}
            onPrint={() => {
              const exportData = clients.map((client) => ({
                ...client,
                totalRevenue: getClientRevenue(client),
                projectCount: client.projects.length,
                invoiceCount: client.invoices.length,
              }));
              printData(exportData, clientColumns, { title: 'Client Portal Report' });
            }}
            onCopyToClipboard={async () => {
              const exportData = clients.map((client) => ({
                ...client,
                totalRevenue: getClientRevenue(client),
                projectCount: client.projects.length,
                invoiceCount: client.invoices.length,
              }));
              return copyUtil(exportData, clientColumns);
            }}
            disabled={clients.length === 0}
            showImport={false}
            theme={theme === 'dark' ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {viewMode === 'list' && renderClientList()}
        {viewMode === 'detail' && renderClientDetail()}
        {viewMode === 'timeline' && renderTimeline()}
      </div>

      {/* Modals */}
      {showAddClient && renderAddClientModal()}
      {editingClient && renderEditClientModal()}
      {showAddModal && renderAddItemModal()}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.clientPortal.aboutClientPortal', 'About Client Portal')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          A comprehensive client relationship management tool for freelancers. Track client profiles, projects,
          communications, contracts, invoices, and tasks. View relationship timelines and analyze your total
          revenue per client. All data is stored locally in your browser.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default ClientPortalTool;
