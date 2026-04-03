import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Baby, Phone, Mail, AlertTriangle, Users, Heart, Calendar, Edit2, Trash2, X, Shield, Clock, Camera, FileText, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import { UIConfig } from '../ContextualUI';

interface ChildProfileToolProps {
  uiConfig?: UIConfig;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isAuthorizedPickup: boolean;
}

interface MedicalInfo {
  allergies: string[];
  medications: string[];
  conditions: string[];
  dietaryRestrictions: string[];
  doctorName: string;
  doctorPhone: string;
  insuranceProvider: string;
  insuranceNumber: string;
}

interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  classroom: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'waitlist';
  photoUrl?: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  emergencyContacts: EmergencyContact[];
  authorizedPickups: string[];
  medicalInfo: MedicalInfo;
  schedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const ChildProfileTool: React.FC<ChildProfileToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const COLUMNS: ColumnConfig[] = [
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
    { key: 'dateOfBirth', header: 'Date of Birth' },
    { key: 'classroom', header: 'Classroom' },
    { key: 'status', header: 'Status' },
    { key: 'parentName', header: 'Parent Name' },
    { key: 'parentPhone', header: 'Parent Phone' },
  ];

  const {
    data: children,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
  } = useToolData<ChildProfile>('child-profile', [], COLUMNS);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [viewingChild, setViewingChild] = useState<ChildProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'contacts' | 'schedule'>('info');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male' as ChildProfile['gender'],
    classroom: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active' as ChildProfile['status'],
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    emergencyContacts: [] as EmergencyContact[],
    medicalInfo: {
      allergies: [] as string[],
      medications: [] as string[],
      conditions: [] as string[],
      dietaryRestrictions: [] as string[],
      doctorName: '',
      doctorPhone: '',
      insuranceProvider: '',
      insuranceNumber: '',
    },
    schedule: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
    },
    notes: '',
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    isAuthorizedPickup: false,
  });

  const classrooms = [...new Set(children.map(c => c.classroom).filter(Boolean))];

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

      if (params.classroom) {
        setSelectedClassroom(params.classroom);
        hasChanges = true;
      }
      if (params.status && ['active', 'inactive', 'waitlist'].includes(params.status)) {
        setSelectedStatus(params.status);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredChildren = children.filter(child => {
    const matchesSearch = `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClassroom = selectedClassroom === 'all' || child.classroom === selectedClassroom;
    const matchesStatus = selectedStatus === 'all' || child.status === selectedStatus;
    return matchesSearch && matchesClassroom && matchesStatus;
  });

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months };
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      classroom: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      address: '',
      emergencyContacts: [],
      medicalInfo: {
        allergies: [],
        medications: [],
        conditions: [],
        dietaryRestrictions: [],
        doctorName: '',
        doctorPhone: '',
        insuranceProvider: '',
        insuranceNumber: '',
      },
      schedule: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      notes: '',
    });
    setEditingChild(null);
    setShowForm(false);
    setActiveTab('info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const childData = {
      ...formData,
      authorizedPickups: formData.emergencyContacts
        .filter(c => c.isAuthorizedPickup)
        .map(c => c.name),
      updatedAt: new Date().toISOString(),
    };

    if (editingChild) {
      await updateItem(editingChild.id, childData);
    } else {
      await addItem({
        ...childData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
    }
    resetForm();
  };

  const handleEdit = (child: ChildProfile) => {
    setFormData({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth,
      gender: child.gender,
      classroom: child.classroom,
      enrollmentDate: child.enrollmentDate,
      status: child.status,
      parentName: child.parentName,
      parentEmail: child.parentEmail,
      parentPhone: child.parentPhone,
      address: child.address,
      emergencyContacts: child.emergencyContacts,
      medicalInfo: child.medicalInfo,
      schedule: child.schedule,
      notes: child.notes,
    });
    setEditingChild(child);
    setShowForm(true);
  };

  const addEmergencyContact = () => {
    if (!newContact.name || !newContact.phone) return;
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { ...newContact, id: crypto.randomUUID() },
      ],
    }));
    setNewContact({ name: '', relationship: '', phone: '', isAuthorizedPickup: false });
  };

  const removeEmergencyContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id),
    }));
  };

  const addAllergy = () => {
    if (!newAllergy.trim()) return;
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: [...prev.medicalInfo.allergies, newAllergy.trim()],
      },
    }));
    setNewAllergy('');
  };

  const removeAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: prev.medicalInfo.allergies.filter(a => a !== allergy),
      },
    }));
  };

  const getStatusColor = (status: ChildProfile['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
      waitlist: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[status];
  };

  const exportColumns: ColumnConfig[] = [
    { key: 'firstName', header: 'First Name', selected: true },
    { key: 'lastName', header: 'Last Name', selected: true },
    { key: 'dateOfBirth', header: 'Date of Birth', selected: true },
    { key: 'classroom', header: 'Classroom', selected: true },
    { key: 'parentName', header: 'Parent Name', selected: true },
    { key: 'parentPhone', header: 'Parent Phone', selected: true },
    { key: 'parentEmail', header: 'Parent Email', selected: true },
    { key: 'status', header: 'Status', selected: true },
  ];

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="w-7 h-7 text-blue-500" />
            {t('tools.childProfile.childProfiles', 'Child Profiles')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.childProfile.manageChildInformationEmergencyContacts', 'Manage child information, emergency contacts, and medical details')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="child-profile" toolName="Child Profile" />

          <SyncStatus isSaving={isSaving} lastSynced={lastSynced} />
          <ExportDropdown
            data={filteredChildren}
            filename="child-profiles"
            columns={exportColumns}
          />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('tools.childProfile.addChild', 'Add Child')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="text-2xl font-bold text-blue-500">{children.filter(c => c.status === 'active').length}</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.childProfile.activeChildren', 'Active Children')}</div>
        </div>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="text-2xl font-bold text-yellow-500">{children.filter(c => c.status === 'waitlist').length}</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.childProfile.waitlist', 'Waitlist')}</div>
        </div>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="text-2xl font-bold text-red-500">
            {children.filter(c => c.medicalInfo?.allergies?.length > 0).length}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.childProfile.withAllergies', 'With Allergies')}</div>
        </div>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="text-2xl font-bold text-purple-500">{classrooms.length}</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.childProfile.classrooms', 'Classrooms')}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.childProfile.searchChildren', 'Search children...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          />
        </div>
        <select
          value={selectedClassroom}
          onChange={(e) => setSelectedClassroom(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <option value="all">{t('tools.childProfile.allClassrooms', 'All Classrooms')}</option>
          {classrooms.map(classroom => (
            <option key={classroom} value={classroom}>{classroom}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <option value="all">{t('tools.childProfile.allStatus', 'All Status')}</option>
          <option value="active">{t('tools.childProfile.active', 'Active')}</option>
          <option value="inactive">{t('tools.childProfile.inactive', 'Inactive')}</option>
          <option value="waitlist">{t('tools.childProfile.waitlist2', 'Waitlist')}</option>
        </select>
      </div>

      {/* Children Grid */}
      {isLoading ? (
        <div className="text-center py-12">{t('tools.childProfile.loadingProfiles', 'Loading profiles...')}</div>
      ) : filteredChildren.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Baby className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">{t('tools.childProfile.noChildrenFound', 'No children found')}</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.childProfile.addAChildProfileTo', 'Add a child profile to get started')}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChildren.map(child => {
            const age = calculateAge(child.dateOfBirth);
            const hasAllergies = child.medicalInfo?.allergies?.length > 0;

            return (
              <div
                key={child.id}
                className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => setViewingChild(child)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                      {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{child.firstName} {child.lastName}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {age.years}y {age.months}m • {child.classroom || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(child.status)}`}>
                    {child.status}
                  </span>
                </div>

                {hasAllergies && (
                  <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      Allergies: {child.medicalInfo.allergies.join(', ')}
                    </span>
                  </div>
                )}

                <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{child.parentName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{child.parentPhone}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(child);
                    }}
                    className={`flex-1 py-2 text-sm rounded-lg ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.childProfile.edit', 'Edit')}
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const confirmed = await confirm({
                        title: 'Delete Profile',
                        message: 'Are you sure you want to delete this profile? This action cannot be undone.',
                        confirmText: 'Delete',
                        cancelText: 'Cancel',
                        variant: 'danger',
                      });
                      if (confirmed) {
                        deleteItem(child.id);
                      }
                    }}
                    className="py-2 px-4 text-sm text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Child Modal */}
      {viewingChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  {viewingChild.firstName.charAt(0)}{viewingChild.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{viewingChild.firstName} {viewingChild.lastName}</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {viewingChild.classroom} • {calculateAge(viewingChild.dateOfBirth).years}y {calculateAge(viewingChild.dateOfBirth).months}m
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingChild(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Emergency Contacts */}
            <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                {t('tools.childProfile.emergencyContacts', 'Emergency Contacts')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{viewingChild.parentName} (Parent)</span>
                  <span>{viewingChild.parentPhone}</span>
                </div>
                {viewingChild.emergencyContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between">
                    <span>
                      {contact.name} ({contact.relationship})
                      {contact.isAuthorizedPickup && (
                        <span className="ml-2 text-xs text-green-500">✓ Pickup</span>
                      )}
                    </span>
                    <span>{contact.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Info */}
            {(viewingChild.medicalInfo?.allergies?.length > 0 || viewingChild.medicalInfo?.conditions?.length > 0) && (
              <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  {t('tools.childProfile.medicalAlerts', 'Medical Alerts')}
                </h3>
                {viewingChild.medicalInfo?.allergies?.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium">{t('tools.childProfile.allergies', 'Allergies:')}</span>
                    {viewingChild.medicalInfo.allergies.join(', ')}
                  </div>
                )}
                {viewingChild.medicalInfo?.conditions?.length > 0 && (
                  <div>
                    <span className="font-medium">{t('tools.childProfile.conditions', 'Conditions:')}</span>
                    {viewingChild.medicalInfo.conditions.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Schedule */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                {t('tools.childProfile.weeklySchedule2', 'Weekly Schedule')}
              </h3>
              <div className="flex gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => {
                  const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'][idx] as keyof typeof viewingChild.schedule;
                  const isScheduled = viewingChild.schedule?.[dayKey];
                  return (
                    <div
                      key={day}
                      className={`flex-1 py-2 text-center rounded-lg text-sm font-medium ${
                        isScheduled
                          ? 'bg-blue-500 text-white'
                          : isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setViewingChild(null);
                  handleEdit(viewingChild);
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('tools.childProfile.editProfile', 'Edit Profile')}
              </button>
              <button
                onClick={() => setViewingChild(null)}
                className={`flex-1 py-2 rounded-lg border ${
                  isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t('tools.childProfile.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingChild ? t('tools.childProfile.editChildProfile', 'Edit Child Profile') : t('tools.childProfile.addNewChild', 'Add New Child')}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(['info', 'medical', 'contacts', 'schedule'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'info' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('tools.childProfile.firstName', 'First Name *')}</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('tools.childProfile.lastName', 'Last Name *')}</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('tools.childProfile.dateOfBirth', 'Date of Birth *')}</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        required
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('tools.childProfile.gender', 'Gender')}</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as ChildProfile['gender'] }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <option value="male">{t('tools.childProfile.male', 'Male')}</option>
                        <option value="female">{t('tools.childProfile.female', 'Female')}</option>
                        <option value="other">{t('tools.childProfile.other', 'Other')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('tools.childProfile.classroom', 'Classroom')}</label>
                      <input
                        type="text"
                        value={formData.classroom}
                        onChange={(e) => setFormData(prev => ({ ...prev, classroom: e.target.value }))}
                        placeholder={t('tools.childProfile.eGButterflies', 'e.g., Butterflies')}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('tools.childProfile.parentGuardianName', 'Parent/Guardian Name *')}</label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                        required
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('tools.childProfile.parentPhone', 'Parent Phone *')}</label>
                      <input
                        type="tel"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                        required
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('tools.childProfile.parentEmail', 'Parent Email')}</label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('tools.childProfile.address', 'Address')}</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    />
                  </div>
                </>
              )}

              {activeTab === 'medical' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      {t('tools.childProfile.allergies2', 'Allergies')}
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder={t('tools.childProfile.addAllergy', 'Add allergy...')}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={addAllergy}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        {t('tools.childProfile.add', 'Add')}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.medicalInfo.allergies.map(allergy => (
                        <span
                          key={allergy}
                          className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm flex items-center gap-1"
                        >
                          {allergy}
                          <button type="button" onClick={() => removeAllergy(allergy)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('tools.childProfile.doctorName', 'Doctor Name')}</label>
                      <input
                        type="text"
                        value={formData.medicalInfo.doctorName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          medicalInfo: { ...prev.medicalInfo, doctorName: e.target.value }
                        }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('tools.childProfile.doctorPhone', 'Doctor Phone')}</label>
                      <input
                        type="tel"
                        value={formData.medicalInfo.doctorPhone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          medicalInfo: { ...prev.medicalInfo, doctorPhone: e.target.value }
                        }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'contacts' && (
                <>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className="font-medium mb-3">{t('tools.childProfile.addEmergencyContact', 'Add Emergency Contact')}</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={newContact.name}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('tools.childProfile.name', 'Name')}
                        className={`px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'
                        }`}
                      />
                      <input
                        type="text"
                        value={newContact.relationship}
                        onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                        placeholder={t('tools.childProfile.relationship', 'Relationship')}
                        className={`px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'
                        }`}
                      />
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="tel"
                        value={newContact.phone}
                        onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder={t('tools.childProfile.phone', 'Phone')}
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'
                        }`}
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newContact.isAuthorizedPickup}
                          onChange={(e) => setNewContact(prev => ({ ...prev, isAuthorizedPickup: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{t('tools.childProfile.authorizedPickup', 'Authorized Pickup')}</span>
                      </label>
                      <button
                        type="button"
                        onClick={addEmergencyContact}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {t('tools.childProfile.add2', 'Add')}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {formData.emergencyContacts.map(contact => (
                      <div
                        key={contact.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isDark ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div>
                          <span className="font-medium">{contact.name}</span>
                          <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({contact.relationship})
                          </span>
                          {contact.isAuthorizedPickup && (
                            <span className="ml-2 text-xs text-green-500">✓ Pickup</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span>{contact.phone}</span>
                          <button
                            type="button"
                            onClick={() => removeEmergencyContact(contact.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'schedule' && (
                <div>
                  <label className="block text-sm font-medium mb-4">{t('tools.childProfile.weeklySchedule', 'Weekly Schedule')}</label>
                  <div className="grid grid-cols-5 gap-3">
                    {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, [day]: !prev.schedule[day] }
                        }))}
                        className={`py-4 rounded-lg text-center font-medium capitalize ${
                          formData.schedule[day]
                            ? 'bg-blue-600 text-white'
                            : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 py-2 rounded-lg border ${
                    isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.childProfile.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingChild ? t('tools.childProfile.updateProfile', 'Update Profile') : t('tools.childProfile.addChild2', 'Add Child')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default ChildProfileTool;
