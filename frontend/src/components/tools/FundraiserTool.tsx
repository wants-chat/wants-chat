'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Megaphone,
  DollarSign,
  Calendar,
  Users,
  Target,
  Plus,
  Trash2,
  Search,
  TrendingUp,
  Gift,
  Share2,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Trophy,
  Sparkles,
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
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface FundraiserToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
type CampaignType = 'general' | 'event' | 'crowdfunding' | 'peer_to_peer' | 'matching' | 'annual';
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  goal: number;
  raised: number;
  donorCount: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  imageUrl: string;
  isMatching: boolean;
  matchingRatio: number;
  matchingMax: number;
  matchingSource: string;
  createdAt: string;
  updatedAt: string;
}

interface Pledge {
  id: string;
  campaignId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  pledgeDate: string;
  expectedDate: string;
  fulfilled: boolean;
  fulfilledAt: string | null;
  notes: string;
  createdAt: string;
}

interface EventTicket {
  id: string;
  campaignId: string;
  ticketType: string;
  price: number;
  quantity: number;
  sold: number;
  createdAt: string;
}

interface FundraisingTeam {
  id: string;
  campaignId: string;
  name: string;
  captain: string;
  captainEmail: string;
  goal: number;
  raised: number;
  memberCount: number;
  createdAt: string;
}

interface Contribution {
  id: string;
  campaignId: string;
  teamId: string | null;
  donorName: string;
  donorEmail: string;
  amount: number;
  isMatched: boolean;
  matchedAmount: number;
  paymentStatus: PaymentStatus;
  isAnonymous: boolean;
  message: string;
  createdAt: string;
}

// Constants
const CAMPAIGN_TYPES: { value: CampaignType; label: string; description: string }[] = [
  { value: 'general', label: 'General Campaign', description: 'Standard fundraising campaign' },
  { value: 'event', label: 'Event-Based', description: 'Gala, auction, or special event' },
  { value: 'crowdfunding', label: 'Crowdfunding', description: 'Time-limited crowdfunding' },
  { value: 'peer_to_peer', label: 'Peer-to-Peer', description: 'Team-based fundraising' },
  { value: 'matching', label: 'Matching Gift', description: 'Donations matched by sponsor' },
  { value: 'annual', label: 'Annual Appeal', description: 'Yearly giving campaign' },
];

// Column configurations
const CAMPAIGN_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Campaign Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'goal', header: 'Goal', type: 'currency' },
  { key: 'raised', header: 'Raised', type: 'currency' },
  { key: 'donorCount', header: 'Donors', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
];

const CONTRIBUTION_COLUMNS: ColumnConfig[] = [
  { key: 'donorName', header: 'Donor', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'matchedAmount', header: 'Matched', type: 'currency' },
  { key: 'paymentStatus', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Date', type: 'date' },
];

const PLEDGE_COLUMNS: ColumnConfig[] = [
  { key: 'donorName', header: 'Donor', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'expectedDate', header: 'Expected', type: 'date' },
  { key: 'fulfilled', header: 'Fulfilled', type: 'boolean' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDaysRemaining = (endDate: string) => {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Main Component
export const FundraiserTool: React.FC<FundraiserToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: campaigns,
    addItem: addCampaignToBackend,
    updateItem: updateCampaignBackend,
    deleteItem: deleteCampaignBackend,
    isSynced: campaignsSynced,
    isSaving: campaignsSaving,
    lastSaved: campaignsLastSaved,
    syncError: campaignsSyncError,
    forceSync: forceCampaignsSync,
  } = useToolData<Campaign>('fundraiser-campaigns', [], CAMPAIGN_COLUMNS);

  const {
    data: contributions,
    addItem: addContributionToBackend,
    updateItem: updateContributionBackend,
    deleteItem: deleteContributionBackend,
  } = useToolData<Contribution>('fundraiser-contributions', [], CONTRIBUTION_COLUMNS);

  const {
    data: pledges,
    addItem: addPledgeToBackend,
    updateItem: updatePledgeBackend,
    deleteItem: deletePledgeBackend,
  } = useToolData<Pledge>('fundraiser-pledges', [], PLEDGE_COLUMNS);

  const {
    data: teams,
    addItem: addTeamToBackend,
    updateItem: updateTeamBackend,
    deleteItem: deleteTeamBackend,
  } = useToolData<FundraisingTeam>('fundraiser-teams', [], []);

  const {
    data: tickets,
    addItem: addTicketToBackend,
    updateItem: updateTicketBackend,
    deleteItem: deleteTicketBackend,
  } = useToolData<EventTicket>('fundraiser-tickets', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'campaigns' | 'contributions' | 'pledges' | 'teams' | 'analytics'>('campaigns');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [showPledgeForm, setShowPledgeForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    type: 'general',
    goal: 0,
    startDate: '',
    endDate: '',
    status: 'draft',
    imageUrl: '',
    isMatching: false,
    matchingRatio: 1,
    matchingMax: 0,
    matchingSource: '',
  });

  const [newContribution, setNewContribution] = useState<Partial<Contribution>>({
    campaignId: '',
    teamId: null,
    donorName: '',
    donorEmail: '',
    amount: 0,
    isAnonymous: false,
    message: '',
  });

  const [newPledge, setNewPledge] = useState<Partial<Pledge>>({
    campaignId: '',
    donorName: '',
    donorEmail: '',
    amount: 0,
    expectedDate: '',
    notes: '',
  });

  const [newTeam, setNewTeam] = useState<Partial<FundraisingTeam>>({
    name: '',
    captain: '',
    captainEmail: '',
    goal: 0,
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.campaignName || params.name) {
        setNewCampaign({
          ...newCampaign,
          name: params.campaignName || params.name || '',
          goal: parseFloat(params.goal) || 0,
          description: params.description || '',
        });
        setShowCampaignForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add new campaign
  const addCampaign = () => {
    if (!newCampaign.name || !newCampaign.goal) {
      setValidationMessage('Please enter campaign name and goal');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const campaign: Campaign = {
      id: generateId(),
      name: newCampaign.name || '',
      description: newCampaign.description || '',
      type: newCampaign.type || 'general',
      goal: newCampaign.goal || 0,
      raised: 0,
      donorCount: 0,
      startDate: newCampaign.startDate || new Date().toISOString(),
      endDate: newCampaign.endDate || '',
      status: newCampaign.status || 'draft',
      imageUrl: newCampaign.imageUrl || '',
      isMatching: newCampaign.isMatching || false,
      matchingRatio: newCampaign.matchingRatio || 1,
      matchingMax: newCampaign.matchingMax || 0,
      matchingSource: newCampaign.matchingSource || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addCampaignToBackend(campaign);
    setShowCampaignForm(false);
    setNewCampaign({
      name: '',
      description: '',
      type: 'general',
      goal: 0,
      startDate: '',
      endDate: '',
      status: 'draft',
      imageUrl: '',
      isMatching: false,
      matchingRatio: 1,
      matchingMax: 0,
      matchingSource: '',
    });
  };

  // Add contribution
  const addContribution = () => {
    if (!newContribution.campaignId || !newContribution.amount || newContribution.amount <= 0) {
      setValidationMessage('Please select a campaign and enter a valid amount');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const campaign = campaigns.find(c => c.id === newContribution.campaignId);
    let matchedAmount = 0;

    if (campaign?.isMatching && campaign.matchingMax > 0) {
      const currentMatchedTotal = contributions
        .filter(c => c.campaignId === campaign.id && c.isMatched)
        .reduce((sum, c) => sum + c.matchedAmount, 0);
      const availableMatching = campaign.matchingMax - currentMatchedTotal;
      const potentialMatch = (newContribution.amount || 0) * campaign.matchingRatio;
      matchedAmount = Math.min(potentialMatch, availableMatching);
    }

    const contribution: Contribution = {
      id: generateId(),
      campaignId: newContribution.campaignId,
      teamId: newContribution.teamId || null,
      donorName: newContribution.donorName || 'Anonymous',
      donorEmail: newContribution.donorEmail || '',
      amount: newContribution.amount || 0,
      isMatched: matchedAmount > 0,
      matchedAmount,
      paymentStatus: 'completed',
      isAnonymous: newContribution.isAnonymous || false,
      message: newContribution.message || '',
      createdAt: new Date().toISOString(),
    };

    addContributionToBackend(contribution);

    // Update campaign totals
    if (campaign) {
      updateCampaignBackend(campaign.id, {
        raised: campaign.raised + contribution.amount + matchedAmount,
        donorCount: campaign.donorCount + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    // Update team if applicable
    if (contribution.teamId) {
      const team = teams.find(t => t.id === contribution.teamId);
      if (team) {
        updateTeamBackend(team.id, {
          raised: team.raised + contribution.amount,
        });
      }
    }

    setShowContributionForm(false);
    setNewContribution({
      campaignId: '',
      teamId: null,
      donorName: '',
      donorEmail: '',
      amount: 0,
      isAnonymous: false,
      message: '',
    });
  };

  // Add pledge
  const addPledge = () => {
    if (!newPledge.campaignId || !newPledge.donorName || !newPledge.amount) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const pledge: Pledge = {
      id: generateId(),
      campaignId: newPledge.campaignId || '',
      donorName: newPledge.donorName || '',
      donorEmail: newPledge.donorEmail || '',
      amount: newPledge.amount || 0,
      pledgeDate: new Date().toISOString(),
      expectedDate: newPledge.expectedDate || '',
      fulfilled: false,
      fulfilledAt: null,
      notes: newPledge.notes || '',
      createdAt: new Date().toISOString(),
    };

    addPledgeToBackend(pledge);
    setShowPledgeForm(false);
    setNewPledge({
      campaignId: '',
      donorName: '',
      donorEmail: '',
      amount: 0,
      expectedDate: '',
      notes: '',
    });
  };

  // Add team
  const addTeam = () => {
    if (!newTeam.name || !selectedCampaignId) {
      setValidationMessage('Please enter team name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const team: FundraisingTeam = {
      id: generateId(),
      campaignId: selectedCampaignId,
      name: newTeam.name || '',
      captain: newTeam.captain || '',
      captainEmail: newTeam.captainEmail || '',
      goal: newTeam.goal || 0,
      raised: 0,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };

    addTeamToBackend(team);
    setShowTeamForm(false);
    setNewTeam({
      name: '',
      captain: '',
      captainEmail: '',
      goal: 0,
    });
  };

  // Fulfill pledge
  const fulfillPledge = (pledgeId: string) => {
    const pledge = pledges.find(p => p.id === pledgeId);
    if (!pledge) return;

    updatePledgeBackend(pledgeId, {
      fulfilled: true,
      fulfilledAt: new Date().toISOString(),
    });

    // Create contribution from pledge
    const contribution: Contribution = {
      id: generateId(),
      campaignId: pledge.campaignId,
      teamId: null,
      donorName: pledge.donorName,
      donorEmail: pledge.donorEmail,
      amount: pledge.amount,
      isMatched: false,
      matchedAmount: 0,
      paymentStatus: 'completed',
      isAnonymous: false,
      message: 'Pledge fulfilled',
      createdAt: new Date().toISOString(),
    };

    addContributionToBackend(contribution);

    // Update campaign
    const campaign = campaigns.find(c => c.id === pledge.campaignId);
    if (campaign) {
      updateCampaignBackend(campaign.id, {
        raised: campaign.raised + pledge.amount,
        donorCount: campaign.donorCount + 1,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Delete functions
  const deleteCampaign = async (campaignId: string) => {
    const confirmed = await confirm({
      title: 'Delete Campaign',
      message: 'Are you sure? This will delete all associated contributions, pledges, and teams.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteCampaignBackend(campaignId);
      contributions.filter(c => c.campaignId === campaignId).forEach(c => deleteContributionBackend(c.id));
      pledges.filter(p => p.campaignId === campaignId).forEach(p => deletePledgeBackend(p.id));
      teams.filter(t => t.campaignId === campaignId).forEach(t => deleteTeamBackend(t.id));
      if (selectedCampaignId === campaignId) setSelectedCampaignId(null);
    }
  };

  // Analytics
  const analytics = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
    const totalGoal = campaigns.reduce((sum, c) => sum + c.goal, 0);
    const totalDonors = campaigns.reduce((sum, c) => sum + c.donorCount, 0);
    const avgContribution = contributions.length > 0
      ? contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length
      : 0;
    const pendingPledges = pledges.filter(p => !p.fulfilled);
    const pendingAmount = pendingPledges.reduce((sum, p) => sum + p.amount, 0);

    const topCampaigns = [...campaigns]
      .sort((a, b) => b.raised - a.raised)
      .slice(0, 5);

    return {
      activeCampaigns: activeCampaigns.length,
      totalRaised,
      totalGoal,
      totalDonors,
      avgContribution,
      pendingPledges: pendingPledges.length,
      pendingAmount,
      topCampaigns,
      overallProgress: totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0,
    };
  }, [campaigns, contributions, pledges]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = searchTerm === '' ||
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, filterStatus]);

  // Selected campaign data
  const selectedCampaign = selectedCampaignId ? campaigns.find(c => c.id === selectedCampaignId) : null;
  const campaignContributions = selectedCampaignId
    ? contributions.filter(c => c.campaignId === selectedCampaignId)
    : [];
  const campaignTeams = selectedCampaignId
    ? teams.filter(t => t.campaignId === selectedCampaignId)
    : [];

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.fundraiser.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.fundraiser.fundraiserCampaignManager', 'Fundraiser Campaign Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.fundraiser.createCampaignsTrackDonationsAnd', 'Create campaigns, track donations, and reach your goals')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="fundraiser" toolName="Fundraiser" />

              <SyncStatus
                isSynced={campaignsSynced}
                isSaving={campaignsSaving}
                lastSaved={campaignsLastSaved}
                syncError={campaignsSyncError}
                onForceSync={forceCampaignsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredCampaigns, 'campaigns', CAMPAIGN_COLUMNS)}
                onExportExcel={() => exportToExcel(filteredCampaigns, 'campaigns', CAMPAIGN_COLUMNS)}
                onExportJSON={() => exportToJSON(filteredCampaigns, 'campaigns')}
                onExportPDF={() => exportToPDF(filteredCampaigns, 'Fundraising Campaigns', CAMPAIGN_COLUMNS)}
                onCopy={() => copyUtil(filteredCampaigns)}
                onPrint={() => printData(filteredCampaigns, 'Fundraising Campaigns', CAMPAIGN_COLUMNS)}
                theme={theme}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Megaphone className="w-4 h-4 text-orange-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fundraiser.activeCampaigns', 'Active Campaigns')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.activeCampaigns}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fundraiser.totalRaised', 'Total Raised')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(analytics.totalRaised)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fundraiser.totalDonors', 'Total Donors')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalDonors}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-purple-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fundraiser.pendingPledges', 'Pending Pledges')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(analytics.pendingAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['campaigns', 'contributions', 'pledges', 'teams', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.fundraiser.searchCampaigns', 'Search campaigns...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.fundraiser.allStatus', 'All Status')}</option>
                    <option value="draft">{t('tools.fundraiser.draft', 'Draft')}</option>
                    <option value="active">{t('tools.fundraiser.active', 'Active')}</option>
                    <option value="paused">{t('tools.fundraiser.paused', 'Paused')}</option>
                    <option value="completed">{t('tools.fundraiser.completed', 'Completed')}</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowCampaignForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.fundraiser.newCampaign', 'New Campaign')}
                </button>
              </div>

              {/* Campaign Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCampaigns.length === 0 ? (
                  <div className={`col-span-2 text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.fundraiser.noCampaignsFoundCreateYour', 'No campaigns found. Create your first campaign to get started.')}</p>
                  </div>
                ) : (
                  filteredCampaigns.map((campaign) => {
                    const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
                    const daysRemaining = getDaysRemaining(campaign.endDate);
                    return (
                      <div
                        key={campaign.id}
                        onClick={() => setSelectedCampaignId(campaign.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedCampaignId === campaign.id
                            ? theme === 'dark'
                              ? 'bg-orange-900/30 border-orange-500'
                              : 'bg-orange-50 border-orange-500'
                            : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {campaign.name}
                            </h4>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {CAMPAIGN_TYPES.find(t => t.value === campaign.type)?.label}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              {formatCurrency(campaign.raised)} raised
                            </span>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              {formatCurrency(campaign.goal)} goal
                            </span>
                          </div>
                          <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <div
                              className="h-full rounded-full bg-orange-500 transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              {campaign.donorCount} donors
                            </span>
                            {daysRemaining !== null && daysRemaining >= 0 && (
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                {daysRemaining} days left
                              </span>
                            )}
                          </div>
                        </div>

                        {campaign.isMatching && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-orange-500">
                            <Gift className="w-3 h-3" />
                            {campaign.matchingRatio}x matching up to {formatCurrency(campaign.matchingMax)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Contributions Tab */}
          {activeTab === 'contributions' && (
            <div>
              <div className="flex justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.fundraiser.searchContributions', 'Search contributions...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button
                  onClick={() => setShowContributionForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.fundraiser.recordContribution', 'Record Contribution')}
                </button>
              </div>

              <div className="space-y-3">
                {contributions.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.fundraiser.noContributionsYetRecordYour', 'No contributions yet. Record your first contribution to get started.')}</p>
                  </div>
                ) : (
                  contributions
                    .filter(c => searchTerm === '' || c.donorName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((contribution) => {
                      const campaign = campaigns.find(c => c.id === contribution.campaignId);
                      return (
                        <div
                          key={contribution.id}
                          className={`p-4 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {contribution.isAnonymous ? 'Anonymous' : contribution.donorName}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {campaign?.name || 'Unknown campaign'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(contribution.amount)}
                              </p>
                              {contribution.isMatched && (
                                <span className="text-xs text-orange-500">
                                  +{formatCurrency(contribution.matchedAmount)} matched
                                </span>
                              )}
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(contribution.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* Pledges Tab */}
          {activeTab === 'pledges' && (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowPledgeForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.fundraiser.addPledge', 'Add Pledge')}
                </button>
              </div>

              <div className="space-y-3">
                {pledges.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.fundraiser.noPledgesYetAddA', 'No pledges yet. Add a pledge to track future donations.')}</p>
                  </div>
                ) : (
                  pledges.map((pledge) => {
                    const campaign = campaigns.find(c => c.id === pledge.campaignId);
                    return (
                      <div
                        key={pledge.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {pledge.donorName}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {campaign?.name || 'Unknown campaign'}
                            </p>
                            {pledge.expectedDate && (
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Expected: {formatDate(pledge.expectedDate)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(pledge.amount)}
                            </p>
                            {pledge.fulfilled ? (
                              <span className="flex items-center gap-1 text-green-500 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                {t('tools.fundraiser.fulfilled', 'Fulfilled')}
                              </span>
                            ) : (
                              <button
                                onClick={() => fulfillPledge(pledge.id)}
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                              >
                                {t('tools.fundraiser.fulfill', 'Fulfill')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div>
              <div className="flex justify-between mb-6">
                <select
                  value={selectedCampaignId || ''}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{t('tools.fundraiser.selectCampaign', 'Select Campaign')}</option>
                  {campaigns.filter(c => c.type === 'peer_to_peer').map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowTeamForm(true)}
                  disabled={!selectedCampaignId}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedCampaignId
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.fundraiser.addTeam', 'Add Team')}
                </button>
              </div>

              <div className="space-y-3">
                {campaignTeams.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {selectedCampaignId
                        ? t('tools.fundraiser.noTeamsYetForThis', 'No teams yet for this campaign.') : t('tools.fundraiser.selectAPeerToPeer', 'Select a peer-to-peer campaign to manage teams.')}
                    </p>
                  </div>
                ) : (
                  campaignTeams
                    .sort((a, b) => b.raised - a.raised)
                    .map((team, index) => (
                      <div
                        key={team.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {index < 3 && (
                              <Trophy className={`w-5 h-5 ${
                                index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-400' : 'text-orange-500'
                              }`} />
                            )}
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {team.name}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Captain: {team.captain} | {team.memberCount} members
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(team.raised)}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              of {formatCurrency(team.goal)} goal
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.fundraiser.overallProgress', 'Overall Progress')}
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className={`h-4 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all"
                        style={{ width: `${Math.min(analytics.overallProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.overallProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {formatCurrency(analytics.totalRaised)} raised
                  </span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {formatCurrency(analytics.totalGoal)} total goal
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fundraiser.topCampaigns', 'Top Campaigns')}
                  </h4>
                  <div className="space-y-3">
                    {analytics.topCampaigns.map((campaign, index) => (
                      <div key={campaign.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {index + 1}
                          </span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {campaign.name}
                          </span>
                        </div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(campaign.raised)}
                        </span>
                      </div>
                    ))}
                    {analytics.topCampaigns.length === 0 && (
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.fundraiser.noDataYet', 'No data yet')}</p>
                    )}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fundraiser.keyMetrics', 'Key Metrics')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.fundraiser.averageContribution', 'Average Contribution')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(analytics.avgContribution)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.fundraiser.totalDonors2', 'Total Donors')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {analytics.totalDonors}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.fundraiser.pendingPledges2', 'Pending Pledges')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {analytics.pendingPledges}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.fundraiser.pendingAmount', 'Pending Amount')}</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(analytics.pendingAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Form Modal */}
        {showCampaignForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.fundraiser.createNewCampaign', 'Create New Campaign')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.campaignName', 'Campaign Name *')}
                  </label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.campaignType', 'Campaign Type')}
                  </label>
                  <select
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as CampaignType })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {CAMPAIGN_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.fundraiser.goal', 'Goal *')}
                    </label>
                    <input
                      type="number"
                      value={newCampaign.goal || ''}
                      onChange={(e) => setNewCampaign({ ...newCampaign, goal: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.fundraiser.status', 'Status')}
                    </label>
                    <select
                      value={newCampaign.status}
                      onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value as CampaignStatus })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="draft">{t('tools.fundraiser.draft2', 'Draft')}</option>
                      <option value="active">{t('tools.fundraiser.active2', 'Active')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.fundraiser.startDate', 'Start Date')}
                    </label>
                    <input
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.fundraiser.endDate', 'End Date')}
                    </label>
                    <input
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.description', 'Description')}
                  </label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newCampaign.isMatching}
                    onChange={(e) => setNewCampaign({ ...newCampaign, isMatching: e.target.checked })}
                    className="rounded"
                  />
                  <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.enableMatchingGifts', 'Enable Matching Gifts')}
                  </label>
                </div>
                {newCampaign.isMatching && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.fundraiser.matchRatio', 'Match Ratio')}
                      </label>
                      <input
                        type="number"
                        value={newCampaign.matchingRatio || ''}
                        onChange={(e) => setNewCampaign({ ...newCampaign, matchingRatio: parseFloat(e.target.value) || 1 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min="1"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.fundraiser.matchMax', 'Match Max')}
                      </label>
                      <input
                        type="number"
                        value={newCampaign.matchingMax || ''}
                        onChange={(e) => setNewCampaign({ ...newCampaign, matchingMax: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCampaignForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('tools.fundraiser.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addCampaign}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {t('tools.fundraiser.createCampaign', 'Create Campaign')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contribution Form Modal */}
        {showContributionForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.fundraiser.recordContribution2', 'Record Contribution')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.campaign', 'Campaign *')}
                  </label>
                  <select
                    value={newContribution.campaignId}
                    onChange={(e) => setNewContribution({ ...newContribution, campaignId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.fundraiser.selectCampaign2', 'Select campaign...')}</option>
                    {campaigns.filter(c => c.status === 'active').map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.fundraiser.donorName', 'Donor Name')}
                    </label>
                    <input
                      type="text"
                      value={newContribution.donorName}
                      onChange={(e) => setNewContribution({ ...newContribution, donorName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.fundraiser.amount', 'Amount *')}
                    </label>
                    <input
                      type="number"
                      value={newContribution.amount || ''}
                      onChange={(e) => setNewContribution({ ...newContribution, amount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newContribution.isAnonymous}
                    onChange={(e) => setNewContribution({ ...newContribution, isAnonymous: e.target.checked })}
                    className="rounded"
                  />
                  <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.anonymousDonation', 'Anonymous Donation')}
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowContributionForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('tools.fundraiser.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addContribution}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {t('tools.fundraiser.record', 'Record')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pledge Form Modal */}
        {showPledgeForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.fundraiser.addPledge2', 'Add Pledge')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.campaign2', 'Campaign *')}
                  </label>
                  <select
                    value={newPledge.campaignId}
                    onChange={(e) => setNewPledge({ ...newPledge, campaignId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t('tools.fundraiser.selectCampaign3', 'Select campaign...')}</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.donorName2', 'Donor Name *')}
                  </label>
                  <input
                    type="text"
                    value={newPledge.donorName}
                    onChange={(e) => setNewPledge({ ...newPledge, donorName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.fundraiser.amount2', 'Amount *')}
                    </label>
                    <input
                      type="number"
                      value={newPledge.amount || ''}
                      onChange={(e) => setNewPledge({ ...newPledge, amount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.fundraiser.expectedDate', 'Expected Date')}
                    </label>
                    <input
                      type="date"
                      value={newPledge.expectedDate}
                      onChange={(e) => setNewPledge({ ...newPledge, expectedDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPledgeForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('tools.fundraiser.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={addPledge}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {t('tools.fundraiser.addPledge3', 'Add Pledge')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Team Form Modal */}
        {showTeamForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.fundraiser.createTeam', 'Create Team')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.teamName', 'Team Name *')}
                  </label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.captainName', 'Captain Name')}
                  </label>
                  <input
                    type="text"
                    value={newTeam.captain}
                    onChange={(e) => setNewTeam({ ...newTeam, captain: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fundraiser.teamGoal', 'Team Goal')}
                  </label>
                  <input
                    type="number"
                    value={newTeam.goal || ''}
                    onChange={(e) => setNewTeam({ ...newTeam, goal: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTeamForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('tools.fundraiser.cancel4', 'Cancel')}
                </button>
                <button
                  onClick={addTeam}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {t('tools.fundraiser.createTeam2', 'Create Team')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
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

export default FundraiserTool;
