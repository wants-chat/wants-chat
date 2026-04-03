'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Check,
  X,
  Download,
  Search,
  Filter,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
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

// ============ INTERFACES ============
interface TeamRosterToolProps {
  uiConfig?: UIConfig;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  location: string;
  joinDate: string;
  status: 'active' | 'inactive';
  manager?: string;
  createdAt: string;
}

type SortField = 'name' | 'position' | 'department' | 'joinDate';
type SortOrder = 'asc' | 'desc';

// ============ COLUMN CONFIGURATION ============
const TEAM_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'position', header: 'Position', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'joinDate', header: 'Join Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'manager', header: 'Manager', type: 'string' },
];

// ============ HELPER FUNCTIONS ============
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Operations', 'Design', 'Finance', 'Support', 'Product', 'Legal'];

const STATUS_COLORS = {
  active: { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/30', darkText: 'text-green-400' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'bg-gray-900/30', darkText: 'text-gray-400' },
};

// ============ SAMPLE DATA GENERATOR ============
const generateSampleData = (): TeamMember[] => [
  {
    id: generateId(),
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '555-0101',
    position: 'Senior Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    joinDate: '2023-01-15',
    status: 'active',
    manager: 'Sarah Johnson',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '555-0102',
    position: 'Engineering Manager',
    department: 'Engineering',
    location: 'San Francisco, CA',
    joinDate: '2022-06-20',
    status: 'active',
    manager: 'Mike Davis',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Emily Chen',
    email: 'emily.c@example.com',
    phone: '555-0104',
    position: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    joinDate: '2023-03-10',
    status: 'active',
    manager: 'Mike Davis',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'David Wilson',
    email: 'david.w@example.com',
    phone: '555-0105',
    position: 'Marketing Specialist',
    department: 'Marketing',
    location: 'Austin, TX',
    joinDate: '2023-09-01',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    phone: '555-0106',
    position: 'Sales Representative',
    department: 'Sales',
    location: 'Chicago, IL',
    joinDate: '2023-02-15',
    status: 'active',
    manager: 'Mike Davis',
    createdAt: new Date().toISOString(),
  },
];

// ============ MAIN COMPONENT ============
export const TeamRosterTool: React.FC<TeamRosterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: teamMembers,
    setData: setTeamMembers,
    addItem: addTeamMember,
    updateItem: updateTeamMember,
    deleteItem: deleteTeamMember,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<TeamMember>('team-roster', generateSampleData(), TEAM_COLUMNS);

  // Local state for UI interactions
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Form state for new/edited member
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    location: '',
    status: 'active',
  });

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.name || params.email) {
        setFormData({
          name: params.name || '',
          email: params.email || '',
          phone: params.phone || '',
          position: params.position || '',
          department: params.department || '',
          location: params.location || '',
          status: 'active',
        });
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.position.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter((member) => member.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((member) => member.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }

      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });

    return filtered;
  }, [teamMembers, searchQuery, departmentFilter, statusFilter, sortField, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const total = teamMembers.length;
    const active = teamMembers.filter((m) => m.status === 'active').length;
    const byDepartment = teamMembers.reduce((acc: Record<string, number>, member) => {
      acc[member.department] = (acc[member.department] || 0) + 1;
      return acc;
    }, {});

    return { total, active, byDepartment };
  }, [teamMembers]);

  // Handlers
  const handleAddNew = () => {
    setIsAddingNew(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      location: '',
      status: 'active',
    });
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData(member);
  };

  const handleSaveMember = () => {
    if (!formData.name || !formData.email || !formData.position) {
      setValidationMessage('Please fill in required fields: Name, Email, Position');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingId) {
      // Update existing member
      updateTeamMember(editingId, {
        ...formData,
        createdAt: formData.createdAt || new Date().toISOString(),
      } as Partial<TeamMember>);
      setEditingId(null);
    } else {
      // Add new member
      const newMember: TeamMember = {
        id: generateId(),
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        position: formData.position || '',
        department: formData.department || '',
        location: formData.location || '',
        status: (formData.status || 'active') as 'active' | 'inactive',
        manager: formData.manager,
        createdAt: new Date().toISOString(),
      };
      addTeamMember(newMember);
      setIsAddingNew(false);
    }

    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      location: '',
      status: 'active',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      location: '',
      status: 'active',
    });
  };

  const handleDeleteMember = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this team member?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteTeamMember(id);
  };

  const handleToggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.teamRoster.loadingTeamRoster', 'Loading team roster...')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.teamRoster.teamRoster', 'Team Roster')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.teamRoster.manageAndOrganizeYourTeam', 'Manage and organize your team members')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="team-roster" toolName="Team Roster" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={theme}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.teamRoster.teamMemberDataPreFilled', 'Team member data pre-filled')}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.teamRoster.totalMembers', 'Total Members')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.teamRoster.active', 'Active')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <div className="text-2xl font-bold text-blue-500">{Object.keys(stats.byDepartment).length}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.teamRoster.departments', 'Departments')}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <Search className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.teamRoster.searchByNameEmailOr', 'Search by name, email, or position...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                />
              </div>
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg text-sm border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="">{t('tools.teamRoster.allDepartments', 'All Departments')}</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className={`px-3 py-2 rounded-lg text-sm border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">{t('tools.teamRoster.allStatus', 'All Status')}</option>
              <option value="active">{t('tools.teamRoster.activeOnly', 'Active Only')}</option>
              <option value="inactive">{t('tools.teamRoster.inactiveOnly', 'Inactive Only')}</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddNew}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {t('tools.teamRoster.addMember', 'Add Member')}
            </button>

            <ExportDropdown
              onExportCSV={() => exportCSV()}
              onExportExcel={() => exportExcel()}
              onExportJSON={() => exportJSON()}
              onExportPDF={() => exportPDF()}
              onPrint={() => print('Team Roster')}
              onCopyToClipboard={() => copyToClipboard('csv')}
              disabled={teamMembers.length === 0}
              theme={theme}
            />
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAddingNew || editingId) && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingId ? t('tools.teamRoster.editTeamMember', 'Edit Team Member') : t('tools.teamRoster.addNewTeamMember', 'Add New Team Member')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-medium block mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.teamRoster.name', 'Name *')}</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('tools.teamRoster.fullName', 'Full name')}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium block mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.teamRoster.email', 'Email *')}</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('tools.teamRoster.emailExampleCom', 'email@example.com')}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium block mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.teamRoster.phone', 'Phone')}</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="555-0000"
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium block mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.teamRoster.position', 'Position *')}</label>
                <input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder={t('tools.teamRoster.jobTitle', 'Job title')}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium block mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.teamRoster.department', 'Department')}</label>
                <select
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="">{t('tools.teamRoster.selectDepartment', 'Select department')}</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-sm font-medium block mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.teamRoster.location', 'Location')}</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={t('tools.teamRoster.cityState', 'City, State')}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium block mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.teamRoster.manager', 'Manager')}</label>
                <input
                  type="text"
                  value={formData.manager || ''}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder={t('tools.teamRoster.managerName', 'Manager name')}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium block mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.teamRoster.status', 'Status')}</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="active">{t('tools.teamRoster.active2', 'Active')}</option>
                  <option value="inactive">{t('tools.teamRoster.inactive', 'Inactive')}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveMember}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Check className="w-4 h-4" />
                {t('tools.teamRoster.save', 'Save')}
              </button>
              <button
                onClick={handleCancel}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <X className="w-4 h-4" />
                {t('tools.teamRoster.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Team Members List */}
        <div className="space-y-2">
          {filteredMembers.length === 0 ? (
            <div className={`p-8 text-center rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.teamRoster.noTeamMembersFound', 'No team members found')}</p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const colors = STATUS_COLORS[member.status];
              return (
                <div
                  key={member.id}
                  className={`rounded-lg border p-4 transition-all ${
                    expandedId === member.id
                      ? isDark
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-gray-50 border-gray-300'
                      : isDark
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colors.darkBg}`}>
                          <span className={`text-sm font-semibold ${colors.darkText}`}>{member.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{member.name}</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{member.position}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${colors.darkBg} ${colors.darkText}`}>
                        {member.status === 'active' ? t('tools.teamRoster.active3', 'Active') : t('tools.teamRoster.inactive2', 'Inactive')}
                      </span>
                      <button
                        onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                        className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      >
                        {expandedId === member.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedId === member.id && (
                    <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} space-y-3`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.teamRoster.email2', 'Email')}</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.teamRoster.phone2', 'Phone')}</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{member.phone || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.teamRoster.department2', 'Department')}</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{member.department}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.teamRoster.location2', 'Location')}</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{member.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.teamRoster.joinDate', 'Join Date')}</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(member.joinDate)}</p>
                          </div>
                        </div>

                        {member.manager && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                            <div>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.teamRoster.manager2', 'Manager')}</p>
                              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{member.manager}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                          {t('tools.teamRoster.edit', 'Edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.teamRoster.tip', 'Tip:')}</strong> Use the search and filter options to find team members quickly. All changes are automatically synced to the cloud.
          </p>
        </div>
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default TeamRosterTool;
