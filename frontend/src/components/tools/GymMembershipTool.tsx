'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dumbbell,
  Users,
  CreditCard,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Star,
  Sparkles,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GymMembershipToolProps {
  uiConfig?: UIConfig;
}

// Types
type MembershipType = 'basic' | 'standard' | 'premium' | 'vip' | 'family';
type MembershipStatus = 'active' | 'expired' | 'paused' | 'cancelled';
type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'paypal';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyPhone: string;
  membershipType: MembershipType;
  status: MembershipStatus;
  startDate: string;
  endDate: string;
  monthlyFee: number;
  paymentMethod: PaymentMethod;
  autoRenew: boolean;
  notes: string;
  createdAt: string;
  lastVisit: string;
  totalVisits: number;
}

interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

// Constants
const MEMBERSHIP_TYPES: { type: MembershipType; label: string; price: number; features: string[] }[] = [
  { type: 'basic', label: 'Basic', price: 29, features: ['Gym access', 'Locker room'] },
  { type: 'standard', label: 'Standard', price: 49, features: ['Gym access', 'Locker room', 'Group classes'] },
  { type: 'premium', label: 'Premium', price: 79, features: ['24/7 access', 'All classes', 'Sauna', 'Pool'] },
  { type: 'vip', label: 'VIP', price: 129, features: ['All Premium features', 'Personal trainer', 'Nutrition plan'] },
  { type: 'family', label: 'Family', price: 149, features: ['4 members', 'All Standard features', 'Kids area'] },
];

const STATUS_COLORS: Record<MembershipStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  expired: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  paused: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  cancelled: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' },
};

// Column configurations
const MEMBER_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'membershipType', header: 'Membership', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'monthlyFee', header: 'Monthly Fee', type: 'currency' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'totalVisits', header: 'Total Visits', type: 'number' },
];

const PAYMENT_COLUMNS: ColumnConfig[] = [
  { key: 'memberName', header: 'Member', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'method', header: 'Payment Method', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

export const GymMembershipTool: React.FC<GymMembershipToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: members,
    addItem: addMemberToBackend,
    updateItem: updateMemberBackend,
    deleteItem: deleteMemberBackend,
    isSynced: membersSynced,
    isSaving: membersSaving,
    lastSaved: membersLastSaved,
    syncError: membersSyncError,
    forceSync: forceMembersSync,
  } = useToolData<Member>('gym-members', [], MEMBER_COLUMNS);

  const {
    data: payments,
    addItem: addPaymentToBackend,
    deleteItem: deletePaymentBackend,
  } = useToolData<Payment>('gym-payments', [], PAYMENT_COLUMNS);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'members' | 'payments' | 'analytics'>('members');
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<MembershipStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<MembershipType | 'all'>('all');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // New member form state
  const [newMember, setNewMember] = useState<Partial<Member>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    membershipType: 'standard',
    autoRenew: true,
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.firstName || params.lastName || params.email) {
        setNewMember({
          ...newMember,
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          email: params.email || '',
          phone: params.phone || '',
        });
        setShowMemberForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add new member
  const addMember = () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.email) {
      setValidationMessage('Please fill in required fields (First Name, Last Name, Email)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const membershipInfo = MEMBERSHIP_TYPES.find(m => m.type === newMember.membershipType) || MEMBERSHIP_TYPES[1];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const member: Member = {
      id: generateId(),
      firstName: newMember.firstName || '',
      lastName: newMember.lastName || '',
      email: newMember.email || '',
      phone: newMember.phone || '',
      address: newMember.address || '',
      dateOfBirth: newMember.dateOfBirth || '',
      emergencyContact: newMember.emergencyContact || '',
      emergencyPhone: newMember.emergencyPhone || '',
      membershipType: newMember.membershipType || 'standard',
      status: 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      monthlyFee: membershipInfo.price,
      paymentMethod: 'credit_card',
      autoRenew: newMember.autoRenew ?? true,
      notes: newMember.notes || '',
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      totalVisits: 0,
    };

    addMemberToBackend(member);
    resetForm();
  };

  // Update member
  const updateMember = () => {
    if (!editingMember) return;
    updateMemberBackend(editingMember.id, editingMember);
    setEditingMember(null);
    setShowMemberForm(false);
  };

  // Delete member
  const deleteMember = async (memberId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this member?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteMemberBackend(memberId);
    }
  };

  // Record check-in
  const recordCheckIn = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      updateMemberBackend(memberId, {
        lastVisit: new Date().toISOString(),
        totalVisits: member.totalVisits + 1,
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setShowMemberForm(false);
    setEditingMember(null);
    setNewMember({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      emergencyContact: '',
      emergencyPhone: '',
      membershipType: 'standard',
      autoRenew: true,
      notes: '',
    });
  };

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch =
        searchTerm === '' ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
      const matchesType = filterType === 'all' || member.membershipType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [members, searchTerm, filterStatus, filterType]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const activeMembers = members.filter(m => m.status === 'active');
    const totalRevenue = activeMembers.reduce((sum, m) => sum + m.monthlyFee, 0);
    const avgVisits = members.length > 0
      ? members.reduce((sum, m) => sum + m.totalVisits, 0) / members.length
      : 0;

    const membershipBreakdown = MEMBERSHIP_TYPES.map(type => ({
      ...type,
      count: members.filter(m => m.membershipType === type.type && m.status === 'active').length,
    }));

    const expiringThisMonth = members.filter(m => {
      const endDate = new Date(m.endDate);
      const now = new Date();
      return m.status === 'active' &&
        endDate.getMonth() === now.getMonth() &&
        endDate.getFullYear() === now.getFullYear();
    });

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      totalRevenue,
      avgVisits: Math.round(avgVisits * 10) / 10,
      membershipBreakdown,
      expiringThisMonth,
    };
  }, [members]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.gymMembership.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.gymMembership.gymMembershipManager', 'Gym Membership Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.gymMembership.manageMembersTrackPaymentsAnd', 'Manage members, track payments, and view analytics')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="gym-membership" toolName="Gym Membership" />

              <SyncStatus
                isSynced={membersSynced}
                isSaving={membersSaving}
                lastSaved={membersLastSaved}
                syncError={membersSyncError}
                onForceSync={forceMembersSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(members, MEMBER_COLUMNS, { filename: 'gym-members' })}
                onExportExcel={() => exportToExcel(members, MEMBER_COLUMNS, { filename: 'gym-members' })}
                onExportJSON={() => exportToJSON(members, { filename: 'gym-members' })}
                onExportPDF={async () => {
                  await exportToPDF(members, MEMBER_COLUMNS, {
                    filename: 'gym-members',
                    title: 'Gym Membership Report',
                    subtitle: `${analytics.activeMembers} active members | ${formatCurrency(analytics.totalRevenue)} monthly revenue`,
                  });
                }}
                onPrint={() => printData(members, MEMBER_COLUMNS, { title: 'Gym Members' })}
                onCopyToClipboard={() => copyUtil(members, MEMBER_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
              { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <Star className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Members', value: analytics.totalMembers, icon: <Users className="w-5 h-5" />, color: 'bg-blue-500' },
            { label: 'Active Members', value: analytics.activeMembers, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-500' },
            { label: 'Monthly Revenue', value: formatCurrency(analytics.totalRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'bg-purple-500' },
            { label: 'Avg. Visits', value: analytics.avgVisits, icon: <Calendar className="w-5 h-5" />, color: 'bg-orange-500' },
          ].map((stat, index) => (
            <Card key={index} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${stat.color} rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Filters and Add Button */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.gymMembership.searchMembers', 'Search members...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as MembershipStatus | 'all')}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.gymMembership.allStatuses', 'All Statuses')}</option>
                  <option value="active">{t('tools.gymMembership.active', 'Active')}</option>
                  <option value="expired">{t('tools.gymMembership.expired', 'Expired')}</option>
                  <option value="paused">{t('tools.gymMembership.paused', 'Paused')}</option>
                  <option value="cancelled">{t('tools.gymMembership.cancelled', 'Cancelled')}</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as MembershipType | 'all')}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.gymMembership.allTypes', 'All Types')}</option>
                  {MEMBERSHIP_TYPES.map(type => (
                    <option key={type.type} value={type.type}>{type.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowMemberForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.gymMembership.addMember', 'Add Member')}
              </button>
            </div>

            {/* Member Form Modal */}
            {showMemberForm && (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <span>{editingMember ? t('tools.gymMembership.editMember', 'Edit Member') : t('tools.gymMembership.addNewMember', 'Add New Member')}</span>
                    <button onClick={resetForm} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <X className="w-5 h-5" />
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.gymMembership.firstName', 'First Name *')}
                      </label>
                      <input
                        type="text"
                        value={editingMember?.firstName ?? newMember.firstName}
                        onChange={(e) => editingMember
                          ? setEditingMember({ ...editingMember, firstName: e.target.value })
                          : setNewMember({ ...newMember, firstName: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.gymMembership.lastName', 'Last Name *')}
                      </label>
                      <input
                        type="text"
                        value={editingMember?.lastName ?? newMember.lastName}
                        onChange={(e) => editingMember
                          ? setEditingMember({ ...editingMember, lastName: e.target.value })
                          : setNewMember({ ...newMember, lastName: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.gymMembership.email', 'Email *')}
                      </label>
                      <input
                        type="email"
                        value={editingMember?.email ?? newMember.email}
                        onChange={(e) => editingMember
                          ? setEditingMember({ ...editingMember, email: e.target.value })
                          : setNewMember({ ...newMember, email: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.gymMembership.phone2', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={editingMember?.phone ?? newMember.phone}
                        onChange={(e) => editingMember
                          ? setEditingMember({ ...editingMember, phone: e.target.value })
                          : setNewMember({ ...newMember, phone: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.gymMembership.membershipType', 'Membership Type')}
                      </label>
                      <select
                        value={editingMember?.membershipType ?? newMember.membershipType}
                        onChange={(e) => editingMember
                          ? setEditingMember({ ...editingMember, membershipType: e.target.value as MembershipType })
                          : setNewMember({ ...newMember, membershipType: e.target.value as MembershipType })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {MEMBERSHIP_TYPES.map(type => (
                          <option key={type.type} value={type.type}>
                            {type.label} - {formatCurrency(type.price)}/month
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.gymMembership.dateOfBirth', 'Date of Birth')}
                      </label>
                      <input
                        type="date"
                        value={editingMember?.dateOfBirth ?? newMember.dateOfBirth}
                        onChange={(e) => editingMember
                          ? setEditingMember({ ...editingMember, dateOfBirth: e.target.value })
                          : setNewMember({ ...newMember, dateOfBirth: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.gymMembership.notes', 'Notes')}
                      </label>
                      <textarea
                        value={editingMember?.notes ?? newMember.notes}
                        onChange={(e) => editingMember
                          ? setEditingMember({ ...editingMember, notes: e.target.value })
                          : setNewMember({ ...newMember, notes: e.target.value })
                        }
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={resetForm}
                      className={`px-4 py-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('tools.gymMembership.cancel', 'Cancel')}
                    </button>
                    <button
                      onClick={editingMember ? updateMember : addMember}
                      className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      {editingMember ? t('tools.gymMembership.update', 'Update') : t('tools.gymMembership.add', 'Add')} Member
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Members List */}
            <div className="space-y-3">
              {filteredMembers.length === 0 ? (
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardContent className="p-8 text-center">
                    <Users className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {t('tools.gymMembership.noMembersFoundAddYour', 'No members found. Add your first member to get started!')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredMembers.map(member => (
                  <Card key={member.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <User className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {member.firstName} {member.lastName}
                            </h3>
                            <div className="flex items-center gap-3 text-sm">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                {member.email}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[member.status].bg} ${STATUS_COLORS[member.status].text}`}>
                                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(member.monthlyFee)}/mo
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {MEMBERSHIP_TYPES.find(t => t.type === member.membershipType)?.label}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => recordCheckIn(member.id)}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                              title={t('tools.gymMembership.recordCheckIn', 'Record Check-in')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditingMember(member); setShowMemberForm(true); }}
                              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMember(member.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                              {expandedMemberId === member.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      {expandedMemberId === member.id && (
                        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} grid grid-cols-2 md:grid-cols-4 gap-4`}>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.gymMembership.phone', 'Phone')}</p>
                            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{member.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.gymMembership.startDate', 'Start Date')}</p>
                            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{formatDate(member.startDate)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.gymMembership.endDate', 'End Date')}</p>
                            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{formatDate(member.endDate)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.gymMembership.totalVisits', 'Total Visits')}</p>
                            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{member.totalVisits}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.gymMembership.lastVisit', 'Last Visit')}</p>
                            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{formatDate(member.lastVisit)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.gymMembership.autoRenew', 'Auto-Renew')}</p>
                            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{member.autoRenew ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Membership Breakdown */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {t('tools.gymMembership.membershipBreakdown', 'Membership Breakdown')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.membershipBreakdown.map(type => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {type.label}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatCurrency(type.price)}/month
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {type.count}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          members
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expiring This Month */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  {t('tools.gymMembership.expiringThisMonth', 'Expiring This Month')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.expiringThisMonth.length === 0 ? (
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.gymMembership.noMembershipsExpiringThisMonth', 'No memberships expiring this month')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics.expiringThisMonth.map(member => (
                      <div key={member.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {member.firstName} {member.lastName}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Expires: {formatDate(member.endDate)}
                          </p>
                        </div>
                        <button className="px-3 py-1 bg-[#0D9488] text-white text-sm rounded-lg hover:bg-[#0F766E]">
                          {t('tools.gymMembership.renew', 'Renew')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.gymMembership.paymentHistory', 'Payment History')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.gymMembership.noPaymentRecordsYet', 'No payment records yet')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map(payment => {
                    const member = members.find(m => m.id === payment.memberId);
                    return (
                      <div key={payment.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {member ? `${member.firstName} ${member.lastName}` : 'Unknown Member'}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(payment.date)} - {payment.method.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(payment.amount)}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <AlertCircle className="w-5 h-5" />
            <span>{validationMessage}</span>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default GymMembershipTool;
