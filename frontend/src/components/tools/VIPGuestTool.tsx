'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Crown,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  RefreshCw,
  Star,
  Bed,
  Calendar,
  Gift,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface VIPGuestToolProps {
  uiConfig?: UIConfig;
}

interface VIPGuest {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  vipLevel: VIPLevel;
  membershipNumber: string;
  company: string;
  title: string;
  roomPreference: string;
  dietaryRestrictions: string;
  specialAmenities: string[];
  notes: string;
  totalStays: number;
  totalSpent: number;
  lastVisit: string;
  currentReservation: string;
  roomNumber: string;
  birthday: string;
  anniversary: string;
  status: GuestStatus;
  createdAt: string;
}

type VIPLevel = 'platinum' | 'gold' | 'silver' | 'bronze';
type GuestStatus = 'active' | 'in-house' | 'checked-out' | 'upcoming';

const VIP_LEVELS: { value: VIPLevel; label: string; color: string }[] = [
  { value: 'platinum', label: 'Platinum', color: 'purple' },
  { value: 'gold', label: 'Gold', color: 'yellow' },
  { value: 'silver', label: 'Silver', color: 'gray' },
  { value: 'bronze', label: 'Bronze', color: 'orange' },
];

const GUEST_STATUSES: { value: GuestStatus; label: string; color: string }[] = [
  { value: 'in-house', label: 'In House', color: 'green' },
  { value: 'upcoming', label: 'Upcoming', color: 'blue' },
  { value: 'active', label: 'Active Member', color: 'gray' },
  { value: 'checked-out', label: 'Checked Out', color: 'gray' },
];

const SPECIAL_AMENITIES = [
  'Welcome champagne',
  'Fresh flowers',
  'Fruit basket',
  'Spa credit',
  'Late checkout',
  'Room upgrade',
  'Airport transfer',
  'Personal concierge',
  'Turndown service',
  'Premium minibar',
];

const vipColumns: ColumnConfig[] = [
  { key: 'id', header: 'Guest ID', type: 'string' },
  { key: 'guestName', header: 'Name', type: 'string' },
  { key: 'vipLevel', header: 'VIP Level', type: 'string' },
  { key: 'company', header: 'Company', type: 'string' },
  { key: 'totalStays', header: 'Total Stays', type: 'number' },
  { key: 'totalSpent', header: 'Total Spent', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'roomNumber', header: 'Current Room', type: 'string' },
];

const generateSampleVIPs = (): VIPGuest[] => {
  const today = new Date();
  return [
    {
      id: 'VIP-001',
      guestName: 'Robert Williams',
      email: 'rwilliams@corp.com',
      phone: '+1 555-1000',
      vipLevel: 'platinum',
      membershipNumber: 'PLT-123456',
      company: 'Tech Industries Inc.',
      title: 'CEO',
      roomPreference: 'Penthouse, high floor, city view',
      dietaryRestrictions: 'Vegetarian',
      specialAmenities: ['Welcome champagne', 'Fresh flowers', 'Personal concierge', 'Airport transfer'],
      notes: 'Prefers late check-in. Always book spa appointment on arrival.',
      totalStays: 47,
      totalSpent: 125000,
      lastVisit: new Date(today.getTime() - 30 * 86400000).toISOString().split('T')[0],
      currentReservation: 'RES-VIP-001',
      roomNumber: '801',
      birthday: '1975-03-15',
      anniversary: '2000-06-20',
      status: 'in-house',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'VIP-002',
      guestName: 'Elizabeth Chen',
      email: 'echen@globalfinance.com',
      phone: '+1 555-2000',
      vipLevel: 'gold',
      membershipNumber: 'GLD-789012',
      company: 'Global Finance LLC',
      title: 'Managing Director',
      roomPreference: 'Suite, quiet floor',
      dietaryRestrictions: 'Gluten-free',
      specialAmenities: ['Fruit basket', 'Late checkout', 'Spa credit'],
      notes: 'Birthday on Jan 15 - arrange cake',
      totalStays: 23,
      totalSpent: 45000,
      lastVisit: new Date(today.getTime() - 60 * 86400000).toISOString().split('T')[0],
      currentReservation: '',
      roomNumber: '',
      birthday: '1982-01-15',
      anniversary: '',
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'VIP-003',
      guestName: 'James Morrison',
      email: 'jmorrison@media.com',
      phone: '+1 555-3000',
      vipLevel: 'silver',
      membershipNumber: 'SLV-345678',
      company: 'Morrison Media Group',
      title: 'Founder',
      roomPreference: 'Deluxe room',
      dietaryRestrictions: '',
      specialAmenities: ['Room upgrade', 'Turndown service'],
      notes: '',
      totalStays: 12,
      totalSpent: 18000,
      lastVisit: new Date(today.getTime() - 90 * 86400000).toISOString().split('T')[0],
      currentReservation: '',
      roomNumber: '',
      birthday: '1968-07-22',
      anniversary: '1995-09-10',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const VIPGuestTool: React.FC<VIPGuestToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const vipsData = useToolData<VIPGuest>(
    'vip-guests',
    generateSampleVIPs(),
    vipColumns,
    { autoSave: true }
  );

  const vips = vipsData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingVIP, setEditingVIP] = useState<VIPGuest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<VIPLevel | ''>('');
  const [filterStatus, setFilterStatus] = useState<GuestStatus | ''>('');

  const [newVIP, setNewVIP] = useState<Partial<VIPGuest>>({
    guestName: '',
    email: '',
    phone: '',
    vipLevel: 'gold',
    membershipNumber: '',
    company: '',
    title: '',
    roomPreference: '',
    dietaryRestrictions: '',
    specialAmenities: [],
    notes: '',
    totalStays: 0,
    totalSpent: 0,
    birthday: '',
    anniversary: '',
    status: 'active',
  });

  const handleAddVIP = () => {
    if (!newVIP.guestName) return;
    const vip: VIPGuest = {
      id: `VIP-${Date.now().toString().slice(-6)}`,
      guestName: newVIP.guestName || '',
      email: newVIP.email || '',
      phone: newVIP.phone || '',
      vipLevel: newVIP.vipLevel as VIPLevel || 'gold',
      membershipNumber: newVIP.membershipNumber || `${newVIP.vipLevel?.toUpperCase().slice(0, 3) || 'GLD'}-${Date.now().toString().slice(-6)}`,
      company: newVIP.company || '',
      title: newVIP.title || '',
      roomPreference: newVIP.roomPreference || '',
      dietaryRestrictions: newVIP.dietaryRestrictions || '',
      specialAmenities: newVIP.specialAmenities || [],
      notes: newVIP.notes || '',
      totalStays: newVIP.totalStays || 0,
      totalSpent: newVIP.totalSpent || 0,
      lastVisit: '',
      currentReservation: '',
      roomNumber: '',
      birthday: newVIP.birthday || '',
      anniversary: newVIP.anniversary || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    vipsData.addItem(vip);
    setNewVIP({
      guestName: '',
      email: '',
      phone: '',
      vipLevel: 'gold',
      membershipNumber: '',
      company: '',
      title: '',
      roomPreference: '',
      dietaryRestrictions: '',
      specialAmenities: [],
      notes: '',
      totalStays: 0,
      totalSpent: 0,
      birthday: '',
      anniversary: '',
      status: 'active',
    });
    setShowForm(false);
  };

  const handleUpdateVIP = () => {
    if (!editingVIP) return;
    vipsData.updateItem(editingVIP.id, editingVIP);
    setEditingVIP(null);
  };

  const handleDeleteVIP = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Remove this VIP guest?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) vipsData.deleteItem(id);
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Reset all VIP guests to sample data?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) vipsData.resetToDefault(generateSampleVIPs());
  };

  const filteredVIPs = useMemo(() => {
    return vips.filter(v => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!v.guestName.toLowerCase().includes(q) &&
            !v.company.toLowerCase().includes(q) &&
            !v.membershipNumber.toLowerCase().includes(q)) return false;
      }
      if (filterLevel && v.vipLevel !== filterLevel) return false;
      if (filterStatus && v.status !== filterStatus) return false;
      return true;
    });
  }, [vips, searchQuery, filterLevel, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: vips.length,
      inHouse: vips.filter(v => v.status === 'in-house').length,
      upcoming: vips.filter(v => v.status === 'upcoming').length,
      platinum: vips.filter(v => v.vipLevel === 'platinum').length,
    };
  }, [vips]);

  const inputClass = `w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;
  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const getLevelColor = (level: VIPLevel) => {
    const colors: Record<string, string> = {
      platinum: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700',
      gold: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      silver: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700',
      bronze: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
    };
    return colors[level] || colors.gold;
  };

  const getStatusColor = (status: GuestStatus) => {
    const colors: Record<string, string> = {
      'in-house': isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      upcoming: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      active: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
      'checked-out': isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
    };
    return colors[status] || colors.active;
  };

  const toggleAmenity = (amenity: string, isEditing: boolean) => {
    const current = isEditing ? editingVIP?.specialAmenities || [] : newVIP.specialAmenities || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];

    if (isEditing) {
      setEditingVIP({ ...editingVIP!, specialAmenities: updated });
    } else {
      setNewVIP({ ...newVIP, specialAmenities: updated });
    }
  };

  const renderForm = (vip: Partial<VIPGuest>, isEditing = false) => {
    const setData = isEditing
      ? (updates: Partial<VIPGuest>) => setEditingVIP({ ...editingVIP!, ...updates })
      : (updates: Partial<VIPGuest>) => setNewVIP({ ...newVIP, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.guestName', 'Guest Name *')}</label>
            <input type="text" value={vip.guestName || ''} onChange={(e) => setData({ guestName: e.target.value })} placeholder={t('tools.vIPGuest.fullName', 'Full name')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.vipLevel', 'VIP Level')}</label>
            <select value={vip.vipLevel || 'gold'} onChange={(e) => setData({ vipLevel: e.target.value as VIPLevel })} className={inputClass}>
              {VIP_LEVELS.map(l => (<option key={l.value} value={l.value}>{l.label}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.membership', 'Membership #')}</label>
            <input type="text" value={vip.membershipNumber || ''} onChange={(e) => setData({ membershipNumber: e.target.value })} placeholder={t('tools.vIPGuest.autoGeneratedIfEmpty', 'Auto-generated if empty')} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.email', 'Email')}</label>
            <input type="email" value={vip.email || ''} onChange={(e) => setData({ email: e.target.value })} placeholder={t('tools.vIPGuest.emailCompanyCom', 'email@company.com')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.phone', 'Phone')}</label>
            <input type="tel" value={vip.phone || ''} onChange={(e) => setData({ phone: e.target.value })} placeholder="+1 555-0000" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.company', 'Company')}</label>
            <input type="text" value={vip.company || ''} onChange={(e) => setData({ company: e.target.value })} placeholder={t('tools.vIPGuest.companyName', 'Company name')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.title', 'Title')}</label>
            <input type="text" value={vip.title || ''} onChange={(e) => setData({ title: e.target.value })} placeholder={t('tools.vIPGuest.positionTitle', 'Position/Title')} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.roomPreference', 'Room Preference')}</label>
            <input type="text" value={vip.roomPreference || ''} onChange={(e) => setData({ roomPreference: e.target.value })} placeholder={t('tools.vIPGuest.roomTypeFloorView', 'Room type, floor, view...')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.dietaryRestrictions', 'Dietary Restrictions')}</label>
            <input type="text" value={vip.dietaryRestrictions || ''} onChange={(e) => setData({ dietaryRestrictions: e.target.value })} placeholder={t('tools.vIPGuest.anyDietaryNeeds', 'Any dietary needs')} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.birthday', 'Birthday')}</label>
            <input type="date" value={vip.birthday || ''} onChange={(e) => setData({ birthday: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.anniversary', 'Anniversary')}</label>
            <input type="date" value={vip.anniversary || ''} onChange={(e) => setData({ anniversary: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.specialAmenities', 'Special Amenities')}</label>
          <div className="flex flex-wrap gap-2">
            {SPECIAL_AMENITIES.map(amenity => (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity, isEditing)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  (vip.specialAmenities || []).includes(amenity)
                    ? 'bg-[#0D9488] text-white'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vIPGuest.notes', 'Notes')}</label>
          <textarea value={vip.notes || ''} onChange={(e) => setData({ notes: e.target.value })} placeholder={t('tools.vIPGuest.specialPreferencesReminders', 'Special preferences, reminders...')} rows={2} className={inputClass} />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488]/10 rounded-xl"><Crown className="w-6 h-6 text-[#0D9488]" /></div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vIPGuest.vipGuestManagement', 'VIP Guest Management')}</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vIPGuest.manageVipGuestProfilesAnd', 'Manage VIP guest profiles and preferences')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="v-i-p-guest" toolName="V I P Guest" />

              <SyncStatus isSynced={vipsData.isSynced} isSaving={vipsData.isSaving} lastSaved={vipsData.lastSaved} syncError={vipsData.syncError} onForceSync={() => vipsData.forceSync()} theme={isDark ? 'dark' : 'light'} showLabel={true} size="sm" />
              <ExportDropdown onExportCSV={() => vipsData.exportCSV({ filename: 'vip-guests' })} onExportExcel={() => vipsData.exportExcel({ filename: 'vip-guests' })} onExportJSON={() => vipsData.exportJSON({ filename: 'vip-guests' })} onExportPDF={() => vipsData.exportPDF({ filename: 'vip-guests', title: 'VIP Guests' })} onPrint={() => vipsData.print('VIP Guests')} onCopyToClipboard={() => vipsData.copyToClipboard('tab')} theme={isDark ? 'dark' : 'light'} />
              <button onClick={handleReset} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}><RefreshCw className="w-4 h-4" />{t('tools.vIPGuest.reset', 'Reset')}</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vIPGuest.totalVips', 'Total VIPs')}</p><p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vIPGuest.inHouse', 'In House')}</p><p className="text-2xl font-bold text-green-500">{stats.inHouse}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vIPGuest.upcoming', 'Upcoming')}</p><p className="text-2xl font-bold text-blue-500">{stats.upcoming}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vIPGuest.platinum', 'Platinum')}</p><p className="text-2xl font-bold text-purple-500">{stats.platinum}</p></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.vIPGuest.searchVipGuests', 'Search VIP guests...')} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value as VIPLevel | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.vIPGuest.allLevels', 'All Levels')}</option>
            {VIP_LEVELS.map(l => (<option key={l.value} value={l.value}>{l.label}</option>))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as GuestStatus | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.vIPGuest.allStatuses', 'All Statuses')}</option>
            {GUEST_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2"><Plus className="w-5 h-5" />{t('tools.vIPGuest.addVip', 'Add VIP')}</button>
        </div>

        {/* Forms */}
        {showForm && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vIPGuest.addVipGuest', 'Add VIP Guest')}</h3>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(newVIP)}
            <button onClick={handleAddVIP} disabled={!newVIP.guestName} className="mt-4 w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5" />{t('tools.vIPGuest.addVipGuest2', 'Add VIP Guest')}</button>
          </div>
        )}

        {editingVIP && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vIPGuest.editVipGuest', 'Edit VIP Guest')}</h3>
              <button onClick={() => setEditingVIP(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(editingVIP, true)}
            <div className="flex gap-3 mt-4">
              <button onClick={handleUpdateVIP} className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"><Save className="w-5 h-5" />{t('tools.vIPGuest.save', 'Save')}</button>
              <button onClick={() => setEditingVIP(null)} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('tools.vIPGuest.cancel', 'Cancel')}</button>
            </div>
          </div>
        )}

        {/* VIP List */}
        <div className="space-y-3">
          {filteredVIPs.map(vip => (
            <div key={vip.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{vip.guestName}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLevelColor(vip.vipLevel)}`}>{VIP_LEVELS.find(l => l.value === vip.vipLevel)?.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(vip.status)}`}>{GUEST_STATUSES.find(s => s.value === vip.status)?.label}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                    {vip.company && <div className="flex items-center gap-2"><User className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{vip.title} at {vip.company}</span></div>}
                    {vip.roomNumber && <div className="flex items-center gap-2"><Bed className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Room {vip.roomNumber}</span></div>}
                    <div className="flex items-center gap-2"><Star className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{vip.totalStays} stays</span></div>
                    <div className="flex items-center gap-2"><Gift className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className="text-[#0D9488] font-medium">${vip.totalSpent.toLocaleString()}</span></div>
                  </div>
                  {vip.specialAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {vip.specialAmenities.map(a => (<span key={a} className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{a}</span>))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => setEditingVIP(vip)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
                  <button onClick={() => handleDeleteVIP(vip.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVIPs.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <Crown className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.vIPGuest.noVipGuestsFound', 'No VIP guests found.')}</p>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default VIPGuestTool;
