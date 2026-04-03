'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Users,
  DollarSign,
  Gift,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  TrendingUp,
  Target,
  FileText,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
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
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface DonorManagerToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  organization: string;
  givingLevel: 'major' | 'regular' | 'one-time';
  firstDonationDate: string;
  totalLifetimeGiving: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Donation {
  id: string;
  donorId: string;
  amount: number;
  date: string;
  campaign: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
}

interface Pledge {
  id: string;
  donorId: string;
  pledgeAmount: number;
  amountPaid: number;
  schedule: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

interface Communication {
  id: string;
  donorId: string;
  type: 'thank-you' | 'newsletter' | 'appeal' | 'update' | 'receipt';
  subject: string;
  content: string;
  sentDate: string;
  status: 'sent' | 'pending' | 'draft';
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  createdAt: string;
}

type TabType = 'donors' | 'donations' | 'pledges' | 'communications' | 'campaigns' | 'dashboard';
type GivingLevelFilter = 'all' | 'major' | 'regular' | 'one-time';

// Column configuration for exports
const donorColumns: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'organization', header: 'Organization', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'givingLevel', header: 'Giving Level', type: 'string' },
  { key: 'totalLifetimeGiving', header: 'Lifetime Giving', type: 'currency' },
  { key: 'firstDonationDate', header: 'First Donation', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const defaultDonors: Donor[] = [];
const defaultDonations: Donation[] = [];
const defaultPledges: Pledge[] = [];
const defaultCommunications: Communication[] = [];
const defaultCampaigns: Campaign[] = [];

export const DonorManagerTool: React.FC<DonorManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData for backend sync
  const donorsToolData = useToolData<Donor>('donor-manager-donors', defaultDonors, donorColumns);
  const donationsToolData = useToolData<Donation>('donor-manager-donations', defaultDonations, donorColumns);

  // Extract data and methods from hook
  const donors = donorsToolData.data;
  const setDonors = donorsToolData.setData;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [donations, setDonations] = useState<Donation[]>(defaultDonations);
  const [pledges, setPledges] = useState<Pledge[]>(defaultPledges);
  const [communications, setCommunications] = useState<Communication[]>(defaultCommunications);
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Filter states
  const [givingLevelFilter, setGivingLevelFilter] = useState<GivingLevelFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editingPledge, setEditingPledge] = useState<Pledge | null>(null);
  const [editingCommunication, setEditingCommunication] = useState<Communication | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedDonorId, setSelectedDonorId] = useState<string>('');

  // Form states
  const [donorForm, setDonorForm] = useState<Partial<Donor>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    organization: '',
    givingLevel: 'regular',
    firstDonationDate: new Date().toISOString().split('T')[0],
    totalLifetimeGiving: 0,
    notes: '',
  });

  const [donationForm, setDonationForm] = useState<Partial<Donation>>({
    donorId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    campaign: '',
    paymentMethod: 'credit-card',
    notes: '',
  });

  const [pledgeForm, setPledgeForm] = useState<Partial<Pledge>>({
    donorId: '',
    pledgeAmount: 0,
    amountPaid: 0,
    schedule: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
    notes: '',
  });

  const [communicationForm, setCommunicationForm] = useState<Partial<Communication>>({
    donorId: '',
    type: 'thank-you',
    subject: '',
    content: '',
    sentDate: new Date().toISOString().split('T')[0],
    status: 'draft',
  });

  const [campaignForm, setCampaignForm] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    goalAmount: 0,
    raisedAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'upcoming',
  });


  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.name || params.amount || params.content) {
        setDonorForm(prev => ({
          ...prev,
          name: params.name || prev.name,
          notes: params.content || params.text || prev.notes,
        }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);


  // Computed values
  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const matchesLevel = givingLevelFilter === 'all' || donor.givingLevel === givingLevelFilter;
      const matchesSearch = searchQuery === '' ||
        donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.organization.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [donors, givingLevelFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalDonors = donors.length;
    const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
    const averageDonation = donations.length > 0 ? totalRaised / donations.length : 0;

    const currentYear = new Date().getFullYear();
    const ytdDonations = donations.filter(d =>
      new Date(d.date).getFullYear() === currentYear
    );
    const ytdGiving = ytdDonations.reduce((sum, d) => sum + d.amount, 0);

    const majorDonors = donors.filter(d => d.givingLevel === 'major').length;
    const regularDonors = donors.filter(d => d.givingLevel === 'regular').length;
    const oneTimeDonors = donors.filter(d => d.givingLevel === 'one-time').length;

    const activePledges = pledges.filter(p => p.status === 'active');
    const totalPledged = activePledges.reduce((sum, p) => sum + p.pledgeAmount, 0);
    const totalPledgePaid = activePledges.reduce((sum, p) => sum + p.amountPaid, 0);

    return {
      totalDonors,
      totalRaised,
      averageDonation,
      ytdGiving,
      majorDonors,
      regularDonors,
      oneTimeDonors,
      totalPledged,
      totalPledgePaid,
      pledgeProgress: totalPledged > 0 ? (totalPledgePaid / totalPledged) * 100 : 0,
    };
  }, [donors, donations, pledges]);

  // CRUD handlers
  const handleSaveDonor = () => {
    if (!donorForm.name || !donorForm.email) return;

    if (editingDonor) {
      donorsToolData.updateItem(editingDonor.id, {
        ...donorForm,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newDonor: Donor = {
        id: `donor-${Date.now()}`,
        name: donorForm.name || '',
        email: donorForm.email || '',
        phone: donorForm.phone || '',
        address: donorForm.address || '',
        organization: donorForm.organization || '',
        givingLevel: donorForm.givingLevel || 'regular',
        firstDonationDate: donorForm.firstDonationDate || new Date().toISOString().split('T')[0],
        totalLifetimeGiving: donorForm.totalLifetimeGiving || 0,
        notes: donorForm.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      donorsToolData.addItem(newDonor);
    }

    resetDonorForm();
    setShowDonorModal(false);
    setEditingDonor(null);
  };

  const handleDeleteDonor = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Donor',
      message: 'Are you sure you want to delete this donor? All associated donations, pledges, and communications will also be deleted.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      donorsToolData.deleteItem(id);
      setDonations(donations.filter(d => d.donorId !== id));
      setPledges(pledges.filter(p => p.donorId !== id));
      setCommunications(communications.filter(c => c.donorId !== id));
    }
  };

  const handleSaveDonation = () => {
    if (!donationForm.donorId || !donationForm.amount) return;

    if (editingDonation) {
      setDonations(donations.map(d =>
        d.id === editingDonation.id
          ? { ...d, ...donationForm } as Donation
          : d
      ));
    } else {
      const newDonation: Donation = {
        id: `donation-${Date.now()}`,
        donorId: donationForm.donorId || '',
        amount: donationForm.amount || 0,
        date: donationForm.date || new Date().toISOString().split('T')[0],
        campaign: donationForm.campaign || '',
        paymentMethod: donationForm.paymentMethod || 'credit-card',
        notes: donationForm.notes || '',
        createdAt: new Date().toISOString(),
      };
      setDonations([...donations, newDonation]);

      // Update donor's total lifetime giving
      const donor = donors.find(d => d.id === donationForm.donorId);
      if (donor) {
        donorsToolData.updateItem(donor.id, {
          totalLifetimeGiving: donor.totalLifetimeGiving + (donationForm.amount || 0),
        });
      }

      // Update campaign raised amount if applicable
      if (donationForm.campaign) {
        setCampaigns(campaigns.map(c =>
          c.name === donationForm.campaign
            ? { ...c, raisedAmount: c.raisedAmount + (donationForm.amount || 0) }
            : c
        ));
      }
    }

    resetDonationForm();
    setShowDonationModal(false);
    setEditingDonation(null);
  };

  const handleDeleteDonation = async (id: string) => {
    const donation = donations.find(d => d.id === id);
    if (donation) {
      const confirmed = await confirm({
        title: 'Delete Donation',
        message: 'Are you sure you want to delete this donation?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
      });
      if (confirmed) {
        setDonations(donations.filter(d => d.id !== id));

        // Update donor's total lifetime giving
        const donor = donors.find(d => d.id === donation.donorId);
        if (donor) {
          donorsToolData.updateItem(donor.id, {
            totalLifetimeGiving: Math.max(0, donor.totalLifetimeGiving - donation.amount),
          });
        }
      }
    }
  };

  const handleSavePledge = () => {
    if (!pledgeForm.donorId || !pledgeForm.pledgeAmount) return;

    if (editingPledge) {
      setPledges(pledges.map(p =>
        p.id === editingPledge.id
          ? { ...p, ...pledgeForm } as Pledge
          : p
      ));
    } else {
      const newPledge: Pledge = {
        id: `pledge-${Date.now()}`,
        donorId: pledgeForm.donorId || '',
        pledgeAmount: pledgeForm.pledgeAmount || 0,
        amountPaid: pledgeForm.amountPaid || 0,
        schedule: pledgeForm.schedule || 'monthly',
        startDate: pledgeForm.startDate || new Date().toISOString().split('T')[0],
        endDate: pledgeForm.endDate || '',
        status: pledgeForm.status || 'active',
        notes: pledgeForm.notes || '',
        createdAt: new Date().toISOString(),
      };
      setPledges([...pledges, newPledge]);
    }

    resetPledgeForm();
    setShowPledgeModal(false);
    setEditingPledge(null);
  };

  const handleDeletePledge = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Pledge',
      message: 'Are you sure you want to delete this pledge?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setPledges(pledges.filter(p => p.id !== id));
    }
  };

  const handleSaveCommunication = () => {
    if (!communicationForm.donorId || !communicationForm.subject) return;

    if (editingCommunication) {
      setCommunications(communications.map(c =>
        c.id === editingCommunication.id
          ? { ...c, ...communicationForm } as Communication
          : c
      ));
    } else {
      const newCommunication: Communication = {
        id: `comm-${Date.now()}`,
        donorId: communicationForm.donorId || '',
        type: communicationForm.type || 'thank-you',
        subject: communicationForm.subject || '',
        content: communicationForm.content || '',
        sentDate: communicationForm.sentDate || new Date().toISOString().split('T')[0],
        status: communicationForm.status || 'draft',
        createdAt: new Date().toISOString(),
      };
      setCommunications([...communications, newCommunication]);
    }

    resetCommunicationForm();
    setShowCommunicationModal(false);
    setEditingCommunication(null);
  };

  const handleDeleteCommunication = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Communication',
      message: 'Are you sure you want to delete this communication?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setCommunications(communications.filter(c => c.id !== id));
    }
  };

  const handleSaveCampaign = () => {
    if (!campaignForm.name) return;

    if (editingCampaign) {
      setCampaigns(campaigns.map(c =>
        c.id === editingCampaign.id
          ? { ...c, ...campaignForm } as Campaign
          : c
      ));
    } else {
      const newCampaign: Campaign = {
        id: `campaign-${Date.now()}`,
        name: campaignForm.name || '',
        description: campaignForm.description || '',
        goalAmount: campaignForm.goalAmount || 0,
        raisedAmount: campaignForm.raisedAmount || 0,
        startDate: campaignForm.startDate || new Date().toISOString().split('T')[0],
        endDate: campaignForm.endDate || '',
        status: campaignForm.status || 'upcoming',
        createdAt: new Date().toISOString(),
      };
      setCampaigns([...campaigns, newCampaign]);
    }

    resetCampaignForm();
    setShowCampaignModal(false);
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Campaign',
      message: 'Are you sure you want to delete this campaign?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  // Reset form helpers
  const resetDonorForm = () => {
    setDonorForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      organization: '',
      givingLevel: 'regular',
      firstDonationDate: new Date().toISOString().split('T')[0],
      totalLifetimeGiving: 0,
      notes: '',
    });
  };

  const resetDonationForm = () => {
    setDonationForm({
      donorId: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      campaign: '',
      paymentMethod: 'credit-card',
      notes: '',
    });
  };

  const resetPledgeForm = () => {
    setPledgeForm({
      donorId: '',
      pledgeAmount: 0,
      amountPaid: 0,
      schedule: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      notes: '',
    });
  };

  const resetCommunicationForm = () => {
    setCommunicationForm({
      donorId: '',
      type: 'thank-you',
      subject: '',
      content: '',
      sentDate: new Date().toISOString().split('T')[0],
      status: 'draft',
    });
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      goalAmount: 0,
      raisedAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'upcoming',
    });
  };

  // Edit handlers
  const handleEditDonor = (donor: Donor) => {
    setDonorForm(donor);
    setEditingDonor(donor);
    setShowDonorModal(true);
  };

  const handleEditDonation = (donation: Donation) => {
    setDonationForm(donation);
    setEditingDonation(donation);
    setShowDonationModal(true);
  };

  const handleEditPledge = (pledge: Pledge) => {
    setPledgeForm(pledge);
    setEditingPledge(pledge);
    setShowPledgeModal(true);
  };

  const handleEditCommunication = (communication: Communication) => {
    setCommunicationForm(communication);
    setEditingCommunication(communication);
    setShowCommunicationModal(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setCampaignForm(campaign);
    setEditingCampaign(campaign);
    setShowCampaignModal(true);
  };

  const getDonorName = (donorId: string) => {
    const donor = donors.find(d => d.id === donorId);
    return donor?.name || 'Unknown Donor';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getGivingLevelBadge = (level: string) => {
    const styles = {
      major: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      regular: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'one-time': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return styles[level as keyof typeof styles] || styles['one-time'];
  };

  // Styles
  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;
  const inputClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  } rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = `px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2`;
  const buttonSecondary = `px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
    isDark
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'donors', label: 'Donors', icon: Users },
    { id: 'donations', label: 'Donations', icon: Gift },
    { id: 'pledges', label: 'Pledges', icon: Target },
    { id: 'communications', label: 'Communications', icon: Mail },
    { id: 'campaigns', label: 'Campaigns', icon: Heart },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-rose-500 font-medium">{t('tools.donorManager.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.donorManager.donorManagement', 'Donor Management')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.donorManager.trackDonorsDonationsPledgesAnd', 'Track donors, donations, pledges, and campaigns')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <WidgetEmbedButton toolSlug="donor-manager" toolName="Donor Manager" />

                <SyncStatus
                  isSynced={donorsToolData.isSynced}
                  isSaving={donorsToolData.isSaving}
                  lastSaved={donorsToolData.lastSaved}
                  syncError={donorsToolData.syncError}
                  onForceSync={() => donorsToolData.forceSync()}
                  theme={isDark ? 'dark' : 'light'}
                />
                <ExportDropdown
                  onExportCSV={() => donorsToolData.exportCSV({ filename: 'donors' })}
                  onExportExcel={() => donorsToolData.exportExcel({ filename: 'donors' })}
                  onExportJSON={() => donorsToolData.exportJSON({ filename: 'donors' })}
                  onExportPDF={() => donorsToolData.exportPDF({ filename: 'donors', title: 'Donors Report' })}
                  onPrint={() => donorsToolData.print('Donors Report')}
                  onCopyToClipboard={() => donorsToolData.copyToClipboard('tab')}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={cardClass}>
          <div className="p-2">
            <div className="flex flex-wrap gap-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                        : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={cardClass}>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.donorManager.totalDonors', 'Total Donors')}</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalDonors}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.donorManager.totalRaised', 'Total Raised')}</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(stats.totalRaised)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Gift className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.donorManager.avgDonation', 'Avg. Donation')}</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(stats.averageDonation)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.donorManager.ytdGiving', 'YTD Giving')}</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(stats.ytdGiving)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Donor Breakdown & Pledge Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={cardClass}>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.donorManager.donorBreakdown', 'Donor Breakdown')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.donorManager.majorDonors', 'Major Donors')}</span>
                      </div>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stats.majorDonors}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.donorManager.regularDonors', 'Regular Donors')}</span>
                      </div>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stats.regularDonors}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.donorManager.oneTimeDonors', 'One-Time Donors')}</span>
                      </div>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stats.oneTimeDonors}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.donorManager.pledgeProgress', 'Pledge Progress')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.donorManager.totalPledged', 'Total Pledged')}</span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(stats.totalPledged)}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.donorManager.amountCollected', 'Amount Collected')}</span>
                        <span className="font-semibold text-green-500">
                          {formatCurrency(stats.totalPledgePaid)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full transition-all"
                          style={{ width: `${Math.min(stats.pledgeProgress, 100)}%` }}
                        />
                      </div>
                      <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {stats.pledgeProgress.toFixed(1)}% collected
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={cardClass}>
              <div className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.donorManager.recentDonations', 'Recent Donations')}
                </h3>
                {donations.length === 0 ? (
                  <p className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('tools.donorManager.noDonationsRecordedYet2', 'No donations recorded yet')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {donations.slice(-5).reverse().map(donation => (
                      <div
                        key={donation.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Gift className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {getDonorName(donation.donorId)}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {donation.campaign || 'General Fund'} - {donation.date}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-green-500">
                          {formatCurrency(donation.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Donors Tab */}
        {activeTab === 'donors' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className={cardClass}>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('tools.donorManager.searchDonors', 'Search donors...')}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <select
                      value={givingLevelFilter}
                      onChange={(e) => setGivingLevelFilter(e.target.value as GivingLevelFilter)}
                      className={inputClass}
                    >
                      <option value="all">{t('tools.donorManager.allLevels', 'All Levels')}</option>
                      <option value="major">{t('tools.donorManager.majorDonors2', 'Major Donors')}</option>
                      <option value="regular">{t('tools.donorManager.regularDonors2', 'Regular Donors')}</option>
                      <option value="one-time">{t('tools.donorManager.oneTimeDonors2', 'One-Time Donors')}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      resetDonorForm();
                      setEditingDonor(null);
                      setShowDonorModal(true);
                    }}
                    className={buttonPrimary}
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.donorManager.addDonor', 'Add Donor')}
                  </button>
                </div>
              </div>
            </div>

            {/* Donors List */}
            <div className={cardClass}>
              <div className="p-6">
                {filteredDonors.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.donorManager.noDonorsFound', 'No donors found')}</p>
                    <p className="text-sm mt-1">{t('tools.donorManager.addYourFirstDonorTo', 'Add your first donor to get started')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDonors.map(donor => (
                      <div
                        key={donor.id}
                        className={`p-4 rounded-xl border ${
                          isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                              <Users className="w-6 h-6 text-rose-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {donor.name}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGivingLevelBadge(donor.givingLevel)}`}>
                                  {donor.givingLevel.charAt(0).toUpperCase() + donor.givingLevel.slice(1)}
                                </span>
                              </div>
                              <div className={`flex flex-wrap items-center gap-4 mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  {donor.email}
                                </span>
                                {donor.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" />
                                    {donor.phone}
                                  </span>
                                )}
                                {donor.organization && (
                                  <span className="flex items-center gap-1">
                                    <Building className="w-3.5 h-3.5" />
                                    {donor.organization}
                                  </span>
                                )}
                              </div>
                              <div className={`flex items-center gap-4 mt-2 text-sm`}>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                  First donation: {donor.firstDonationDate}
                                </span>
                                <span className="font-semibold text-green-500">
                                  Lifetime: {formatCurrency(donor.totalLifetimeGiving)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditDonor(donor)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                              }`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDonor(donor.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
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
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="space-y-4">
            <div className={cardClass}>
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => {
                    resetDonationForm();
                    setEditingDonation(null);
                    setShowDonationModal(true);
                  }}
                  className={buttonPrimary}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.donorManager.recordDonation', 'Record Donation')}
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <div className="p-6">
                {donations.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.donorManager.noDonationsRecordedYet', 'No donations recorded yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {donations.map(donation => (
                      <div
                        key={donation.id}
                        className={`p-4 rounded-xl border ${
                          isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <Gift className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {getDonorName(donation.donorId)}
                              </p>
                              <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span>{donation.date}</span>
                                <span>{donation.campaign || 'General Fund'}</span>
                                <span>{donation.paymentMethod}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-green-500">
                              {formatCurrency(donation.amount)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditDonation(donation)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                                }`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDonation(donation.id)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
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
            </div>
          </div>
        )}

        {/* Pledges Tab */}
        {activeTab === 'pledges' && (
          <div className="space-y-4">
            <div className={cardClass}>
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => {
                    resetPledgeForm();
                    setEditingPledge(null);
                    setShowPledgeModal(true);
                  }}
                  className={buttonPrimary}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.donorManager.addPledge', 'Add Pledge')}
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <div className="p-6">
                {pledges.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.donorManager.noPledgesRecordedYet', 'No pledges recorded yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pledges.map(pledge => {
                      const progress = pledge.pledgeAmount > 0 ? (pledge.amountPaid / pledge.pledgeAmount) * 100 : 0;
                      return (
                        <div
                          key={pledge.id}
                          className={`p-4 rounded-xl border ${
                            isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {getDonorName(pledge.donorId)}
                                </p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  pledge.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  pledge.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {pledge.status.charAt(0).toUpperCase() + pledge.status.slice(1)}
                                </span>
                              </div>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {pledge.schedule.charAt(0).toUpperCase() + pledge.schedule.slice(1)} - {pledge.startDate} to {pledge.endDate || 'Ongoing'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditPledge(pledge)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                                }`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePledge(pledge.id)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                              {formatCurrency(pledge.amountPaid)} of {formatCurrency(pledge.pledgeAmount)}
                            </span>
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Communications Tab */}
        {activeTab === 'communications' && (
          <div className="space-y-4">
            <div className={cardClass}>
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => {
                    resetCommunicationForm();
                    setEditingCommunication(null);
                    setShowCommunicationModal(true);
                  }}
                  className={buttonPrimary}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.donorManager.newCommunication', 'New Communication')}
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <div className="p-6">
                {communications.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.donorManager.noCommunicationsLoggedYet', 'No communications logged yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {communications.map(comm => (
                      <div
                        key={comm.id}
                        className={`p-4 rounded-xl border ${
                          isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              comm.status === 'sent' ? 'bg-green-100 dark:bg-green-900/30' :
                              comm.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                              'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              {comm.status === 'sent' ? (
                                <CheckCircle className={`w-5 h-5 ${comm.status === 'sent' ? 'text-green-500' : 'text-gray-500'}`} />
                              ) : comm.status === 'pending' ? (
                                <Clock className="w-5 h-5 text-yellow-500" />
                              ) : (
                                <FileText className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {comm.subject}
                                </p>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  comm.type === 'thank-you' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                  comm.type === 'receipt' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {comm.type.charAt(0).toUpperCase() + comm.type.slice(1).replace('-', ' ')}
                                </span>
                              </div>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                To: {getDonorName(comm.donorId)} - {comm.sentDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditCommunication(comm)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                              }`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCommunication(comm.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
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
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className={cardClass}>
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => {
                    resetCampaignForm();
                    setEditingCampaign(null);
                    setShowCampaignModal(true);
                  }}
                  className={buttonPrimary}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.donorManager.createCampaign', 'Create Campaign')}
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <div className="p-6">
                {campaigns.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.donorManager.noCampaignsCreatedYet', 'No campaigns created yet')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaigns.map(campaign => {
                      const progress = campaign.goalAmount > 0 ? (campaign.raisedAmount / campaign.goalAmount) * 100 : 0;
                      return (
                        <div
                          key={campaign.id}
                          className={`p-4 rounded-xl border ${
                            isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {campaign.name}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  campaign.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  campaign.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                </span>
                              </div>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {campaign.startDate} to {campaign.endDate || 'Ongoing'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditCampaign(campaign)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                                }`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCampaign(campaign.id)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {campaign.description && (
                            <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {campaign.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-500 font-semibold">
                              {formatCurrency(campaign.raisedAmount)}
                            </span>
                            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                              Goal: {formatCurrency(campaign.goalAmount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {progress.toFixed(1)}% of goal
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Donor Modal */}
        {showDonorModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingDonor ? t('tools.donorManager.editDonor', 'Edit Donor') : t('tools.donorManager.addNewDonor', 'Add New Donor')}
                  </h3>
                  <button
                    onClick={() => {
                      setShowDonorModal(false);
                      setEditingDonor(null);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.name', 'Name *')}</label>
                    <input
                      type="text"
                      value={donorForm.name || ''}
                      onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                      placeholder={t('tools.donorManager.fullName', 'Full name')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.email', 'Email *')}</label>
                    <input
                      type="email"
                      value={donorForm.email || ''}
                      onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                      placeholder={t('tools.donorManager.emailExampleCom', 'email@example.com')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={donorForm.phone || ''}
                      onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                      placeholder="(555) 555-5555"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.organization', 'Organization')}</label>
                    <input
                      type="text"
                      value={donorForm.organization || ''}
                      onChange={(e) => setDonorForm({ ...donorForm, organization: e.target.value })}
                      placeholder={t('tools.donorManager.companyOrOrganization', 'Company or organization')}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.donorManager.address', 'Address')}</label>
                    <input
                      type="text"
                      value={donorForm.address || ''}
                      onChange={(e) => setDonorForm({ ...donorForm, address: e.target.value })}
                      placeholder={t('tools.donorManager.fullAddress', 'Full address')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.givingLevel', 'Giving Level')}</label>
                    <select
                      value={donorForm.givingLevel || 'regular'}
                      onChange={(e) => setDonorForm({ ...donorForm, givingLevel: e.target.value as Donor['givingLevel'] })}
                      className={inputClass}
                    >
                      <option value="major">{t('tools.donorManager.majorDonor', 'Major Donor')}</option>
                      <option value="regular">{t('tools.donorManager.regularDonor', 'Regular Donor')}</option>
                      <option value="one-time">{t('tools.donorManager.oneTimeDonor', 'One-Time Donor')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.firstDonationDate', 'First Donation Date')}</label>
                    <input
                      type="date"
                      value={donorForm.firstDonationDate || ''}
                      onChange={(e) => setDonorForm({ ...donorForm, firstDonationDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.donorManager.notes', 'Notes')}</label>
                    <textarea
                      value={donorForm.notes || ''}
                      onChange={(e) => setDonorForm({ ...donorForm, notes: e.target.value })}
                      placeholder={t('tools.donorManager.additionalNotes', 'Additional notes...')}
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowDonorModal(false);
                      setEditingDonor(null);
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.donorManager.cancel', 'Cancel')}
                  </button>
                  <button onClick={handleSaveDonor} className={buttonPrimary}>
                    {editingDonor ? t('tools.donorManager.saveChanges', 'Save Changes') : t('tools.donorManager.addDonor2', 'Add Donor')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Donation Modal */}
        {showDonationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingDonation ? t('tools.donorManager.editDonation', 'Edit Donation') : t('tools.donorManager.recordDonation2', 'Record Donation')}
                  </h3>
                  <button
                    onClick={() => {
                      setShowDonationModal(false);
                      setEditingDonation(null);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.donor', 'Donor *')}</label>
                    <select
                      value={donationForm.donorId || ''}
                      onChange={(e) => setDonationForm({ ...donationForm, donorId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.donorManager.selectDonor', 'Select donor...')}</option>
                      {donors.map(donor => (
                        <option key={donor.id} value={donor.id}>{donor.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.amount', 'Amount *')}</label>
                    <input
                      type="number"
                      value={donationForm.amount || ''}
                      onChange={(e) => setDonationForm({ ...donationForm, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.date', 'Date')}</label>
                    <input
                      type="date"
                      value={donationForm.date || ''}
                      onChange={(e) => setDonationForm({ ...donationForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.campaign', 'Campaign')}</label>
                    <select
                      value={donationForm.campaign || ''}
                      onChange={(e) => setDonationForm({ ...donationForm, campaign: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.donorManager.generalFund', 'General Fund')}</option>
                      {campaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.name}>{campaign.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.paymentMethod', 'Payment Method')}</label>
                    <select
                      value={donationForm.paymentMethod || 'credit-card'}
                      onChange={(e) => setDonationForm({ ...donationForm, paymentMethod: e.target.value })}
                      className={inputClass}
                    >
                      <option value="credit-card">{t('tools.donorManager.creditCard', 'Credit Card')}</option>
                      <option value="check">{t('tools.donorManager.check', 'Check')}</option>
                      <option value="cash">{t('tools.donorManager.cash', 'Cash')}</option>
                      <option value="bank-transfer">{t('tools.donorManager.bankTransfer', 'Bank Transfer')}</option>
                      <option value="paypal">{t('tools.donorManager.paypal', 'PayPal')}</option>
                      <option value="other">{t('tools.donorManager.other', 'Other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.notes2', 'Notes')}</label>
                    <textarea
                      value={donationForm.notes || ''}
                      onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })}
                      placeholder={t('tools.donorManager.additionalNotes2', 'Additional notes...')}
                      rows={2}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowDonationModal(false);
                      setEditingDonation(null);
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.donorManager.cancel2', 'Cancel')}
                  </button>
                  <button onClick={handleSaveDonation} className={buttonPrimary}>
                    {editingDonation ? t('tools.donorManager.saveChanges2', 'Save Changes') : t('tools.donorManager.recordDonation3', 'Record Donation')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pledge Modal */}
        {showPledgeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingPledge ? t('tools.donorManager.editPledge', 'Edit Pledge') : t('tools.donorManager.addPledge2', 'Add Pledge')}
                  </h3>
                  <button
                    onClick={() => {
                      setShowPledgeModal(false);
                      setEditingPledge(null);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.donor2', 'Donor *')}</label>
                    <select
                      value={pledgeForm.donorId || ''}
                      onChange={(e) => setPledgeForm({ ...pledgeForm, donorId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.donorManager.selectDonor2', 'Select donor...')}</option>
                      {donors.map(donor => (
                        <option key={donor.id} value={donor.id}>{donor.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.donorManager.pledgeAmount', 'Pledge Amount *')}</label>
                      <input
                        type="number"
                        value={pledgeForm.pledgeAmount || ''}
                        onChange={(e) => setPledgeForm({ ...pledgeForm, pledgeAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.donorManager.amountPaid', 'Amount Paid')}</label>
                      <input
                        type="number"
                        value={pledgeForm.amountPaid || ''}
                        onChange={(e) => setPledgeForm({ ...pledgeForm, amountPaid: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.schedule', 'Schedule')}</label>
                    <select
                      value={pledgeForm.schedule || 'monthly'}
                      onChange={(e) => setPledgeForm({ ...pledgeForm, schedule: e.target.value as Pledge['schedule'] })}
                      className={inputClass}
                    >
                      <option value="monthly">{t('tools.donorManager.monthly', 'Monthly')}</option>
                      <option value="quarterly">{t('tools.donorManager.quarterly', 'Quarterly')}</option>
                      <option value="annually">{t('tools.donorManager.annually', 'Annually')}</option>
                      <option value="one-time">{t('tools.donorManager.oneTime', 'One-Time')}</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.donorManager.startDate', 'Start Date')}</label>
                      <input
                        type="date"
                        value={pledgeForm.startDate || ''}
                        onChange={(e) => setPledgeForm({ ...pledgeForm, startDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.donorManager.endDate', 'End Date')}</label>
                      <input
                        type="date"
                        value={pledgeForm.endDate || ''}
                        onChange={(e) => setPledgeForm({ ...pledgeForm, endDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.status', 'Status')}</label>
                    <select
                      value={pledgeForm.status || 'active'}
                      onChange={(e) => setPledgeForm({ ...pledgeForm, status: e.target.value as Pledge['status'] })}
                      className={inputClass}
                    >
                      <option value="active">{t('tools.donorManager.active', 'Active')}</option>
                      <option value="completed">{t('tools.donorManager.completed', 'Completed')}</option>
                      <option value="cancelled">{t('tools.donorManager.cancelled', 'Cancelled')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.notes3', 'Notes')}</label>
                    <textarea
                      value={pledgeForm.notes || ''}
                      onChange={(e) => setPledgeForm({ ...pledgeForm, notes: e.target.value })}
                      placeholder={t('tools.donorManager.additionalNotes3', 'Additional notes...')}
                      rows={2}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPledgeModal(false);
                      setEditingPledge(null);
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.donorManager.cancel3', 'Cancel')}
                  </button>
                  <button onClick={handleSavePledge} className={buttonPrimary}>
                    {editingPledge ? t('tools.donorManager.saveChanges3', 'Save Changes') : t('tools.donorManager.addPledge3', 'Add Pledge')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Communication Modal */}
        {showCommunicationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingCommunication ? t('tools.donorManager.editCommunication', 'Edit Communication') : t('tools.donorManager.newCommunication2', 'New Communication')}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCommunicationModal(false);
                      setEditingCommunication(null);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.donor3', 'Donor *')}</label>
                    <select
                      value={communicationForm.donorId || ''}
                      onChange={(e) => setCommunicationForm({ ...communicationForm, donorId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.donorManager.selectDonor3', 'Select donor...')}</option>
                      {donors.map(donor => (
                        <option key={donor.id} value={donor.id}>{donor.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.type', 'Type')}</label>
                    <select
                      value={communicationForm.type || 'thank-you'}
                      onChange={(e) => setCommunicationForm({ ...communicationForm, type: e.target.value as Communication['type'] })}
                      className={inputClass}
                    >
                      <option value="thank-you">{t('tools.donorManager.thankYouLetter', 'Thank You Letter')}</option>
                      <option value="receipt">{t('tools.donorManager.donationReceipt', 'Donation Receipt')}</option>
                      <option value="newsletter">{t('tools.donorManager.newsletter', 'Newsletter')}</option>
                      <option value="appeal">{t('tools.donorManager.appeal', 'Appeal')}</option>
                      <option value="update">{t('tools.donorManager.update', 'Update')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.subject', 'Subject *')}</label>
                    <input
                      type="text"
                      value={communicationForm.subject || ''}
                      onChange={(e) => setCommunicationForm({ ...communicationForm, subject: e.target.value })}
                      placeholder={t('tools.donorManager.emailSubject', 'Email subject...')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.content', 'Content')}</label>
                    <textarea
                      value={communicationForm.content || ''}
                      onChange={(e) => setCommunicationForm({ ...communicationForm, content: e.target.value })}
                      placeholder={t('tools.donorManager.messageContent', 'Message content...')}
                      rows={4}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.donorManager.date2', 'Date')}</label>
                      <input
                        type="date"
                        value={communicationForm.sentDate || ''}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, sentDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.donorManager.status2', 'Status')}</label>
                      <select
                        value={communicationForm.status || 'draft'}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, status: e.target.value as Communication['status'] })}
                        className={inputClass}
                      >
                        <option value="draft">{t('tools.donorManager.draft', 'Draft')}</option>
                        <option value="pending">{t('tools.donorManager.pending', 'Pending')}</option>
                        <option value="sent">{t('tools.donorManager.sent', 'Sent')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCommunicationModal(false);
                      setEditingCommunication(null);
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.donorManager.cancel4', 'Cancel')}
                  </button>
                  <button onClick={handleSaveCommunication} className={buttonPrimary}>
                    {editingCommunication ? t('tools.donorManager.saveChanges4', 'Save Changes') : t('tools.donorManager.saveCommunication', 'Save Communication')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editingCampaign ? t('tools.donorManager.editCampaign', 'Edit Campaign') : t('tools.donorManager.createCampaign2', 'Create Campaign')}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCampaignModal(false);
                      setEditingCampaign(null);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.campaignName', 'Campaign Name *')}</label>
                    <input
                      type="text"
                      value={campaignForm.name || ''}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      placeholder={t('tools.donorManager.eGYearEndGiving', 'e.g., Year-End Giving')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.description', 'Description')}</label>
                    <textarea
                      value={campaignForm.description || ''}
                      onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                      placeholder={t('tools.donorManager.campaignDescription', 'Campaign description...')}
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.donorManager.goalAmount', 'Goal Amount')}</label>
                      <input
                        type="number"
                        value={campaignForm.goalAmount || ''}
                        onChange={(e) => setCampaignForm({ ...campaignForm, goalAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.donorManager.amountRaised', 'Amount Raised')}</label>
                      <input
                        type="number"
                        value={campaignForm.raisedAmount || ''}
                        onChange={(e) => setCampaignForm({ ...campaignForm, raisedAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.donorManager.startDate2', 'Start Date')}</label>
                      <input
                        type="date"
                        value={campaignForm.startDate || ''}
                        onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.donorManager.endDate2', 'End Date')}</label>
                      <input
                        type="date"
                        value={campaignForm.endDate || ''}
                        onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.donorManager.status3', 'Status')}</label>
                    <select
                      value={campaignForm.status || 'upcoming'}
                      onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value as Campaign['status'] })}
                      className={inputClass}
                    >
                      <option value="upcoming">{t('tools.donorManager.upcoming', 'Upcoming')}</option>
                      <option value="active">{t('tools.donorManager.active2', 'Active')}</option>
                      <option value="completed">{t('tools.donorManager.completed2', 'Completed')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCampaignModal(false);
                      setEditingCampaign(null);
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.donorManager.cancel5', 'Cancel')}
                  </button>
                  <button onClick={handleSaveCampaign} className={buttonPrimary}>
                    {editingCampaign ? t('tools.donorManager.saveChanges5', 'Save Changes') : t('tools.donorManager.createCampaign3', 'Create Campaign')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.donorManager.aboutDonorManagementTool', 'About Donor Management Tool')}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your non-profit organization's donors, track donations and pledges, log communications,
            and monitor campaign progress. All data is stored locally in your browser for privacy.
          </p>
        </div>

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default DonorManagerTool;
