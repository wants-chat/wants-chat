import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Trash2, Search, Filter, CheckCircle, XCircle, Clock, Mail, Sparkles, Download, UserPlus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface WeddingGuestListToolProps {
  uiConfig?: UIConfig;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  group: 'bride' | 'groom' | 'mutual';
  category: 'family' | 'friend' | 'colleague' | 'other';
  plusOne: boolean;
  plusOneName: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  dietaryRestrictions: string;
  tableNumber: string;
  notes: string;
}

const emptyGuest: Omit<Guest, 'id'> = {
  name: '',
  email: '',
  phone: '',
  group: 'mutual',
  category: 'friend',
  plusOne: false,
  plusOneName: '',
  rsvpStatus: 'pending',
  dietaryRestrictions: '',
  tableNumber: '',
  notes: '',
};

export const WeddingGuestListTool: React.FC<WeddingGuestListToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState<Omit<Guest, 'id'>>(emptyGuest);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.items && Array.isArray(params.items)) {
        const prefillGuests: Guest[] = params.items.map((item, idx) => ({
          id: `guest-${idx}-${Date.now()}`,
          name: typeof item === 'string' ? item : item.name || '',
          email: typeof item === 'object' ? item.email || '' : '',
          phone: '',
          group: 'mutual',
          category: 'friend',
          plusOne: false,
          plusOneName: '',
          rsvpStatus: 'pending',
          dietaryRestrictions: '',
          tableNumber: '',
          notes: '',
        }));
        setGuests(prefillGuests);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = filterGroup === 'all' || guest.group === filterGroup;
      const matchesStatus = filterStatus === 'all' || guest.rsvpStatus === filterStatus;
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [guests, searchQuery, filterGroup, filterStatus]);

  const stats = useMemo(() => {
    const total = guests.length;
    const confirmed = guests.filter((g) => g.rsvpStatus === 'confirmed').length;
    const declined = guests.filter((g) => g.rsvpStatus === 'declined').length;
    const pending = guests.filter((g) => g.rsvpStatus === 'pending').length;
    const plusOnes = guests.filter((g) => g.plusOne && g.rsvpStatus === 'confirmed').length;
    const brideGuests = guests.filter((g) => g.group === 'bride').length;
    const groomGuests = guests.filter((g) => g.group === 'groom').length;

    return { total, confirmed, declined, pending, plusOnes, brideGuests, groomGuests, attending: confirmed + plusOnes };
  }, [guests]);

  const handleAddGuest = () => {
    if (!newGuest.name.trim()) return;
    const guest: Guest = {
      ...newGuest,
      id: `guest-${Date.now()}`,
    };
    setGuests((prev) => [...prev, guest]);
    setNewGuest(emptyGuest);
    setShowAddForm(false);
  };

  const handleDeleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const handleUpdateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Group', 'Category', 'Plus One', 'RSVP Status', 'Table', 'Dietary Restrictions', 'Notes'];
    const rows = guests.map((g) => [
      g.name,
      g.email,
      g.phone,
      g.group,
      g.category,
      g.plusOne ? `Yes - ${g.plusOneName}` : 'No',
      g.rsvpStatus,
      g.tableNumber,
      g.dietaryRestrictions,
      g.notes,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding_guest_list.csv';
    a.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700';
      case 'declined':
        return isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700';
      default:
        return isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Users className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingGuestList.weddingGuestList', 'Wedding Guest List')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingGuestList.manageYourWeddingGuestsAnd', 'Manage your wedding guests and RSVPs')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white"
            >
              <UserPlus className="w-4 h-4" /> Add Guest
            </button>
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {t('tools.weddingGuestList.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingGuestList.totalGuests', 'Total Guests')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <div className="text-2xl font-bold text-green-500">{stats.attending}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingGuestList.attending', 'Attending')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingGuestList.pending', 'Pending')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <div className="text-2xl font-bold text-red-500">{stats.declined}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingGuestList.declined', 'Declined')}</div>
          </div>
        </div>

        {/* Bride/Groom Split */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bride's Side: {stats.brideGuests}</span>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Groom's Side: {stats.groomGuests}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex bg-gray-300">
            <div
              className="h-full bg-pink-500"
              style={{ width: stats.total > 0 ? `${(stats.brideGuests / stats.total) * 100}%` : '50%' }}
            />
            <div
              className="h-full bg-blue-500"
              style={{ width: stats.total > 0 ? `${(stats.groomGuests / stats.total) * 100}%` : '50%' }}
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.weddingGuestList.searchGuests', 'Search guests...')}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
            />
          </div>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">{t('tools.weddingGuestList.allGroups', 'All Groups')}</option>
            <option value="bride">{t('tools.weddingGuestList.brideSSide', 'Bride\'s Side')}</option>
            <option value="groom">{t('tools.weddingGuestList.groomSSide', 'Groom\'s Side')}</option>
            <option value="mutual">{t('tools.weddingGuestList.mutual', 'Mutual')}</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">{t('tools.weddingGuestList.allStatus', 'All Status')}</option>
            <option value="confirmed">{t('tools.weddingGuestList.confirmed', 'Confirmed')}</option>
            <option value="pending">{t('tools.weddingGuestList.pending2', 'Pending')}</option>
            <option value="declined">{t('tools.weddingGuestList.declined2', 'Declined')}</option>
          </select>
        </div>

        {/* Add Guest Form */}
        {showAddForm && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingGuestList.addNewGuest', 'Add New Guest')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                value={newGuest.name}
                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                placeholder={t('tools.weddingGuestList.guestName', 'Guest Name *')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="email"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                placeholder={t('tools.weddingGuestList.email', 'Email')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="tel"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                placeholder={t('tools.weddingGuestList.phone', 'Phone')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <select
                value={newGuest.group}
                onChange={(e) => setNewGuest({ ...newGuest, group: e.target.value as Guest['group'] })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="bride">{t('tools.weddingGuestList.brideSSide2', 'Bride\'s Side')}</option>
                <option value="groom">{t('tools.weddingGuestList.groomSSide2', 'Groom\'s Side')}</option>
                <option value="mutual">{t('tools.weddingGuestList.mutual2', 'Mutual')}</option>
              </select>
              <select
                value={newGuest.category}
                onChange={(e) => setNewGuest({ ...newGuest, category: e.target.value as Guest['category'] })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="family">{t('tools.weddingGuestList.family', 'Family')}</option>
                <option value="friend">{t('tools.weddingGuestList.friend', 'Friend')}</option>
                <option value="colleague">{t('tools.weddingGuestList.colleague', 'Colleague')}</option>
                <option value="other">{t('tools.weddingGuestList.other', 'Other')}</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="plusOne"
                  checked={newGuest.plusOne}
                  onChange={(e) => setNewGuest({ ...newGuest, plusOne: e.target.checked })}
                  className="w-4 h-4 text-teal-500"
                />
                <label htmlFor="plusOne" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.weddingGuestList.plusOne', 'Plus One')}</label>
              </div>
            </div>
            {newGuest.plusOne && (
              <input
                type="text"
                value={newGuest.plusOneName}
                onChange={(e) => setNewGuest({ ...newGuest, plusOneName: e.target.value })}
                placeholder={t('tools.weddingGuestList.plusOneName', 'Plus One Name')}
                className={`mt-4 w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddGuest}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium"
              >
                {t('tools.weddingGuestList.addGuest', 'Add Guest')}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewGuest(emptyGuest);
                }}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                {t('tools.weddingGuestList.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Guest List */}
        <div className="space-y-2">
          {filteredGuests.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {guests.length === 0 ? (
                <>
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.weddingGuestList.noGuestsAddedYetClick', 'No guests added yet. Click "Add Guest" to start.')}</p>
                </>
              ) : (
                <p>{t('tools.weddingGuestList.noGuestsMatchYourSearch', 'No guests match your search criteria.')}</p>
              )}
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                      guest.group === 'bride' ? 'bg-pink-500' : guest.group === 'groom' ? 'bg-blue-500' : 'bg-teal-500'
                    }`}>
                      {guest.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {guest.name}
                        {guest.plusOne && (
                          <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            +1 {guest.plusOneName && `(${guest.plusOneName})`}
                          </span>
                        )}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {guest.email && <span className="mr-3">{guest.email}</span>}
                        <span className="capitalize">{guest.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={guest.rsvpStatus}
                      onChange={(e) => handleUpdateGuest(guest.id, { rsvpStatus: e.target.value as Guest['rsvpStatus'] })}
                      className={`px-3 py-1.5 text-sm rounded-lg ${getStatusColor(guest.rsvpStatus)}`}
                    >
                      <option value="pending">{t('tools.weddingGuestList.pending3', 'Pending')}</option>
                      <option value="confirmed">{t('tools.weddingGuestList.confirmed2', 'Confirmed')}</option>
                      <option value="declined">{t('tools.weddingGuestList.declined3', 'Declined')}</option>
                    </select>
                    <input
                      type="text"
                      value={guest.tableNumber}
                      onChange={(e) => handleUpdateGuest(guest.id, { tableNumber: e.target.value })}
                      placeholder="Table"
                      className={`w-20 px-3 py-1.5 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <button
                      onClick={() => handleDeleteGuest(guest.id)}
                      className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
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
    </div>
  );
};

export default WeddingGuestListTool;
