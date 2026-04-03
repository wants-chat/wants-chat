import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building2,
  X,
  Save,
  Loader2,
  Filter,
  ChevronDown,
  UserPlus,
  AlertCircle,
  DollarSign,
  Target,
  TrendingUp,
  LayoutGrid,
  List,
  MessageSquare,
  Flame,
  Thermometer,
  Snowflake,
  Calendar,
  ArrowRight,
  Clock,
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
import { api } from '../../lib/api';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score: 'hot' | 'warm' | 'cold';
  estimated_value?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface LeadActivity {
  id: string;
  lead_id: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'status_change';
  content: string;
  created_at: string;
}

interface UIConfig {
  prefillData?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    status?: Lead['status'];
    score?: Lead['score'];
    estimated_value?: number;
    notes?: string;
  };
}

interface LeadTrackerToolProps {
  uiConfig?: UIConfig;
}

const leadStatuses = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'purple' },
  { value: 'qualified', label: 'Qualified', color: 'cyan' },
  { value: 'proposal', label: 'Proposal', color: 'yellow' },
  { value: 'negotiation', label: 'Negotiation', color: 'orange' },
  { value: 'won', label: 'Won', color: 'green' },
  { value: 'lost', label: 'Lost', color: 'red' },
];

const leadScores = [
  { value: 'hot', label: 'Hot', icon: Flame, color: 'red' },
  { value: 'warm', label: 'Warm', icon: Thermometer, color: 'orange' },
  { value: 'cold', label: 'Cold', icon: Snowflake, color: 'blue' },
];

const leadSources = [
  'Website',
  'Referral',
  'Social Media',
  'Cold Call',
  'Email Campaign',
  'Trade Show',
  'Advertisement',
  'Other',
];

const activityTypes = [
  { value: 'note', label: 'Note', icon: MessageSquare },
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
];

// Column configuration for export
const leadColumns: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'company', header: 'Company', type: 'string' },
  { key: 'source', header: 'Source', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'score', header: 'Score', type: 'string' },
  { key: 'estimated_value', header: 'Estimated Value', type: 'currency' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'created_at', header: 'Created At', type: 'date' },
];

export const LeadTrackerTool: React.FC<LeadTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize useToolData hook with leads
  const {
    data: leads,
    isLoading: loading,
    isSaving: saving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
    exportCSV: exportLeadsCSV,
    exportExcel: exportLeadsExcel,
    exportJSON: exportLeadsJSON,
    exportPDF: exportLeadsPDF,
  } = useToolData<Lead>('lead-tracker', [], leadColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
    onError: (error) => setError(error),
  });

  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('');
  const [filterScore, setFilterScore] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Activity modal states
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: 'note' as LeadActivity['type'], content: '' });
  const [savingActivity, setSavingActivity] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    status: 'new' as Lead['status'],
    score: 'warm' as Lead['score'],
    estimated_value: 0,
    notes: '',
  });

  // Stats - compute from leads data
  const stats = React.useMemo(() => {
    const total = leads.length;
    const won = leads.filter((l: Lead) => l.status === 'won').length;
    const closed = leads.filter((l: Lead) => l.status === 'won' || l.status === 'lost').length;
    const conversionRate = closed > 0 ? Math.round((won / closed) * 100) : 0;
    const pipelineValue = leads
      .filter((l: Lead) => l.status !== 'won' && l.status !== 'lost')
      .reduce((sum: number, l: Lead) => sum + (l.estimated_value || 0), 0);

    return { total, won, conversionRate, pipelineValue };
  }, [leads]);

  // Get filtered leads based on search and filters
  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead: Lead) => {
      if (searchQuery && !lead.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !lead.email?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterStatus && lead.status !== filterStatus) {
        return false;
      }
      if (filterSource && lead.source !== filterSource) {
        return false;
      }
      if (filterScore && lead.score !== filterScore) {
        return false;
      }
      return true;
    });
  }, [leads, searchQuery, filterStatus, filterSource, filterScore]);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      const prefill = uiConfig.prefillData;
      setFormData({
        name: prefill.name || '',
        email: prefill.email || '',
        phone: prefill.phone || '',
        company: prefill.company || '',
        source: prefill.source || '',
        status: prefill.status || 'new',
        score: prefill.score || 'warm',
        estimated_value: prefill.estimated_value || 0,
        notes: prefill.notes || '',
      });
      setShowModal(true);
    }
  }, [uiConfig?.prefillData]);

  // Fetch activities for a lead
  const fetchActivities = async (leadId: string) => {
    try {
      setLoadingActivities(true);
      const response = await api.get(`/business/lead-activities?lead_id=${leadId}`);
      setActivities(response.items || response || []);
    } catch (err: any) {
      console.error('Failed to load activities:', err);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Open modal for new lead
  const handleAddNew = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      source: '',
      status: 'new',
      score: 'warm',
      estimated_value: 0,
      notes: '',
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || '',
      status: lead.status,
      score: lead.score,
      estimated_value: lead.estimated_value || 0,
      notes: lead.notes || '',
    });
    setShowModal(true);
  };

  // Open activity modal
  const handleViewActivities = (lead: Lead) => {
    setSelectedLead(lead);
    setShowActivityModal(true);
    fetchActivities(lead.id);
  };

  // Save lead
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setNameError('Name is required');
      return;
    }

    try {
      setNameError(null);
      setError(null);

      if (editingLead) {
        // Update existing lead
        updateItem(editingLead.id, {
          ...formData,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Add new lead
        const newLead: Lead = {
          id: `lead-${Date.now()}`,
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        addItem(newLead);
      }

      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save lead');
    }
  };

  // Delete lead
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Lead',
      message: 'Are you sure you want to delete this lead? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      deleteItem(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete lead');
    }
  };

  // Add activity
  const handleAddActivity = async () => {
    if (!newActivity.content.trim() || !selectedLead) return;

    try {
      setSavingActivity(true);
      await api.post('/business/lead-activities', {
        lead_id: selectedLead.id,
        type: newActivity.type,
        content: newActivity.content,
      });
      setNewActivity({ type: 'note', content: '' });
      fetchActivities(selectedLead.id);
    } catch (err: any) {
      setError(err.message || 'Failed to add activity');
    } finally {
      setSavingActivity(false);
    }
  };

  // Update lead status (for kanban drag or quick update)
  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      updateItem(leadId, {
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const statusObj = leadStatuses.find(s => s.value === status);
    return colors[statusObj?.color || 'gray'] || colors.gray;
  };

  const getScoreIcon = (score: string) => {
    const scoreObj = leadScores.find(s => s.value === score);
    if (!scoreObj) return null;
    const Icon = scoreObj.icon;
    const colors: Record<string, string> = {
      red: 'text-red-500',
      orange: 'text-orange-500',
      blue: 'text-blue-500',
    };
    return <Icon className={`w-4 h-4 ${colors[scoreObj.color]}`} />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Group leads by status for kanban view
  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gradient-to-r from-white to-emerald-50 border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.leadTracker.leadTracker', 'Lead Tracker')}
                </h3>
                <WidgetEmbedButton toolSlug="lead-tracker" toolName="Lead Tracker" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={saving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={isDark ? 'dark' : 'light'}
                  showLabel={true}
                  size="sm"
                />
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.leadTracker.trackAndManageYourSales', 'Track and manage your sales pipeline')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-emerald-500 text-white' : isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} rounded-l-lg transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 ${viewMode === 'kanban' ? 'bg-emerald-500 text-white' : isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} rounded-r-lg transition-colors`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <ExportDropdown
              onExportCSV={() => exportLeadsCSV({ filename: 'leads' })}
              onExportExcel={() => exportLeadsExcel({ filename: 'leads' })}
              onExportJSON={() => exportLeadsJSON({ filename: 'leads' })}
              onExportPDF={() => exportLeadsPDF({ filename: 'leads', title: 'Leads Report' })}
              onPrint={() => printData(leads, leadColumns, { title: 'Leads Report' })}
              onCopyToClipboard={() => copyUtil(leads, leadColumns)}
              disabled={leads.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              {t('tools.leadTracker.addLead', 'Add Lead')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-4 gap-4 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.leadTracker.totalLeads', 'Total Leads')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className="text-2xl font-bold text-emerald-500">{stats.won}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.leadTracker.wonDeals', 'Won Deals')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className="text-2xl font-bold text-blue-500">{stats.conversionRate}%</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.leadTracker.conversionRate', 'Conversion Rate')}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className="text-2xl font-bold text-orange-500">{formatCurrency(stats.pipelineValue)}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.leadTracker.pipelineValue', 'Pipeline Value')}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder={t('tools.leadTracker.searchLeads', 'Search leads...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="">{t('tools.leadTracker.allStatuses', 'All Statuses')}</option>
              {leadStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="">{t('tools.leadTracker.allSources', 'All Sources')}</option>
              {leadSources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="">{t('tools.leadTracker.allScores', 'All Scores')}</option>
              {leadScores.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Lead List / Kanban */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{leads.length === 0 ? t('tools.leadTracker.noLeadsFound', 'No leads found') : t('tools.leadTracker.noResultsMatchYourFilters', 'No results match your filters')}</p>
            {leads.length === 0 && (
              <button onClick={handleAddNew} className="mt-2 text-emerald-500 hover:underline">
                {t('tools.leadTracker.addYourFirstLead', 'Add your first lead')}
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          // List View
          <div className="space-y-2">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {lead.name}
                      </h4>
                      {getScoreIcon(lead.score)}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                        {leadStatuses.find(s => s.value === lead.status)?.label}
                      </span>
                    </div>
                    <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </span>
                      )}
                      {lead.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {lead.company}
                        </span>
                      )}
                      {lead.estimated_value && lead.estimated_value > 0 && (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <DollarSign className="w-3 h-3" /> {formatCurrency(lead.estimated_value)}
                        </span>
                      )}
                      {lead.source && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> {lead.source}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewActivities(lead)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      title={t('tools.leadTracker.viewActivities', 'View Activities')}
                    >
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleEdit(lead)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Kanban View
          <div className="flex gap-4 overflow-x-auto pb-4">
            {leadStatuses.map((status) => {
              const statusLeads = getLeadsByStatus(status.value);
              return (
                <div
                  key={status.value}
                  className={`flex-shrink-0 w-72 rounded-lg ${isDark ? 'bg-gray-900/50' : 'bg-gray-100'}`}
                >
                  <div className={`px-3 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(status.value)}`}>
                        {status.label}
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {statusLeads.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                    {statusLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {lead.name}
                          </span>
                          {getScoreIcon(lead.score)}
                        </div>
                        {lead.company && (
                          <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {lead.company}
                          </p>
                        )}
                        {lead.estimated_value && lead.estimated_value > 0 && (
                          <p className="text-xs text-emerald-500 font-medium">
                            {formatCurrency(lead.estimated_value)}
                          </p>
                        )}
                        <div className="flex items-center justify-end gap-1 mt-2">
                          <button
                            onClick={() => handleViewActivities(lead)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <MessageSquare className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleEdit(lead)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Edit2 className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-lg rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingLead ? t('tools.leadTracker.editLead', 'Edit Lead') : t('tools.leadTracker.addLead2', 'Add Lead')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.leadTracker.name', 'Name *')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (nameError) setNameError(null);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${nameError ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-200'} ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                  placeholder={t('tools.leadTracker.leadName', 'Lead name')}
                />
                {nameError && (
                  <p className="mt-1 text-sm text-red-500">{nameError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.leadTracker.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.leadTracker.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.leadTracker.company', 'Company')}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.leadTracker.source', 'Source')}
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="">{t('tools.leadTracker.selectSource', 'Select source')}</option>
                    {leadSources.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.leadTracker.estimatedValue', 'Estimated Value')}
                  </label>
                  <div className="relative">
                    <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="number"
                      value={formData.estimated_value}
                      onChange={(e) => setFormData({ ...formData, estimated_value: parseFloat(e.target.value) || 0 })}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.leadTracker.status', 'Status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {leadStatuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.leadTracker.score', 'Score')}
                  </label>
                  <select
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value as Lead['score'] })}
                    className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {leadScores.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.leadTracker.notes', 'Notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.leadTracker.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t('tools.leadTracker.saving', 'Saving...') : t('tools.leadTracker.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-lg rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.leadTracker.activities', 'Activities')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedLead.name}
                </p>
              </div>
              <button onClick={() => setShowActivityModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Add Activity Form */}
              <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex gap-2 mb-2">
                  {activityTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNewActivity({ ...newActivity, type: type.value as LeadActivity['type'] })}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                          newActivity.type === type.value
                            ? 'bg-emerald-500 text-white'
                            : isDark
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newActivity.content}
                    onChange={(e) => setNewActivity({ ...newActivity, content: e.target.value })}
                    placeholder={t('tools.leadTracker.addANoteLogA', 'Add a note, log a call...')}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                  <button
                    onClick={handleAddActivity}
                    disabled={savingActivity || !newActivity.content.trim()}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {savingActivity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Activity List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {loadingActivities ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                ) : activities.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t('tools.leadTracker.noActivitiesYet', 'No activities yet')}</p>
                  </div>
                ) : (
                  activities.map((activity) => {
                    const activityType = activityTypes.find(t => t.value === activity.type);
                    const Icon = activityType?.icon || MessageSquare;
                    return (
                      <div
                        key={activity.id}
                        className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`p-1.5 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                            <Icon className={`w-3 h-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {activity.content}
                            </p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className={`flex justify-end p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowActivityModal(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.leadTracker.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default LeadTrackerTool;
