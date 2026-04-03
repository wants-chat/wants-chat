import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  RefreshCw,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Bell,
  Search,
  DollarSign,
  TrendingUp,
  X,
  Tag,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface SubscriptionManagerToolProps {
  uiConfig?: UIConfig;
}

type BillingCycle = 'weekly' | 'monthly' | 'yearly';
type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

interface SubscriptionCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface Subscription {
  id: string;
  name: string;
  provider: string;
  categoryId: string;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  autoRenew: boolean;
  status: SubscriptionStatus;
  notes?: string;
  reminderDays: number;
  createdAt: string;
  updatedAt: string;
}

const defaultCategories: SubscriptionCategory[] = [
  { id: 'streaming', name: 'Streaming', color: '#e11d48' },
  { id: 'software', name: 'Software', color: '#7c3aed' },
  { id: 'gaming', name: 'Gaming', color: '#059669' },
  { id: 'fitness', name: 'Fitness', color: '#ea580c' },
  { id: 'music', name: 'Music', color: '#0891b2' },
  { id: 'news', name: 'News & Media', color: '#4f46e5' },
  { id: 'cloud', name: 'Cloud Storage', color: '#0284c7' },
  { id: 'productivity', name: 'Productivity', color: '#65a30d' },
  { id: 'education', name: 'Education', color: '#c026d3' },
  { id: 'other', name: 'Other', color: '#64748b' },
];

const billingCycleLabels: Record<BillingCycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const statusLabels: Record<SubscriptionStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  cancelled: 'Cancelled',
};

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysUntil = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Column configuration for exports
const SUBSCRIPTION_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'provider', header: 'Provider', type: 'string' },
  { key: 'categoryId', header: 'Category', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'billingCycle', header: 'Billing Cycle', type: 'string' },
  { key: 'nextBillingDate', header: 'Next Billing', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'autoRenew', header: 'Auto-Renew', type: 'boolean' },
  { key: 'reminderDays', header: 'Reminder Days', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Categories storage key (categories stay in localStorage as configuration)
const CATEGORIES_STORAGE_KEY = 'subscriptionManagerCategories';

export const SubscriptionManagerTool: React.FC<SubscriptionManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the new useToolData hook for backend persistence
  const {
    data: subscriptions,
    setData: setSubscriptions,
    addItem: addSubscription,
    updateItem: updateSubscription,
    deleteItem: removeSubscription,
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
  } = useToolData<Subscription>('subscriptions', [], SUBSCRIPTION_COLUMNS);

  // Categories state (stays in localStorage as configuration)
  const [categories, setCategories] = useState<SubscriptionCategory[]>(defaultCategories);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'upcoming' | 'stats'>('list');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | 'all'>('all');

  // Form states
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // Subscription form
  const [subscriptionForm, setSubscriptionForm] = useState({
    name: '',
    provider: '',
    categoryId: 'streaming',
    amount: '',
    billingCycle: 'monthly' as BillingCycle,
    nextBillingDate: new Date().toISOString().split('T')[0],
    autoRenew: true,
    status: 'active' as SubscriptionStatus,
    notes: '',
    reminderDays: 3,
  });

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#e11d48',
  });

  // Load categories from localStorage (subscriptions handled by useToolData hook)
  useEffect(() => {
    const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save categories to localStorage
  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.title || params.description || params.amount) {
        setSubscriptionForm((prev) => ({
          ...prev,
          name: params.title || prev.name,
          provider: params.description || prev.provider,
          amount: params.amount?.toString() || prev.amount,
        }));
        setShowSubscriptionModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || sub.categoryId === filterCategory;
      const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [subscriptions, searchQuery, filterCategory, filterStatus]);

  // Upcoming renewals (next 30 days)
  const upcomingRenewals = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        if (sub.status !== 'active') return false;
        const days = getDaysUntil(sub.nextBillingDate);
        return days >= 0 && days <= 30;
      })
      .sort((a, b) => getDaysUntil(a.nextBillingDate) - getDaysUntil(b.nextBillingDate));
  }, [subscriptions]);

  // Stats calculations
  const stats = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active');

    const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
      switch (sub.billingCycle) {
        case 'weekly':
          return sum + sub.amount * 4.33;
        case 'monthly':
          return sum + sub.amount;
        case 'yearly':
          return sum + sub.amount / 12;
        default:
          return sum;
      }
    }, 0);

    const yearlyTotal = monthlyTotal * 12;

    const categoryCosts = activeSubscriptions.reduce(
      (acc, sub) => {
        const monthlyAmount =
          sub.billingCycle === 'weekly'
            ? sub.amount * 4.33
            : sub.billingCycle === 'yearly'
              ? sub.amount / 12
              : sub.amount;

        acc[sub.categoryId] = (acc[sub.categoryId] || 0) + monthlyAmount;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalActive: activeSubscriptions.length,
      monthlyTotal,
      yearlyTotal,
      categoryCosts,
    };
  }, [subscriptions]);

  // Handlers
  const handleAddSubscriptionSubmit = () => {
    if (!subscriptionForm.name || !subscriptionForm.amount) return;

    const now = new Date().toISOString();
    const newSubscription: Subscription = {
      id: generateId(),
      name: subscriptionForm.name,
      provider: subscriptionForm.provider,
      categoryId: subscriptionForm.categoryId,
      amount: parseFloat(subscriptionForm.amount),
      billingCycle: subscriptionForm.billingCycle,
      nextBillingDate: subscriptionForm.nextBillingDate,
      autoRenew: subscriptionForm.autoRenew,
      status: subscriptionForm.status,
      notes: subscriptionForm.notes,
      reminderDays: subscriptionForm.reminderDays,
      createdAt: now,
      updatedAt: now,
    };

    addSubscription(newSubscription);
    resetSubscriptionForm();
    setShowSubscriptionModal(false);
  };

  const handleUpdateSubscriptionSubmit = () => {
    if (!editingSubscription || !subscriptionForm.name || !subscriptionForm.amount) return;

    updateSubscription(editingSubscription.id, {
      name: subscriptionForm.name,
      provider: subscriptionForm.provider,
      categoryId: subscriptionForm.categoryId,
      amount: parseFloat(subscriptionForm.amount),
      billingCycle: subscriptionForm.billingCycle,
      nextBillingDate: subscriptionForm.nextBillingDate,
      autoRenew: subscriptionForm.autoRenew,
      status: subscriptionForm.status,
      notes: subscriptionForm.notes,
      reminderDays: subscriptionForm.reminderDays,
      updatedAt: new Date().toISOString(),
    });

    resetSubscriptionForm();
    setEditingSubscription(null);
    setShowSubscriptionModal(false);
  };

  const handleDeleteSubscription = (id: string) => {
    removeSubscription(id);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setSubscriptionForm({
      name: subscription.name,
      provider: subscription.provider,
      categoryId: subscription.categoryId,
      amount: subscription.amount.toString(),
      billingCycle: subscription.billingCycle,
      nextBillingDate: subscription.nextBillingDate,
      autoRenew: subscription.autoRenew,
      status: subscription.status,
      notes: subscription.notes || '',
      reminderDays: subscription.reminderDays,
    });
    setShowSubscriptionModal(true);
  };

  const handleAddCategory = () => {
    if (!categoryForm.name) return;

    const newCategory: SubscriptionCategory = {
      id: generateId(),
      name: categoryForm.name,
      color: categoryForm.color,
    };

    setCategories([...categories, newCategory]);
    setCategoryForm({ name: '', color: '#e11d48' });
    setShowCategoryModal(false);
  };

  const resetSubscriptionForm = () => {
    setSubscriptionForm({
      name: '',
      provider: '',
      categoryId: 'streaming',
      amount: '',
      billingCycle: 'monthly',
      nextBillingDate: new Date().toISOString().split('T')[0],
      autoRenew: true,
      status: 'active',
      notes: '',
      reminderDays: 3,
    });
  };

  const getCategoryById = (id: string) => {
    return categories.find((cat) => cat.id === id) || { name: 'Unknown', color: '#64748b' };
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'paused':
        return 'text-amber-500';
      case 'cancelled':
        return 'text-red-500';
    }
  };

  const getStatusBg = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return isDark ? 'bg-green-900/20' : 'bg-green-50';
      case 'paused':
        return isDark ? 'bg-amber-900/20' : 'bg-amber-50';
      case 'cancelled':
        return isDark ? 'bg-red-900/20' : 'bg-red-50';
    }
  };

  // Render helpers
  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-rose-500`;

  const cardClass = `p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div
      className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-rose-900/20' : 'bg-gradient-to-r from-white to-rose-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.subscriptionManager.subscriptionManager', 'Subscription Manager')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.subscriptionManager.trackAndManageYourRecurring', 'Track and manage your recurring payments')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="subscription-manager" toolName="Subscription Manager" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'subscriptions' })}
              onExportExcel={() => exportExcel({ filename: 'subscriptions' })}
              onExportJSON={() => exportJSON({ filename: 'subscriptions' })}
              onExportPDF={() => exportPDF({
                filename: 'subscriptions',
                title: 'Subscription Manager',
                subtitle: `Monthly: ${formatCurrency(stats.monthlyTotal)}`
              })}
              onPrint={() => print('Subscriptions')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-rose-500 font-medium">{t('tools.subscriptionManager.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="p-3 bg-rose-500/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.subscriptionManager.activeSubscriptions', 'Active Subscriptions')}
              </p>
              <p className="text-2xl font-bold text-rose-500">{stats.totalActive}</p>
            </div>
          </div>
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.subscriptionManager.monthlyCost', 'Monthly Cost')}</p>
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(stats.monthlyTotal)}
              </p>
            </div>
          </div>
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.subscriptionManager.yearlyCost', 'Yearly Cost')}</p>
              <p className="text-2xl font-bold text-blue-500">
                {formatCurrency(stats.yearlyTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${
              activeTab === 'list'
                ? 'bg-rose-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            {t('tools.subscriptionManager.allSubscriptions', 'All Subscriptions')}
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-rose-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Upcoming ({upcomingRenewals.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-rose-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {t('tools.subscriptionManager.analytics', 'Analytics')}
          </button>
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                />
                <input
                  type="text"
                  placeholder={t('tools.subscriptionManager.searchSubscriptions', 'Search subscriptions...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`${inputClass} md:w-40`}
              >
                <option value="all">{t('tools.subscriptionManager.allCategories', 'All Categories')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as SubscriptionStatus | 'all')}
                className={`${inputClass} md:w-32`}
              >
                <option value="all">{t('tools.subscriptionManager.allStatus', 'All Status')}</option>
                <option value="active">{t('tools.subscriptionManager.active', 'Active')}</option>
                <option value="paused">{t('tools.subscriptionManager.paused', 'Paused')}</option>
                <option value="cancelled">{t('tools.subscriptionManager.cancelled', 'Cancelled')}</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetSubscriptionForm();
                  setEditingSubscription(null);
                  setShowSubscriptionModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.subscriptionManager.addSubscription', 'Add Subscription')}
              </button>
              <button
                onClick={() => setShowCategoryModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
              >
                <Tag className="w-4 h-4" />
                {t('tools.subscriptionManager.manageCategories', 'Manage Categories')}
              </button>
            </div>

            {/* Subscriptions List */}
            <div className="space-y-3">
              {filteredSubscriptions.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">{t('tools.subscriptionManager.noSubscriptionsFound', 'No subscriptions found')}</p>
                  <p className="text-sm">{t('tools.subscriptionManager.addYourFirstSubscriptionTo', 'Add your first subscription to start tracking')}</p>
                </div>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const category = getCategoryById(sub.categoryId);
                  const daysUntil = getDaysUntil(sub.nextBillingDate);
                  const isUpcoming = daysUntil >= 0 && daysUntil <= sub.reminderDays;

                  return (
                    <div
                      key={sub.id}
                      className={`${cardClass} ${isUpcoming && sub.status === 'active' ? 'ring-2 ring-amber-500/50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: category.color }}
                          >
                            {sub.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                              >
                                {sub.name}
                              </h4>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getStatusBg(sub.status)} ${getStatusColor(sub.status)}`}
                              >
                                {statusLabels[sub.status]}
                              </span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {sub.provider} | {category.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSubscription(sub)}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubscription(sub.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div
                        className={`mt-3 flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        <span className="flex items-center gap-1 font-semibold text-rose-500">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(sub.amount)} / {sub.billingCycle}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Next: {formatDate(sub.nextBillingDate)}
                          {isUpcoming && sub.status === 'active' && (
                            <span className="text-amber-500 font-medium ml-1">
                              ({daysUntil === 0 ? 'Today' : `${daysUntil}d`})
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-4 h-4" />
                          {sub.autoRenew ? t('tools.subscriptionManager.autoRenew', 'Auto-renew') : t('tools.subscriptionManager.manual', 'Manual')}
                        </span>
                        {sub.notes && (
                          <span
                            className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            {sub.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Upcoming Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.subscriptionManager.upcomingRenewalsNext30Days', 'Upcoming Renewals (Next 30 Days)')}
                </h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {upcomingRenewals.length} subscription{upcomingRenewals.length !== 1 ? 's' : ''}{' '}
                renewing soon
              </p>
            </div>

            {upcomingRenewals.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">{t('tools.subscriptionManager.noUpcomingRenewals', 'No upcoming renewals')}</p>
                <p className="text-sm">{t('tools.subscriptionManager.noActiveSubscriptionsRenewingIn', 'No active subscriptions renewing in the next 30 days')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingRenewals.map((sub) => {
                  const category = getCategoryById(sub.categoryId);
                  const daysUntil = getDaysUntil(sub.nextBillingDate);

                  return (
                    <div key={sub.id} className={cardClass}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: category.color }}
                          >
                            {sub.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4
                              className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                            >
                              {sub.name}
                            </h4>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatCurrency(sub.amount)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${daysUntil <= 3 ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {daysUntil === 0
                              ? 'Today'
                              : daysUntil === 1
                                ? 'Tomorrow'
                                : `In ${daysUntil} days`}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(sub.nextBillingDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Cost Breakdown by Category */}
            <div className={cardClass}>
              <h4
                className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {t('tools.subscriptionManager.monthlyCostByCategory', 'Monthly Cost by Category')}
              </h4>
              {Object.entries(stats.categoryCosts).length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('tools.subscriptionManager.noActiveSubscriptionsToAnalyze', 'No active subscriptions to analyze')}
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.categoryCosts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([categoryId, amount]) => {
                      const category = getCategoryById(categoryId);
                      const percentage = (amount / stats.monthlyTotal) * 100;

                      return (
                        <div key={categoryId}>
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              {category.name}
                            </span>
                            <span
                              className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                            >
                              {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div
                            className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: category.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className={cardClass}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.subscriptionManager.averagePerSubscription', 'Average per Subscription')}
                </p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(
                    stats.totalActive > 0 ? stats.monthlyTotal / stats.totalActive : 0
                  )}
                  <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.subscriptionManager.mo', '/mo')}
                  </span>
                </p>
              </div>
              <div className={cardClass}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.subscriptionManager.dailyCost', 'Daily Cost')}
                </p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.monthlyTotal / 30)}
                  <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.subscriptionManager.day', '/day')}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.subscriptionManager.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Set reminder days to get notified before renewals</li>
                <li>- Review yearly subscriptions regularly for unused services</li>
                <li>- Consider annual plans for frequently used services (often cheaper)</li>
                <li>- Pause subscriptions instead of cancelling to keep your data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg rounded-xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-xl max-h-[90vh] overflow-y-auto`}
          >
            <div
              className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingSubscription ? t('tools.subscriptionManager.editSubscription', 'Edit Subscription') : t('tools.subscriptionManager.addSubscription2', 'Add Subscription')}
              </h3>
              <button
                onClick={() => {
                  setShowSubscriptionModal(false);
                  setEditingSubscription(null);
                  resetSubscriptionForm();
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t('tools.subscriptionManager.subscriptionName', 'Subscription Name *')}
                  </label>
                  <input
                    type="text"
                    value={subscriptionForm.name}
                    onChange={(e) =>
                      setSubscriptionForm({ ...subscriptionForm, name: e.target.value })
                    }
                    placeholder={t('tools.subscriptionManager.eGNetflix', 'e.g., Netflix')}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t('tools.subscriptionManager.provider', 'Provider')}
                  </label>
                  <input
                    type="text"
                    value={subscriptionForm.provider}
                    onChange={(e) =>
                      setSubscriptionForm({ ...subscriptionForm, provider: e.target.value })
                    }
                    placeholder={t('tools.subscriptionManager.eGNetflixInc', 'e.g., Netflix Inc.')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t('tools.subscriptionManager.category', 'Category')}
                  </label>
                  <select
                    value={subscriptionForm.categoryId}
                    onChange={(e) =>
                      setSubscriptionForm({ ...subscriptionForm, categoryId: e.target.value })
                    }
                    className={inputClass}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t('tools.subscriptionManager.amount', 'Amount *')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={subscriptionForm.amount}
                    onChange={(e) =>
                      setSubscriptionForm({ ...subscriptionForm, amount: e.target.value })
                    }
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t('tools.subscriptionManager.billingCycle', 'Billing Cycle')}
                  </label>
                  <select
                    value={subscriptionForm.billingCycle}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        billingCycle: e.target.value as BillingCycle,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="weekly">{t('tools.subscriptionManager.weekly', 'Weekly')}</option>
                    <option value="monthly">{t('tools.subscriptionManager.monthly', 'Monthly')}</option>
                    <option value="yearly">{t('tools.subscriptionManager.yearly', 'Yearly')}</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t('tools.subscriptionManager.nextBillingDate', 'Next Billing Date')}
                  </label>
                  <input
                    type="date"
                    value={subscriptionForm.nextBillingDate}
                    onChange={(e) =>
                      setSubscriptionForm({ ...subscriptionForm, nextBillingDate: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t('tools.subscriptionManager.status', 'Status')}
                  </label>
                  <select
                    value={subscriptionForm.status}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        status: e.target.value as SubscriptionStatus,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="active">{t('tools.subscriptionManager.active2', 'Active')}</option>
                    <option value="paused">{t('tools.subscriptionManager.paused2', 'Paused')}</option>
                    <option value="cancelled">{t('tools.subscriptionManager.cancelled2', 'Cancelled')}</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t('tools.subscriptionManager.reminderDaysBefore', 'Reminder (days before)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={subscriptionForm.reminderDays}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        reminderDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subscriptionForm.autoRenew}
                      onChange={(e) =>
                        setSubscriptionForm({ ...subscriptionForm, autoRenew: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                    />
                    <span
                      className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                    >
                      {t('tools.subscriptionManager.autoRenewEnabled', 'Auto-renew enabled')}
                    </span>
                  </label>
                </div>
                <div className="col-span-2">
                  <label
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {t('tools.subscriptionManager.notes', 'Notes')}
                  </label>
                  <textarea
                    value={subscriptionForm.notes}
                    onChange={(e) =>
                      setSubscriptionForm({ ...subscriptionForm, notes: e.target.value })
                    }
                    placeholder={t('tools.subscriptionManager.optionalNotes', 'Optional notes...')}
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    setEditingSubscription(null);
                    resetSubscriptionForm();
                  }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.subscriptionManager.cancel', 'Cancel')}
                </button>
                <button
                  onClick={editingSubscription ? handleUpdateSubscriptionSubmit : handleAddSubscriptionSubmit}
                  disabled={!subscriptionForm.name || !subscriptionForm.amount}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingSubscription ? t('tools.subscriptionManager.update', 'Update') : t('tools.subscriptionManager.add', 'Add')} Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md rounded-xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-xl max-h-[90vh] overflow-y-auto`}
          >
            <div
              className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.subscriptionManager.manageCategories2', 'Manage Categories')}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Add Category Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder={t('tools.subscriptionManager.newCategoryName', 'New category name')}
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!categoryForm.name}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{cat.name}</span>
                    </div>
                    {!defaultCategories.find((dc) => dc.id === cat.id) && (
                      <button
                        onClick={() =>
                          setCategories(categories.filter((c) => c.id !== cat.id))
                        }
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagerTool;
