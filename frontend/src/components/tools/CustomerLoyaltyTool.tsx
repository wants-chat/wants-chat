'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Award,
  Users,
  Gift,
  Star,
  TrendingUp,
  Crown,
  Percent,
  Calendar,
  Mail,
  Phone,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  BarChart3,
  Heart,
  ShoppingBag,
  Zap,
  CheckCircle,
  Clock,
  Tag,
  Sparkles,
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

interface CustomerLoyaltyToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type MemberTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
type RewardStatus = 'available' | 'redeemed' | 'expired';
type TransactionType = 'purchase' | 'referral' | 'bonus' | 'redemption' | 'adjustment';

interface LoyaltyMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  tier: MemberTier;
  points: number;
  lifetimePoints: number;
  lifetimeSpend: number;
  joinDate: string;
  lastVisit: string;
  visitCount: number;
  referralCode: string;
  referredBy?: string;
  preferences?: string[];
  notes?: string;
}

interface PointsTransaction {
  id: string;
  memberId: string;
  type: TransactionType;
  points: number;
  description: string;
  orderId?: string;
  orderAmount?: number;
  createdAt: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  tier: MemberTier | 'all';
  expiresAt?: string;
  quantity?: number;
  isActive: boolean;
}

interface RedeemedReward {
  id: string;
  memberId: string;
  rewardId: string;
  rewardName: string;
  pointsUsed: number;
  status: RewardStatus;
  redeemedAt: string;
  expiresAt: string;
}

// Constants
const TIER_CONFIG: Record<MemberTier, { minPoints: number; multiplier: number; color: string; bgColor: string }> = {
  bronze: { minPoints: 0, multiplier: 1, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  silver: { minPoints: 1000, multiplier: 1.25, color: 'text-gray-500', bgColor: 'bg-gray-200' },
  gold: { minPoints: 5000, multiplier: 1.5, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  platinum: { minPoints: 15000, multiplier: 1.75, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  diamond: { minPoints: 50000, multiplier: 2, color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

const POINTS_PER_DOLLAR = 10;

const SAMPLE_REWARDS: Reward[] = [
  { id: 'r1', name: '$5 Off Next Purchase', description: 'Get $5 off your next order', pointsCost: 500, category: 'Discount', tier: 'all', isActive: true },
  { id: 'r2', name: '$10 Off Next Purchase', description: 'Get $10 off your next order', pointsCost: 900, category: 'Discount', tier: 'all', isActive: true },
  { id: 'r3', name: 'Free Shipping', description: 'Free standard shipping on next order', pointsCost: 300, category: 'Shipping', tier: 'all', isActive: true },
  { id: 'r4', name: 'Double Points Day', description: 'Earn double points on your next purchase', pointsCost: 750, category: 'Bonus', tier: 'silver', isActive: true },
  { id: 'r5', name: 'VIP Early Access', description: '24-hour early access to sales', pointsCost: 1000, category: 'Exclusive', tier: 'gold', isActive: true },
  { id: 'r6', name: 'Birthday Gift Box', description: 'Special gift box on your birthday', pointsCost: 1500, category: 'Gift', tier: 'platinum', isActive: true },
  { id: 'r7', name: 'Free Product of Choice', description: 'Any product under $25 for free', pointsCost: 2500, category: 'Gift', tier: 'diamond', isActive: true },
];

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Column configurations for exports
const MEMBER_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'tier', header: 'Tier', type: 'string' },
  { key: 'points', header: 'Current Points', type: 'number' },
  { key: 'lifetimePoints', header: 'Lifetime Points', type: 'number' },
  { key: 'lifetimeSpend', header: 'Lifetime Spend', type: 'currency' },
  { key: 'joinDate', header: 'Join Date', type: 'date' },
  { key: 'visitCount', header: 'Visit Count', type: 'number' },
  { key: 'referralCode', header: 'Referral Code', type: 'string' },
];

// Main Component
export const CustomerLoyaltyTool: React.FC<CustomerLoyaltyToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const { t } = useTranslation();
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
  } = useToolData<LoyaltyMember>('loyalty-members', [], MEMBER_COLUMNS);

  const {
    data: transactions,
    addItem: addTransactionToBackend,
  } = useToolData<PointsTransaction>('loyalty-transactions', []);

  const {
    data: redeemedRewards,
    addItem: addRedeemedRewardToBackend,
    updateItem: updateRedeemedRewardBackend,
  } = useToolData<RedeemedReward>('redeemed-rewards', []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'members' | 'rewards' | 'transactions' | 'analytics'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [newMember, setNewMember] = useState<Partial<LoyaltyMember>>({});

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.tier && TIER_CONFIG[params.tier as MemberTier]) {
        setFilterTier(params.tier);
        hasChanges = true;
      }
      if (params.tab && ['members', 'rewards', 'transactions', 'analytics'].includes(params.tab)) {
        setActiveTab(params.tab);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [pointsToAdd, setPointsToAdd] = useState({ amount: 0, orderAmount: 0, description: '' });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      if (uiConfig.params.email) {
        setNewMember((prev) => ({ ...prev, email: uiConfig.params!.email }));
        setShowMemberForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate tier based on lifetime points
  const calculateTier = (lifetimePoints: number): MemberTier => {
    if (lifetimePoints >= TIER_CONFIG.diamond.minPoints) return 'diamond';
    if (lifetimePoints >= TIER_CONFIG.platinum.minPoints) return 'platinum';
    if (lifetimePoints >= TIER_CONFIG.gold.minPoints) return 'gold';
    if (lifetimePoints >= TIER_CONFIG.silver.minPoints) return 'silver';
    return 'bronze';
  };

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        searchTerm === '' ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);
      const matchesTier = filterTier === 'all' || member.tier === filterTier;
      return matchesSearch && matchesTier;
    });
  }, [members, searchTerm, filterTier]);

  // Add new member
  const addMember = () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.email) {
      setValidationMessage('Please fill in required fields (First Name, Last Name, Email)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const member: LoyaltyMember = {
      id: generateId(),
      firstName: newMember.firstName || '',
      lastName: newMember.lastName || '',
      email: newMember.email || '',
      phone: newMember.phone || '',
      dateOfBirth: newMember.dateOfBirth || '',
      tier: 'bronze',
      points: 100, // Welcome bonus
      lifetimePoints: 100,
      lifetimeSpend: 0,
      joinDate: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitCount: 1,
      referralCode: generateReferralCode(),
      notes: newMember.notes || '',
    };

    addMemberToBackend(member);

    // Add welcome bonus transaction
    const transaction: PointsTransaction = {
      id: generateId(),
      memberId: member.id,
      type: 'bonus',
      points: 100,
      description: 'Welcome bonus for joining loyalty program',
      createdAt: new Date().toISOString(),
    };
    addTransactionToBackend(transaction);

    setShowMemberForm(false);
    setNewMember({});
  };

  // Add points from purchase
  const addPointsFromPurchase = () => {
    if (!selectedMember || pointsToAdd.orderAmount <= 0) {
      setValidationMessage('Please enter a valid order amount');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const tierMultiplier = TIER_CONFIG[selectedMember.tier].multiplier;
    const earnedPoints = Math.floor(pointsToAdd.orderAmount * POINTS_PER_DOLLAR * tierMultiplier);

    const updatedMember: LoyaltyMember = {
      ...selectedMember,
      points: selectedMember.points + earnedPoints,
      lifetimePoints: selectedMember.lifetimePoints + earnedPoints,
      lifetimeSpend: selectedMember.lifetimeSpend + pointsToAdd.orderAmount,
      lastVisit: new Date().toISOString(),
      visitCount: selectedMember.visitCount + 1,
      tier: calculateTier(selectedMember.lifetimePoints + earnedPoints),
    };

    updateMemberBackend(selectedMember.id, updatedMember);

    const transaction: PointsTransaction = {
      id: generateId(),
      memberId: selectedMember.id,
      type: 'purchase',
      points: earnedPoints,
      description: pointsToAdd.description || `Purchase - ${formatCurrency(pointsToAdd.orderAmount)}`,
      orderAmount: pointsToAdd.orderAmount,
      createdAt: new Date().toISOString(),
    };
    addTransactionToBackend(transaction);

    setSelectedMember(updatedMember);
    setShowPointsModal(false);
    setPointsToAdd({ amount: 0, orderAmount: 0, description: '' });
  };

  // Redeem reward
  const redeemReward = (reward: Reward) => {
    if (!selectedMember) return;

    if (selectedMember.points < reward.pointsCost) {
      setValidationMessage('Insufficient points for this reward');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Check tier requirement
    if (reward.tier !== 'all') {
      const tiers: MemberTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      const memberTierIndex = tiers.indexOf(selectedMember.tier);
      const requiredTierIndex = tiers.indexOf(reward.tier);
      if (memberTierIndex < requiredTierIndex) {
        setValidationMessage(`This reward requires ${reward.tier} tier or higher`);
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }
    }

    const updatedMember: LoyaltyMember = {
      ...selectedMember,
      points: selectedMember.points - reward.pointsCost,
    };

    updateMemberBackend(selectedMember.id, updatedMember);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const redemption: RedeemedReward = {
      id: generateId(),
      memberId: selectedMember.id,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsUsed: reward.pointsCost,
      status: 'available',
      redeemedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    addRedeemedRewardToBackend(redemption);

    const transaction: PointsTransaction = {
      id: generateId(),
      memberId: selectedMember.id,
      type: 'redemption',
      points: -reward.pointsCost,
      description: `Redeemed: ${reward.name}`,
      createdAt: new Date().toISOString(),
    };
    addTransactionToBackend(transaction);

    setSelectedMember(updatedMember);
    setValidationMessage(`Successfully redeemed: ${reward.name}`);
    setTimeout(() => setValidationMessage(null), 3000);
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
      if (selectedMember?.id === memberId) {
        setSelectedMember(null);
      }
    }
  };

  // Analytics
  const analytics = useMemo(() => {
    const totalMembers = members.length;
    const tierDistribution = members.reduce((acc, m) => {
      acc[m.tier] = (acc[m.tier] || 0) + 1;
      return acc;
    }, {} as Record<MemberTier, number>);
    const totalLifetimeSpend = members.reduce((sum, m) => sum + m.lifetimeSpend, 0);
    const totalPointsIssued = members.reduce((sum, m) => sum + m.lifetimePoints, 0);
    const totalPointsRedeemed = redeemedRewards.reduce((sum, r) => sum + r.pointsUsed, 0);
    const activeMembers = members.filter((m) => {
      const lastVisit = new Date(m.lastVisit);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastVisit >= thirtyDaysAgo;
    }).length;

    return {
      totalMembers,
      tierDistribution,
      totalLifetimeSpend,
      totalPointsIssued,
      totalPointsRedeemed,
      activeMembers,
      averageSpend: totalMembers > 0 ? totalLifetimeSpend / totalMembers : 0,
    };
  }, [members, redeemedRewards]);

  // Member transactions
  const memberTransactions = useMemo(() => {
    if (!selectedMember) return [];
    return transactions
      .filter((t) => t.memberId === selectedMember.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, selectedMember]);

  // Member redeemed rewards
  const memberRewards = useMemo(() => {
    if (!selectedMember) return [];
    return redeemedRewards.filter((r) => r.memberId === selectedMember.id);
  }, [redeemedRewards, selectedMember]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.customerLoyalty.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.customerLoyalty.customerLoyaltyTool', 'Customer Loyalty Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.customerLoyalty.loyaltyProgramManagementAndRewards', 'Loyalty program management and rewards tracking')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="customer-loyalty" toolName="Customer Loyalty" />

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
                onExportCSV={() => exportToCSV(members, MEMBER_COLUMNS, 'loyalty-members')}
                onExportExcel={() => exportToExcel(members, MEMBER_COLUMNS, 'loyalty-members')}
                onExportJSON={() => exportToJSON(members, 'loyalty-members')}
                onExportPDF={() => exportToPDF(members, MEMBER_COLUMNS, 'Loyalty Members')}
                onCopy={() => copyUtil(members, MEMBER_COLUMNS)}
                onPrint={() => printData(members, MEMBER_COLUMNS, 'Loyalty Members')}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {['members', 'rewards', 'transactions', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'members' && <Users className="w-4 h-4 inline mr-2" />}
                {tab === 'rewards' && <Gift className="w-4 h-4 inline mr-2" />}
                {tab === 'transactions' && <TrendingUp className="w-4 h-4 inline mr-2" />}
                {tab === 'analytics' && <BarChart3 className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Members List */}
            <div className={`lg:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.customerLoyalty.loyaltyMembers', 'Loyalty Members')}
                </h2>
                <button
                  onClick={() => setShowMemberForm(true)}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  {t('tools.customerLoyalty.addMember', 'Add Member')}
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.customerLoyalty.searchMembers', 'Search members...')}
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
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">{t('tools.customerLoyalty.allTiers', 'All Tiers')}</option>
                  {Object.keys(TIER_CONFIG).map((tier) => (
                    <option key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedMember?.id === member.id
                        ? 'border-[#0D9488] bg-[#0D9488]/10'
                        : theme === 'dark'
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${TIER_CONFIG[member.tier].bgColor}`}>
                          <Crown className={`w-5 h-5 ${TIER_CONFIG[member.tier].color}`} />
                        </div>
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#0D9488] font-bold">{member.points.toLocaleString()} pts</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${TIER_CONFIG[member.tier].bgColor} ${TIER_CONFIG[member.tier].color}`}>
                          {member.tier.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.customerLoyalty.noMembersFound', 'No members found')}
                  </p>
                )}
              </div>
            </div>

            {/* Member Details */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              {selectedMember ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.customerLoyalty.memberDetails', 'Member Details')}
                    </h2>
                    <button
                      onClick={() => deleteMember(selectedMember.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3 ${TIER_CONFIG[selectedMember.tier].bgColor}`}>
                      <Crown className={`w-10 h-10 ${TIER_CONFIG[selectedMember.tier].color}`} />
                    </div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedMember.firstName} {selectedMember.lastName}
                    </h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${TIER_CONFIG[selectedMember.tier].bgColor} ${TIER_CONFIG[selectedMember.tier].color}`}>
                      {selectedMember.tier.toUpperCase()} MEMBER
                    </span>
                  </div>

                  <div className={`grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#0D9488]">{selectedMember.points.toLocaleString()}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customerLoyalty.availablePoints', 'Available Points')}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMember.lifetimePoints.toLocaleString()}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customerLoyalty.lifetimePoints', 'Lifetime Points')}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(selectedMember.lifetimeSpend)}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customerLoyalty.lifetimeSpend', 'Lifetime Spend')}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMember.visitCount}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customerLoyalty.visits', 'Visits')}</p>
                    </div>
                  </div>

                  <div className={`space-y-3 mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedMember.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Joined {formatDate(selectedMember.joinDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Referral Code: {selectedMember.referralCode}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPointsModal(true)}
                      className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      {t('tools.customerLoyalty.addPoints', 'Add Points')}
                    </button>
                    <button
                      onClick={() => setShowRedeemModal(true)}
                      className={`flex-1 py-2 rounded-lg font-medium ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Gift className="w-4 h-4 inline mr-1" />
                      {t('tools.customerLoyalty.redeem', 'Redeem')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.customerLoyalty.selectAMemberToView', 'Select a member to view details')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.customerLoyalty.availableRewards', 'Available Rewards')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_REWARDS.filter((r) => r.isActive).map((reward) => (
                <div
                  key={reward.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {reward.category}
                    </span>
                    {reward.tier !== 'all' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TIER_CONFIG[reward.tier].bgColor} ${TIER_CONFIG[reward.tier].color}`}>
                        {reward.tier.toUpperCase()}+
                      </span>
                    )}
                  </div>
                  <h3 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {reward.name}
                  </h3>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {reward.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#0D9488] font-bold">{reward.pointsCost.toLocaleString()} pts</span>
                    <Gift className="w-5 h-5 text-[#0D9488]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.customerLoyalty.pointsTransactions', 'Points Transactions')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    <th className="text-left py-3 px-4">{t('tools.customerLoyalty.date', 'Date')}</th>
                    <th className="text-left py-3 px-4">{t('tools.customerLoyalty.member', 'Member')}</th>
                    <th className="text-left py-3 px-4">{t('tools.customerLoyalty.type', 'Type')}</th>
                    <th className="text-left py-3 px-4">{t('tools.customerLoyalty.description', 'Description')}</th>
                    <th className="text-right py-3 px-4">{t('tools.customerLoyalty.points', 'Points')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice().reverse().map((transaction) => {
                    const member = members.find((m) => m.id === transaction.memberId);
                    return (
                      <tr
                        key={transaction.id}
                        className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {member ? `${member.firstName} ${member.lastName}` : 'Unknown'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'purchase'
                              ? 'bg-green-100 text-green-800'
                              : transaction.type === 'redemption'
                              ? 'bg-purple-100 text-purple-800'
                              : transaction.type === 'bonus'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {transaction.description}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${
                          transaction.points >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {transaction.points >= 0 ? '+' : ''}{transaction.points.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.customerLoyalty.noTransactionsYet', 'No transactions yet')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerLoyalty.totalMembers', 'Total Members')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.totalMembers}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerLoyalty.activeMembers30d', 'Active Members (30d)')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.activeMembers}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerLoyalty.pointsIssued', 'Points Issued')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.totalPointsIssued.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerLoyalty.avgSpend', 'Avg. Spend')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(analytics.averageSpend)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tier Distribution */}
            <div className={`md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.customerLoyalty.tierDistribution', 'Tier Distribution')}
              </h3>
              <div className="space-y-4">
                {(Object.keys(TIER_CONFIG) as MemberTier[]).map((tier) => {
                  const count = analytics.tierDistribution[tier] || 0;
                  const percentage = analytics.totalMembers > 0 ? (count / analytics.totalMembers) * 100 : 0;
                  return (
                    <div key={tier}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`capitalize ${TIER_CONFIG[tier].color}`}>{tier}</span>
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{count} members</span>
                      </div>
                      <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-2 rounded-full ${TIER_CONFIG[tier].bgColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Spend Card */}
            <div className={`md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.customerLoyalty.programOverview', 'Program Overview')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerLoyalty.totalLifetimeSpend', 'Total Lifetime Spend')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(analytics.totalLifetimeSpend)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customerLoyalty.pointsRedeemed', 'Points Redeemed')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.totalPointsRedeemed.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showMemberForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.customerLoyalty.addNewMember', 'Add New Member')}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.customerLoyalty.firstName', 'First Name *')}
                    </label>
                    <input
                      type="text"
                      value={newMember.firstName || ''}
                      onChange={(e) => setNewMember((prev) => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.customerLoyalty.lastName', 'Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={newMember.lastName || ''}
                      onChange={(e) => setNewMember((prev) => ({ ...prev, lastName: e.target.value }))}
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
                    {t('tools.customerLoyalty.email', 'Email *')}
                  </label>
                  <input
                    type="email"
                    value={newMember.email || ''}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerLoyalty.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={newMember.phone || ''}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerLoyalty.dateOfBirth', 'Date of Birth')}
                  </label>
                  <input
                    type="date"
                    value={newMember.dateOfBirth || ''}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowMemberForm(false); setNewMember({}); }}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.customerLoyalty.cancel', 'Cancel')}
                </button>
                <button
                  onClick={addMember}
                  className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
                >
                  {t('tools.customerLoyalty.addMember2', 'Add Member')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Points Modal */}
        {showPointsModal && selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.customerLoyalty.addPointsFromPurchase', 'Add Points from Purchase')}
              </h2>

              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Member: {selectedMember.firstName} {selectedMember.lastName}
                <br />
                <span className="text-sm">
                  Points multiplier: {TIER_CONFIG[selectedMember.tier].multiplier}x ({selectedMember.tier})
                </span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerLoyalty.orderAmount', 'Order Amount ($)')}
                  </label>
                  <input
                    type="number"
                    value={pointsToAdd.orderAmount || ''}
                    onChange={(e) => setPointsToAdd((prev) => ({ ...prev, orderAmount: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    step="0.01"
                    min="0"
                  />
                </div>

                {pointsToAdd.orderAmount > 0 && (
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.customerLoyalty.pointsToEarn', 'Points to earn:')}
                    </p>
                    <p className="text-2xl font-bold text-[#0D9488]">
                      +{Math.floor(pointsToAdd.orderAmount * POINTS_PER_DOLLAR * TIER_CONFIG[selectedMember.tier].multiplier).toLocaleString()} pts
                    </p>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.customerLoyalty.descriptionOptional', 'Description (optional)')}
                  </label>
                  <input
                    type="text"
                    value={pointsToAdd.description}
                    onChange={(e) => setPointsToAdd((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder={t('tools.customerLoyalty.orderReferenceOrNotes', 'Order reference or notes')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowPointsModal(false); setPointsToAdd({ amount: 0, orderAmount: 0, description: '' }); }}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.customerLoyalty.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={addPointsFromPurchase}
                  className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7B6F]"
                >
                  {t('tools.customerLoyalty.addPoints2', 'Add Points')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Modal */}
        {showRedeemModal && selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-lg`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.customerLoyalty.redeemReward', 'Redeem Reward')}
              </h2>

              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Available Points: <span className="text-[#0D9488] font-bold">{selectedMember.points.toLocaleString()}</span>
              </p>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {SAMPLE_REWARDS.filter((r) => r.isActive).map((reward) => {
                  const canRedeem = selectedMember.points >= reward.pointsCost;
                  const tiers: MemberTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
                  const meetsTierRequirement = reward.tier === 'all' ||
                    tiers.indexOf(selectedMember.tier) >= tiers.indexOf(reward.tier);

                  return (
                    <div
                      key={reward.id}
                      className={`p-4 rounded-lg border ${
                        !canRedeem || !meetsTierRequirement
                          ? theme === 'dark' ? 'border-gray-700 opacity-50' : 'border-gray-200 opacity-50'
                          : theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {reward.name}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {reward.description}
                          </p>
                          <p className="text-[#0D9488] font-bold mt-1">{reward.pointsCost.toLocaleString()} pts</p>
                        </div>
                        <button
                          onClick={() => { redeemReward(reward); setShowRedeemModal(false); }}
                          disabled={!canRedeem || !meetsTierRequirement}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            canRedeem && meetsTierRequirement
                              ? t('tools.customerLoyalty.bg0d9488TextWhiteHover', 'bg-[#0D9488] text-white hover:bg-[#0B7B6F]') : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {t('tools.customerLoyalty.redeem2', 'Redeem')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowRedeemModal(false)}
                className={`w-full mt-4 py-2 rounded-lg font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.customerLoyalty.close', 'Close')}
              </button>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg shadow-lg animate-pulse">
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default CustomerLoyaltyTool;
