'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  Search,
  Filter,
  Bell,
  FileText,
  Send,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  XCircle,
  MessageSquare,
  X,
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

interface RenewalTrackerToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type InsuranceType = 'auto' | 'home' | 'life' | 'health' | 'business';
type RenewalStatus = 'upcoming' | 'due' | 'overdue' | 'renewed' | 'lapsed' | 'cancelled';
type ContactAttempt = 'pending' | 'attempted' | 'contacted' | 'scheduled';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact: 'email' | 'phone' | 'both';
}

interface PolicyRenewal {
  id: string;
  policyNumber: string;
  customerId: string;
  insuranceType: InsuranceType;
  carrier: string;
  currentPremium: number;
  proposedPremium: number;
  premiumChange: number;
  effectiveDate: string;
  expirationDate: string;
  renewalDate: string;
  status: RenewalStatus;
  contactStatus: ContactAttempt;
  autoRenew: boolean;
  daysUntilExpiry: number;
  lastContactDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface RenewalActivity {
  id: string;
  renewalId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'renewal' | 'cancellation';
  description: string;
  outcome: string;
  performedBy: string;
  timestamp: string;
}

interface RenewalReminder {
  id: string;
  renewalId: string;
  reminderDate: string;
  type: 'email' | 'call' | 'task';
  message: string;
  completed: boolean;
}

// Constants
const INSURANCE_TYPES: { type: InsuranceType; label: string }[] = [
  { type: 'auto', label: 'Auto' },
  { type: 'home', label: 'Home' },
  { type: 'life', label: 'Life' },
  { type: 'health', label: 'Health' },
  { type: 'business', label: 'Business' },
];

const STATUS_CONFIG: Record<RenewalStatus, { label: string; color: string; icon: React.ReactNode }> = {
  upcoming: { label: 'Upcoming', color: 'text-blue-500 bg-blue-500/10', icon: <Calendar className="w-4 h-4" /> },
  due: { label: 'Due Soon', color: 'text-orange-500 bg-orange-500/10', icon: <AlertTriangle className="w-4 h-4" /> },
  overdue: { label: 'Overdue', color: 'text-red-500 bg-red-500/10', icon: <XCircle className="w-4 h-4" /> },
  renewed: { label: 'Renewed', color: 'text-green-500 bg-green-500/10', icon: <CheckCircle className="w-4 h-4" /> },
  lapsed: { label: 'Lapsed', color: 'text-gray-500 bg-gray-500/10', icon: <XCircle className="w-4 h-4" /> },
  cancelled: { label: 'Cancelled', color: 'text-red-500 bg-red-500/10', icon: <XCircle className="w-4 h-4" /> },
};

const CONTACT_STATUS_CONFIG: Record<ContactAttempt, { label: string; color: string }> = {
  pending: { label: 'Not Contacted', color: 'text-gray-500 bg-gray-500/10' },
  attempted: { label: 'Attempted', color: 'text-yellow-500 bg-yellow-500/10' },
  contacted: { label: 'Contacted', color: 'text-blue-500 bg-blue-500/10' },
  scheduled: { label: 'Scheduled', color: 'text-green-500 bg-green-500/10' },
};

const CARRIERS = [
  'SafeGuard Insurance',
  'LifeShield Co.',
  'Premier Coverage',
  'National Trust Insurance',
  'ValueFirst Insurance',
];

// Column configuration for exports
const RENEWAL_COLUMNS: ColumnConfig[] = [
  { key: 'policyNumber', header: 'Policy Number', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'insuranceType', header: 'Type', type: 'string' },
  { key: 'carrier', header: 'Carrier', type: 'string' },
  { key: 'expirationDate', header: 'Expiration Date', type: 'date' },
  { key: 'daysUntilExpiry', header: 'Days Until Expiry', type: 'number' },
  { key: 'currentPremium', header: 'Current Premium', type: 'currency' },
  { key: 'proposedPremium', header: 'Proposed Premium', type: 'currency' },
  { key: 'premiumChange', header: 'Premium Change %', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'contactStatus', header: 'Contact Status', type: 'string' },
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
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDaysUntilExpiry = (expirationDate: string): number => {
  const expiry = new Date(expirationDate);
  const today = new Date();
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getRenewalStatus = (daysUntilExpiry: number, isRenewed: boolean): RenewalStatus => {
  if (isRenewed) return 'renewed';
  if (daysUntilExpiry < 0) return 'overdue';
  if (daysUntilExpiry <= 7) return 'due';
  if (daysUntilExpiry <= 30) return 'upcoming';
  return 'upcoming';
};

// Main Component
export const RenewalTrackerTool: React.FC<RenewalTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: customers,
    addItem: addCustomerToBackend,
    updateItem: updateCustomerBackend,
    deleteItem: deleteCustomerBackend,
    isSynced: customersSynced,
    isSaving: customersSaving,
    lastSaved: customersLastSaved,
    syncError: customersSyncError,
    forceSync: forceCustomersSync,
  } = useToolData<Customer>('renewal-customers', [], []);

  const {
    data: renewals,
    addItem: addRenewalToBackend,
    updateItem: updateRenewalBackend,
    deleteItem: deleteRenewalBackend,
    isSynced: renewalsSynced,
    isSaving: renewalsSaving,
    lastSaved: renewalsLastSaved,
    syncError: renewalsSyncError,
    forceSync: forceRenewalsSync,
  } = useToolData<PolicyRenewal>('policy-renewals', [], RENEWAL_COLUMNS);

  const {
    data: activities,
    addItem: addActivityToBackend,
  } = useToolData<RenewalActivity>('renewal-activities', [], []);

  const {
    data: reminders,
    addItem: addReminderToBackend,
    updateItem: updateReminderBackend,
  } = useToolData<RenewalReminder>('renewal-reminders', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'renewals' | 'calendar' | 'analytics'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<InsuranceType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<RenewalStatus | 'all'>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<'7' | '14' | '30' | '60' | '90' | 'all'>('30');
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [expandedRenewalId, setExpandedRenewalId] = useState<string | null>(null);
  const [selectedRenewal, setSelectedRenewal] = useState<PolicyRenewal | null>(null);

  // Form states
  const [renewalForm, setRenewalForm] = useState<Partial<PolicyRenewal>>({
    insuranceType: 'auto',
    carrier: CARRIERS[0],
    currentPremium: 1200,
    proposedPremium: 1200,
    autoRenew: true,
  });

  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredContact: 'email',
  });

  // Activity form
  const [activityForm, setActivityForm] = useState({
    type: 'call' as 'call' | 'email' | 'meeting' | 'note',
    description: '',
    outcome: '',
  });

  // Filter renewals
  const filteredRenewals = useMemo(() => {
    return renewals.filter((renewal) => {
      const customer = customers.find((c) => c.id === renewal.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';

      const matchesSearch = searchTerm === '' ||
        renewal.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || renewal.insuranceType === filterType;
      const matchesStatus = filterStatus === 'all' || renewal.status === filterStatus;

      let matchesTimeframe = true;
      if (filterTimeframe !== 'all') {
        const days = parseInt(filterTimeframe);
        matchesTimeframe = renewal.daysUntilExpiry <= days;
      }

      return matchesSearch && matchesType && matchesStatus && matchesTimeframe;
    });
  }, [renewals, customers, searchTerm, filterType, filterStatus, filterTimeframe]);

  // Dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const now = new Date();
    const thisMonth = renewals.filter((r) => {
      const exp = new Date(r.expirationDate);
      return exp.getMonth() === now.getMonth() && exp.getFullYear() === now.getFullYear();
    });

    const dueSoon = renewals.filter((r) => r.daysUntilExpiry <= 7 && r.daysUntilExpiry > 0 && r.status !== 'renewed');
    const overdue = renewals.filter((r) => r.status === 'overdue');
    const renewedThisMonth = thisMonth.filter((r) => r.status === 'renewed');

    const totalPremiumAtRisk = renewals
      .filter((r) => ['upcoming', 'due', 'overdue'].includes(r.status))
      .reduce((sum, r) => sum + r.currentPremium, 0);

    const avgPremiumChange = renewals.length > 0
      ? renewals.reduce((sum, r) => sum + r.premiumChange, 0) / renewals.length
      : 0;

    const retentionRate = thisMonth.length > 0
      ? Math.round((renewedThisMonth.length / thisMonth.length) * 100)
      : 0;

    return {
      totalRenewals: renewals.length,
      dueSoon: dueSoon.length,
      overdue: overdue.length,
      renewedThisMonth: renewedThisMonth.length,
      totalPremiumAtRisk,
      avgPremiumChange: Math.round(avgPremiumChange * 10) / 10,
      retentionRate,
      pendingContact: renewals.filter((r) => r.contactStatus === 'pending' && r.status !== 'renewed').length,
    };
  }, [renewals]);

  // Upcoming renewals by week
  const upcomingByWeek = useMemo(() => {
    const weeks: { week: string; count: number; premium: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const startDay = i * 7;
      const endDay = (i + 1) * 7;
      const weekRenewals = renewals.filter(
        (r) => r.daysUntilExpiry > startDay && r.daysUntilExpiry <= endDay && r.status !== 'renewed'
      );
      weeks.push({
        week: `Week ${i + 1}`,
        count: weekRenewals.length,
        premium: weekRenewals.reduce((sum, r) => sum + r.currentPremium, 0),
      });
    }
    return weeks;
  }, [renewals]);

  // Get customer name
  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  // Get customer
  const getCustomer = (customerId: string) => {
    return customers.find((c) => c.id === customerId);
  };

  // Add customer
  const handleAddCustomer = () => {
    if (!customerForm.firstName || !customerForm.lastName) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newCustomer: Customer = {
      id: generateId(),
      firstName: customerForm.firstName || '',
      lastName: customerForm.lastName || '',
      email: customerForm.email || '',
      phone: customerForm.phone || '',
      preferredContact: customerForm.preferredContact || 'email',
    };

    addCustomerToBackend(newCustomer);
    setRenewalForm({ ...renewalForm, customerId: newCustomer.id });
    setCustomerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      preferredContact: 'email',
    });
  };

  // Add renewal
  const handleAddRenewal = () => {
    if (!renewalForm.customerId || !renewalForm.policyNumber) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date();
    const expirationDate = new Date(renewalForm.expirationDate || now);
    const daysUntilExpiry = getDaysUntilExpiry(expirationDate.toISOString());
    const premiumChange = renewalForm.currentPremium && renewalForm.proposedPremium
      ? ((renewalForm.proposedPremium - renewalForm.currentPremium) / renewalForm.currentPremium) * 100
      : 0;

    const newRenewal: PolicyRenewal = {
      id: generateId(),
      policyNumber: renewalForm.policyNumber || '',
      customerId: renewalForm.customerId || '',
      insuranceType: renewalForm.insuranceType as InsuranceType,
      carrier: renewalForm.carrier || CARRIERS[0],
      currentPremium: renewalForm.currentPremium || 0,
      proposedPremium: renewalForm.proposedPremium || renewalForm.currentPremium || 0,
      premiumChange: Math.round(premiumChange * 10) / 10,
      effectiveDate: renewalForm.effectiveDate || '',
      expirationDate: expirationDate.toISOString(),
      renewalDate: '',
      status: getRenewalStatus(daysUntilExpiry, false),
      contactStatus: 'pending',
      autoRenew: renewalForm.autoRenew ?? true,
      daysUntilExpiry,
      lastContactDate: '',
      notes: renewalForm.notes || '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    addRenewalToBackend(newRenewal);
    setShowRenewalForm(false);
    setRenewalForm({
      insuranceType: 'auto',
      carrier: CARRIERS[0],
      currentPremium: 1200,
      proposedPremium: 1200,
      autoRenew: true,
    });
  };

  // Process renewal
  const handleProcessRenewal = (renewalId: string) => {
    const renewal = renewals.find((r) => r.id === renewalId);
    if (!renewal) return;

    const newEffectiveDate = new Date(renewal.expirationDate);
    const newExpirationDate = new Date(newEffectiveDate);
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1);

    updateRenewalBackend(renewalId, {
      status: 'renewed',
      renewalDate: new Date().toISOString(),
      effectiveDate: newEffectiveDate.toISOString(),
      expirationDate: newExpirationDate.toISOString(),
      currentPremium: renewal.proposedPremium,
      daysUntilExpiry: getDaysUntilExpiry(newExpirationDate.toISOString()),
      updatedAt: new Date().toISOString(),
    });

    addActivityToBackend({
      id: generateId(),
      renewalId,
      type: 'renewal',
      description: 'Policy renewed successfully',
      outcome: `New premium: ${formatCurrency(renewal.proposedPremium)}`,
      performedBy: 'System',
      timestamp: new Date().toISOString(),
    });
  };

  // Log contact activity
  const handleLogActivity = (renewalId: string) => {
    if (!activityForm.description.trim()) return;

    addActivityToBackend({
      id: generateId(),
      renewalId,
      type: activityForm.type,
      description: activityForm.description,
      outcome: activityForm.outcome,
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    updateRenewalBackend(renewalId, {
      contactStatus: 'contacted',
      lastContactDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setActivityForm({
      type: 'call',
      description: '',
      outcome: '',
    });
  };

  // Cancel/Lapse policy
  const handleCancelRenewal = async (renewalId: string, reason: 'cancelled' | 'lapsed') => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: `Are you sure you want to mark this policy as ${reason}?`,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    updateRenewalBackend(renewalId, {
      status: reason,
      updatedAt: new Date().toISOString(),
    });

    addActivityToBackend({
      id: generateId(),
      renewalId,
      type: 'cancellation',
      description: `Policy ${reason}`,
      outcome: '',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const dataWithNames = filteredRenewals.map((r) => ({
      ...r,
      customerName: getCustomerName(r.customerId),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(dataWithNames, RENEWAL_COLUMNS, 'policy-renewals');
        break;
      case 'excel':
        exportToExcel(dataWithNames, RENEWAL_COLUMNS, 'policy-renewals');
        break;
      case 'json':
        exportToJSON(dataWithNames, 'policy-renewals');
        break;
      case 'pdf':
        exportToPDF(dataWithNames, RENEWAL_COLUMNS, 'Policy Renewals Report');
        break;
    }
  };

  return (
    <>
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <RefreshCw className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{t('tools.renewalTracker.renewalTracker', 'Renewal Tracker')}</h1>
            <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.trackAndManagePolicyRenewals', 'Track and manage policy renewals')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="renewal-tracker" toolName="Renewal Tracker" />

          <SyncStatus
            isSynced={renewalsSynced && customersSynced}
            isSaving={renewalsSaving || customersSaving}
            lastSaved={renewalsLastSaved || customersLastSaved}
            error={renewalsSyncError || customersSyncError}
            onRetry={() => { forceRenewalsSync(); forceCustomersSync(); }}
          />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.dueSoon', 'Due Soon')}</p>
                <p className="text-2xl font-bold">{dashboardMetrics.dueSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.overdue', 'Overdue')}</p>
                <p className="text-2xl font-bold">{dashboardMetrics.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.retentionRate', 'Retention Rate')}</p>
                <p className="text-2xl font-bold">{dashboardMetrics.retentionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.premiumAtRisk', 'Premium at Risk')}</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboardMetrics.totalPremiumAtRisk)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {['dashboard', 'renewals', 'calendar', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Upcoming Renewals by Week */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.renewalTracker.upcomingRenewalsNext4Weeks', 'Upcoming Renewals (Next 4 Weeks)')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingByWeek.map((week) => (
                  <div key={week.week} className="flex items-center justify-between">
                    <span className="text-sm">{week.week}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{formatCurrency(week.premium)}</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min((week.count / 10) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{week.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.renewalTracker.quickStats', 'Quick Stats')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.pendingContact', 'Pending Contact')}</p>
                  <p className="text-xl font-bold">{dashboardMetrics.pendingContact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.renewedThisMonth', 'Renewed This Month')}</p>
                  <p className="text-xl font-bold">{dashboardMetrics.renewedThisMonth}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.avgPremiumChange', 'Avg Premium Change')}</p>
                  <p className={`text-xl font-bold ${dashboardMetrics.avgPremiumChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {dashboardMetrics.avgPremiumChange > 0 ? '+' : ''}{dashboardMetrics.avgPremiumChange}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.totalPolicies', 'Total Policies')}</p>
                  <p className="text-xl font-bold">{dashboardMetrics.totalRenewals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority Renewals */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t('tools.renewalTracker.priorityRenewals', 'Priority Renewals')}</CardTitle>
              <button
                onClick={() => setShowRenewalForm(true)}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                {t('tools.renewalTracker.addRenewal', 'Add Renewal')}
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {renewals
                  .filter((r) => r.status !== 'renewed' && r.status !== 'cancelled' && r.status !== 'lapsed')
                  .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
                  .slice(0, 5)
                  .map((renewal) => (
                    <div key={renewal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${STATUS_CONFIG[renewal.status].color}`}>
                          {STATUS_CONFIG[renewal.status].icon}
                        </div>
                        <div>
                          <p className="font-medium">{getCustomerName(renewal.customerId)}</p>
                          <p className="text-sm text-muted-foreground">
                            {renewal.policyNumber} - {renewal.carrier}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {renewal.daysUntilExpiry < 0
                              ? `${Math.abs(renewal.daysUntilExpiry)} days overdue`
                              : `${renewal.daysUntilExpiry} days`}
                          </p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(renewal.currentPremium)}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedRenewal(renewal);
                            setExpandedRenewalId(renewal.id);
                            setActiveTab('renewals');
                          }}
                          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                        >
                          {t('tools.renewalTracker.process', 'Process')}
                        </button>
                      </div>
                    </div>
                  ))}
                {renewals.filter((r) => !['renewed', 'cancelled', 'lapsed'].includes(r.status)).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">{t('tools.renewalTracker.noPendingRenewals', 'No pending renewals')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Renewals Tab */}
      {activeTab === 'renewals' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('tools.renewalTracker.searchRenewals', 'Search renewals...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <select
              value={filterTimeframe}
              onChange={(e) => setFilterTimeframe(e.target.value as typeof filterTimeframe)}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="7">{t('tools.renewalTracker.next7Days', 'Next 7 Days')}</option>
              <option value="14">{t('tools.renewalTracker.next14Days', 'Next 14 Days')}</option>
              <option value="30">{t('tools.renewalTracker.next30Days', 'Next 30 Days')}</option>
              <option value="60">{t('tools.renewalTracker.next60Days', 'Next 60 Days')}</option>
              <option value="90">{t('tools.renewalTracker.next90Days', 'Next 90 Days')}</option>
              <option value="all">{t('tools.renewalTracker.all', 'All')}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as RenewalStatus | 'all')}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">{t('tools.renewalTracker.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <option key={status} value={status}>{config.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowRenewalForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Calendar className="w-4 h-4" />
              {t('tools.renewalTracker.addRenewal2', 'Add Renewal')}
            </button>
          </div>

          {/* Renewals List */}
          <div className="space-y-3">
            {filteredRenewals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('tools.renewalTracker.noRenewalsFound', 'No renewals found')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredRenewals.map((renewal) => {
                const customer = getCustomer(renewal.customerId);
                return (
                  <Card key={renewal.id} className="overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedRenewalId(expandedRenewalId === renewal.id ? null : renewal.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${STATUS_CONFIG[renewal.status].color}`}>
                            {STATUS_CONFIG[renewal.status].icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{getCustomerName(renewal.customerId)}</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_CONFIG[renewal.status].color}`}>
                                {STATUS_CONFIG[renewal.status].label}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {renewal.policyNumber} - {INSURANCE_TYPES.find((t) => t.type === renewal.insuranceType)?.label}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {renewal.daysUntilExpiry < 0
                                ? `${Math.abs(renewal.daysUntilExpiry)}d overdue`
                                : `${renewal.daysUntilExpiry}d left`}
                            </p>
                            <div className="flex items-center gap-1 text-sm">
                              <span>{formatCurrency(renewal.currentPremium)}</span>
                              <ArrowRight className="w-3 h-3" />
                              <span className={renewal.premiumChange > 0 ? 'text-red-500' : 'text-green-500'}>
                                {formatCurrency(renewal.proposedPremium)}
                              </span>
                            </div>
                          </div>
                          {expandedRenewalId === renewal.id ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedRenewalId === renewal.id && (
                      <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                        {/* Customer Contact Info */}
                        {customer && (
                          <div className="flex gap-4 flex-wrap">
                            <a
                              href={`mailto:${customer.email}`}
                              className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80"
                            >
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{customer.email}</span>
                            </a>
                            <a
                              href={`tel:${customer.phone}`}
                              className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{customer.phone}</span>
                            </a>
                          </div>
                        )}

                        {/* Policy Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.carrier', 'Carrier')}</p>
                            <p className="font-medium">{renewal.carrier}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.expiration', 'Expiration')}</p>
                            <p className="font-medium">{formatDate(renewal.expirationDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.premiumChange', 'Premium Change')}</p>
                            <p className={`font-medium ${renewal.premiumChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {renewal.premiumChange > 0 ? '+' : ''}{renewal.premiumChange}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('tools.renewalTracker.contactStatus', 'Contact Status')}</p>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${CONTACT_STATUS_CONFIG[renewal.contactStatus].color}`}>
                              {CONTACT_STATUS_CONFIG[renewal.contactStatus].label}
                            </span>
                          </div>
                        </div>

                        {/* Log Activity */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">{t('tools.renewalTracker.logActivity', 'Log Activity')}</p>
                          <div className="flex gap-2 flex-wrap">
                            <select
                              value={activityForm.type}
                              onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as typeof activityForm.type })}
                              className="px-2 py-1 text-sm border border-border rounded bg-background"
                            >
                              <option value="call">{t('tools.renewalTracker.call', 'Call')}</option>
                              <option value="email">{t('tools.renewalTracker.email', 'Email')}</option>
                              <option value="meeting">{t('tools.renewalTracker.meeting', 'Meeting')}</option>
                              <option value="note">{t('tools.renewalTracker.note', 'Note')}</option>
                            </select>
                            <input
                              type="text"
                              placeholder={t('tools.renewalTracker.description', 'Description...')}
                              value={activityForm.description}
                              onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                              className="flex-1 min-w-[150px] px-2 py-1 text-sm border border-border rounded bg-background"
                            />
                            <input
                              type="text"
                              placeholder={t('tools.renewalTracker.outcome', 'Outcome...')}
                              value={activityForm.outcome}
                              onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value })}
                              className="w-32 px-2 py-1 text-sm border border-border rounded bg-background"
                            />
                            <button
                              onClick={() => handleLogActivity(renewal.id)}
                              className="px-3 py-1 text-sm bg-muted text-foreground rounded hover:bg-muted/80"
                            >
                              {t('tools.renewalTracker.log', 'Log')}
                            </button>
                          </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="space-y-2">
                          {activities
                            .filter((a) => a.renewalId === renewal.id)
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .slice(0, 3)
                            .map((activity) => (
                              <div key={activity.id} className="p-2 bg-muted/50 rounded text-sm">
                                <div className="flex justify-between text-muted-foreground text-xs mb-1">
                                  <span className="capitalize">{activity.type}</span>
                                  <span>{formatDate(activity.timestamp)}</span>
                                </div>
                                <p>{activity.description}</p>
                                {activity.outcome && (
                                  <p className="text-muted-foreground">Outcome: {activity.outcome}</p>
                                )}
                              </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          {renewal.status !== 'renewed' && renewal.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleProcessRenewal(renewal.id)}
                                className="px-4 py-2 text-sm bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20"
                              >
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                {t('tools.renewalTracker.processRenewal', 'Process Renewal')}
                              </button>
                              <button
                                onClick={() => handleCancelRenewal(renewal.id, 'cancelled')}
                                className="px-4 py-2 text-sm bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20"
                              >
                                {t('tools.renewalTracker.cancelPolicy', 'Cancel Policy')}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('tools.renewalTracker.calendarViewComingSoon', 'Calendar view coming soon')}</p>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.renewalTracker.renewalsByType', 'Renewals by Type')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {INSURANCE_TYPES.map(({ type, label }) => {
                  const typeRenewals = renewals.filter((r) => r.insuranceType === type);
                  const renewed = typeRenewals.filter((r) => r.status === 'renewed').length;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${typeRenewals.length > 0 ? (renewed / typeRenewals.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {renewed}/{typeRenewals.length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('tools.renewalTracker.premiumTrends', 'Premium Trends')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('tools.renewalTracker.averagePremiumChange', 'Average Premium Change')}</span>
                  <span className={`font-medium ${dashboardMetrics.avgPremiumChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {dashboardMetrics.avgPremiumChange > 0 ? '+' : ''}{dashboardMetrics.avgPremiumChange}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('tools.renewalTracker.retentionRate2', 'Retention Rate')}</span>
                  <span className="font-medium">{dashboardMetrics.retentionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('tools.renewalTracker.totalPremiumAtRisk', 'Total Premium at Risk')}</span>
                  <span className="font-medium">{formatCurrency(dashboardMetrics.totalPremiumAtRisk)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Renewal Modal */}
      {showRenewalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.renewalTracker.addPolicyRenewal', 'Add Policy Renewal')}</CardTitle>
              <button onClick={() => setShowRenewalForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer selection */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.renewalTracker.customer', 'Customer')}</label>
                <select
                  value={renewalForm.customerId || ''}
                  onChange={(e) => setRenewalForm({ ...renewalForm, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="">{t('tools.renewalTracker.selectCustomerOrAddNew', 'Select customer or add new')}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>

              {/* New customer form */}
              {!renewalForm.customerId && (
                <div className="p-3 border border-border rounded-lg space-y-3">
                  <p className="text-sm font-medium">{t('tools.renewalTracker.addNewCustomer', 'Add New Customer')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={t('tools.renewalTracker.firstName', 'First Name *')}
                      value={customerForm.firstName || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                    <input
                      type="text"
                      placeholder={t('tools.renewalTracker.lastName', 'Last Name *')}
                      value={customerForm.lastName || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="email"
                      placeholder={t('tools.renewalTracker.email2', 'Email')}
                      value={customerForm.email || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                    <input
                      type="tel"
                      placeholder={t('tools.renewalTracker.phone', 'Phone')}
                      value={customerForm.phone || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                  <button
                    onClick={handleAddCustomer}
                    className="w-full px-3 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80"
                  >
                    {t('tools.renewalTracker.addCustomer', 'Add Customer')}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.renewalTracker.policyNumber', 'Policy Number *')}</label>
                <input
                  type="text"
                  value={renewalForm.policyNumber || ''}
                  onChange={(e) => setRenewalForm({ ...renewalForm, policyNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  placeholder={t('tools.renewalTracker.polXxxxXxxx', 'POL-XXXX-XXXX')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.renewalTracker.insuranceType', 'Insurance Type')}</label>
                  <select
                    value={renewalForm.insuranceType}
                    onChange={(e) => setRenewalForm({ ...renewalForm, insuranceType: e.target.value as InsuranceType })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    {INSURANCE_TYPES.map(({ type, label }) => (
                      <option key={type} value={type}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.renewalTracker.carrier2', 'Carrier')}</label>
                  <select
                    value={renewalForm.carrier}
                    onChange={(e) => setRenewalForm({ ...renewalForm, carrier: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    {CARRIERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.renewalTracker.expirationDate', 'Expiration Date *')}</label>
                <input
                  type="date"
                  value={renewalForm.expirationDate?.split('T')[0] || ''}
                  onChange={(e) => setRenewalForm({ ...renewalForm, expirationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.renewalTracker.currentPremium', 'Current Premium')}</label>
                  <input
                    type="number"
                    value={renewalForm.currentPremium || 0}
                    onChange={(e) => setRenewalForm({ ...renewalForm, currentPremium: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.renewalTracker.proposedPremium', 'Proposed Premium')}</label>
                  <input
                    type="number"
                    value={renewalForm.proposedPremium || 0}
                    onChange={(e) => setRenewalForm({ ...renewalForm, proposedPremium: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={renewalForm.autoRenew ?? true}
                  onChange={(e) => setRenewalForm({ ...renewalForm, autoRenew: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="autoRenew" className="text-sm">{t('tools.renewalTracker.autoRenewEnabled', 'Auto-renew enabled')}</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.renewalTracker.notes', 'Notes')}</label>
                <textarea
                  value={renewalForm.notes || ''}
                  onChange={(e) => setRenewalForm({ ...renewalForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background h-20"
                  placeholder={t('tools.renewalTracker.additionalNotes', 'Additional notes...')}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowRenewalForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  {t('tools.renewalTracker.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddRenewal}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  {t('tools.renewalTracker.addRenewal3', 'Add Renewal')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default RenewalTrackerTool;
