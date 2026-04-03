'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
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
import {
  Users,
  UserPlus,
  Home,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Heart,
  Bell,
  Search,
  Filter,
  Upload,
  Trash2,
  Edit2,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Cake,
  Gift,
  Star,
  Award,
  Clock,
  FileText,
  Settings,
  Sparkles,
  BarChart3,
  UserCheck,
  Building,
} from 'lucide-react';

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
  joinDate: string;
  membershipType: MembershipType;
  familyId: string | null;
  groupIds: string[];
  skills: string[];
  interests: string[];
  communicationPreferences: CommunicationPreference[];
  birthday: string;
  anniversary: string;
  photoUrl: string;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Family {
  id: string;
  name: string;
  primaryContactId: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  leaderId: string | null;
  meetingSchedule: string;
  isActive: boolean;
  createdAt: string;
}

type MembershipType = 'Regular' | 'Premium' | 'Family' | 'Senior' | 'Student' | 'Honorary';
type CommunicationPreference = 'Email' | 'Phone' | 'Text' | 'Mail' | 'None';
type GroupType = 'Committee' | 'Ministry' | 'Small Group' | 'Class' | 'Team' | 'Other';

const membershipTypes: MembershipType[] = ['Regular', 'Premium', 'Family', 'Senior', 'Student', 'Honorary'];
const communicationOptions: CommunicationPreference[] = ['Email', 'Phone', 'Text', 'Mail', 'None'];
const groupTypes: GroupType[] = ['Committee', 'Ministry', 'Small Group', 'Class', 'Team', 'Other'];

const membershipColors: Record<MembershipType, string> = {
  Regular: 'bg-blue-500/20 text-blue-500',
  Premium: 'bg-purple-500/20 text-purple-500',
  Family: 'bg-green-500/20 text-green-500',
  Senior: 'bg-amber-500/20 text-amber-500',
  Student: 'bg-cyan-500/20 text-cyan-500',
  Honorary: 'bg-rose-500/20 text-rose-500',
};

const tabs = [
  { id: 'members', label: 'Members', icon: Users },
  { id: 'families', label: 'Families', icon: Home },
  { id: 'groups', label: 'Groups', icon: Building },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

// Column configurations for useToolData
const memberColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'zipCode', header: 'Zip Code', type: 'string' },
  { key: 'joinDate', header: 'Join Date', type: 'date' },
  { key: 'membershipType', header: 'Membership Type', type: 'string' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
];

const familyColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Family Name', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'zipCode', header: 'Zip Code', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const groupColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Group Name', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'meetingSchedule', header: 'Meeting Schedule', type: 'string' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
];

// Sample data generators for each data type
const generateSampleFamilies = (): Family[] => [
  {
    id: 'family-1',
    name: 'Johnson Family',
    primaryContactId: 'member-1',
    address: '123 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    notes: 'Active members since 2018',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'family-2',
    name: 'Smith Family',
    primaryContactId: 'member-3',
    address: '456 Maple Avenue',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62702',
    notes: 'Founding members',
    createdAt: new Date().toISOString(),
  },
];

const generateSampleGroups = (): Group[] => [
  {
    id: 'group-1',
    name: 'Finance Committee',
    description: 'Oversees budget and financial planning',
    type: 'Committee',
    leaderId: 'member-3',
    meetingSchedule: 'First Monday of each month at 7 PM',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'group-2',
    name: 'Youth Ministry',
    description: 'Programs and activities for teenagers',
    type: 'Ministry',
    leaderId: 'member-3',
    meetingSchedule: 'Every Sunday at 5 PM',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'group-3',
    name: 'Welcome Team',
    description: 'Greeting and helping new visitors',
    type: 'Team',
    leaderId: 'member-2',
    meetingSchedule: 'As needed',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const generateSampleMembers = (): Member[] => [
  {
    id: 'member-1',
    firstName: 'John',
    lastName: 'Johnson',
    email: 'john.johnson@email.com',
    phone: '(555) 123-4567',
    address: '123 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    joinDate: '2018-03-15',
    membershipType: 'Regular',
    familyId: 'family-1',
    groupIds: ['group-1'],
    skills: ['Accounting', 'Leadership'],
    interests: ['Community Service', 'Music'],
    communicationPreferences: ['Email', 'Phone'],
    birthday: '1975-06-20',
    anniversary: '2000-08-12',
    photoUrl: '',
    isActive: true,
    notes: 'Treasurer since 2020',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'member-2',
    firstName: 'Mary',
    lastName: 'Johnson',
    email: 'mary.johnson@email.com',
    phone: '(555) 123-4568',
    address: '123 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    joinDate: '2018-03-15',
    membershipType: 'Family',
    familyId: 'family-1',
    groupIds: ['group-3'],
    skills: ['Teaching', 'Event Planning'],
    interests: ['Children Programs', 'Hospitality'],
    communicationPreferences: ['Email', 'Text'],
    birthday: '1978-09-10',
    anniversary: '2000-08-12',
    photoUrl: '',
    isActive: true,
    notes: 'Leads welcome team',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'member-3',
    firstName: 'Robert',
    lastName: 'Smith',
    email: 'robert.smith@email.com',
    phone: '(555) 234-5678',
    address: '456 Maple Avenue',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62702',
    joinDate: '2010-01-10',
    membershipType: 'Premium',
    familyId: 'family-2',
    groupIds: ['group-1', 'group-2'],
    skills: ['Music', 'Technology'],
    interests: ['Youth Programs', 'Worship'],
    communicationPreferences: ['Email'],
    birthday: '1965-12-05',
    anniversary: '1990-06-15',
    photoUrl: '',
    isActive: true,
    notes: 'Board member',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'member-4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@email.com',
    phone: '(555) 345-6789',
    address: '789 Pine Road',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62703',
    joinDate: '2022-09-01',
    membershipType: 'Student',
    familyId: null,
    groupIds: ['group-2'],
    skills: ['Social Media', 'Photography'],
    interests: ['Youth Programs', 'Arts'],
    communicationPreferences: ['Text', 'Email'],
    birthday: '2004-04-25',
    anniversary: '',
    photoUrl: '',
    isActive: true,
    notes: 'College student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'member-5',
    firstName: 'Margaret',
    lastName: 'Wilson',
    email: 'margaret.wilson@email.com',
    phone: '(555) 456-7890',
    address: '321 Elm Court',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62704',
    joinDate: '1995-05-20',
    membershipType: 'Senior',
    familyId: null,
    groupIds: ['group-3'],
    skills: ['Cooking', 'Mentoring'],
    interests: ['Prayer Group', 'Visitation'],
    communicationPreferences: ['Phone', 'Mail'],
    birthday: '1945-11-30',
    anniversary: '1968-04-18',
    photoUrl: '',
    isActive: true,
    notes: 'Charter member',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultMember: Omit<Member, 'id' | 'createdAt' | 'updatedAt'> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  joinDate: new Date().toISOString().split('T')[0],
  membershipType: 'Regular',
  familyId: null,
  groupIds: [],
  skills: [],
  interests: [],
  communicationPreferences: ['Email'],
  birthday: '',
  anniversary: '',
  photoUrl: '',
  isActive: true,
  notes: '',
};

const defaultFamily: Omit<Family, 'id' | 'createdAt'> = {
  name: '',
  primaryContactId: null,
  address: '',
  city: '',
  state: '',
  zipCode: '',
  notes: '',
};

const defaultGroup: Omit<Group, 'id' | 'createdAt'> = {
  name: '',
  description: '',
  type: 'Committee',
  leaderId: null,
  meetingSchedule: '',
  isActive: true,
};

interface MemberDirectoryToolProps {
  uiConfig?: UIConfig;
}

export const MemberDirectoryTool: React.FC<MemberDirectoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize hooks for members, families, and groups with backend sync
  const membersData = useToolData<Member>(
    'member-directory-members',
    generateSampleMembers(),
    memberColumns,
    { autoSave: true }
  );

  const familiesData = useToolData<Family>(
    'member-directory-families',
    generateSampleFamilies(),
    familyColumns,
    { autoSave: true }
  );

  const groupsData = useToolData<Group>(
    'member-directory-groups',
    generateSampleGroups(),
    groupColumns,
    { autoSave: true }
  );

  // Destructure sync status from members hook (primary data source)
  const {
    data: members,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = membersData;

  // Use data from hooks
  const families = familiesData.data;
  const groups = groupsData.data;

  const [activeTab, setActiveTab] = useState('members');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMembershipType, setFilterMembershipType] = useState<MembershipType | 'all'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Form states
  const [memberForm, setMemberForm] = useState<Omit<Member, 'id' | 'createdAt' | 'updatedAt'>>(defaultMember);
  const [familyForm, setFamilyForm] = useState<Omit<Family, 'id' | 'createdAt'>>(defaultFamily);
  const [groupForm, setGroupForm] = useState<Omit<Group, 'id' | 'createdAt'>>(defaultGroup);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.name || params.email || params.text) {
        setIsPrefilled(true);
        const nameParts = (params.name || params.text || '').split(' ');
        setMemberForm(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: params.email || '',
        }));
        setShowMemberForm(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = searchTerm === '' ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);

      const matchesMembershipType = filterMembershipType === 'all' || member.membershipType === filterMembershipType;
      const matchesGroup = filterGroup === 'all' || member.groupIds.includes(filterGroup);
      const matchesActive = filterActive === 'all' ||
        (filterActive === 'active' && member.isActive) ||
        (filterActive === 'inactive' && !member.isActive);

      return matchesSearch && matchesMembershipType && matchesGroup && matchesActive;
    });
  }, [members, searchTerm, filterMembershipType, filterGroup, filterActive]);

  // Get upcoming birthdays (next 30 days)
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return members
      .filter(member => {
        if (!member.birthday || !member.isActive) return false;
        const birthday = new Date(member.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        return thisYearBirthday >= today && thisYearBirthday <= thirtyDaysFromNow;
      })
      .sort((a, b) => {
        const aDate = new Date(a.birthday);
        const bDate = new Date(b.birthday);
        const aThisYear = new Date(today.getFullYear(), aDate.getMonth(), aDate.getDate());
        const bThisYear = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
        return aThisYear.getTime() - bThisYear.getTime();
      });
  }, [members]);

  // Get upcoming anniversaries (next 30 days)
  const upcomingAnniversaries = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return members
      .filter(member => {
        if (!member.anniversary || !member.isActive) return false;
        const anniversary = new Date(member.anniversary);
        const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
        if (thisYearAnniversary < today) {
          thisYearAnniversary.setFullYear(today.getFullYear() + 1);
        }
        return thisYearAnniversary >= today && thisYearAnniversary <= thirtyDaysFromNow;
      })
      .sort((a, b) => {
        const aDate = new Date(a.anniversary);
        const bDate = new Date(b.anniversary);
        const aThisYear = new Date(today.getFullYear(), aDate.getMonth(), aDate.getDate());
        const bThisYear = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
        return aThisYear.getTime() - bThisYear.getTime();
      });
  }, [members]);

  // Member CRUD
  const saveMember = () => {
    if (editingMember) {
      membersData.updateItem(editingMember.id, {
        ...memberForm,
        updatedAt: new Date().toISOString(),
      });
      setEditingMember(null);
    } else {
      const newMember: Member = {
        ...memberForm,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      membersData.addItem(newMember);
    }
    setShowMemberForm(false);
    setMemberForm(defaultMember);
  };

  const editMember = (member: Member) => {
    setMemberForm(member);
    setEditingMember(member);
    setShowMemberForm(true);
  };

  const deleteMember = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Member',
      message: 'Are you sure you want to delete this member?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      membersData.deleteItem(id);
    }
  };

  const toggleMemberActive = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member) {
      membersData.updateItem(id, {
        isActive: !member.isActive,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Family CRUD
  const saveFamily = () => {
    if (editingFamily) {
      familiesData.updateItem(editingFamily.id, familyForm);
      setEditingFamily(null);
    } else {
      const newFamily: Family = {
        ...familyForm,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      familiesData.addItem(newFamily);
    }
    setShowFamilyForm(false);
    setFamilyForm(defaultFamily);
  };

  const editFamily = (family: Family) => {
    setFamilyForm(family);
    setEditingFamily(family);
    setShowFamilyForm(true);
  };

  const deleteFamily = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Family',
      message: 'Are you sure you want to delete this family? Members will not be deleted.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      // Remove family reference from members
      familiesData.deleteItem(id);
      members.forEach(m => {
        if (m.familyId === id) {
          membersData.updateItem(m.id, { familyId: null });
        }
      });
    }
  };

  // Group CRUD
  const saveGroup = () => {
    if (editingGroup) {
      groupsData.updateItem(editingGroup.id, groupForm);
      setEditingGroup(null);
    } else {
      const newGroup: Group = {
        ...groupForm,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      groupsData.addItem(newGroup);
    }
    setShowGroupForm(false);
    setGroupForm(defaultGroup);
  };

  const editGroup = (group: Group) => {
    setGroupForm(group);
    setEditingGroup(group);
    setShowGroupForm(true);
  };

  const deleteGroup = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Group',
      message: 'Are you sure you want to delete this group? Members will be removed from this group.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      groupsData.deleteItem(id);
      // Remove group reference from members
      members.forEach(m => {
        if (m.groupIds.includes(id)) {
          membersData.updateItem(m.id, {
            groupIds: m.groupIds.filter(gId => gId !== id),
          });
        }
      });
    }
  };

  // Helper functions
  const getMemberName = (id: string | null) => {
    if (!id) return 'Unassigned';
    const member = members.find(m => m.id === id);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
  };

  const getFamilyName = (id: string | null) => {
    if (!id) return 'No family';
    const family = families.find(f => f.id === id);
    return family?.name || 'Unknown';
  };

  const getFamilyMembers = (familyId: string) => {
    return members.filter(m => m.familyId === familyId);
  };

  const getGroupMembers = (groupId: string) => {
    return members.filter(m => m.groupIds.includes(groupId));
  };

  const addSkill = () => {
    if (newSkill.trim() && !memberForm.skills.includes(newSkill.trim())) {
      setMemberForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setMemberForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !memberForm.interests.includes(newInterest.trim())) {
      setMemberForm(prev => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setMemberForm(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  const toggleGroupInMember = (groupId: string) => {
    setMemberForm(prev => ({
      ...prev,
      groupIds: prev.groupIds.includes(groupId)
        ? prev.groupIds.filter(id => id !== groupId)
        : [...prev.groupIds, groupId],
    }));
  };

  const toggleCommunicationPreference = (pref: CommunicationPreference) => {
    setMemberForm(prev => ({
      ...prev,
      communicationPreferences: prev.communicationPreferences.includes(pref)
        ? prev.communicationPreferences.filter(p => p !== pref)
        : [...prev.communicationPreferences, pref],
    }));
  };

  // Clear all data
  const clearAllData = async () => {
    const confirmed = await confirm({
      title: 'Clear All Data',
      message: 'Are you sure you want to clear all data? This cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      membersData.clearData();
      familiesData.clearData();
      groupsData.clearData();
    }
  };

  // Load sample data
  const loadSampleData = async () => {
    const confirmed = await confirm({
      title: 'Load Sample Data',
      message: 'This will replace all current data with sample data. Continue?',
      confirmText: 'Load Data',
      cancelText: 'Cancel',
      variant: 'warning',
    });
    if (confirmed) {
      membersData.resetToDefault(generateSampleMembers());
      familiesData.resetToDefault(generateSampleFamilies());
      groupsData.resetToDefault(generateSampleGroups());
    }
  };

  // Statistics
  const stats = useMemo(() => ({
    totalMembers: members.length,
    activeMembers: members.filter(m => m.isActive).length,
    inactiveMembers: members.filter(m => !m.isActive).length,
    totalFamilies: families.length,
    totalGroups: groups.length,
    membersByType: membershipTypes.reduce((acc, type) => {
      acc[type] = members.filter(m => m.membershipType === type).length;
      return acc;
    }, {} as Record<MembershipType, number>),
    newMembersThisYear: members.filter(m =>
      new Date(m.joinDate).getFullYear() === new Date().getFullYear()
    ).length,
  }), [members, families, groups]);

  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500'
  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`;

  const cardClass = `rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg transition-all font-medium shadow-lg shadow-teal-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const buttonDanger = `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm bg-red-500/10 hover:bg-red-500/20 text-red-500`;

  return (
    <div className={`max-w-6xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 rounded-xl">
            <Users className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.memberDirectory.memberDirectory', 'Member Directory')}
            </h1>
            <div className="flex items-center gap-3">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.memberDirectory.manageMembersFamiliesAndGroups', 'Manage members, families, and groups')}
              </p>
              <WidgetEmbedButton toolSlug="member-directory" toolName="Member Directory" />

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
        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown
            onExportCSV={() => exportToCSV(members, memberColumns, { filename: 'member-directory' })}
            onExportExcel={() => exportToExcel(members, memberColumns, { filename: 'member-directory' })}
            onExportJSON={() => exportToJSON(members, { filename: 'member-directory' })}
            onExportPDF={() => exportToPDF(members, memberColumns, {
              filename: 'member-directory',
              title: 'Member Directory',
              subtitle: `${members.length} members`,
              orientation: 'landscape'
            })}
            onPrint={() => printData(members, memberColumns, { title: 'Member Directory' })}
            onCopyToClipboard={() => copyUtil(members, memberColumns)}
            showImport={false}
            theme={theme}
          />
          <button onClick={loadSampleData} className={buttonSecondary}>
            <Upload className="w-4 h-4" />
            {t('tools.memberDirectory.sample', 'Sample')}
          </button>
          <button onClick={clearAllData} className={buttonDanger}>
            <Trash2 className="w-4 h-4" />
            {t('tools.memberDirectory.clear', 'Clear')}
          </button>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.memberDirectory.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Users className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.memberDirectory.totalMembers', 'Total Members')}</p>
              <p className="text-xl font-bold">{stats.totalMembers}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.memberDirectory.active', 'Active')}</p>
              <p className="text-xl font-bold text-green-500">{stats.activeMembers}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Home className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.memberDirectory.families', 'Families')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.totalFamilies}</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Building className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.memberDirectory.groups', 'Groups')}</p>
              <p className="text-xl font-bold text-purple-500">{stats.totalGroups}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-500 text-white shadow-sm'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Members Tab */}
        {activeTab === 'members' && (
          <>
            {/* Search and Filters */}
            <div className={cardClass}>
              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('tools.memberDirectory.searchMembers', 'Search members...')}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`${buttonSecondary} ${showFilters ? 'bg-teal-500/20 text-teal-500' : ''}`}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setMemberForm(defaultMember);
                      setEditingMember(null);
                      setShowMemberForm(true);
                    }}
                    className={buttonPrimary}
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('tools.memberDirectory.addMember', 'Add Member')}
                  </button>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className={labelClass}>{t('tools.memberDirectory.membershipType', 'Membership Type')}</label>
                      <select
                        value={filterMembershipType}
                        onChange={(e) => setFilterMembershipType(e.target.value as MembershipType | 'all')}
                        className={inputClass}
                      >
                        <option value="all">{t('tools.memberDirectory.allTypes', 'All Types')}</option>
                        {membershipTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.memberDirectory.group', 'Group')}</label>
                      <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className={inputClass}
                      >
                        <option value="all">{t('tools.memberDirectory.allGroups', 'All Groups')}</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.memberDirectory.status', 'Status')}</label>
                      <select
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                        className={inputClass}
                      >
                        <option value="all">{t('tools.memberDirectory.allStatus', 'All Status')}</option>
                        <option value="active">{t('tools.memberDirectory.active2', 'Active')}</option>
                        <option value="inactive">{t('tools.memberDirectory.inactive', 'Inactive')}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Member Form Modal */}
            {showMemberForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${cardClass} max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-teal-500" />
                        {editingMember ? t('tools.memberDirectory.editMember', 'Edit Member') : t('tools.memberDirectory.addNewMember', 'Add New Member')}
                      </h2>
                      <button
                        onClick={() => {
                          setShowMemberForm(false);
                          setEditingMember(null);
                          setMemberForm(defaultMember);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-teal-500">{t('tools.memberDirectory.basicInformation', 'Basic Information')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.firstName', 'First Name *')}</label>
                            <input
                              type="text"
                              value={memberForm.firstName}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, firstName: e.target.value }))}
                              className={inputClass}
                              placeholder={t('tools.memberDirectory.firstName2', 'First name')}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.lastName', 'Last Name *')}</label>
                            <input
                              type="text"
                              value={memberForm.lastName}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, lastName: e.target.value }))}
                              className={inputClass}
                              placeholder={t('tools.memberDirectory.lastName2', 'Last name')}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.membershipType2', 'Membership Type')}</label>
                            <select
                              value={memberForm.membershipType}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, membershipType: e.target.value as MembershipType }))}
                              className={inputClass}
                            >
                              {membershipTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.email', 'Email')}</label>
                            <input
                              type="email"
                              value={memberForm.email}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                              className={inputClass}
                              placeholder={t('tools.memberDirectory.emailExampleCom', 'email@example.com')}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.phone', 'Phone')}</label>
                            <input
                              type="tel"
                              value={memberForm.phone}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                              className={inputClass}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.joinDate', 'Join Date')}</label>
                            <input
                              type="date"
                              value={memberForm.joinDate}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, joinDate: e.target.value }))}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-teal-500">{t('tools.memberDirectory.address', 'Address')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="sm:col-span-2">
                            <label className={labelClass}>{t('tools.memberDirectory.streetAddress', 'Street Address')}</label>
                            <input
                              type="text"
                              value={memberForm.address}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, address: e.target.value }))}
                              className={inputClass}
                              placeholder={t('tools.memberDirectory.123MainStreet', '123 Main Street')}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.city', 'City')}</label>
                            <input
                              type="text"
                              value={memberForm.city}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, city: e.target.value }))}
                              className={inputClass}
                              placeholder={t('tools.memberDirectory.city3', 'City')}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>{t('tools.memberDirectory.state', 'State')}</label>
                              <input
                                type="text"
                                value={memberForm.state}
                                onChange={(e) => setMemberForm(prev => ({ ...prev, state: e.target.value }))}
                                className={inputClass}
                                placeholder="ST"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>{t('tools.memberDirectory.zip', 'Zip')}</label>
                              <input
                                type="text"
                                value={memberForm.zipCode}
                                onChange={(e) => setMemberForm(prev => ({ ...prev, zipCode: e.target.value }))}
                                className={inputClass}
                                placeholder="12345"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Family & Groups */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-teal-500">{t('tools.memberDirectory.familyGroups', 'Family & Groups')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.family', 'Family')}</label>
                            <select
                              value={memberForm.familyId || ''}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, familyId: e.target.value || null }))}
                              className={inputClass}
                            >
                              <option value="">{t('tools.memberDirectory.noFamilyAssigned', 'No family assigned')}</option>
                              {families.map(family => (
                                <option key={family.id} value={family.id}>{family.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.groups2', 'Groups')}</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {groups.map(group => (
                                <button
                                  key={group.id}
                                  type="button"
                                  onClick={() => toggleGroupInMember(group.id)}
                                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                    memberForm.groupIds.includes(group.id)
                                      ? 'bg-teal-500 text-white'
                                      : theme === 'dark'
                                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {group.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-teal-500">{t('tools.memberDirectory.importantDates', 'Important Dates')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.birthday', 'Birthday')}</label>
                            <input
                              type="date"
                              value={memberForm.birthday}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, birthday: e.target.value }))}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.anniversary', 'Anniversary')}</label>
                            <input
                              type="date"
                              value={memberForm.anniversary}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, anniversary: e.target.value }))}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Skills & Interests */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-teal-500">{t('tools.memberDirectory.skillsInterests', 'Skills & Interests')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.skills', 'Skills')}</label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                className={inputClass}
                                placeholder={t('tools.memberDirectory.addASkill', 'Add a skill')}
                              />
                              <button type="button" onClick={addSkill} className={buttonSecondary}>
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {memberForm.skills.map(skill => (
                                <span
                                  key={skill}
                                  className="flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-blue-500/20 text-blue-500"
                                >
                                  {skill}
                                  <button type="button" onClick={() => removeSkill(skill)}>
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.interests', 'Interests')}</label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                                className={inputClass}
                                placeholder={t('tools.memberDirectory.addAnInterest', 'Add an interest')}
                              />
                              <button type="button" onClick={addInterest} className={buttonSecondary}>
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {memberForm.interests.map(interest => (
                                <span
                                  key={interest}
                                  className="flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-purple-500/20 text-purple-500"
                                >
                                  {interest}
                                  <button type="button" onClick={() => removeInterest(interest)}>
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Communication Preferences */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-teal-500">{t('tools.memberDirectory.communicationPreferences', 'Communication Preferences')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {communicationOptions.map(pref => (
                            <button
                              key={pref}
                              type="button"
                              onClick={() => toggleCommunicationPreference(pref)}
                              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                memberForm.communicationPreferences.includes(pref)
                                  ? 'bg-teal-500 text-white'
                                  : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {pref}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes & Status */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-teal-500">{t('tools.memberDirectory.additionalInfo', 'Additional Info')}</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className={labelClass}>{t('tools.memberDirectory.notes', 'Notes')}</label>
                            <textarea
                              value={memberForm.notes}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, notes: e.target.value }))}
                              className={inputClass}
                              rows={3}
                              placeholder={t('tools.memberDirectory.additionalNotes', 'Additional notes...')}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="memberActive"
                              checked={memberForm.isActive}
                              onChange={(e) => setMemberForm(prev => ({ ...prev, isActive: e.target.checked }))}
                              className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                            />
                            <label htmlFor="memberActive" className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                              {t('tools.memberDirectory.activeMember', 'Active Member')}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setShowMemberForm(false);
                          setEditingMember(null);
                          setMemberForm(defaultMember);
                        }}
                        className={buttonSecondary}
                      >
                        {t('tools.memberDirectory.cancel', 'Cancel')}
                      </button>
                      <button
                        onClick={saveMember}
                        disabled={!memberForm.firstName || !memberForm.lastName}
                        className={`${buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Check className="w-4 h-4" />
                        {editingMember ? t('tools.memberDirectory.saveChanges', 'Save Changes') : t('tools.memberDirectory.addMember2', 'Add Member')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className={cardClass}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Members ({filteredMembers.length})
                  </h2>
                </div>

                {filteredMembers.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.memberDirectory.noMembersFound', 'No members found')}</p>
                    <p className="text-sm mt-1">{t('tools.memberDirectory.addAMemberOrAdjust', 'Add a member or adjust your filters')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMembers.map(member => (
                      <div
                        key={member.id}
                        className={`p-4 rounded-lg border ${
                          member.isActive
                            ? theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                            : theme === 'dark' ? 'bg-gray-800/50 border-gray-700 opacity-60' : 'bg-gray-100/50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                            }`}>
                              {member.firstName[0]}{member.lastName[0]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">
                                  {member.firstName} {member.lastName}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${membershipColors[member.membershipType]}`}>
                                  {member.membershipType}
                                </span>
                                {!member.isActive && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-500">
                                    {t('tools.memberDirectory.inactive2', 'Inactive')}
                                  </span>
                                )}
                              </div>
                              <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {member.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {member.email}
                                  </span>
                                )}
                                {member.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {member.phone}
                                  </span>
                                )}
                                {member.familyId && (
                                  <span className="flex items-center gap-1">
                                    <Home className="w-3 h-3" />
                                    {getFamilyName(member.familyId)}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Joined {new Date(member.joinDate).toLocaleDateString()}
                                </span>
                              </div>
                              {member.groupIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {member.groupIds.map(gId => {
                                    const group = groups.find(g => g.id === gId);
                                    return group ? (
                                      <span
                                        key={gId}
                                        className={`px-2 py-0.5 rounded text-xs ${
                                          theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                        }`}
                                      >
                                        {group.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleMemberActive(member.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                member.isActive
                                  ? 'text-green-500 hover:bg-green-500/10'
                                  : 'text-gray-400 hover:bg-gray-500/10'
                              }`}
                              title={member.isActive ? t('tools.memberDirectory.deactivate', 'Deactivate') : t('tools.memberDirectory.activate', 'Activate')}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => editMember(member)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMember(member.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
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
          </>
        )}

        {/* Families Tab */}
        {activeTab === 'families' && (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setFamilyForm(defaultFamily);
                  setEditingFamily(null);
                  setShowFamilyForm(true);
                }}
                className={buttonPrimary}
              >
                <Plus className="w-4 h-4" />
                {t('tools.memberDirectory.addFamily', 'Add Family')}
              </button>
            </div>

            {/* Family Form Modal */}
            {showFamilyForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${cardClass} max-w-lg w-full`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Home className="w-5 h-5 text-teal-500" />
                        {editingFamily ? t('tools.memberDirectory.editFamily', 'Edit Family') : t('tools.memberDirectory.addNewFamily', 'Add New Family')}
                      </h2>
                      <button
                        onClick={() => {
                          setShowFamilyForm(false);
                          setEditingFamily(null);
                          setFamilyForm(defaultFamily);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>{t('tools.memberDirectory.familyName', 'Family Name *')}</label>
                        <input
                          type="text"
                          value={familyForm.name}
                          onChange={(e) => setFamilyForm(prev => ({ ...prev, name: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.memberDirectory.eGJohnsonFamily', 'e.g., Johnson Family')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.memberDirectory.primaryContact', 'Primary Contact')}</label>
                        <select
                          value={familyForm.primaryContactId || ''}
                          onChange={(e) => setFamilyForm(prev => ({ ...prev, primaryContactId: e.target.value || null }))}
                          className={inputClass}
                        >
                          <option value="">{t('tools.memberDirectory.selectContact', 'Select contact')}</option>
                          {members.map(member => (
                            <option key={member.id} value={member.id}>
                              {member.firstName} {member.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.memberDirectory.address2', 'Address')}</label>
                        <input
                          type="text"
                          value={familyForm.address}
                          onChange={(e) => setFamilyForm(prev => ({ ...prev, address: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.memberDirectory.streetAddress2', 'Street address')}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>{t('tools.memberDirectory.city2', 'City')}</label>
                          <input
                            type="text"
                            value={familyForm.city}
                            onChange={(e) => setFamilyForm(prev => ({ ...prev, city: e.target.value }))}
                            className={inputClass}
                            placeholder={t('tools.memberDirectory.city4', 'City')}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.memberDirectory.state2', 'State')}</label>
                          <input
                            type="text"
                            value={familyForm.state}
                            onChange={(e) => setFamilyForm(prev => ({ ...prev, state: e.target.value }))}
                            className={inputClass}
                            placeholder="ST"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.memberDirectory.zip2', 'Zip')}</label>
                          <input
                            type="text"
                            value={familyForm.zipCode}
                            onChange={(e) => setFamilyForm(prev => ({ ...prev, zipCode: e.target.value }))}
                            className={inputClass}
                            placeholder="12345"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.memberDirectory.notes2', 'Notes')}</label>
                        <textarea
                          value={familyForm.notes}
                          onChange={(e) => setFamilyForm(prev => ({ ...prev, notes: e.target.value }))}
                          className={inputClass}
                          rows={3}
                          placeholder={t('tools.memberDirectory.additionalNotes2', 'Additional notes...')}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setShowFamilyForm(false);
                          setEditingFamily(null);
                          setFamilyForm(defaultFamily);
                        }}
                        className={buttonSecondary}
                      >
                        {t('tools.memberDirectory.cancel2', 'Cancel')}
                      </button>
                      <button
                        onClick={saveFamily}
                        disabled={!familyForm.name}
                        className={`${buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Check className="w-4 h-4" />
                        {editingFamily ? t('tools.memberDirectory.saveChanges2', 'Save Changes') : t('tools.memberDirectory.addFamily2', 'Add Family')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Families List */}
            <div className={cardClass}>
              <div className="p-4">
                {families.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Home className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.memberDirectory.noFamiliesAdded', 'No families added')}</p>
                    <p className="text-sm mt-1">{t('tools.memberDirectory.createAFamilyToGroup', 'Create a family to group members')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {families.map(family => {
                      const members = getFamilyMembers(family.id);
                      const primaryContact = members.find(m => m.id === family.primaryContactId);
                      return (
                        <div
                          key={family.id}
                          className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{family.name}</h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {members.length} member{members.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => editFamily(family)}
                                className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteFamily(family.id)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {family.address && (
                            <p className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              <MapPin className="w-3 h-3" />
                              {family.address}, {family.city}, {family.state} {family.zipCode}
                            </p>
                          )}
                          {primaryContact && (
                            <p className={`flex items-center gap-1 text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Star className="w-3 h-3" />
                              Primary: {primaryContact.firstName} {primaryContact.lastName}
                            </p>
                          )}
                          {members.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t('tools.memberDirectory.familyMembers', 'Family Members:')}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {members.map(member => (
                                  <span
                                    key={member.id}
                                    className={`px-2 py-1 rounded text-sm ${
                                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    {member.firstName} {member.lastName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setGroupForm(defaultGroup);
                  setEditingGroup(null);
                  setShowGroupForm(true);
                }}
                className={buttonPrimary}
              >
                <Plus className="w-4 h-4" />
                {t('tools.memberDirectory.addGroup', 'Add Group')}
              </button>
            </div>

            {/* Group Form Modal */}
            {showGroupForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${cardClass} max-w-lg w-full`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Building className="w-5 h-5 text-teal-500" />
                        {editingGroup ? t('tools.memberDirectory.editGroup', 'Edit Group') : t('tools.memberDirectory.addNewGroup', 'Add New Group')}
                      </h2>
                      <button
                        onClick={() => {
                          setShowGroupForm(false);
                          setEditingGroup(null);
                          setGroupForm(defaultGroup);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>{t('tools.memberDirectory.groupName', 'Group Name *')}</label>
                        <input
                          type="text"
                          value={groupForm.name}
                          onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.memberDirectory.eGFinanceCommittee', 'e.g., Finance Committee')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.memberDirectory.type', 'Type')}</label>
                        <select
                          value={groupForm.type}
                          onChange={(e) => setGroupForm(prev => ({ ...prev, type: e.target.value as GroupType }))}
                          className={inputClass}
                        >
                          {groupTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.memberDirectory.description', 'Description')}</label>
                        <textarea
                          value={groupForm.description}
                          onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                          className={inputClass}
                          rows={2}
                          placeholder={t('tools.memberDirectory.groupDescription', 'Group description...')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.memberDirectory.leader', 'Leader')}</label>
                        <select
                          value={groupForm.leaderId || ''}
                          onChange={(e) => setGroupForm(prev => ({ ...prev, leaderId: e.target.value || null }))}
                          className={inputClass}
                        >
                          <option value="">{t('tools.memberDirectory.selectLeader', 'Select leader')}</option>
                          {members.filter(m => m.isActive).map(member => (
                            <option key={member.id} value={member.id}>
                              {member.firstName} {member.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.memberDirectory.meetingSchedule', 'Meeting Schedule')}</label>
                        <input
                          type="text"
                          value={groupForm.meetingSchedule}
                          onChange={(e) => setGroupForm(prev => ({ ...prev, meetingSchedule: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.memberDirectory.eGEverySundayAt', 'e.g., Every Sunday at 5 PM')}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="groupActive"
                          checked={groupForm.isActive}
                          onChange={(e) => setGroupForm(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                        />
                        <label htmlFor="groupActive" className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                          {t('tools.memberDirectory.activeGroup', 'Active Group')}
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setShowGroupForm(false);
                          setEditingGroup(null);
                          setGroupForm(defaultGroup);
                        }}
                        className={buttonSecondary}
                      >
                        {t('tools.memberDirectory.cancel3', 'Cancel')}
                      </button>
                      <button
                        onClick={saveGroup}
                        disabled={!groupForm.name}
                        className={`${buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Check className="w-4 h-4" />
                        {editingGroup ? t('tools.memberDirectory.saveChanges3', 'Save Changes') : t('tools.memberDirectory.addGroup2', 'Add Group')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Groups List */}
            <div className={cardClass}>
              <div className="p-4">
                {groups.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Building className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.memberDirectory.noGroupsCreated', 'No groups created')}</p>
                    <p className="text-sm mt-1">{t('tools.memberDirectory.createCommitteesMinistriesOrOther', 'Create committees, ministries, or other groups')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map(group => {
                      const members = getGroupMembers(group.id);
                      const leader = members.find(m => m.id === group.leaderId);
                      return (
                        <div
                          key={group.id}
                          className={`p-4 rounded-lg border ${
                            group.isActive
                              ? theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                              : theme === 'dark' ? 'bg-gray-800/50 border-gray-700 opacity-60' : 'bg-gray-100/50 border-gray-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{group.name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {group.type}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => editGroup(group)}
                                className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteGroup(group.id)}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {group.description && (
                            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {group.description}
                            </p>
                          )}
                          <div className={`mt-3 space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {leader && (
                              <p className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Leader: {leader.firstName} {leader.lastName}
                              </p>
                            )}
                            {group.meetingSchedule && (
                              <p className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {group.meetingSchedule}
                              </p>
                            )}
                            <p className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {members.length} member{members.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Membership Statistics */}
            <div className={cardClass}>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-500" />
                  {t('tools.memberDirectory.membershipStatistics', 'Membership Statistics')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {membershipTypes.map(type => (
                    <div key={type} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{type}</p>
                      <p className={`text-2xl font-bold ${membershipColors[type].replace('bg-', 'text-').replace('/20', '')}`}>
                        {stats.membersByType[type]}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    New members this year: <span className="font-semibold text-teal-500">{stats.newMembersThisYear}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Birthdays */}
            <div className={cardClass}>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Cake className="w-5 h-5 text-pink-500" />
                  {t('tools.memberDirectory.upcomingBirthdaysNext30Days', 'Upcoming Birthdays (Next 30 Days)')}
                </h2>
                {upcomingBirthdays.length === 0 ? (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.memberDirectory.noUpcomingBirthdays', 'No upcoming birthdays')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {upcomingBirthdays.map(member => {
                      const birthday = new Date(member.birthday);
                      return (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Cake className="w-4 h-4 text-pink-500" />
                            <span className="font-medium">{member.firstName} {member.lastName}</span>
                          </div>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {birthday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Anniversaries */}
            <div className={cardClass}>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-500" />
                  {t('tools.memberDirectory.upcomingAnniversariesNext30Days', 'Upcoming Anniversaries (Next 30 Days)')}
                </h2>
                {upcomingAnniversaries.length === 0 ? (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.memberDirectory.noUpcomingAnniversaries', 'No upcoming anniversaries')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {upcomingAnniversaries.map(member => {
                      const anniversary = new Date(member.anniversary);
                      const years = new Date().getFullYear() - anniversary.getFullYear();
                      return (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Gift className="w-4 h-4 text-amber-500" />
                            <span className="font-medium">{member.firstName} {member.lastName}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500`}>
                              {years} years
                            </span>
                          </div>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {anniversary.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Group Summary */}
            <div className={cardClass}>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-500" />
                  {t('tools.memberDirectory.groupMembershipSummary', 'Group Membership Summary')}
                </h2>
                {groups.length === 0 ? (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.memberDirectory.noGroupsCreated2', 'No groups created')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {groups.map(group => {
                      const memberCount = getGroupMembers(group.id).length;
                      return (
                        <div
                          key={group.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Building className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">{group.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {group.type}
                            </span>
                          </div>
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {memberCount} member{memberCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.memberDirectory.aboutMemberDirectoryTool', 'About Member Directory Tool')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          A comprehensive member management system for churches, clubs, and community organizations.
          Track member information, organize families and groups, manage skills and interests, and never miss important dates.
          Data is automatically synced to your account when logged in, with local backup for offline access.
        </p>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default MemberDirectoryTool;
