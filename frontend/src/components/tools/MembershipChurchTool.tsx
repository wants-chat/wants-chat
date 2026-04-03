'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Heart,
  Home,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
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
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface MembershipChurchToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  membershipDate: string;
  status: 'active' | 'inactive' | 'visitor' | 'transferred';
  membershipType: 'member' | 'visitor' | 'regular-attender' | 'youth' | 'senior';
  familyId: string;
  ministries: string[];
  skills: string[];
  notes: string;
  baptismDate: string;
  confirmationDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: string;
  updatedAt: string;
}

interface Family {
  id: string;
  familyName: string;
  headOfHousehold: string;
  address: string;
  phone: string;
  memberIds: string[];
  notes: string;
  createdAt: string;
}

interface Attendance {
  id: string;
  memberId: string;
  date: string;
  service: string;
  status: 'present' | 'absent' | 'online';
  notes: string;
  createdAt: string;
}

interface Visit {
  id: string;
  visitorName: string;
  email: string;
  phone: string;
  visitDate: string;
  howHeard: string;
  interests: string[];
  followUpStatus: 'pending' | 'contacted' | 'completed' | 'no-response';
  assignedTo: string;
  notes: string;
  createdAt: string;
}

type TabType = 'dashboard' | 'members' | 'families' | 'attendance' | 'visitors';
type StatusFilter = 'all' | 'active' | 'inactive' | 'visitor' | 'transferred';

// Column configuration for exports
const memberColumns: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'membershipType', header: 'Type', type: 'string' },
  { key: 'membershipDate', header: 'Member Since', type: 'date' },
  { key: 'baptismDate', header: 'Baptism Date', type: 'date' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const defaultMembers: Member[] = [];
const defaultFamilies: Family[] = [];
const defaultAttendance: Attendance[] = [];
const defaultVisitors: Visit[] = [];

export const MembershipChurchTool: React.FC<MembershipChurchToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData for backend sync
  const membersToolData = useToolData<Member>('church-members', defaultMembers, memberColumns);
  const familiesToolData = useToolData<Family>('church-families', defaultFamilies, []);
  const attendanceToolData = useToolData<Attendance>('church-attendance', defaultAttendance, []);
  const visitorsToolData = useToolData<Visit>('church-visitors', defaultVisitors, []);

  // Extract data and methods from hooks
  const members = membersToolData.data;
  const families = familiesToolData.data;
  const attendance = attendanceToolData.data;
  const visitors = visitorsToolData.data;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [editingVisitor, setEditingVisitor] = useState<Visit | null>(null);

  // Form states
  const [memberForm, setMemberForm] = useState<Partial<Member>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    membershipDate: new Date().toISOString().split('T')[0],
    status: 'active',
    membershipType: 'member',
    familyId: '',
    ministries: [],
    skills: [],
    notes: '',
    baptismDate: '',
    confirmationDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const [familyForm, setFamilyForm] = useState<Partial<Family>>({
    familyName: '',
    headOfHousehold: '',
    address: '',
    phone: '',
    memberIds: [],
    notes: '',
  });

  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    service: 'sunday-morning',
    selectedMembers: [] as string[],
  });

  const [visitorForm, setVisitorForm] = useState<Partial<Visit>>({
    visitorName: '',
    email: '',
    phone: '',
    visitDate: new Date().toISOString().split('T')[0],
    howHeard: '',
    interests: [],
    followUpStatus: 'pending',
    assignedTo: '',
    notes: '',
  });

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.name || params.firstName || params.lastName || params.email) {
        setMemberForm(prev => ({
          ...prev,
          firstName: params.firstName || (params.name?.split(' ')[0]) || prev.firstName,
          lastName: params.lastName || (params.name?.split(' ').slice(1).join(' ')) || prev.lastName,
          email: params.email || prev.email,
          phone: params.phone || prev.phone,
          notes: params.content || params.text || prev.notes,
        }));
        setShowMemberModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Computed values
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const matchesSearch = searchQuery === '' ||
        fullName.includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [members, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const activeMembers = members.filter(m => m.status === 'active').length;
    const inactiveMembers = members.filter(m => m.status === 'inactive').length;
    const visitorMembers = members.filter(m => m.status === 'visitor').length;
    const totalFamilies = families.length;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newMembersThisMonth = members.filter(m =>
      new Date(m.createdAt) >= thisMonth
    ).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAttendance = attendance.filter(a =>
      new Date(a.date) >= thirtyDaysAgo && a.status === 'present'
    ).length;

    const avgAttendance = members.length > 0
      ? Math.round((recentAttendance / 4) / members.length * 100)
      : 0;

    const pendingFollowUps = visitors.filter(v => v.followUpStatus === 'pending').length;

    return {
      activeMembers,
      inactiveMembers,
      visitorMembers,
      totalFamilies,
      newMembersThisMonth,
      avgAttendance,
      pendingFollowUps,
      totalVisitors: visitors.length,
    };
  }, [members, families, attendance, visitors]);

  // CRUD handlers
  const handleSaveMember = () => {
    if (!memberForm.firstName || !memberForm.lastName) return;

    if (editingMember) {
      membersToolData.updateItem(editingMember.id, {
        ...memberForm,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newMember: Member = {
        id: `member-${Date.now()}`,
        firstName: memberForm.firstName || '',
        lastName: memberForm.lastName || '',
        email: memberForm.email || '',
        phone: memberForm.phone || '',
        address: memberForm.address || '',
        city: memberForm.city || '',
        state: memberForm.state || '',
        zipCode: memberForm.zipCode || '',
        dateOfBirth: memberForm.dateOfBirth || '',
        membershipDate: memberForm.membershipDate || new Date().toISOString().split('T')[0],
        status: memberForm.status || 'active',
        membershipType: memberForm.membershipType || 'member',
        familyId: memberForm.familyId || '',
        ministries: memberForm.ministries || [],
        skills: memberForm.skills || [],
        notes: memberForm.notes || '',
        baptismDate: memberForm.baptismDate || '',
        confirmationDate: memberForm.confirmationDate || '',
        emergencyContactName: memberForm.emergencyContactName || '',
        emergencyContactPhone: memberForm.emergencyContactPhone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      membersToolData.addItem(newMember);
    }

    resetMemberForm();
    setShowMemberModal(false);
    setEditingMember(null);
  };

  const handleDeleteMember = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Member',
      message: 'Are you sure you want to delete this member?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      membersToolData.deleteItem(id);
    }
  };

  const handleSaveFamily = () => {
    if (!familyForm.familyName) return;

    if (editingFamily) {
      familiesToolData.updateItem(editingFamily.id, familyForm);
    } else {
      const newFamily: Family = {
        id: `family-${Date.now()}`,
        familyName: familyForm.familyName || '',
        headOfHousehold: familyForm.headOfHousehold || '',
        address: familyForm.address || '',
        phone: familyForm.phone || '',
        memberIds: familyForm.memberIds || [],
        notes: familyForm.notes || '',
        createdAt: new Date().toISOString(),
      };
      familiesToolData.addItem(newFamily);
    }

    resetFamilyForm();
    setShowFamilyModal(false);
    setEditingFamily(null);
  };

  const handleDeleteFamily = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Family',
      message: 'Are you sure you want to delete this family?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      familiesToolData.deleteItem(id);
    }
  };

  const handleRecordAttendance = () => {
    const newAttendanceRecords = attendanceForm.selectedMembers.map(memberId => ({
      id: `attendance-${Date.now()}-${memberId}`,
      memberId,
      date: attendanceForm.date,
      service: attendanceForm.service,
      status: 'present' as const,
      notes: '',
      createdAt: new Date().toISOString(),
    }));

    newAttendanceRecords.forEach(record => {
      attendanceToolData.addItem(record);
    });

    setAttendanceForm({
      date: new Date().toISOString().split('T')[0],
      service: 'sunday-morning',
      selectedMembers: [],
    });
    setShowAttendanceModal(false);
  };

  const handleSaveVisitor = () => {
    if (!visitorForm.visitorName) return;

    if (editingVisitor) {
      visitorsToolData.updateItem(editingVisitor.id, visitorForm);
    } else {
      const newVisitor: Visit = {
        id: `visitor-${Date.now()}`,
        visitorName: visitorForm.visitorName || '',
        email: visitorForm.email || '',
        phone: visitorForm.phone || '',
        visitDate: visitorForm.visitDate || new Date().toISOString().split('T')[0],
        howHeard: visitorForm.howHeard || '',
        interests: visitorForm.interests || [],
        followUpStatus: visitorForm.followUpStatus || 'pending',
        assignedTo: visitorForm.assignedTo || '',
        notes: visitorForm.notes || '',
        createdAt: new Date().toISOString(),
      };
      visitorsToolData.addItem(newVisitor);
    }

    resetVisitorForm();
    setShowVisitorModal(false);
    setEditingVisitor(null);
  };

  const handleDeleteVisitor = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Visitor',
      message: 'Are you sure you want to delete this visitor record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      visitorsToolData.deleteItem(id);
    }
  };

  const handleConvertVisitorToMember = (visitor: Visit) => {
    const nameParts = visitor.visitorName.split(' ');
    setMemberForm({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: visitor.email,
      phone: visitor.phone,
      status: 'active',
      membershipType: 'member',
      membershipDate: new Date().toISOString().split('T')[0],
      notes: `Converted from visitor. Original visit: ${visitor.visitDate}. ${visitor.notes}`,
    });
    setShowMemberModal(true);
    visitorsToolData.updateItem(visitor.id, { followUpStatus: 'completed' });
  };

  // Reset form helpers
  const resetMemberForm = () => {
    setMemberForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      dateOfBirth: '',
      membershipDate: new Date().toISOString().split('T')[0],
      status: 'active',
      membershipType: 'member',
      familyId: '',
      ministries: [],
      skills: [],
      notes: '',
      baptismDate: '',
      confirmationDate: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    });
  };

  const resetFamilyForm = () => {
    setFamilyForm({
      familyName: '',
      headOfHousehold: '',
      address: '',
      phone: '',
      memberIds: [],
      notes: '',
    });
  };

  const resetVisitorForm = () => {
    setVisitorForm({
      visitorName: '',
      email: '',
      phone: '',
      visitDate: new Date().toISOString().split('T')[0],
      howHeard: '',
      interests: [],
      followUpStatus: 'pending',
      assignedTo: '',
      notes: '',
    });
  };

  // Format helpers
  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'visitor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'transferred': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFollowUpColor = (status: Visit['followUpStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'contacted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'no-response': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Tab navigation
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'families', label: 'Families', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'visitors', label: 'Visitors', icon: UserPlus },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.membershipChurch.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.membershipChurch.churchMembershipManager', 'Church Membership Manager')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.membershipChurch.manageMembersFamiliesAttendanceAnd', 'Manage members, families, attendance, and visitors')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="membership-church" toolName="Membership Church" />

              <SyncStatus
                isSynced={membersToolData.isSynced}
                isSaving={membersToolData.isSaving}
                lastSaved={membersToolData.lastSaved}
                syncError={membersToolData.syncError}
                onForceSync={membersToolData.forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(members, memberColumns, { filename: 'church-members' })}
                onExportExcel={() => exportToExcel(members, memberColumns, { filename: 'church-members' })}
                onExportJSON={() => exportToJSON(members, { filename: 'church-members' })}
                onExportPDF={async () => {
                  await exportToPDF(members, memberColumns, {
                    filename: 'church-members',
                    title: 'Church Members Report',
                    subtitle: `${members.length} members | ${families.length} families`,
                  });
                }}
                onPrint={() => printData(members, memberColumns, { title: 'Church Members' })}
                onCopyToClipboard={async () => await copyUtil(members, memberColumns, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.membershipChurch.activeMembers', 'Active Members')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.activeMembers}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.membershipChurch.families', 'Families')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalFamilies}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <UserPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.membershipChurch.newThisMonth', 'New This Month')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.newMembersThisMonth}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.membershipChurch.pendingFollowUps', 'Pending Follow-ups')}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.pendingFollowUps}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.membershipChurch.searchMembers', 'Search members...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.membershipChurch.allStatus', 'All Status')}</option>
                  <option value="active">{t('tools.membershipChurch.active', 'Active')}</option>
                  <option value="inactive">{t('tools.membershipChurch.inactive', 'Inactive')}</option>
                  <option value="visitor">{t('tools.membershipChurch.visitor', 'Visitor')}</option>
                  <option value="transferred">{t('tools.membershipChurch.transferred', 'Transferred')}</option>
                </select>
              </div>
              <button
                onClick={() => { resetMemberForm(); setEditingMember(null); setShowMemberModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.membershipChurch.addMember', 'Add Member')}
              </button>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.name', 'Name')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.contact', 'Contact')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.status', 'Status')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.memberSince', 'Member Since')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {member.firstName} {member.lastName}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {member.membershipType}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email || '-'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {member.phone || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatDate(member.membershipDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setMemberForm(member); setEditingMember(member); setShowMemberModal(true); }}
                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600`}
                          >
                            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
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
              {filteredMembers.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.membershipChurch.noMembersFoundAddYour', 'No members found. Add your first member to get started.')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Families Tab */}
        {activeTab === 'families' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.membershipChurch.familyUnits', 'Family Units')}
              </h2>
              <button
                onClick={() => { resetFamilyForm(); setEditingFamily(null); setShowFamilyModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.membershipChurch.addFamily', 'Add Family')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {families.map((family) => (
                <div key={family.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {family.familyName}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Head: {family.headOfHousehold || 'Not specified'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setFamilyForm(family); setEditingFamily(family); setShowFamilyModal(true); }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteFamily(family.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {family.address || 'No address'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {family.phone || 'No phone'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {family.memberIds.length} members
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {families.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.membershipChurch.noFamiliesFoundAddYour', 'No families found. Add your first family to get started.')}
              </div>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.membershipChurch.attendanceRecords', 'Attendance Records')}
              </h2>
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.membershipChurch.recordAttendance', 'Record Attendance')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.date', 'Date')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.service', 'Service')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.member', 'Member')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.status2', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {attendance.slice(0, 20).map((record) => {
                    const member = members.find(m => m.id === record.memberId);
                    return (
                      <tr key={record.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatDate(record.date)}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {record.service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {member ? `${member.firstName} ${member.lastName}` : 'Unknown'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            record.status === 'online' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {attendance.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.membershipChurch.noAttendanceRecordsYetRecord', 'No attendance records yet. Record attendance to get started.')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visitors Tab */}
        {activeTab === 'visitors' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.membershipChurch.visitorTracking', 'Visitor Tracking')}
              </h2>
              <button
                onClick={() => { resetVisitorForm(); setEditingVisitor(null); setShowVisitorModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.membershipChurch.addVisitor', 'Add Visitor')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.name2', 'Name')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.contact2', 'Contact')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.visitDate', 'Visit Date')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.followUp', 'Follow-up')}</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.actions2', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visitors.map((visitor) => (
                    <tr key={visitor.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {visitor.visitorName}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div>{visitor.email || '-'}</div>
                          <div>{visitor.phone || '-'}</div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatDate(visitor.visitDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFollowUpColor(visitor.followUpStatus)}`}>
                          {visitor.followUpStatus.replace(/-/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleConvertVisitorToMember(visitor)}
                            className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900"
                            title={t('tools.membershipChurch.convertToMember', 'Convert to Member')}
                          >
                            <UserPlus className="w-4 h-4 text-green-500" />
                          </button>
                          <button
                            onClick={() => { setVisitorForm(visitor); setEditingVisitor(visitor); setShowVisitorModal(true); }}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteVisitor(visitor.id)}
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
              {visitors.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.membershipChurch.noVisitorsRecordedYetAdd', 'No visitors recorded yet. Add a visitor to track follow-ups.')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Member Modal */}
        {showMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingMember ? t('tools.membershipChurch.editMember', 'Edit Member') : t('tools.membershipChurch.addNewMember', 'Add New Member')}
                </h3>
                <button onClick={() => { setShowMemberModal(false); setEditingMember(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.firstName', 'First Name *')}</label>
                    <input
                      type="text"
                      value={memberForm.firstName || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.lastName', 'Last Name *')}</label>
                    <input
                      type="text"
                      value={memberForm.lastName || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.email', 'Email')}</label>
                    <input
                      type="email"
                      value={memberForm.email || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={memberForm.phone || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.address', 'Address')}</label>
                  <input
                    type="text"
                    value={memberForm.address || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.city', 'City')}</label>
                    <input
                      type="text"
                      value={memberForm.city || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, city: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.state', 'State')}</label>
                    <input
                      type="text"
                      value={memberForm.state || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, state: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.zipCode', 'ZIP Code')}</label>
                    <input
                      type="text"
                      value={memberForm.zipCode || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, zipCode: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.status3', 'Status')}</label>
                    <select
                      value={memberForm.status || 'active'}
                      onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value as Member['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="active">{t('tools.membershipChurch.active2', 'Active')}</option>
                      <option value="inactive">{t('tools.membershipChurch.inactive2', 'Inactive')}</option>
                      <option value="visitor">{t('tools.membershipChurch.visitor2', 'Visitor')}</option>
                      <option value="transferred">{t('tools.membershipChurch.transferred2', 'Transferred')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.membershipType', 'Membership Type')}</label>
                    <select
                      value={memberForm.membershipType || 'member'}
                      onChange={(e) => setMemberForm({ ...memberForm, membershipType: e.target.value as Member['membershipType'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="member">{t('tools.membershipChurch.member2', 'Member')}</option>
                      <option value="visitor">{t('tools.membershipChurch.visitor3', 'Visitor')}</option>
                      <option value="regular-attender">{t('tools.membershipChurch.regularAttender', 'Regular Attender')}</option>
                      <option value="youth">{t('tools.membershipChurch.youth', 'Youth')}</option>
                      <option value="senior">{t('tools.membershipChurch.senior', 'Senior')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.dateOfBirth', 'Date of Birth')}</label>
                    <input
                      type="date"
                      value={memberForm.dateOfBirth || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, dateOfBirth: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.membershipDate', 'Membership Date')}</label>
                    <input
                      type="date"
                      value={memberForm.membershipDate || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, membershipDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.baptismDate', 'Baptism Date')}</label>
                    <input
                      type="date"
                      value={memberForm.baptismDate || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, baptismDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.confirmationDate', 'Confirmation Date')}</label>
                    <input
                      type="date"
                      value={memberForm.confirmationDate || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, confirmationDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.notes', 'Notes')}</label>
                  <textarea
                    value={memberForm.notes || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowMemberModal(false); setEditingMember(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.membershipChurch.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveMember}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingMember ? t('tools.membershipChurch.saveChanges', 'Save Changes') : t('tools.membershipChurch.addMember2', 'Add Member')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Family Modal */}
        {showFamilyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingFamily ? t('tools.membershipChurch.editFamily', 'Edit Family') : t('tools.membershipChurch.addNewFamily', 'Add New Family')}
                </h3>
                <button onClick={() => { setShowFamilyModal(false); setEditingFamily(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.familyName', 'Family Name *')}</label>
                  <input
                    type="text"
                    value={familyForm.familyName || ''}
                    onChange={(e) => setFamilyForm({ ...familyForm, familyName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.headOfHousehold', 'Head of Household')}</label>
                  <input
                    type="text"
                    value={familyForm.headOfHousehold || ''}
                    onChange={(e) => setFamilyForm({ ...familyForm, headOfHousehold: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.address2', 'Address')}</label>
                  <input
                    type="text"
                    value={familyForm.address || ''}
                    onChange={(e) => setFamilyForm({ ...familyForm, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.phone2', 'Phone')}</label>
                  <input
                    type="tel"
                    value={familyForm.phone || ''}
                    onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.notes2', 'Notes')}</label>
                  <textarea
                    value={familyForm.notes || ''}
                    onChange={(e) => setFamilyForm({ ...familyForm, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowFamilyModal(false); setEditingFamily(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.membershipChurch.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveFamily}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingFamily ? t('tools.membershipChurch.saveChanges2', 'Save Changes') : t('tools.membershipChurch.addFamily2', 'Add Family')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Modal */}
        {showAttendanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.membershipChurch.recordAttendance2', 'Record Attendance')}
                </h3>
                <button onClick={() => setShowAttendanceModal(false)} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.date2', 'Date')}</label>
                  <input
                    type="date"
                    value={attendanceForm.date}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.service2', 'Service')}</label>
                  <select
                    value={attendanceForm.service}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, service: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="sunday-morning">{t('tools.membershipChurch.sundayMorning', 'Sunday Morning')}</option>
                    <option value="sunday-evening">{t('tools.membershipChurch.sundayEvening', 'Sunday Evening')}</option>
                    <option value="wednesday">{t('tools.membershipChurch.wednesdayService', 'Wednesday Service')}</option>
                    <option value="bible-study">{t('tools.membershipChurch.bibleStudy', 'Bible Study')}</option>
                    <option value="youth">{t('tools.membershipChurch.youthService', 'Youth Service')}</option>
                    <option value="special-event">{t('tools.membershipChurch.specialEvent', 'Special Event')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.selectMembersPresent', 'Select Members Present')}</label>
                  <div className={`max-h-48 overflow-y-auto border rounded-lg ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                    {members.filter(m => m.status === 'active').map((member) => (
                      <label key={member.id} className={`flex items-center gap-2 p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          checked={attendanceForm.selectedMembers.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAttendanceForm({
                                ...attendanceForm,
                                selectedMembers: [...attendanceForm.selectedMembers, member.id],
                              });
                            } else {
                              setAttendanceForm({
                                ...attendanceForm,
                                selectedMembers: attendanceForm.selectedMembers.filter(id => id !== member.id),
                              });
                            }
                          }}
                          className="rounded text-[#0D9488]"
                        />
                        <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {member.firstName} {member.lastName}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {attendanceForm.selectedMembers.length} members selected
                  </p>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.membershipChurch.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleRecordAttendance}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {t('tools.membershipChurch.recordAttendance3', 'Record Attendance')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visitor Modal */}
        {showVisitorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-lg`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingVisitor ? t('tools.membershipChurch.editVisitor', 'Edit Visitor') : t('tools.membershipChurch.addNewVisitor', 'Add New Visitor')}
                </h3>
                <button onClick={() => { setShowVisitorModal(false); setEditingVisitor(null); }} className="p-1">
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.visitorName', 'Visitor Name *')}</label>
                  <input
                    type="text"
                    value={visitorForm.visitorName || ''}
                    onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.email2', 'Email')}</label>
                    <input
                      type="email"
                      value={visitorForm.email || ''}
                      onChange={(e) => setVisitorForm({ ...visitorForm, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.phone3', 'Phone')}</label>
                    <input
                      type="tel"
                      value={visitorForm.phone || ''}
                      onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.visitDate2', 'Visit Date')}</label>
                    <input
                      type="date"
                      value={visitorForm.visitDate || ''}
                      onChange={(e) => setVisitorForm({ ...visitorForm, visitDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.howDidTheyHear', 'How Did They Hear?')}</label>
                    <input
                      type="text"
                      value={visitorForm.howHeard || ''}
                      onChange={(e) => setVisitorForm({ ...visitorForm, howHeard: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.followUpStatus', 'Follow-up Status')}</label>
                  <select
                    value={visitorForm.followUpStatus || 'pending'}
                    onChange={(e) => setVisitorForm({ ...visitorForm, followUpStatus: e.target.value as Visit['followUpStatus'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="pending">{t('tools.membershipChurch.pending', 'Pending')}</option>
                    <option value="contacted">{t('tools.membershipChurch.contacted', 'Contacted')}</option>
                    <option value="completed">{t('tools.membershipChurch.completed', 'Completed')}</option>
                    <option value="no-response">{t('tools.membershipChurch.noResponse', 'No Response')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.membershipChurch.notes3', 'Notes')}</label>
                  <textarea
                    value={visitorForm.notes || ''}
                    onChange={(e) => setVisitorForm({ ...visitorForm, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowVisitorModal(false); setEditingVisitor(null); }}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('tools.membershipChurch.cancel4', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveVisitor}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B847A]"
                >
                  {editingVisitor ? t('tools.membershipChurch.saveChanges3', 'Save Changes') : t('tools.membershipChurch.addVisitor2', 'Add Visitor')}
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

export default MembershipChurchTool;
