'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Users,
  Clock,
  CheckCircle,
  MessageCircle,
  Lock,
  Unlock,
  Calendar,
  Filter,
  Bell,
  Sparkles,
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
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';

interface PrayerRequestToolProps {
  uiConfig?: UIConfig;
}

interface PrayerRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requestTitle: string;
  requestDetails: string;
  category: 'health' | 'family' | 'financial' | 'spiritual' | 'work' | 'relationships' | 'grief' | 'thanksgiving' | 'other';
  urgency: 'urgent' | 'normal' | 'ongoing';
  status: 'active' | 'answered' | 'archived';
  isConfidential: boolean;
  isAnonymous: boolean;
  dateSubmitted: string;
  dateAnswered: string;
  answerNotes: string;
  prayerCount: number;
  assignedTo: string[];
  followUpDate: string;
  updates: PrayerUpdate[];
  createdAt: string;
}

interface PrayerUpdate {
  id: string;
  date: string;
  note: string;
  updatedBy: string;
}

interface PrayerTeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  assignedRequests: string[];
  createdAt: string;
}

type TabType = 'requests' | 'team' | 'answered' | 'stats';
type StatusFilter = 'all' | 'active' | 'answered' | 'archived';
type CategoryFilter = string;

const requestColumns: ColumnConfig[] = [
  { key: 'dateSubmitted', header: 'Date', type: 'date' },
  { key: 'requesterName', header: 'Requester', type: 'string' },
  { key: 'requestTitle', header: 'Request', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'urgency', header: 'Urgency', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'prayerCount', header: 'Prayers', type: 'number' },
];

const defaultRequests: PrayerRequest[] = [];
const defaultTeamMembers: PrayerTeamMember[] = [];

export const PrayerRequestTool: React.FC<PrayerRequestToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const requestsToolData = useToolData<PrayerRequest>('prayer-requests', defaultRequests, requestColumns);
  const teamToolData = useToolData<PrayerTeamMember>('prayer-team', defaultTeamMembers, []);

  const requests = requestsToolData.data;
  const teamMembers = teamToolData.data;

  const [activeTab, setActiveTab] = useState<TabType>('requests');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PrayerRequest | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<PrayerTeamMember | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);

  const [requestForm, setRequestForm] = useState<Partial<PrayerRequest>>({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    requestTitle: '',
    requestDetails: '',
    category: 'other',
    urgency: 'normal',
    status: 'active',
    isConfidential: false,
    isAnonymous: false,
    dateSubmitted: new Date().toISOString().split('T')[0],
    prayerCount: 0,
    assignedTo: [],
    updates: [],
  });

  const [teamForm, setTeamForm] = useState<Partial<PrayerTeamMember>>({
    name: '',
    email: '',
    phone: '',
    isActive: true,
    assignedRequests: [],
  });

  const [updateForm, setUpdateForm] = useState({
    note: '',
    markAnswered: false,
  });

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.name || params.content || params.text) {
        setRequestForm(prev => ({
          ...prev,
          requesterName: params.name || prev.requesterName,
          requestTitle: params.title || params.subject || prev.requestTitle,
          requestDetails: params.content || params.text || prev.requestDetails,
          requesterEmail: params.email || prev.requesterEmail,
        }));
        setShowRequestModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
      const matchesSearch = searchQuery === '' ||
        r.requestTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.requestDetails.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [requests, statusFilter, categoryFilter, searchQuery]);

  const stats = useMemo(() => {
    const activeRequests = requests.filter(r => r.status === 'active').length;
    const answeredRequests = requests.filter(r => r.status === 'answered').length;
    const urgentRequests = requests.filter(r => r.urgency === 'urgent' && r.status === 'active').length;
    const confidentialRequests = requests.filter(r => r.isConfidential && r.status === 'active').length;
    const totalPrayers = requests.reduce((sum, r) => sum + r.prayerCount, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newThisMonth = requests.filter(r => new Date(r.dateSubmitted) >= thisMonth).length;
    const answeredThisMonth = requests.filter(r =>
      r.status === 'answered' && r.dateAnswered && new Date(r.dateAnswered) >= thisMonth
    ).length;

    return {
      activeRequests,
      answeredRequests,
      urgentRequests,
      confidentialRequests,
      totalPrayers,
      newThisMonth,
      answeredThisMonth,
      totalRequests: requests.length,
      activeTeamMembers: teamMembers.filter(m => m.isActive).length,
    };
  }, [requests, teamMembers]);

  const handleSaveRequest = () => {
    if (!requestForm.requestTitle) return;

    if (editingRequest) {
      requestsToolData.updateItem(editingRequest.id, requestForm);
    } else {
      const newRequest: PrayerRequest = {
        id: `prayer-${Date.now()}`,
        requesterName: requestForm.isAnonymous ? 'Anonymous' : (requestForm.requesterName || ''),
        requesterEmail: requestForm.requesterEmail || '',
        requesterPhone: requestForm.requesterPhone || '',
        requestTitle: requestForm.requestTitle || '',
        requestDetails: requestForm.requestDetails || '',
        category: requestForm.category || 'other',
        urgency: requestForm.urgency || 'normal',
        status: 'active',
        isConfidential: requestForm.isConfidential || false,
        isAnonymous: requestForm.isAnonymous || false,
        dateSubmitted: requestForm.dateSubmitted || new Date().toISOString().split('T')[0],
        dateAnswered: '',
        answerNotes: '',
        prayerCount: 0,
        assignedTo: requestForm.assignedTo || [],
        followUpDate: requestForm.followUpDate || '',
        updates: [],
        createdAt: new Date().toISOString(),
      };
      requestsToolData.addItem(newRequest);
    }

    resetRequestForm();
    setShowRequestModal(false);
    setEditingRequest(null);
  };

  const handleDeleteRequest = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Prayer Request',
      message: 'Are you sure you want to delete this prayer request?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      requestsToolData.deleteItem(id);
    }
  };

  const handleAddUpdate = () => {
    if (!selectedRequest || !updateForm.note) return;

    const newUpdate: PrayerUpdate = {
      id: `update-${Date.now()}`,
      date: new Date().toISOString(),
      note: updateForm.note,
      updatedBy: 'Admin',
    };

    const updates = [...(selectedRequest.updates || []), newUpdate];
    const updateData: Partial<PrayerRequest> = { updates };

    if (updateForm.markAnswered) {
      updateData.status = 'answered';
      updateData.dateAnswered = new Date().toISOString().split('T')[0];
      updateData.answerNotes = updateForm.note;
    }

    requestsToolData.updateItem(selectedRequest.id, updateData);

    setUpdateForm({ note: '', markAnswered: false });
    setShowUpdateModal(false);
    setSelectedRequest(null);
  };

  const handlePrayedFor = (request: PrayerRequest) => {
    requestsToolData.updateItem(request.id, {
      prayerCount: request.prayerCount + 1,
    });
  };

  const handleSaveTeamMember = () => {
    if (!teamForm.name) return;

    if (editingTeamMember) {
      teamToolData.updateItem(editingTeamMember.id, teamForm);
    } else {
      const newMember: PrayerTeamMember = {
        id: `team-${Date.now()}`,
        name: teamForm.name || '',
        email: teamForm.email || '',
        phone: teamForm.phone || '',
        isActive: teamForm.isActive !== false,
        assignedRequests: [],
        createdAt: new Date().toISOString(),
      };
      teamToolData.addItem(newMember);
    }

    resetTeamForm();
    setShowTeamModal(false);
    setEditingTeamMember(null);
  };

  const handleDeleteTeamMember = async (id: string) => {
    const confirmed = await confirm({
      title: 'Remove Team Member',
      message: 'Are you sure you want to remove this team member?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      teamToolData.deleteItem(id);
    }
  };

  const resetRequestForm = () => {
    setRequestForm({
      requesterName: '',
      requesterEmail: '',
      requesterPhone: '',
      requestTitle: '',
      requestDetails: '',
      category: 'other',
      urgency: 'normal',
      status: 'active',
      isConfidential: false,
      isAnonymous: false,
      dateSubmitted: new Date().toISOString().split('T')[0],
      prayerCount: 0,
      assignedTo: [],
      updates: [],
    });
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: '',
      email: '',
      phone: '',
      isActive: true,
      assignedRequests: [],
    });
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const getCategoryColor = (category: PrayerRequest['category']) => {
    switch (category) {
      case 'health': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'family': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'financial': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'spiritual': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'work': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'relationships': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'grief': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'thanksgiving': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getUrgencyColor = (urgency: PrayerRequest['urgency']) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'ongoing': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: PrayerRequest['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'answered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'requests', label: 'Prayer Requests', icon: Heart },
    { id: 'team', label: 'Prayer Team', icon: Users },
    { id: 'answered', label: 'Answered Prayers', icon: CheckCircle },
    { id: 'stats', label: 'Statistics', icon: Clock },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.prayerRequest.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.prayerRequest.prayerRequestManager', 'Prayer Request Manager')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.prayerRequest.trackPrayerRequestsManagePrayer', 'Track prayer requests, manage prayer teams, and celebrate answered prayers')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="prayer-request" toolName="Prayer Request" />

              <SyncStatus
                isSynced={requestsToolData.isSynced}
                isSaving={requestsToolData.isSaving}
                lastSaved={requestsToolData.lastSaved}
                syncError={requestsToolData.syncError}
                onForceSync={requestsToolData.forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(requests.filter(r => !r.isConfidential), requestColumns, { filename: 'prayer-requests' })}
                onExportExcel={() => exportToExcel(requests.filter(r => !r.isConfidential), requestColumns, { filename: 'prayer-requests' })}
                onExportJSON={() => exportToJSON(requests.filter(r => !r.isConfidential), { filename: 'prayer-requests' })}
                onExportPDF={async () => {
                  await exportToPDF(requests.filter(r => !r.isConfidential), requestColumns, {
                    filename: 'prayer-requests',
                    title: 'Prayer Requests Report',
                    subtitle: `${stats.activeRequests} active | ${stats.answeredRequests} answered`,
                  });
                }}
                onPrint={() => printData(requests.filter(r => !r.isConfidential), requestColumns, { title: 'Prayer Requests' })}
                onCopyToClipboard={async () => await copyUtil(requests.filter(r => !r.isConfidential), requestColumns, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prayerRequest.activeRequests', 'Active Requests')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.activeRequests}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prayerRequest.answered', 'Answered')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.answeredRequests}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prayerRequest.urgent', 'Urgent')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.urgentRequests}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prayerRequest.teamMembers', 'Team Members')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.activeTeamMembers}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {(activeTab === 'requests' || activeTab === 'answered') && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.prayerRequest.searchRequests', 'Search requests...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">{t('tools.prayerRequest.allCategories', 'All Categories')}</option>
                  <option value="health">{t('tools.prayerRequest.health', 'Health')}</option>
                  <option value="family">{t('tools.prayerRequest.family', 'Family')}</option>
                  <option value="financial">{t('tools.prayerRequest.financial', 'Financial')}</option>
                  <option value="spiritual">{t('tools.prayerRequest.spiritual', 'Spiritual')}</option>
                  <option value="work">{t('tools.prayerRequest.work', 'Work')}</option>
                  <option value="relationships">{t('tools.prayerRequest.relationships', 'Relationships')}</option>
                  <option value="grief">{t('tools.prayerRequest.grief', 'Grief')}</option>
                  <option value="thanksgiving">{t('tools.prayerRequest.thanksgiving', 'Thanksgiving')}</option>
                  <option value="other">{t('tools.prayerRequest.other', 'Other')}</option>
                </select>
              </div>
              <button
                onClick={() => { resetRequestForm(); setEditingRequest(null); setShowRequestModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
              >
                <Plus className="w-4 h-4" />
                {t('tools.prayerRequest.newRequest', 'New Request')}
              </button>
            </div>

            <div className="space-y-4">
              {filteredRequests
                .filter(r => activeTab === 'answered' ? r.status === 'answered' : r.status === 'active')
                .map((request) => (
                <div key={request.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {request.isConfidential && (
                          <Lock className="w-4 h-4 text-yellow-500" />
                        )}
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {request.requestTitle}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(request.category)}`}>
                          {request.category}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                        {request.requestDetails.length > 150
                          ? `${request.requestDetails.substring(0, 150)}...`
                          : request.requestDetails}
                      </p>
                      <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>From: {request.requesterName || 'Anonymous'}</span>
                        <span>Submitted: {formatDate(request.dateSubmitted)}</span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {request.prayerCount} prayers
                        </span>
                        {request.updates.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {request.updates.length} updates
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrayedFor(request)}
                        className="p-2 rounded-lg bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20"
                        title={t('tools.prayerRequest.iPrayedForThis', 'I prayed for this')}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedRequest(request); setShowUpdateModal(true); }}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        title={t('tools.prayerRequest.addUpdate3', 'Add update')}
                      >
                        <MessageCircle className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => { setRequestForm(request); setEditingRequest(request); setShowRequestModal(true); }}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  {request.status === 'answered' && request.answerNotes && (
                    <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                      <p className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                        ✓ Answered on {formatDate(request.dateAnswered)}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                        {request.answerNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {filteredRequests.filter(r => activeTab === 'answered' ? r.status === 'answered' : r.status === 'active').length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeTab === 'answered' ? t('tools.prayerRequest.noAnsweredPrayersYet', 'No answered prayers yet') : t('tools.prayerRequest.noPrayerRequestsFound', 'No prayer requests found')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Prayer Team Members ({teamMembers.length})
              </h2>
              <button
                onClick={() => { resetTeamForm(); setEditingTeamMember(null); setShowTeamModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
              >
                <Plus className="w-4 h-4" />
                {t('tools.prayerRequest.addMember', 'Add Member')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-200 dark:bg-gray-600'}`}>
                        <Users className={`w-5 h-5 ${member.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {member.name}
                        </h3>
                        <span className={`text-xs ${member.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {member.isActive ? t('tools.prayerRequest.active2', 'Active') : t('tools.prayerRequest.inactive', 'Inactive')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setTeamForm(member); setEditingTeamMember(member); setShowTeamModal(true); }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(member.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {member.email && <p>{member.email}</p>}
                    {member.phone && <p>{member.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
            {teamMembers.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.prayerRequest.noPrayerTeamMembersYet', 'No prayer team members yet')}
              </div>
            )}
          </div>
        )}

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingRequest ? t('tools.prayerRequest.editPrayerRequest', 'Edit Prayer Request') : t('tools.prayerRequest.newPrayerRequest', 'New Prayer Request')}
                </h3>
                <button onClick={() => { setShowRequestModal(false); setEditingRequest(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={requestForm.isAnonymous || false}
                      onChange={(e) => setRequestForm({ ...requestForm, isAnonymous: e.target.checked })}
                      className="rounded text-[#0D9488]"
                    />
                    <label htmlFor="anonymous" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prayerRequest.anonymous', 'Anonymous')}
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="confidential"
                      checked={requestForm.isConfidential || false}
                      onChange={(e) => setRequestForm({ ...requestForm, isConfidential: e.target.checked })}
                      className="rounded text-[#0D9488]"
                    />
                    <label htmlFor="confidential" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.prayerRequest.confidential', 'Confidential')}
                    </label>
                  </div>
                </div>
                {!requestForm.isAnonymous && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.yourName', 'Your Name')}</label>
                      <input
                        type="text"
                        value={requestForm.requesterName || ''}
                        onChange={(e) => setRequestForm({ ...requestForm, requesterName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.email', 'Email')}</label>
                        <input
                          type="email"
                          value={requestForm.requesterEmail || ''}
                          onChange={(e) => setRequestForm({ ...requestForm, requesterEmail: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.phone', 'Phone')}</label>
                        <input
                          type="tel"
                          value={requestForm.requesterPhone || ''}
                          onChange={(e) => setRequestForm({ ...requestForm, requesterPhone: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.prayerRequestTitle', 'Prayer Request Title *')}</label>
                  <input
                    type="text"
                    value={requestForm.requestTitle || ''}
                    onChange={(e) => setRequestForm({ ...requestForm, requestTitle: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.prayerRequest.briefSummaryOfYourPrayer', 'Brief summary of your prayer request')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.details', 'Details')}</label>
                  <textarea
                    value={requestForm.requestDetails || ''}
                    onChange={(e) => setRequestForm({ ...requestForm, requestDetails: e.target.value })}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.prayerRequest.shareMoreDetailsAboutYour', 'Share more details about your prayer request...')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.category', 'Category')}</label>
                    <select
                      value={requestForm.category || 'other'}
                      onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value as PrayerRequest['category'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="health">{t('tools.prayerRequest.health2', 'Health')}</option>
                      <option value="family">{t('tools.prayerRequest.family2', 'Family')}</option>
                      <option value="financial">{t('tools.prayerRequest.financial2', 'Financial')}</option>
                      <option value="spiritual">{t('tools.prayerRequest.spiritual2', 'Spiritual')}</option>
                      <option value="work">{t('tools.prayerRequest.work2', 'Work')}</option>
                      <option value="relationships">{t('tools.prayerRequest.relationships2', 'Relationships')}</option>
                      <option value="grief">{t('tools.prayerRequest.grief2', 'Grief')}</option>
                      <option value="thanksgiving">{t('tools.prayerRequest.thanksgiving2', 'Thanksgiving')}</option>
                      <option value="other">{t('tools.prayerRequest.other2', 'Other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.urgency', 'Urgency')}</label>
                    <select
                      value={requestForm.urgency || 'normal'}
                      onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value as PrayerRequest['urgency'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="normal">{t('tools.prayerRequest.normal', 'Normal')}</option>
                      <option value="urgent">{t('tools.prayerRequest.urgent2', 'Urgent')}</option>
                      <option value="ongoing">{t('tools.prayerRequest.ongoing', 'Ongoing')}</option>
                    </select>
                  </div>
                </div>
                {editingRequest && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.status', 'Status')}</label>
                    <select
                      value={requestForm.status || 'active'}
                      onChange={(e) => setRequestForm({ ...requestForm, status: e.target.value as PrayerRequest['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="active">{t('tools.prayerRequest.active', 'Active')}</option>
                      <option value="answered">{t('tools.prayerRequest.answered2', 'Answered')}</option>
                      <option value="archived">{t('tools.prayerRequest.archived', 'Archived')}</option>
                    </select>
                  </div>
                )}
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowRequestModal(false); setEditingRequest(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.prayerRequest.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveRequest}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingRequest ? t('tools.prayerRequest.saveChanges', 'Save Changes') : t('tools.prayerRequest.submitRequest', 'Submit Request')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Team Member Modal */}
        {showTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingTeamMember ? t('tools.prayerRequest.editTeamMember', 'Edit Team Member') : t('tools.prayerRequest.addTeamMember', 'Add Team Member')}
                </h3>
                <button onClick={() => { setShowTeamModal(false); setEditingTeamMember(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.name', 'Name *')}</label>
                  <input
                    type="text"
                    value={teamForm.name || ''}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.email2', 'Email')}</label>
                  <input
                    type="email"
                    value={teamForm.email || ''}
                    onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.phone2', 'Phone')}</label>
                  <input
                    type="tel"
                    value={teamForm.phone || ''}
                    onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="teamActive"
                    checked={teamForm.isActive !== false}
                    onChange={(e) => setTeamForm({ ...teamForm, isActive: e.target.checked })}
                    className="rounded text-[#0D9488]"
                  />
                  <label htmlFor="teamActive" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.prayerRequest.activeMember', 'Active Member')}
                  </label>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowTeamModal(false); setEditingTeamMember(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.prayerRequest.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveTeamMember}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingTeamMember ? t('tools.prayerRequest.saveChanges2', 'Save Changes') : t('tools.prayerRequest.addMember2', 'Add Member')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.prayerRequest.addUpdate', 'Add Update')}
                </h3>
                <button onClick={() => { setShowUpdateModal(false); setSelectedRequest(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedRequest.requestTitle}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    From: {selectedRequest.requesterName}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.prayerRequest.updateNote', 'Update Note *')}</label>
                  <textarea
                    value={updateForm.note}
                    onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.prayerRequest.shareAnUpdateOnThis', 'Share an update on this prayer request...')}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="markAnswered"
                    checked={updateForm.markAnswered}
                    onChange={(e) => setUpdateForm({ ...updateForm, markAnswered: e.target.checked })}
                    className="rounded text-[#0D9488]"
                  />
                  <label htmlFor="markAnswered" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.prayerRequest.markAsAnsweredPrayer', 'Mark as Answered Prayer')}
                  </label>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowUpdateModal(false); setSelectedRequest(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.prayerRequest.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleAddUpdate}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {t('tools.prayerRequest.addUpdate2', 'Add Update')}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PrayerRequestTool;
