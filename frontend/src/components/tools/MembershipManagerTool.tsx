'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  CreditCard,
  Calendar,
  Dumbbell,
  UserPlus,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Activity,
  Bell,
  ClipboardList,
  TrendingUp,
  UserCheck,
  CalendarCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

// Types
interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  membershipType: string;
  membershipPlanId?: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'frozen';
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes?: string;
  createdAt: string;
  photo?: string;
}

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // in months
  price: number;
  features: string[];
  isActive: boolean;
}

interface CheckIn {
  id: string;
  memberId: string;
  memberName: string;
  checkInTime: string;
  checkOutTime?: string;
  notes?: string;
}

interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  type: 'membership' | 'class' | 'fee' | 'other';
  description: string;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online';
  status: 'paid' | 'pending' | 'overdue';
}

interface ClassSession {
  id: string;
  name: string;
  instructor: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  enrolledMembers: string[];
  price: number;
  description?: string;
}

interface MembershipData {
  members: Member[];
  plans: MembershipPlan[];
  checkIns: CheckIn[];
  payments: Payment[];
  classes: ClassSession[];
}

type TabType = 'dashboard' | 'members' | 'plans' | 'checkins' | 'payments' | 'classes';

const STORAGE_KEY = 'wants_membership_manager';

const initialData: MembershipData = {
  members: [],
  plans: [
    {
      id: '1',
      name: 'Basic Monthly',
      description: 'Access to gym floor and cardio equipment',
      duration: 1,
      price: 29.99,
      features: ['Gym floor access', 'Cardio equipment', 'Locker room'],
      isActive: true,
    },
    {
      id: '2',
      name: 'Premium Monthly',
      description: 'Full access including classes and pool',
      duration: 1,
      price: 49.99,
      features: ['All Basic features', 'Group classes', 'Pool access', 'Sauna'],
      isActive: true,
    },
    {
      id: '3',
      name: 'Annual VIP',
      description: 'Annual membership with all amenities and personal training sessions',
      duration: 12,
      price: 499.99,
      features: ['All Premium features', '2 PT sessions/month', 'Guest passes', 'Priority booking'],
      isActive: true,
    },
  ],
  checkIns: [],
  payments: [],
  classes: [],
};

const STATUS_COLORS = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  expired: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  frozen: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const PAYMENT_STATUS_COLORS = {
  paid: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  overdue: 'bg-red-500/10 text-red-500 border-red-500/20',
};

// Column configuration for exports
const memberColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'membershipType', header: 'Membership Type', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'expiryDate', header: 'Expiry Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'emergencyContactName', header: 'Emergency Contact', type: 'string' },
  { key: 'emergencyContactPhone', header: 'Emergency Phone', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

// Column configuration for members export
const membersData: Member[] = [];

interface MembershipManagerToolProps {
  uiConfig?: UIConfig;
}

export const MembershipManagerTool: React.FC<MembershipManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use useToolData hook for managing members
  const {
    data: members,
    addItem: addMember,
    updateItem: updateMember,
    deleteItem: deleteMember,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    isLoading: isDataLoading,
  } = useToolData<Member>('membership-manager-members', [], memberColumns);

  // Local state for other data types
  const [data, setData] = useState<MembershipData>(initialData);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Form states
  const [memberForm, setMemberForm] = useState<Partial<Member>>({});
  const [planForm, setPlanForm] = useState<Partial<MembershipPlan>>({});
  const [checkInForm, setCheckInForm] = useState<Partial<CheckIn>>({});
  const [paymentForm, setPaymentForm] = useState<Partial<Payment>>({});
  const [classForm, setClassForm] = useState<Partial<ClassSession>>({});

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params) {
        setIsPrefilled(true);
        // Pre-fill member form if we have name/email data
        if (params.name || params.email) {
          const nameParts = (params.name || '').split(' ');
          setMemberForm({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: params.email || '',
            phone: params.phone || '',
          });
          setActiveTab('members');
          setShowForm(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Load from localStorage for other data types
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({ ...initialData, ...parsed });
      } catch (e) {
        console.error('Failed to load membership data');
      }
    }
  }, []);

  // Save other data types to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Dashboard stats
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const expiredMembers = members.filter(m => m.status === 'expired').length;
    const frozenMembers = members.filter(m => m.status === 'frozen').length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth = data.payments
      .filter(p => p.status === 'paid' && new Date(p.paymentDate) >= startOfMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const checkInsToday = data.checkIns.filter(c => c.checkInTime.startsWith(todayStr)).length;

    // Members expiring in next 7 days
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringMembers = members.filter(m => {
      const expiry = new Date(m.expiryDate);
      return m.status === 'active' && expiry >= now && expiry <= sevenDaysFromNow;
    }).length;

    return {
      totalMembers,
      activeMembers,
      expiredMembers,
      frozenMembers,
      revenueThisMonth,
      checkInsToday,
      expiringMembers,
    };
  }, [members, data.payments, data.checkIns]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch =
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, statusFilter]);

  // Reset forms
  const resetForms = () => {
    setMemberForm({});
    setPlanForm({});
    setCheckInForm({});
    setPaymentForm({});
    setClassForm({});
    setShowForm(false);
    setEditingId(null);
  };

  // Member CRUD
  const saveMember = async () => {
    if (!memberForm.firstName || !memberForm.lastName || !memberForm.email) return;

    const memberData: Member = {
      id: editingId || Date.now().toString(),
      firstName: memberForm.firstName || '',
      lastName: memberForm.lastName || '',
      email: memberForm.email || '',
      phone: memberForm.phone || '',
      address: memberForm.address || '',
      membershipType: memberForm.membershipType || 'Basic Monthly',
      membershipPlanId: memberForm.membershipPlanId,
      startDate: memberForm.startDate || new Date().toISOString().split('T')[0],
      expiryDate: memberForm.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: memberForm.status || 'active',
      emergencyContactName: memberForm.emergencyContactName || '',
      emergencyContactPhone: memberForm.emergencyContactPhone || '',
      notes: memberForm.notes,
      createdAt: editingId ? (members.find(m => m.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    try {
      if (editingId) {
        updateMember(editingId, memberData);
      } else {
        addMember(memberData);
      }
    } catch (error) {
      console.error('Failed to save member:', error);
    }

    resetForms();
  };

  // Plan CRUD
  const savePlan = async () => {
    if (!planForm.name || !planForm.price) return;

    const planData: MembershipPlan = {
      id: editingId || Date.now().toString(),
      name: planForm.name || '',
      description: planForm.description || '',
      duration: planForm.duration || 1,
      price: planForm.price || 0,
      features: planForm.features || [],
      isActive: planForm.isActive !== false,
    };

    try {
      if (editingId) {
        await api.put(`/business/membership-plans/${editingId}`, planData).catch(() => null);
        setData(prev => ({
          ...prev,
          plans: prev.plans.map(p => p.id === editingId ? planData : p),
        }));
      } else {
        await api.post('/business/membership-plans', planData).catch(() => null);
        setData(prev => ({
          ...prev,
          plans: [...prev.plans, planData],
        }));
      }
    } catch (error) {
      console.error('Failed to save plan:', error);
    }

    resetForms();
  };

  const deletePlan = (id: string) => {
    setData(prev => ({
      ...prev,
      plans: prev.plans.filter(p => p.id !== id),
    }));
  };

  // Check-in CRUD
  const saveCheckIn = async () => {
    if (!checkInForm.memberId) return;

    const member = members.find(m => m.id === checkInForm.memberId);
    if (!member) return;

    const checkInData: CheckIn = {
      id: editingId || Date.now().toString(),
      memberId: checkInForm.memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      checkInTime: checkInForm.checkInTime || new Date().toISOString(),
      checkOutTime: checkInForm.checkOutTime,
      notes: checkInForm.notes,
    };

    try {
      await api.post('/business/check-ins', checkInData).catch(() => null);
      if (editingId) {
        setData(prev => ({
          ...prev,
          checkIns: prev.checkIns.map(c => c.id === editingId ? checkInData : c),
        }));
      } else {
        setData(prev => ({
          ...prev,
          checkIns: [checkInData, ...prev.checkIns],
        }));
      }
    } catch (error) {
      console.error('Failed to save check-in:', error);
    }

    resetForms();
  };

  const checkOutMember = (checkInId: string) => {
    setData(prev => ({
      ...prev,
      checkIns: prev.checkIns.map(c =>
        c.id === checkInId ? { ...c, checkOutTime: new Date().toISOString() } : c
      ),
    }));
  };

  // Payment CRUD
  const savePayment = async () => {
    if (!paymentForm.memberId || !paymentForm.amount) return;

    const member = members.find(m => m.id === paymentForm.memberId);
    if (!member) return;

    const paymentData: Payment = {
      id: editingId || Date.now().toString(),
      memberId: paymentForm.memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      amount: paymentForm.amount || 0,
      type: paymentForm.type || 'membership',
      description: paymentForm.description || '',
      paymentDate: paymentForm.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentForm.paymentMethod || 'card',
      status: paymentForm.status || 'paid',
    };

    try {
      await api.post('/business/member-payments', paymentData).catch(() => null);
      if (editingId) {
        setData(prev => ({
          ...prev,
          payments: prev.payments.map(p => p.id === editingId ? paymentData : p),
        }));
      } else {
        setData(prev => ({
          ...prev,
          payments: [paymentData, ...prev.payments],
        }));
      }
    } catch (error) {
      console.error('Failed to save payment:', error);
    }

    resetForms();
  };

  const deletePayment = (id: string) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.filter(p => p.id !== id),
    }));
  };

  // Class CRUD
  const saveClass = () => {
    if (!classForm.name || !classForm.instructor) return;

    const classData: ClassSession = {
      id: editingId || Date.now().toString(),
      name: classForm.name || '',
      instructor: classForm.instructor || '',
      dayOfWeek: classForm.dayOfWeek || 1,
      startTime: classForm.startTime || '09:00',
      endTime: classForm.endTime || '10:00',
      maxCapacity: classForm.maxCapacity || 20,
      enrolledMembers: classForm.enrolledMembers || [],
      price: classForm.price || 0,
      description: classForm.description,
    };

    if (editingId) {
      setData(prev => ({
        ...prev,
        classes: prev.classes.map(c => c.id === editingId ? classData : c),
      }));
    } else {
      setData(prev => ({
        ...prev,
        classes: [...prev.classes, classData],
      }));
    }

    resetForms();
  };

  const deleteClass = (id: string) => {
    setData(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== id),
    }));
  };

  // Edit handlers
  const editMember = (member: Member) => {
    setMemberForm(member);
    setEditingId(member.id);
    setShowForm(true);
  };

  const editPlan = (plan: MembershipPlan) => {
    setPlanForm(plan);
    setEditingId(plan.id);
    setShowForm(true);
  };

  const editClass = (cls: ClassSession) => {
    setClassForm(cls);
    setEditingId(cls.id);
    setShowForm(true);
  };

  // Quick check-in
  const quickCheckIn = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member || member.status !== 'active') return;

    const checkInData: CheckIn = {
      id: Date.now().toString(),
      memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      checkInTime: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      checkIns: [checkInData, ...prev.checkIns],
    }));
  };

  // Style classes
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    isDark
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const buttonDanger = `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm bg-red-500/10 hover:bg-red-500/20 text-red-500`;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'plans', label: 'Plans', icon: ClipboardList },
    { id: 'checkins', label: 'Check-ins', icon: UserCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'classes', label: 'Classes', icon: Calendar },
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className={`max-w-7xl mx-auto p-4 md:p-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl">
            <Dumbbell className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.membershipManager.membershipManager', 'Membership Manager')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.membershipManager.gymClubMembershipManagement', 'Gym & club membership management')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExportDropdown
            onExportCSV={() => exportToCSV(members, memberColumns, { filename: 'members' })}
            onExportExcel={() => exportToExcel(members, memberColumns, { filename: 'members' })}
            onExportJSON={() => exportToJSON(members, { filename: 'members' })}
            onExportPDF={() => exportToPDF(members, memberColumns, { filename: 'members', title: 'Membership Report' })}
            onPrint={() => printData(members, memberColumns, { title: 'Membership Report' })}
            onCopyToClipboard={() => copyUtil(members, memberColumns)}
            disabled={members.length === 0}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
          <WidgetEmbedButton toolSlug="membership-manager" toolName="Membership Manager" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            showLabel={true}
          />
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span className="text-sm text-cyan-500 font-medium">{t('tools.membershipManager.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className={`flex gap-1 min-w-max p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as TabType); resetForms(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm'
                    : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${cardClass} p-4`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.membershipManager.totalMembers', 'Total Members')}</p>
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                </div>
              </div>
            </div>
            <div className={`${cardClass} p-4`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.membershipManager.active', 'Active')}</p>
                  <p className="text-2xl font-bold text-green-500">{stats.activeMembers}</p>
                </div>
              </div>
            </div>
            <div className={`${cardClass} p-4`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.membershipManager.revenueMonth', 'Revenue (Month)')}</p>
                  <p className="text-2xl font-bold text-teal-500">${stats.revenueThisMonth.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className={`${cardClass} p-4`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <CalendarCheck className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.membershipManager.checkInsToday', 'Check-ins Today')}</p>
                  <p className="text-2xl font-bold text-purple-500">{stats.checkInsToday}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {(stats.expiringMembers > 0 || stats.expiredMembers > 0) && (
            <div className={`${cardClass} p-4`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" />
                {t('tools.membershipManager.renewalReminders', 'Renewal Reminders')}
              </h3>
              <div className="space-y-2">
                {stats.expiringMembers > 0 && (
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>{stats.expiringMembers} member(s) expiring within 7 days</span>
                  </div>
                )}
                {stats.expiredMembers > 0 && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>{stats.expiredMembers} member(s) with expired membership</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Check-ins */}
          <div className={cardClass}>
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-500" />
                {t('tools.membershipManager.recentCheckIns', 'Recent Check-ins')}
              </h3>
            </div>
            <div className="p-4">
              {data.checkIns.slice(0, 5).length === 0 ? (
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.membershipManager.noRecentCheckIns', 'No recent check-ins')}</p>
              ) : (
                <div className="space-y-2">
                  {data.checkIns.slice(0, 5).map(checkIn => (
                    <div key={checkIn.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div>
                        <p className="font-medium">{checkIn.memberName}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(checkIn.checkInTime).toLocaleString()}
                        </p>
                      </div>
                      {!checkIn.checkOutTime && (
                        <button
                          onClick={() => checkOutMember(checkIn.id)}
                          className="px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-lg text-sm hover:bg-cyan-500/20"
                        >
                          {t('tools.membershipManager.checkOut', 'Check Out')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.membershipManager.searchMembers', 'Search members...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
              style={{ width: 'auto' }}
            >
              <option value="all">{t('tools.membershipManager.allStatus', 'All Status')}</option>
              <option value="active">{t('tools.membershipManager.active2', 'Active')}</option>
              <option value="expired">{t('tools.membershipManager.expired', 'Expired')}</option>
              <option value="cancelled">{t('tools.membershipManager.cancelled', 'Cancelled')}</option>
              <option value="frozen">{t('tools.membershipManager.frozen', 'Frozen')}</option>
            </select>
            <button onClick={() => { setShowForm(true); setEditingId(null); setMemberForm({}); }} className={buttonPrimary}>
              <UserPlus className="w-5 h-5" />
              {t('tools.membershipManager.addMember', 'Add Member')}
            </button>
          </div>

          {/* Member Form Modal */}
          {showForm && (
            <div className={`${cardClass} p-6`}>
              <h3 className="text-lg font-semibold mb-4">{editingId ? t('tools.membershipManager.editMember', 'Edit Member') : t('tools.membershipManager.addNewMember', 'Add New Member')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={memberForm.firstName || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.firstName2', 'First name')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={memberForm.lastName || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.lastName2', 'Last name')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.email', 'Email *')}</label>
                  <input
                    type="email"
                    value={memberForm.email || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.emailExampleCom', 'email@example.com')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={memberForm.phone || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.phoneNumber', 'Phone number')}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.membershipManager.address', 'Address')}</label>
                  <input
                    type="text"
                    value={memberForm.address || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.fullAddress', 'Full address')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.membershipPlan', 'Membership Plan')}</label>
                  <select
                    value={memberForm.membershipPlanId || ''}
                    onChange={(e) => {
                      const plan = data.plans.find(p => p.id === e.target.value);
                      setMemberForm({
                        ...memberForm,
                        membershipPlanId: e.target.value,
                        membershipType: plan?.name || '',
                      });
                    }}
                    className={inputClass}
                  >
                    <option value="">{t('tools.membershipManager.selectPlan', 'Select plan')}</option>
                    {data.plans.filter(p => p.isActive).map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.name} - ${plan.price}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.startDate', 'Start Date')}</label>
                  <input
                    type="date"
                    value={memberForm.startDate || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, startDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.expiryDate', 'Expiry Date')}</label>
                  <input
                    type="date"
                    value={memberForm.expiryDate || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, expiryDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.status', 'Status')}</label>
                  <select
                    value={memberForm.status || 'active'}
                    onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value as Member['status'] })}
                    className={inputClass}
                  >
                    <option value="active">{t('tools.membershipManager.active3', 'Active')}</option>
                    <option value="expired">{t('tools.membershipManager.expired2', 'Expired')}</option>
                    <option value="cancelled">{t('tools.membershipManager.cancelled2', 'Cancelled')}</option>
                    <option value="frozen">{t('tools.membershipManager.frozen2', 'Frozen')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.emergencyContactName', 'Emergency Contact Name')}</label>
                  <input
                    type="text"
                    value={memberForm.emergencyContactName || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, emergencyContactName: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.contactName', 'Contact name')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.emergencyContactPhone', 'Emergency Contact Phone')}</label>
                  <input
                    type="tel"
                    value={memberForm.emergencyContactPhone || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, emergencyContactPhone: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.contactPhone', 'Contact phone')}
                  />
                </div>
                <div className="lg:col-span-3">
                  <label className={labelClass}>{t('tools.membershipManager.notes', 'Notes')}</label>
                  <textarea
                    value={memberForm.notes || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
                    className={`${inputClass} h-20`}
                    placeholder={t('tools.membershipManager.additionalNotes', 'Additional notes...')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveMember} className={buttonPrimary}>
                  <Check className="w-4 h-4" />
                  {editingId ? t('tools.membershipManager.update', 'Update') : t('tools.membershipManager.save', 'Save')} Member
                </button>
                <button onClick={resetForms} className={buttonSecondary}>
                  <X className="w-4 h-4" />
                  {t('tools.membershipManager.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            {filteredMembers.length === 0 ? (
              <div className={`${cardClass} p-8 text-center`}>
                <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.membershipManager.noMembersFound', 'No members found')}</p>
              </div>
            ) : (
              filteredMembers.map(member => (
                <div key={member.id} className={`${cardClass} p-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{member.firstName} {member.lastName}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_COLORS[member.status]}`}>
                            {member.status}
                          </span>
                        </div>
                        <div className={`flex flex-wrap items-center gap-3 text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                        <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="text-cyan-500 font-medium">{member.membershipType}</span>
                          {' - '}
                          Expires: {new Date(member.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.status === 'active' && (
                        <button
                          onClick={() => quickCheckIn(member.id)}
                          className="px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-sm hover:bg-green-500/20 flex items-center gap-1"
                        >
                          <UserCheck className="w-4 h-4" />
                          {t('tools.membershipManager.checkIn', 'Check In')}
                        </button>
                      )}
                      <button onClick={() => editMember(member)} className={buttonSecondary}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMember(member.id)} className={buttonDanger}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setShowForm(true); setEditingId(null); setPlanForm({}); }} className={buttonPrimary}>
              <Plus className="w-5 h-5" />
              {t('tools.membershipManager.addPlan', 'Add Plan')}
            </button>
          </div>

          {/* Plan Form */}
          {showForm && (
            <div className={`${cardClass} p-6`}>
              <h3 className="text-lg font-semibold mb-4">{editingId ? t('tools.membershipManager.editPlan', 'Edit Plan') : t('tools.membershipManager.addNewPlan', 'Add New Plan')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.planName', 'Plan Name *')}</label>
                  <input
                    type="text"
                    value={planForm.name || ''}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.eGPremiumMonthly', 'e.g., Premium Monthly')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.price', 'Price *')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={planForm.price || ''}
                    onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) })}
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.durationMonths', 'Duration (months)')}</label>
                  <input
                    type="number"
                    value={planForm.duration || ''}
                    onChange={(e) => setPlanForm({ ...planForm, duration: parseInt(e.target.value) })}
                    className={inputClass}
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.active4', 'Active')}</label>
                  <select
                    value={planForm.isActive !== false ? 'true' : 'false'}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.value === 'true' })}
                    className={inputClass}
                  >
                    <option value="true">{t('tools.membershipManager.yes', 'Yes')}</option>
                    <option value="false">{t('tools.membershipManager.no', 'No')}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.membershipManager.description', 'Description')}</label>
                  <textarea
                    value={planForm.description || ''}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    className={`${inputClass} h-20`}
                    placeholder={t('tools.membershipManager.planDescription', 'Plan description...')}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.membershipManager.featuresCommaSeparated', 'Features (comma-separated)')}</label>
                  <input
                    type="text"
                    value={(planForm.features || []).join(', ')}
                    onChange={(e) => setPlanForm({ ...planForm, features: e.target.value.split(',').map(f => f.trim()).filter(f => f) })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.feature1Feature2Feature', 'Feature 1, Feature 2, Feature 3')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={savePlan} className={buttonPrimary}>
                  <Check className="w-4 h-4" />
                  {editingId ? t('tools.membershipManager.update2', 'Update') : t('tools.membershipManager.save2', 'Save')} Plan
                </button>
                <button onClick={resetForms} className={buttonSecondary}>
                  <X className="w-4 h-4" />
                  {t('tools.membershipManager.cancel2', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.plans.map(plan => (
              <div key={plan.id} className={`${cardClass} p-6 ${!plan.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{plan.name}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{plan.duration} month(s)</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${plan.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                    {plan.isActive ? t('tools.membershipManager.active5', 'Active') : t('tools.membershipManager.inactive', 'Inactive')}
                  </span>
                </div>
                <p className="text-3xl font-bold text-cyan-500 mb-3">${plan.price.toFixed(2)}</p>
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
                {plan.features.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-700">
                  <button onClick={() => editPlan(plan)} className={`${buttonSecondary} flex-1`}>
                    <Edit2 className="w-4 h-4" />
                    {t('tools.membershipManager.edit', 'Edit')}
                  </button>
                  <button onClick={() => deletePlan(plan.id)} className={buttonDanger}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-ins Tab */}
      {activeTab === 'checkins' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setShowForm(true); setEditingId(null); setCheckInForm({}); }} className={buttonPrimary}>
              <Plus className="w-5 h-5" />
              {t('tools.membershipManager.manualCheckIn2', 'Manual Check-in')}
            </button>
          </div>

          {/* Check-in Form */}
          {showForm && (
            <div className={`${cardClass} p-6`}>
              <h3 className="text-lg font-semibold mb-4">{t('tools.membershipManager.manualCheckIn', 'Manual Check-in')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.member', 'Member *')}</label>
                  <select
                    value={checkInForm.memberId || ''}
                    onChange={(e) => setCheckInForm({ ...checkInForm, memberId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">{t('tools.membershipManager.selectMember', 'Select member')}</option>
                    {members.filter(m => m.status === 'active').map(member => (
                      <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.notes2', 'Notes')}</label>
                  <input
                    type="text"
                    value={checkInForm.notes || ''}
                    onChange={(e) => setCheckInForm({ ...checkInForm, notes: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.optionalNotes', 'Optional notes')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveCheckIn} className={buttonPrimary}>
                  <Check className="w-4 h-4" />
                  {t('tools.membershipManager.checkIn2', 'Check In')}
                </button>
                <button onClick={resetForms} className={buttonSecondary}>
                  <X className="w-4 h-4" />
                  {t('tools.membershipManager.cancel3', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Check-ins List */}
          <div className={cardClass}>
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">{t('tools.membershipManager.checkInLog', 'Check-in Log')}</h3>
            </div>
            <div className="divide-y divide-gray-700">
              {data.checkIns.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarCheck className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.membershipManager.noCheckInsRecorded', 'No check-ins recorded')}</p>
                </div>
              ) : (
                data.checkIns.map(checkIn => (
                  <div key={checkIn.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{checkIn.memberName}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        In: {new Date(checkIn.checkInTime).toLocaleString()}
                        {checkIn.checkOutTime && ` | Out: ${new Date(checkIn.checkOutTime).toLocaleString()}`}
                      </p>
                      {checkIn.notes && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{checkIn.notes}</p>
                      )}
                    </div>
                    {!checkIn.checkOutTime && (
                      <button
                        onClick={() => checkOutMember(checkIn.id)}
                        className="px-3 py-1.5 bg-cyan-500/10 text-cyan-500 rounded-lg text-sm hover:bg-cyan-500/20"
                      >
                        {t('tools.membershipManager.checkOut2', 'Check Out')}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setShowForm(true); setEditingId(null); setPaymentForm({}); }} className={buttonPrimary}>
              <Plus className="w-5 h-5" />
              {t('tools.membershipManager.recordPayment2', 'Record Payment')}
            </button>
          </div>

          {/* Payment Form */}
          {showForm && (
            <div className={`${cardClass} p-6`}>
              <h3 className="text-lg font-semibold mb-4">{t('tools.membershipManager.recordPayment', 'Record Payment')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.member2', 'Member *')}</label>
                  <select
                    value={paymentForm.memberId || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, memberId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">{t('tools.membershipManager.selectMember2', 'Select member')}</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.amount', 'Amount *')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.type', 'Type')}</label>
                  <select
                    value={paymentForm.type || 'membership'}
                    onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as Payment['type'] })}
                    className={inputClass}
                  >
                    <option value="membership">{t('tools.membershipManager.membership', 'Membership')}</option>
                    <option value="class">{t('tools.membershipManager.classFee', 'Class Fee')}</option>
                    <option value="fee">{t('tools.membershipManager.otherFee', 'Other Fee')}</option>
                    <option value="other">{t('tools.membershipManager.other', 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.paymentMethod', 'Payment Method')}</label>
                  <select
                    value={paymentForm.paymentMethod || 'card'}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as Payment['paymentMethod'] })}
                    className={inputClass}
                  >
                    <option value="card">{t('tools.membershipManager.card', 'Card')}</option>
                    <option value="cash">{t('tools.membershipManager.cash', 'Cash')}</option>
                    <option value="bank_transfer">{t('tools.membershipManager.bankTransfer', 'Bank Transfer')}</option>
                    <option value="online">{t('tools.membershipManager.online', 'Online')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.paymentDate', 'Payment Date')}</label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.status2', 'Status')}</label>
                  <select
                    value={paymentForm.status || 'paid'}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as Payment['status'] })}
                    className={inputClass}
                  >
                    <option value="paid">{t('tools.membershipManager.paid', 'Paid')}</option>
                    <option value="pending">{t('tools.membershipManager.pending', 'Pending')}</option>
                    <option value="overdue">{t('tools.membershipManager.overdue', 'Overdue')}</option>
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelClass}>{t('tools.membershipManager.description2', 'Description')}</label>
                  <input
                    type="text"
                    value={paymentForm.description || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.paymentDescription', 'Payment description')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={savePayment} className={buttonPrimary}>
                  <Check className="w-4 h-4" />
                  {t('tools.membershipManager.savePayment', 'Save Payment')}
                </button>
                <button onClick={resetForms} className={buttonSecondary}>
                  <X className="w-4 h-4" />
                  {t('tools.membershipManager.cancel4', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Payments List */}
          <div className={cardClass}>
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">{t('tools.membershipManager.paymentHistory', 'Payment History')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.membershipManager.member3', 'Member')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.membershipManager.amount2', 'Amount')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.membershipManager.type2', 'Type')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.membershipManager.date', 'Date')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.membershipManager.status3', 'Status')}</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">{t('tools.membershipManager.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center">
                        <CreditCard className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.membershipManager.noPaymentsRecorded', 'No payments recorded')}</p>
                      </td>
                    </tr>
                  ) : (
                    data.payments.map(payment => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-sm">{payment.memberName}</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-500">${payment.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm capitalize">{payment.type}</td>
                        <td className="px-4 py-3 text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${PAYMENT_STATUS_COLORS[payment.status]}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => deletePayment(payment.id)} className={buttonDanger}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setShowForm(true); setEditingId(null); setClassForm({}); }} className={buttonPrimary}>
              <Plus className="w-5 h-5" />
              {t('tools.membershipManager.addClass', 'Add Class')}
            </button>
          </div>

          {/* Class Form */}
          {showForm && (
            <div className={`${cardClass} p-6`}>
              <h3 className="text-lg font-semibold mb-4">{editingId ? t('tools.membershipManager.editClass', 'Edit Class') : t('tools.membershipManager.addNewClass', 'Add New Class')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.className', 'Class Name *')}</label>
                  <input
                    type="text"
                    value={classForm.name || ''}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.eGMorningYoga', 'e.g., Morning Yoga')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.instructor', 'Instructor *')}</label>
                  <input
                    type="text"
                    value={classForm.instructor || ''}
                    onChange={(e) => setClassForm({ ...classForm, instructor: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.instructorName', 'Instructor name')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.dayOfWeek', 'Day of Week')}</label>
                  <select
                    value={classForm.dayOfWeek || 1}
                    onChange={(e) => setClassForm({ ...classForm, dayOfWeek: parseInt(e.target.value) })}
                    className={inputClass}
                  >
                    {dayNames.map((day, idx) => (
                      <option key={idx} value={idx}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.startTime', 'Start Time')}</label>
                  <input
                    type="time"
                    value={classForm.startTime || ''}
                    onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.endTime', 'End Time')}</label>
                  <input
                    type="time"
                    value={classForm.endTime || ''}
                    onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.maxCapacity', 'Max Capacity')}</label>
                  <input
                    type="number"
                    value={classForm.maxCapacity || ''}
                    onChange={(e) => setClassForm({ ...classForm, maxCapacity: parseInt(e.target.value) })}
                    className={inputClass}
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.membershipManager.price2', 'Price')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={classForm.price || ''}
                    onChange={(e) => setClassForm({ ...classForm, price: parseFloat(e.target.value) })}
                    className={inputClass}
                    placeholder={t('tools.membershipManager.000IncludedWithMembership', '0.00 (included with membership)')}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.membershipManager.description3', 'Description')}</label>
                  <textarea
                    value={classForm.description || ''}
                    onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                    className={`${inputClass} h-20`}
                    placeholder={t('tools.membershipManager.classDescription', 'Class description...')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveClass} className={buttonPrimary}>
                  <Check className="w-4 h-4" />
                  {editingId ? t('tools.membershipManager.update3', 'Update') : t('tools.membershipManager.save3', 'Save')} Class
                </button>
                <button onClick={resetForms} className={buttonSecondary}>
                  <X className="w-4 h-4" />
                  {t('tools.membershipManager.cancel5', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.classes.length === 0 ? (
              <div className={`${cardClass} p-8 text-center col-span-full`}>
                <Calendar className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.membershipManager.noClassesScheduled', 'No classes scheduled')}</p>
              </div>
            ) : (
              data.classes.map(cls => (
                <div key={cls.id} className={cardClass}>
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{cls.name}</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {dayNames[cls.dayOfWeek]} {cls.startTime} - {cls.endTime}
                        </p>
                      </div>
                      {cls.price > 0 && (
                        <span className="text-cyan-500 font-bold">${cls.price}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Instructor: {cls.instructor}
                    </p>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Capacity: {cls.enrolledMembers.length}/{cls.maxCapacity}
                    </p>
                    {cls.description && (
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{cls.description}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => editClass(cls)} className={`${buttonSecondary} flex-1`}>
                        <Edit2 className="w-4 h-4" />
                        {t('tools.membershipManager.edit2', 'Edit')}
                      </button>
                      <button onClick={() => deleteClass(cls.id)} className={buttonDanger}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipManagerTool;
