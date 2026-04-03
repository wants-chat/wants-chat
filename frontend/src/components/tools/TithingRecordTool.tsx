'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  Users,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Filter,
  Heart,
  CheckCircle,
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

interface TithingRecordToolProps {
  uiConfig?: UIConfig;
}

interface Contributor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  memberSince: string;
  pledgeAmount: number;
  pledgeFrequency: 'weekly' | 'monthly' | 'yearly' | 'none';
  envelopeNumber: string;
  isAnonymous: boolean;
  createdAt: string;
}

interface Contribution {
  id: string;
  contributorId: string;
  contributorName: string;
  date: string;
  amount: number;
  type: 'tithe' | 'offering' | 'building-fund' | 'missions' | 'benevolence' | 'special' | 'other';
  method: 'cash' | 'check' | 'card' | 'online' | 'ach';
  checkNumber: string;
  fundDesignation: string;
  notes: string;
  receiptIssued: boolean;
  isAnonymous: boolean;
  createdAt: string;
}

interface Fund {
  id: string;
  name: string;
  description: string;
  goal: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
}

type TabType = 'dashboard' | 'contributions' | 'contributors' | 'funds' | 'reports';

const contributionColumns: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'contributorName', header: 'Contributor', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'method', header: 'Method', type: 'string' },
  { key: 'fundDesignation', header: 'Fund', type: 'string' },
  { key: 'receiptIssued', header: 'Receipt Issued', type: 'boolean' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const defaultContributors: Contributor[] = [];
const defaultContributions: Contribution[] = [];
const defaultFunds: Fund[] = [];

export const TithingRecordTool: React.FC<TithingRecordToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const contributorsToolData = useToolData<Contributor>('tithing-contributors', defaultContributors, []);
  const contributionsToolData = useToolData<Contribution>('tithing-contributions', defaultContributions, contributionColumns);
  const fundsToolData = useToolData<Fund>('tithing-funds', defaultFunds, []);

  const contributors = contributorsToolData.data;
  const contributions = contributionsToolData.data;
  const funds = fundsToolData.data;

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showContributorModal, setShowContributorModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);

  const [contributionForm, setContributionForm] = useState<Partial<Contribution>>({
    contributorId: '',
    contributorName: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'tithe',
    method: 'check',
    checkNumber: '',
    fundDesignation: 'General Fund',
    notes: '',
    receiptIssued: false,
    isAnonymous: false,
  });

  const [contributorForm, setContributorForm] = useState<Partial<Contributor>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    memberSince: new Date().toISOString().split('T')[0],
    pledgeAmount: 0,
    pledgeFrequency: 'monthly',
    envelopeNumber: '',
    isAnonymous: false,
  });

  const [fundForm, setFundForm] = useState<Partial<Fund>>({
    name: '',
    description: '',
    goal: 0,
    currentBalance: 0,
    isActive: true,
  });

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.amount || params.name) {
        setContributionForm(prev => ({
          ...prev,
          contributorName: params.name || prev.contributorName,
          amount: params.amount ? parseFloat(params.amount) : prev.amount,
          notes: params.content || params.text || prev.notes,
        }));
        setShowContributionModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredContributions = useMemo(() => {
    return contributions.filter(c => {
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      const matchesSearch = searchQuery === '' ||
        c.contributorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.fundDesignation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDateStart = !dateRange.start || c.date >= dateRange.start;
      const matchesDateEnd = !dateRange.end || c.date <= dateRange.end;
      return matchesType && matchesSearch && matchesDateStart && matchesDateEnd;
    });
  }, [contributions, typeFilter, searchQuery, dateRange]);

  const stats = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthStr = thisMonth.toISOString().split('T')[0];

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    const lastMonthEnd = new Date(thisMonth);
    lastMonthEnd.setDate(lastMonthEnd.getDate() - 1);

    const thisMonthTotal = contributions
      .filter(c => c.date >= thisMonthStr)
      .reduce((sum, c) => sum + c.amount, 0);

    const lastMonthTotal = contributions
      .filter(c => c.date >= lastMonth.toISOString().split('T')[0] && c.date < thisMonthStr)
      .reduce((sum, c) => sum + c.amount, 0);

    const ytdTotal = contributions
      .filter(c => new Date(c.date).getFullYear() === new Date().getFullYear())
      .reduce((sum, c) => sum + c.amount, 0);

    const tithesTotal = contributions
      .filter(c => c.type === 'tithe')
      .reduce((sum, c) => sum + c.amount, 0);

    const offeringsTotal = contributions
      .filter(c => c.type === 'offering')
      .reduce((sum, c) => sum + c.amount, 0);

    const monthOverMonth = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
      : '0';

    return {
      thisMonthTotal,
      lastMonthTotal,
      ytdTotal,
      tithesTotal,
      offeringsTotal,
      monthOverMonth: parseFloat(monthOverMonth),
      totalContributors: contributors.length,
      totalContributions: contributions.length,
    };
  }, [contributions, contributors]);

  const handleSaveContribution = () => {
    if (!contributionForm.amount) return;

    if (editingContribution) {
      contributionsToolData.updateItem(editingContribution.id, contributionForm);
    } else {
      const newContribution: Contribution = {
        id: `contrib-${Date.now()}`,
        contributorId: contributionForm.contributorId || '',
        contributorName: contributionForm.isAnonymous ? 'Anonymous' : (contributionForm.contributorName || 'Anonymous'),
        date: contributionForm.date || new Date().toISOString().split('T')[0],
        amount: contributionForm.amount || 0,
        type: contributionForm.type || 'tithe',
        method: contributionForm.method || 'check',
        checkNumber: contributionForm.checkNumber || '',
        fundDesignation: contributionForm.fundDesignation || 'General Fund',
        notes: contributionForm.notes || '',
        receiptIssued: contributionForm.receiptIssued || false,
        isAnonymous: contributionForm.isAnonymous || false,
        createdAt: new Date().toISOString(),
      };
      contributionsToolData.addItem(newContribution);
    }

    resetContributionForm();
    setShowContributionModal(false);
    setEditingContribution(null);
  };

  const handleDeleteContribution = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Contribution',
      message: 'Are you sure you want to delete this contribution?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      contributionsToolData.deleteItem(id);
    }
  };

  const handleSaveContributor = () => {
    if (!contributorForm.name) return;

    if (editingContributor) {
      contributorsToolData.updateItem(editingContributor.id, contributorForm);
    } else {
      const newContributor: Contributor = {
        id: `contributor-${Date.now()}`,
        name: contributorForm.name || '',
        email: contributorForm.email || '',
        phone: contributorForm.phone || '',
        address: contributorForm.address || '',
        memberSince: contributorForm.memberSince || new Date().toISOString().split('T')[0],
        pledgeAmount: contributorForm.pledgeAmount || 0,
        pledgeFrequency: contributorForm.pledgeFrequency || 'monthly',
        envelopeNumber: contributorForm.envelopeNumber || '',
        isAnonymous: contributorForm.isAnonymous || false,
        createdAt: new Date().toISOString(),
      };
      contributorsToolData.addItem(newContributor);
    }

    resetContributorForm();
    setShowContributorModal(false);
    setEditingContributor(null);
  };

  const handleDeleteContributor = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Contributor',
      message: 'Are you sure you want to delete this contributor?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      contributorsToolData.deleteItem(id);
    }
  };

  const handleSaveFund = () => {
    if (!fundForm.name) return;

    if (editingFund) {
      fundsToolData.updateItem(editingFund.id, fundForm);
    } else {
      const newFund: Fund = {
        id: `fund-${Date.now()}`,
        name: fundForm.name || '',
        description: fundForm.description || '',
        goal: fundForm.goal || 0,
        currentBalance: fundForm.currentBalance || 0,
        isActive: fundForm.isActive !== false,
        createdAt: new Date().toISOString(),
      };
      fundsToolData.addItem(newFund);
    }

    resetFundForm();
    setShowFundModal(false);
    setEditingFund(null);
  };

  const handleDeleteFund = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Fund',
      message: 'Are you sure you want to delete this fund?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      fundsToolData.deleteItem(id);
    }
  };

  const resetContributionForm = () => {
    setContributionForm({
      contributorId: '',
      contributorName: '',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      type: 'tithe',
      method: 'check',
      checkNumber: '',
      fundDesignation: 'General Fund',
      notes: '',
      receiptIssued: false,
      isAnonymous: false,
    });
  };

  const resetContributorForm = () => {
    setContributorForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      memberSince: new Date().toISOString().split('T')[0],
      pledgeAmount: 0,
      pledgeFrequency: 'monthly',
      envelopeNumber: '',
      isAnonymous: false,
    });
  };

  const resetFundForm = () => {
    setFundForm({
      name: '',
      description: '',
      goal: 0,
      currentBalance: 0,
      isActive: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const getTypeColor = (type: Contribution['type']) => {
    switch (type) {
      case 'tithe': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'offering': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'building-fund': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'missions': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'benevolence': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'special': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'contributions', label: 'Contributions', icon: DollarSign },
    { id: 'contributors', label: 'Contributors', icon: Users },
    { id: 'funds', label: 'Funds', icon: Heart },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.tithingRecord.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.tithingRecord.tithingOfferingRecords', 'Tithing & Offering Records')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.tithingRecord.trackContributionsManageDonorsAnd', 'Track contributions, manage donors, and generate giving statements')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="tithing-record" toolName="Tithing Record" />

              <SyncStatus
                isSynced={contributionsToolData.isSynced}
                isSaving={contributionsToolData.isSaving}
                lastSaved={contributionsToolData.lastSaved}
                syncError={contributionsToolData.syncError}
                onForceSync={contributionsToolData.forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(contributions, contributionColumns, { filename: 'contributions' })}
                onExportExcel={() => exportToExcel(contributions, contributionColumns, { filename: 'contributions' })}
                onExportJSON={() => exportToJSON(contributions, { filename: 'contributions' })}
                onExportPDF={async () => {
                  await exportToPDF(contributions, contributionColumns, {
                    filename: 'contributions',
                    title: 'Contribution Report',
                    subtitle: `${contributions.length} contributions | Total: ${formatCurrency(stats.ytdTotal)}`,
                  });
                }}
                onPrint={() => printData(contributions, contributionColumns, { title: 'Contributions' })}
                onCopyToClipboard={async () => await copyUtil(contributions, contributionColumns, 'tab')}
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tithingRecord.thisMonth', 'This Month')}</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(stats.thisMonthTotal)}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 ${stats.monthOverMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.monthOverMonth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">{Math.abs(stats.monthOverMonth)}%</span>
                  </div>
                </div>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tithingRecord.yearToDate', 'Year to Date')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.ytdTotal)}
                </p>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tithingRecord.totalTithes', 'Total Tithes')}</p>
                <p className={`text-2xl font-bold text-green-600`}>
                  {formatCurrency(stats.tithesTotal)}
                </p>
              </div>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tithingRecord.totalOfferings', 'Total Offerings')}</p>
                <p className={`text-2xl font-bold text-blue-600`}>
                  {formatCurrency(stats.offeringsTotal)}
                </p>
              </div>
            </div>

            {/* Recent Contributions */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.tithingRecord.recentContributions', 'Recent Contributions')}
              </h2>
              <div className="space-y-3">
                {contributions.slice(0, 5).map((contribution) => (
                  <div key={contribution.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(contribution.type)}`}>
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {contribution.contributorName}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {contribution.type} • {formatDate(contribution.date)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(contribution.amount)}
                    </p>
                  </div>
                ))}
                {contributions.length === 0 && (
                  <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.tithingRecord.noContributionsRecordedYet', 'No contributions recorded yet')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contributions Tab */}
        {activeTab === 'contributions' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.tithingRecord.searchContributions', 'Search contributions...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">{t('tools.tithingRecord.allTypes', 'All Types')}</option>
                  <option value="tithe">{t('tools.tithingRecord.tithes', 'Tithes')}</option>
                  <option value="offering">{t('tools.tithingRecord.offerings', 'Offerings')}</option>
                  <option value="building-fund">{t('tools.tithingRecord.buildingFund', 'Building Fund')}</option>
                  <option value="missions">{t('tools.tithingRecord.missions', 'Missions')}</option>
                  <option value="benevolence">{t('tools.tithingRecord.benevolence', 'Benevolence')}</option>
                  <option value="special">{t('tools.tithingRecord.special', 'Special')}</option>
                </select>
              </div>
              <button
                onClick={() => { resetContributionForm(); setEditingContribution(null); setShowContributionModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
              >
                <Plus className="w-4 h-4" />
                {t('tools.tithingRecord.recordContribution', 'Record Contribution')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.date', 'Date')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.contributor', 'Contributor')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.amount', 'Amount')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.type', 'Type')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.method', 'Method')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredContributions.map((contribution) => (
                    <tr key={contribution.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatDate(contribution.date)}
                      </td>
                      <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {contribution.contributorName}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(contribution.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contribution.type)}`}>
                          {contribution.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {contribution.method}
                        {contribution.checkNumber && ` #${contribution.checkNumber}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setContributionForm(contribution); setEditingContribution(contribution); setShowContributionModal(true); }}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteContribution(contribution.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredContributions.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.tithingRecord.noContributionsFound', 'No contributions found')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contributors Tab */}
        {activeTab === 'contributors' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Contributors ({contributors.length})
              </h2>
              <button
                onClick={() => { resetContributorForm(); setEditingContributor(null); setShowContributorModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
              >
                <Plus className="w-4 h-4" />
                {t('tools.tithingRecord.addContributor', 'Add Contributor')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributors.map((contributor) => (
                <div key={contributor.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {contributor.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {contributor.email || 'No email'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setContributorForm(contributor); setEditingContributor(contributor); setShowContributorModal(true); }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteContributor(contributor.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  {contributor.pledgeAmount > 0 && (
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-medium">{t('tools.tithingRecord.pledge', 'Pledge:')}</span> {formatCurrency(contributor.pledgeAmount)} / {contributor.pledgeFrequency}
                    </div>
                  )}
                  {contributor.envelopeNumber && (
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Envelope #{contributor.envelopeNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {contributors.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.tithingRecord.noContributorsAddedYet', 'No contributors added yet')}
              </div>
            )}
          </div>
        )}

        {/* Funds Tab */}
        {activeTab === 'funds' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.tithingRecord.fundManagement', 'Fund Management')}
              </h2>
              <button
                onClick={() => { resetFundForm(); setEditingFund(null); setShowFundModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
              >
                <Plus className="w-4 h-4" />
                {t('tools.tithingRecord.createFund', 'Create Fund')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {funds.map((fund) => (
                <div key={fund.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {fund.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {fund.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setFundForm(fund); setEditingFund(fund); setShowFundModal(true); }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteFund(fund.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  {fund.goal > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.tithingRecord.progress', 'Progress')}</span>
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {((fund.currentBalance / fund.goal) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div
                          className="h-2 rounded-full bg-[#0D9488]"
                          style={{ width: `${Math.min((fund.currentBalance / fund.goal) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {formatCurrency(fund.currentBalance)}
                        </span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {formatCurrency(fund.goal)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {funds.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.tithingRecord.noFundsCreatedYet', 'No funds created yet')}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.tithingRecord.generateReports', 'Generate Reports')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => exportToPDF(contributions, contributionColumns, {
                  filename: 'year-end-giving-statement',
                  title: 'Year-End Giving Statement',
                  subtitle: `Tax Year ${new Date().getFullYear()}`,
                })}
                className={`flex items-center gap-3 p-4 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tithingRecord.yearEndStatement', 'Year-End Statement')}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tithingRecord.generateTaxReadyStatements', 'Generate tax-ready statements')}</p>
                </div>
              </button>
              <button
                onClick={() => exportToExcel(contributions, contributionColumns, { filename: 'monthly-report' })}
                className={`flex items-center gap-3 p-4 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tithingRecord.monthlyReport', 'Monthly Report')}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tithingRecord.exportMonthlyGivingData', 'Export monthly giving data')}</p>
                </div>
              </button>
              <button
                onClick={() => exportToCSV(contributors, [
                  { key: 'name', header: 'Name', type: 'string' },
                  { key: 'email', header: 'Email', type: 'string' },
                  { key: 'pledgeAmount', header: 'Pledge', type: 'currency' },
                ], { filename: 'contributors' })}
                className={`flex items-center gap-3 p-4 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tithingRecord.contributorList', 'Contributor List')}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tithingRecord.exportAllContributors', 'Export all contributors')}</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Contribution Modal */}
        {showContributionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingContribution ? t('tools.tithingRecord.editContribution', 'Edit Contribution') : t('tools.tithingRecord.recordContribution2', 'Record Contribution')}
                </h3>
                <button onClick={() => { setShowContributionModal(false); setEditingContribution(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={contributionForm.isAnonymous || false}
                    onChange={(e) => setContributionForm({ ...contributionForm, isAnonymous: e.target.checked })}
                    className="rounded text-[#0D9488]"
                  />
                  <label htmlFor="anonymous" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tithingRecord.anonymousContribution', 'Anonymous Contribution')}
                  </label>
                </div>
                {!contributionForm.isAnonymous && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.contributorName', 'Contributor Name')}</label>
                    <select
                      value={contributionForm.contributorId || ''}
                      onChange={(e) => {
                        const contributor = contributors.find(c => c.id === e.target.value);
                        setContributionForm({
                          ...contributionForm,
                          contributorId: e.target.value,
                          contributorName: contributor?.name || '',
                        });
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">{t('tools.tithingRecord.selectOrEnterNew', 'Select or enter new...')}</option>
                      {contributors.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {!contributionForm.contributorId && (
                      <input
                        type="text"
                        placeholder={t('tools.tithingRecord.orEnterNewContributorName', 'Or enter new contributor name')}
                        value={contributionForm.contributorName || ''}
                        onChange={(e) => setContributionForm({ ...contributionForm, contributorName: e.target.value })}
                        className={`w-full mt-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.date2', 'Date *')}</label>
                    <input
                      type="date"
                      value={contributionForm.date || ''}
                      onChange={(e) => setContributionForm({ ...contributionForm, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.amount2', 'Amount *')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={contributionForm.amount || ''}
                      onChange={(e) => setContributionForm({ ...contributionForm, amount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.type2', 'Type')}</label>
                    <select
                      value={contributionForm.type || 'tithe'}
                      onChange={(e) => setContributionForm({ ...contributionForm, type: e.target.value as Contribution['type'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="tithe">{t('tools.tithingRecord.tithe', 'Tithe')}</option>
                      <option value="offering">{t('tools.tithingRecord.offering', 'Offering')}</option>
                      <option value="building-fund">{t('tools.tithingRecord.buildingFund2', 'Building Fund')}</option>
                      <option value="missions">{t('tools.tithingRecord.missions2', 'Missions')}</option>
                      <option value="benevolence">{t('tools.tithingRecord.benevolence2', 'Benevolence')}</option>
                      <option value="special">{t('tools.tithingRecord.special2', 'Special')}</option>
                      <option value="other">{t('tools.tithingRecord.other', 'Other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.method2', 'Method')}</label>
                    <select
                      value={contributionForm.method || 'check'}
                      onChange={(e) => setContributionForm({ ...contributionForm, method: e.target.value as Contribution['method'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="cash">{t('tools.tithingRecord.cash', 'Cash')}</option>
                      <option value="check">{t('tools.tithingRecord.check', 'Check')}</option>
                      <option value="card">{t('tools.tithingRecord.card', 'Card')}</option>
                      <option value="online">{t('tools.tithingRecord.online', 'Online')}</option>
                      <option value="ach">{t('tools.tithingRecord.achBankTransfer', 'ACH/Bank Transfer')}</option>
                    </select>
                  </div>
                </div>
                {contributionForm.method === 'check' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.checkNumber', 'Check Number')}</label>
                    <input
                      type="text"
                      value={contributionForm.checkNumber || ''}
                      onChange={(e) => setContributionForm({ ...contributionForm, checkNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.fundDesignation', 'Fund Designation')}</label>
                  <input
                    type="text"
                    value={contributionForm.fundDesignation || ''}
                    onChange={(e) => setContributionForm({ ...contributionForm, fundDesignation: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.tithingRecord.eGGeneralFundBuilding', 'e.g., General Fund, Building Fund')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.notes', 'Notes')}</label>
                  <textarea
                    value={contributionForm.notes || ''}
                    onChange={(e) => setContributionForm({ ...contributionForm, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="receipt"
                    checked={contributionForm.receiptIssued || false}
                    onChange={(e) => setContributionForm({ ...contributionForm, receiptIssued: e.target.checked })}
                    className="rounded text-[#0D9488]"
                  />
                  <label htmlFor="receipt" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tithingRecord.receiptIssued', 'Receipt Issued')}
                  </label>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowContributionModal(false); setEditingContribution(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.tithingRecord.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveContribution}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingContribution ? t('tools.tithingRecord.saveChanges', 'Save Changes') : t('tools.tithingRecord.record', 'Record')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contributor Modal */}
        {showContributorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingContributor ? t('tools.tithingRecord.editContributor', 'Edit Contributor') : t('tools.tithingRecord.addContributor2', 'Add Contributor')}
                </h3>
                <button onClick={() => { setShowContributorModal(false); setEditingContributor(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.name', 'Name *')}</label>
                  <input
                    type="text"
                    value={contributorForm.name || ''}
                    onChange={(e) => setContributorForm({ ...contributorForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.email', 'Email')}</label>
                    <input
                      type="email"
                      value={contributorForm.email || ''}
                      onChange={(e) => setContributorForm({ ...contributorForm, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={contributorForm.phone || ''}
                      onChange={(e) => setContributorForm({ ...contributorForm, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.address', 'Address')}</label>
                  <input
                    type="text"
                    value={contributorForm.address || ''}
                    onChange={(e) => setContributorForm({ ...contributorForm, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.envelope', 'Envelope #')}</label>
                    <input
                      type="text"
                      value={contributorForm.envelopeNumber || ''}
                      onChange={(e) => setContributorForm({ ...contributorForm, envelopeNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.memberSince', 'Member Since')}</label>
                    <input
                      type="date"
                      value={contributorForm.memberSince || ''}
                      onChange={(e) => setContributorForm({ ...contributorForm, memberSince: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.pledgeAmount', 'Pledge Amount')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={contributorForm.pledgeAmount || ''}
                      onChange={(e) => setContributorForm({ ...contributorForm, pledgeAmount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.frequency', 'Frequency')}</label>
                    <select
                      value={contributorForm.pledgeFrequency || 'monthly'}
                      onChange={(e) => setContributorForm({ ...contributorForm, pledgeFrequency: e.target.value as Contributor['pledgeFrequency'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="weekly">{t('tools.tithingRecord.weekly', 'Weekly')}</option>
                      <option value="monthly">{t('tools.tithingRecord.monthly', 'Monthly')}</option>
                      <option value="yearly">{t('tools.tithingRecord.yearly', 'Yearly')}</option>
                      <option value="none">{t('tools.tithingRecord.noPledge', 'No Pledge')}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowContributorModal(false); setEditingContributor(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.tithingRecord.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveContributor}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingContributor ? t('tools.tithingRecord.saveChanges2', 'Save Changes') : t('tools.tithingRecord.addContributor3', 'Add Contributor')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fund Modal */}
        {showFundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingFund ? t('tools.tithingRecord.editFund', 'Edit Fund') : t('tools.tithingRecord.createFund2', 'Create Fund')}
                </h3>
                <button onClick={() => { setShowFundModal(false); setEditingFund(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.fundName', 'Fund Name *')}</label>
                  <input
                    type="text"
                    value={fundForm.name || ''}
                    onChange={(e) => setFundForm({ ...fundForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder={t('tools.tithingRecord.eGBuildingFundMissions', 'e.g., Building Fund, Missions Fund')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.description', 'Description')}</label>
                  <textarea
                    value={fundForm.description || ''}
                    onChange={(e) => setFundForm({ ...fundForm, description: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.goalAmount', 'Goal Amount')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={fundForm.goal || ''}
                      onChange={(e) => setFundForm({ ...fundForm, goal: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tithingRecord.currentBalance', 'Current Balance')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={fundForm.currentBalance || ''}
                      onChange={(e) => setFundForm({ ...fundForm, currentBalance: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fundActive"
                    checked={fundForm.isActive !== false}
                    onChange={(e) => setFundForm({ ...fundForm, isActive: e.target.checked })}
                    className="rounded text-[#0D9488]"
                  />
                  <label htmlFor="fundActive" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tithingRecord.activeFund', 'Active Fund')}
                  </label>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowFundModal(false); setEditingFund(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.tithingRecord.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveFund}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingFund ? t('tools.tithingRecord.saveChanges3', 'Save Changes') : t('tools.tithingRecord.createFund3', 'Create Fund')}
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

export default TithingRecordTool;
