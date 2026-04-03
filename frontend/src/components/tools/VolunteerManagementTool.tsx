'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  User,
  Award,
  Star,
  ClipboardList,
  MessageSquare,
  Heart,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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

interface VolunteerManagementToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type VolunteerStatus = 'active' | 'inactive' | 'pending' | 'on_leave';
type ShiftStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  dateOfBirth: string;
  skills: string[];
  interests: string[];
  availability: string[];
  status: VolunteerStatus;
  hoursLogged: number;
  joinDate: string;
  notes: string;
  createdAt: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  spotsAvailable: number;
  spotsFilled: number;
  skills: string[];
  coordinator: string;
  isRecurring: boolean;
  category: string;
  createdAt: string;
}

interface Shift {
  id: string;
  volunteerId: string;
  opportunityId: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  status: ShiftStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  notes: string;
  createdAt: string;
}

interface Recognition {
  id: string;
  volunteerId: string;
  type: 'badge' | 'milestone' | 'appreciation';
  title: string;
  description: string;
  awardedAt: string;
}

// Constants
const SKILL_OPTIONS = [
  'Event Planning',
  'Fundraising',
  'Marketing',
  'Social Media',
  'Teaching',
  'Mentoring',
  'First Aid',
  'Driving',
  'Photography',
  'Graphic Design',
  'Web Development',
  'Data Entry',
  'Customer Service',
  'Languages',
  'Music',
  'Cooking',
  'Construction',
  'Gardening',
];

const AVAILABILITY_OPTIONS = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings',
  'On-Call',
];

const CATEGORY_OPTIONS = [
  'Education',
  'Healthcare',
  'Environment',
  'Food Bank',
  'Animal Shelter',
  'Senior Care',
  'Youth Programs',
  'Disaster Relief',
  'Community Events',
  'Administration',
];

// Column configurations for exports
const VOLUNTEER_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'hoursLogged', header: 'Hours', type: 'number' },
  { key: 'joinDate', header: 'Join Date', type: 'date' },
];

const OPPORTUNITY_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'spotsAvailable', header: 'Spots', type: 'number' },
  { key: 'spotsFilled', header: 'Filled', type: 'number' },
];

const SHIFT_COLUMNS: ColumnConfig[] = [
  { key: 'volunteerName', header: 'Volunteer', type: 'string' },
  { key: 'opportunityTitle', header: 'Opportunity', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'hoursWorked', header: 'Hours', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Main Component
export const VolunteerManagementTool: React.FC<VolunteerManagementToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: volunteers,
    addItem: addVolunteerToBackend,
    updateItem: updateVolunteerBackend,
    deleteItem: deleteVolunteerBackend,
    isSynced: volunteersSynced,
    isSaving: volunteersSaving,
    lastSaved: volunteersLastSaved,
    syncError: volunteersSyncError,
    forceSync: forceVolunteersSync,
  } = useToolData<Volunteer>('volunteer-profiles', [], VOLUNTEER_COLUMNS);

  const {
    data: opportunities,
    addItem: addOpportunityToBackend,
    updateItem: updateOpportunityBackend,
    deleteItem: deleteOpportunityBackend,
  } = useToolData<Opportunity>('volunteer-opportunities', [], OPPORTUNITY_COLUMNS);

  const {
    data: shifts,
    addItem: addShiftToBackend,
    updateItem: updateShiftBackend,
    deleteItem: deleteShiftBackend,
  } = useToolData<Shift>('volunteer-shifts', [], SHIFT_COLUMNS);

  const {
    data: recognitions,
    addItem: addRecognitionToBackend,
    deleteItem: deleteRecognitionBackend,
  } = useToolData<Recognition>('volunteer-recognitions', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'volunteers' | 'opportunities' | 'schedule' | 'hours' | 'recognition'>('volunteers');
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form state
  const [newVolunteer, setNewVolunteer] = useState<Partial<Volunteer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    dateOfBirth: '',
    skills: [],
    interests: [],
    availability: [],
    status: 'pending',
    notes: '',
  });

  const [newOpportunity, setNewOpportunity] = useState<Partial<Opportunity>>({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    spotsAvailable: 5,
    skills: [],
    coordinator: '',
    isRecurring: false,
    category: '',
  });

  const [newShift, setNewShift] = useState<Partial<Shift>>({
    volunteerId: '',
    opportunityId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.volunteerName || params.firstName || params.lastName) {
        setNewVolunteer({
          ...newVolunteer,
          firstName: params.firstName || '',
          lastName: params.lastName || params.volunteerName?.split(' ').pop() || '',
          email: params.email || '',
          phone: params.phone || '',
        });
        setShowVolunteerForm(true);
        setIsPrefilled(true);
      }
      if (params.opportunityTitle || params.eventName) {
        setNewOpportunity({
          ...newOpportunity,
          title: params.opportunityTitle || params.eventName || '',
          date: params.date || '',
          location: params.location || '',
        });
        setShowOpportunityForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Add new volunteer
  const addVolunteer = () => {
    if (!newVolunteer.firstName || !newVolunteer.lastName || !newVolunteer.email) {
      setValidationMessage('Please enter first name, last name, and email');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const volunteer: Volunteer = {
      id: generateId(),
      firstName: newVolunteer.firstName || '',
      lastName: newVolunteer.lastName || '',
      email: newVolunteer.email || '',
      phone: newVolunteer.phone || '',
      address: newVolunteer.address || '',
      city: newVolunteer.city || '',
      state: newVolunteer.state || '',
      zipCode: newVolunteer.zipCode || '',
      emergencyContact: newVolunteer.emergencyContact || '',
      emergencyPhone: newVolunteer.emergencyPhone || '',
      dateOfBirth: newVolunteer.dateOfBirth || '',
      skills: newVolunteer.skills || [],
      interests: newVolunteer.interests || [],
      availability: newVolunteer.availability || [],
      status: newVolunteer.status || 'pending',
      hoursLogged: 0,
      joinDate: new Date().toISOString(),
      notes: newVolunteer.notes || '',
      createdAt: new Date().toISOString(),
    };

    addVolunteerToBackend(volunteer);
    setShowVolunteerForm(false);
    setNewVolunteer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContact: '',
      emergencyPhone: '',
      dateOfBirth: '',
      skills: [],
      interests: [],
      availability: [],
      status: 'pending',
      notes: '',
    });
  };

  // Add new opportunity
  const addOpportunity = () => {
    if (!newOpportunity.title || !newOpportunity.date) {
      setValidationMessage('Please enter title and date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const opportunity: Opportunity = {
      id: generateId(),
      title: newOpportunity.title || '',
      description: newOpportunity.description || '',
      location: newOpportunity.location || '',
      date: newOpportunity.date || '',
      startTime: newOpportunity.startTime || '',
      endTime: newOpportunity.endTime || '',
      spotsAvailable: newOpportunity.spotsAvailable || 5,
      spotsFilled: 0,
      skills: newOpportunity.skills || [],
      coordinator: newOpportunity.coordinator || '',
      isRecurring: newOpportunity.isRecurring || false,
      category: newOpportunity.category || '',
      createdAt: new Date().toISOString(),
    };

    addOpportunityToBackend(opportunity);
    setShowOpportunityForm(false);
    setNewOpportunity({
      title: '',
      description: '',
      location: '',
      date: '',
      startTime: '',
      endTime: '',
      spotsAvailable: 5,
      skills: [],
      coordinator: '',
      isRecurring: false,
      category: '',
    });
  };

  // Schedule shift
  const scheduleShift = () => {
    if (!newShift.volunteerId || !newShift.opportunityId || !newShift.date) {
      setValidationMessage('Please select volunteer, opportunity, and date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const opportunity = opportunities.find(o => o.id === newShift.opportunityId);
    const shift: Shift = {
      id: generateId(),
      volunteerId: newShift.volunteerId || '',
      opportunityId: newShift.opportunityId || '',
      date: newShift.date || '',
      startTime: newShift.startTime || opportunity?.startTime || '',
      endTime: newShift.endTime || opportunity?.endTime || '',
      hoursWorked: 0,
      status: 'scheduled',
      checkInTime: null,
      checkOutTime: null,
      notes: newShift.notes || '',
      createdAt: new Date().toISOString(),
    };

    addShiftToBackend(shift);

    // Update opportunity spots
    if (opportunity) {
      updateOpportunityBackend(opportunity.id, {
        spotsFilled: opportunity.spotsFilled + 1,
      });
    }

    setShowShiftForm(false);
    setNewShift({
      volunteerId: '',
      opportunityId: '',
      date: '',
      startTime: '',
      endTime: '',
      notes: '',
    });
  };

  // Check in/out volunteer
  const checkIn = (shiftId: string) => {
    const now = new Date().toISOString();
    updateShiftBackend(shiftId, { checkInTime: now, status: 'scheduled' });
  };

  const checkOut = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift || !shift.checkInTime) return;

    const checkInTime = new Date(shift.checkInTime);
    const checkOutTime = new Date();
    const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    updateShiftBackend(shiftId, {
      checkOutTime: checkOutTime.toISOString(),
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      status: 'completed',
    });

    // Update volunteer hours
    const volunteer = volunteers.find(v => v.id === shift.volunteerId);
    if (volunteer) {
      updateVolunteerBackend(volunteer.id, {
        hoursLogged: volunteer.hoursLogged + hoursWorked,
      });
    }
  };

  // Delete functions
  const deleteVolunteer = async (volunteerId: string) => {
    const confirmed = await confirm('Are you sure? This will also delete all associated shifts.');
    if (confirmed) {
      deleteVolunteerBackend(volunteerId);
      shifts.filter(s => s.volunteerId === volunteerId).forEach(s => deleteShiftBackend(s.id));
      recognitions.filter(r => r.volunteerId === volunteerId).forEach(r => deleteRecognitionBackend(r.id));
    }
  };

  const deleteOpportunity = async (opportunityId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this opportunity?');
    if (confirmed) {
      deleteOpportunityBackend(opportunityId);
      shifts.filter(s => s.opportunityId === opportunityId).forEach(s => deleteShiftBackend(s.id));
    }
  };

  // Analytics
  const analytics = useMemo(() => {
    const activeVolunteers = volunteers.filter(v => v.status === 'active').length;
    const totalHours = volunteers.reduce((sum, v) => sum + v.hoursLogged, 0);
    const upcomingOpportunities = opportunities.filter(o => new Date(o.date) >= new Date()).length;
    const completedShifts = shifts.filter(s => s.status === 'completed').length;

    return {
      activeVolunteers,
      totalHours,
      upcomingOpportunities,
      completedShifts,
    };
  }, [volunteers, opportunities, shifts]);

  // Filtered data
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(v => {
      const name = `${v.firstName} ${v.lastName}`.toLowerCase();
      const matchesSearch = searchTerm === '' || name.includes(searchTerm.toLowerCase()) || v.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [volunteers, searchTerm, filterStatus]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(o => {
      const matchesSearch = searchTerm === '' || o.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || o.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [opportunities, searchTerm, filterCategory]);

  const getStatusColor = (status: VolunteerStatus | ShiftStatus) => {
    switch (status) {
      case 'active':
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'inactive':
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'on_leave':
      case 'no_show': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.volunteerManagement.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.volunteerManagement.volunteerManagement', 'Volunteer Management')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.volunteerManagement.coordinateVolunteersScheduleShiftsAnd', 'Coordinate volunteers, schedule shifts, and track hours')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="volunteer-management" toolName="Volunteer Management" />

              <SyncStatus
                isSynced={volunteersSynced}
                isSaving={volunteersSaving}
                lastSaved={volunteersLastSaved}
                syncError={volunteersSyncError}
                onForceSync={forceVolunteersSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredVolunteers, 'volunteers', VOLUNTEER_COLUMNS)}
                onExportExcel={() => exportToExcel(filteredVolunteers, 'volunteers', VOLUNTEER_COLUMNS)}
                onExportJSON={() => exportToJSON(filteredVolunteers, 'volunteers')}
                onExportPDF={() => exportToPDF(filteredVolunteers, 'Volunteer Report', VOLUNTEER_COLUMNS)}
                onCopy={() => copyUtil(filteredVolunteers)}
                onPrint={() => printData(filteredVolunteers, 'Volunteers', VOLUNTEER_COLUMNS)}
                theme={theme}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.volunteerManagement.activeVolunteers', 'Active Volunteers')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.activeVolunteers}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.volunteerManagement.totalHours', 'Total Hours')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalHours.toFixed(1)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.volunteerManagement.upcomingEvents', 'Upcoming Events')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.upcomingOpportunities}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.volunteerManagement.completedShifts', 'Completed Shifts')}</span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.completedShifts}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['volunteers', 'opportunities', 'schedule', 'hours', 'recognition'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-purple-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Volunteers Tab */}
          {activeTab === 'volunteers' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.volunteerManagement.searchVolunteers', 'Search volunteers...')}
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
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.volunteerManagement.allStatus', 'All Status')}</option>
                    <option value="active">{t('tools.volunteerManagement.active', 'Active')}</option>
                    <option value="pending">{t('tools.volunteerManagement.pending', 'Pending')}</option>
                    <option value="inactive">{t('tools.volunteerManagement.inactive', 'Inactive')}</option>
                    <option value="on_leave">{t('tools.volunteerManagement.onLeave', 'On Leave')}</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowVolunteerForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.volunteerManagement.addVolunteer', 'Add Volunteer')}
                </button>
              </div>

              {/* Volunteer Form Modal */}
              {showVolunteerForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.volunteerManagement.addNewVolunteer', 'Add New Volunteer')}
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.volunteerManagement.firstName', 'First Name *')}
                          </label>
                          <input
                            type="text"
                            value={newVolunteer.firstName}
                            onChange={(e) => setNewVolunteer({ ...newVolunteer, firstName: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.volunteerManagement.lastName', 'Last Name *')}
                          </label>
                          <input
                            type="text"
                            value={newVolunteer.lastName}
                            onChange={(e) => setNewVolunteer({ ...newVolunteer, lastName: e.target.value })}
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
                          {t('tools.volunteerManagement.email', 'Email *')}
                        </label>
                        <input
                          type="email"
                          value={newVolunteer.email}
                          onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.volunteerManagement.phone', 'Phone')}
                        </label>
                        <input
                          type="tel"
                          value={newVolunteer.phone}
                          onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.volunteerManagement.skills', 'Skills')}
                        </label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-lg max-h-32 overflow-y-auto">
                          {SKILL_OPTIONS.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                const skills = newVolunteer.skills || [];
                                if (skills.includes(skill)) {
                                  setNewVolunteer({ ...newVolunteer, skills: skills.filter(s => s !== skill) });
                                } else {
                                  setNewVolunteer({ ...newVolunteer, skills: [...skills, skill] });
                                }
                              }}
                              className={`px-2 py-1 text-xs rounded-full ${
                                newVolunteer.skills?.includes(skill)
                                  ? 'bg-purple-500 text-white'
                                  : theme === 'dark'
                                  ? 'bg-gray-600 text-gray-300'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.volunteerManagement.availability', 'Availability')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABILITY_OPTIONS.map((avail) => (
                            <button
                              key={avail}
                              type="button"
                              onClick={() => {
                                const availability = newVolunteer.availability || [];
                                if (availability.includes(avail)) {
                                  setNewVolunteer({ ...newVolunteer, availability: availability.filter(a => a !== avail) });
                                } else {
                                  setNewVolunteer({ ...newVolunteer, availability: [...availability, avail] });
                                }
                              }}
                              className={`px-2 py-1 text-xs rounded-full ${
                                newVolunteer.availability?.includes(avail)
                                  ? 'bg-purple-500 text-white'
                                  : theme === 'dark'
                                  ? 'bg-gray-600 text-gray-300'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {avail}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.volunteerManagement.status', 'Status')}
                        </label>
                        <select
                          value={newVolunteer.status}
                          onChange={(e) => setNewVolunteer({ ...newVolunteer, status: e.target.value as VolunteerStatus })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="pending">{t('tools.volunteerManagement.pending2', 'Pending')}</option>
                          <option value="active">{t('tools.volunteerManagement.active2', 'Active')}</option>
                          <option value="inactive">{t('tools.volunteerManagement.inactive2', 'Inactive')}</option>
                          <option value="on_leave">{t('tools.volunteerManagement.onLeave2', 'On Leave')}</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowVolunteerForm(false)}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {t('tools.volunteerManagement.cancel', 'Cancel')}
                      </button>
                      <button
                        onClick={addVolunteer}
                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        {t('tools.volunteerManagement.addVolunteer2', 'Add Volunteer')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Volunteers List */}
              <div className="space-y-3">
                {filteredVolunteers.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.volunteerManagement.noVolunteersFoundAddYour', 'No volunteers found. Add your first volunteer to get started.')}</p>
                  </div>
                ) : (
                  filteredVolunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <User className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {volunteer.firstName} {volunteer.lastName}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {volunteer.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(volunteer.status)}`}>
                              {volunteer.status.replace('_', ' ')}
                            </span>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {volunteer.hoursLogged.toFixed(1)} hours
                            </p>
                          </div>
                          <button
                            onClick={() => deleteVolunteer(volunteer.id)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {volunteer.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {volunteer.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                          {volunteer.skills.length > 5 && (
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              +{volunteer.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Opportunities Tab */}
          {activeTab === 'opportunities' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.volunteerManagement.searchOpportunities', 'Search opportunities...')}
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
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.volunteerManagement.allCategories', 'All Categories')}</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowOpportunityForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.volunteerManagement.addOpportunity', 'Add Opportunity')}
                </button>
              </div>

              {/* Opportunity Form Modal */}
              {showOpportunityForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.volunteerManagement.addNewOpportunity', 'Add New Opportunity')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.volunteerManagement.title', 'Title *')}
                        </label>
                        <input
                          type="text"
                          value={newOpportunity.title}
                          onChange={(e) => setNewOpportunity({ ...newOpportunity, title: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.volunteerManagement.description', 'Description')}
                        </label>
                        <textarea
                          value={newOpportunity.description}
                          onChange={(e) => setNewOpportunity({ ...newOpportunity, description: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.volunteerManagement.date', 'Date *')}
                          </label>
                          <input
                            type="date"
                            value={newOpportunity.date}
                            onChange={(e) => setNewOpportunity({ ...newOpportunity, date: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.volunteerManagement.category', 'Category')}
                          </label>
                          <select
                            value={newOpportunity.category}
                            onChange={(e) => setNewOpportunity({ ...newOpportunity, category: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="">{t('tools.volunteerManagement.selectCategory', 'Select category...')}</option>
                            {CATEGORY_OPTIONS.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.volunteerManagement.startTime', 'Start Time')}
                          </label>
                          <input
                            type="time"
                            value={newOpportunity.startTime}
                            onChange={(e) => setNewOpportunity({ ...newOpportunity, startTime: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.volunteerManagement.endTime', 'End Time')}
                          </label>
                          <input
                            type="time"
                            value={newOpportunity.endTime}
                            onChange={(e) => setNewOpportunity({ ...newOpportunity, endTime: e.target.value })}
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
                          {t('tools.volunteerManagement.location', 'Location')}
                        </label>
                        <input
                          type="text"
                          value={newOpportunity.location}
                          onChange={(e) => setNewOpportunity({ ...newOpportunity, location: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.volunteerManagement.spotsAvailable', 'Spots Available')}
                        </label>
                        <input
                          type="number"
                          value={newOpportunity.spotsAvailable || ''}
                          onChange={(e) => setNewOpportunity({ ...newOpportunity, spotsAvailable: parseInt(e.target.value) || 0 })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowOpportunityForm(false)}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {t('tools.volunteerManagement.cancel2', 'Cancel')}
                      </button>
                      <button
                        onClick={addOpportunity}
                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        {t('tools.volunteerManagement.addOpportunity2', 'Add Opportunity')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Opportunities List */}
              <div className="space-y-3">
                {filteredOpportunities.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.volunteerManagement.noOpportunitiesFoundCreateYour', 'No opportunities found. Create your first opportunity to get started.')}</p>
                  </div>
                ) : (
                  filteredOpportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {opportunity.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Calendar className="w-3 h-3" />
                              {formatDate(opportunity.date)}
                            </span>
                            {opportunity.location && (
                              <span className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <MapPin className="w-3 h-3" />
                                {opportunity.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {opportunity.spotsFilled}/{opportunity.spotsAvailable} filled
                            </p>
                            {opportunity.category && (
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {opportunity.category}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteOpportunity(opportunity.id)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                          >
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

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowShiftForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.volunteerManagement.scheduleShift', 'Schedule Shift')}
                </button>
              </div>

              {/* Shift Form Modal */}
              {showShiftForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.volunteerManagement.scheduleShift2', 'Schedule Shift')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.volunteerManagement.volunteer', 'Volunteer *')}
                        </label>
                        <select
                          value={newShift.volunteerId}
                          onChange={(e) => setNewShift({ ...newShift, volunteerId: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">{t('tools.volunteerManagement.selectVolunteer', 'Select volunteer...')}</option>
                          {volunteers.filter(v => v.status === 'active').map((v) => (
                            <option key={v.id} value={v.id}>{v.firstName} {v.lastName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.volunteerManagement.opportunity', 'Opportunity *')}
                        </label>
                        <select
                          value={newShift.opportunityId}
                          onChange={(e) => setNewShift({ ...newShift, opportunityId: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">{t('tools.volunteerManagement.selectOpportunity', 'Select opportunity...')}</option>
                          {opportunities.filter(o => o.spotsFilled < o.spotsAvailable).map((o) => (
                            <option key={o.id} value={o.id}>{o.title} - {formatDate(o.date)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.volunteerManagement.date2', 'Date *')}
                        </label>
                        <input
                          type="date"
                          value={newShift.date}
                          onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
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
                        onClick={() => setShowShiftForm(false)}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {t('tools.volunteerManagement.cancel3', 'Cancel')}
                      </button>
                      <button
                        onClick={scheduleShift}
                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        {t('tools.volunteerManagement.schedule', 'Schedule')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Shifts List */}
              <div className="space-y-3">
                {shifts.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.volunteerManagement.noShiftsScheduledScheduleA', 'No shifts scheduled. Schedule a shift to get started.')}</p>
                  </div>
                ) : (
                  shifts.map((shift) => {
                    const volunteer = volunteers.find(v => v.id === shift.volunteerId);
                    const opportunity = opportunities.find(o => o.id === shift.opportunityId);
                    return (
                      <div
                        key={shift.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {volunteer?.firstName} {volunteer?.lastName}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {opportunity?.title} - {formatDate(shift.date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shift.status)}`}>
                              {shift.status.replace('_', ' ')}
                            </span>
                            {shift.status === 'scheduled' && !shift.checkInTime && (
                              <button
                                onClick={() => checkIn(shift.id)}
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                              >
                                {t('tools.volunteerManagement.checkIn', 'Check In')}
                              </button>
                            )}
                            {shift.checkInTime && !shift.checkOutTime && (
                              <button
                                onClick={() => checkOut(shift.id)}
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                              >
                                {t('tools.volunteerManagement.checkOut', 'Check Out')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Hours Tab */}
          {activeTab === 'hours' && (
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.volunteerManagement.hoursLoggedByVolunteer', 'Hours Logged by Volunteer')}
              </h3>
              {volunteers
                .filter(v => v.hoursLogged > 0)
                .sort((a, b) => b.hoursLogged - a.hoursLogged)
                .map((volunteer, index) => (
                  <div
                    key={volunteer.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {volunteer.firstName} {volunteer.lastName}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Since {formatDate(volunteer.joinDate)}
                          </p>
                        </div>
                      </div>
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {volunteer.hoursLogged.toFixed(1)} hrs
                      </p>
                    </div>
                  </div>
                ))}
              {volunteers.filter(v => v.hoursLogged > 0).length === 0 && (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.volunteerManagement.noHoursLoggedYetHours', 'No hours logged yet. Hours are tracked when volunteers check out.')}</p>
                </div>
              )}
            </div>
          )}

          {/* Recognition Tab */}
          {activeTab === 'recognition' && (
            <div className="space-y-4">
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.volunteerManagement.topVolunteers', 'Top Volunteers')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {volunteers
                    .filter(v => v.hoursLogged > 0)
                    .sort((a, b) => b.hoursLogged - a.hoursLogged)
                    .slice(0, 3)
                    .map((volunteer, index) => (
                      <div
                        key={volunteer.id}
                        className={`p-4 rounded-lg text-center ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                        }`}
                      >
                        <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        }`}>
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {volunteer.firstName} {volunteer.lastName}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {volunteer.hoursLogged.toFixed(1)} hours
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {recognitions.length > 0 && (
                <div className="space-y-3">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.volunteerManagement.recentRecognitions', 'Recent Recognitions')}
                  </h4>
                  {recognitions.map((recognition) => {
                    const volunteer = volunteers.find(v => v.id === recognition.volunteerId);
                    return (
                      <div
                        key={recognition.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {recognition.title}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {volunteer?.firstName} {volunteer?.lastName} - {formatDate(recognition.awardedAt)}
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
        </div>
      </div>
    </div>
  );
};

export default VolunteerManagementTool;
