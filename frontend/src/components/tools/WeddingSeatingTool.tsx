import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Plus, Trash2, Users, Search, Move, Sparkles, Table2, UserPlus, Grid3X3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface WeddingSeatingToolProps {
  uiConfig?: UIConfig;
}

interface Guest {
  id: string;
  name: string;
  group: 'bride' | 'groom' | 'mutual';
  tableId: string | null;
}

interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangular' | 'square';
  category: 'vip' | 'family' | 'friends' | 'general';
}

const defaultTables: SeatingTable[] = [
  { id: 'head', name: 'Head Table', capacity: 8, shape: 'rectangular', category: 'vip' },
  { id: 'family-1', name: 'Family 1', capacity: 10, shape: 'round', category: 'family' },
  { id: 'family-2', name: 'Family 2', capacity: 10, shape: 'round', category: 'family' },
  { id: 'friends-1', name: 'Friends 1', capacity: 8, shape: 'round', category: 'friends' },
  { id: 'friends-2', name: 'Friends 2', capacity: 8, shape: 'round', category: 'friends' },
  { id: 'general-1', name: 'Table 1', capacity: 8, shape: 'round', category: 'general' },
  { id: 'general-2', name: 'Table 2', capacity: 8, shape: 'round', category: 'general' },
];

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  vip: { bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-500' },
  family: { bg: 'bg-pink-500/10', border: 'border-pink-500', text: 'text-pink-500' },
  friends: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-500' },
  general: { bg: 'bg-teal-500/10', border: 'border-teal-500', text: 'text-teal-500' },
};

export const WeddingSeatingTool: React.FC<WeddingSeatingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [tables, setTables] = useState<SeatingTable[]>(defaultTables);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [showAddTableForm, setShowAddTableForm] = useState(false);
  const [showAddGuestForm, setShowAddGuestForm] = useState(false);
  const [newTable, setNewTable] = useState({ name: '', capacity: 8, shape: 'round' as const, category: 'general' as const });
  const [newGuest, setNewGuest] = useState({ name: '', group: 'mutual' as const });
  const [tableErrors, setTableErrors] = useState<Record<string, string>>({});
  const [guestErrors, setGuestErrors] = useState<Record<string, string>>({});

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.items && Array.isArray(params.items)) {
        const prefillGuests: Guest[] = params.items.map((item, idx) => ({
          id: `guest-${idx}-${Date.now()}`,
          name: typeof item === 'string' ? item : item.name || '',
          group: 'mutual',
          tableId: null,
        }));
        setGuests(prefillGuests);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const unassignedGuests = useMemo(() => {
    return guests.filter((g) => !g.tableId && g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [guests, searchQuery]);

  const getTableGuests = (tableId: string) => {
    return guests.filter((g) => g.tableId === tableId);
  };

  const stats = useMemo(() => {
    const totalGuests = guests.length;
    const assignedGuests = guests.filter((g) => g.tableId).length;
    const unassigned = totalGuests - assignedGuests;
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

    return { totalGuests, assignedGuests, unassigned, totalCapacity, totalTables: tables.length };
  }, [guests, tables]);

  const validateTable = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newTable.name.trim()) {
      errors.name = 'Table name is required';
    }
    setTableErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTable = () => {
    if (!validateTable()) return;
    const table: SeatingTable = {
      id: `table-${Date.now()}`,
      name: newTable.name,
      capacity: newTable.capacity,
      shape: newTable.shape,
      category: newTable.category,
    };
    setTables((prev) => [...prev, table]);
    setNewTable({ name: '', capacity: 8, shape: 'round', category: 'general' });
    setTableErrors({});
    setShowAddTableForm(false);
  };

  const handleDeleteTable = (tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    setGuests((prev) => prev.map((g) => (g.tableId === tableId ? { ...g, tableId: null } : g)));
  };

  const validateGuest = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newGuest.name.trim()) {
      errors.name = 'Guest name is required';
    }
    setGuestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddGuest = () => {
    if (!validateGuest()) return;
    const guest: Guest = {
      id: `guest-${Date.now()}`,
      name: newGuest.name,
      group: newGuest.group,
      tableId: selectedTableId,
    };
    setGuests((prev) => [...prev, guest]);
    setNewGuest({ name: '', group: 'mutual' });
    setGuestErrors({});
    setShowAddGuestForm(false);
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const handleAssignGuest = (guestId: string, tableId: string | null) => {
    if (tableId) {
      const table = tables.find((t) => t.id === tableId);
      const currentGuests = getTableGuests(tableId);
      if (table && currentGuests.length >= table.capacity) {
        return; // Table is full
      }
    }
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, tableId } : g)));
  };

  const handleDragStart = (guestId: string) => {
    setDraggedGuestId(guestId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, tableId: string | null) => {
    e.preventDefault();
    if (draggedGuestId) {
      handleAssignGuest(draggedGuestId, tableId);
      setDraggedGuestId(null);
    }
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'bride':
        return 'bg-pink-500';
      case 'groom':
        return 'bg-blue-500';
      default:
        return 'bg-teal-500';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Layout className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingSeating.weddingSeatingChart', 'Wedding Seating Chart')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingSeating.arrangeYourGuestsAtTables', 'Arrange your guests at tables')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddGuestForm(true)}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <UserPlus className="w-4 h-4" /> Add Guest
            </button>
            <button
              onClick={() => setShowAddTableForm(true)}
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Table2 className="w-4 h-4" /> Add Table
            </button>
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {t('tools.weddingSeating.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalTables}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingSeating.tables', 'Tables')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalCapacity}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingSeating.totalCapacity', 'Total Capacity')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-teal-900/20' : 'bg-teal-50'}`}>
            <div className="text-2xl font-bold text-teal-500">{stats.totalGuests}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingSeating.totalGuests', 'Total Guests')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <div className="text-2xl font-bold text-green-500">{stats.assignedGuests}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingSeating.assigned', 'Assigned')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${stats.unassigned > 0 ? (isDark ? 'bg-yellow-900/20' : 'bg-yellow-50') : (isDark ? 'bg-gray-800' : 'bg-gray-50')}`}>
            <div className={`text-2xl font-bold ${stats.unassigned > 0 ? 'text-yellow-500' : isDark ? 'text-white' : 'text-gray-900'}`}>{stats.unassigned}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingSeating.unassigned', 'Unassigned')}</div>
          </div>
        </div>

        {/* Add Table Form */}
        {showAddTableForm && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingSeating.addNewTable', 'Add New Table')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) => {
                    setNewTable({ ...newTable, name: e.target.value });
                    if (tableErrors.name) setTableErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder={t('tools.weddingSeating.tableName', 'Table Name *')}
                  className={`w-full px-4 py-2 rounded-lg border ${tableErrors.name ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                />
                {tableErrors.name && <p className="text-red-500 text-xs mt-1">{tableErrors.name}</p>}
              </div>
              <input
                type="number"
                value={newTable.capacity}
                onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 8 })}
                placeholder={t('tools.weddingSeating.capacity', 'Capacity')}
                min="1"
                max="20"
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <select
                value={newTable.shape}
                onChange={(e) => setNewTable({ ...newTable, shape: e.target.value as SeatingTable['shape'] })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="round">{t('tools.weddingSeating.round', 'Round')}</option>
                <option value="rectangular">{t('tools.weddingSeating.rectangular', 'Rectangular')}</option>
                <option value="square">{t('tools.weddingSeating.square', 'Square')}</option>
              </select>
              <select
                value={newTable.category}
                onChange={(e) => setNewTable({ ...newTable, category: e.target.value as SeatingTable['category'] })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="vip">{t('tools.weddingSeating.vip', 'VIP')}</option>
                <option value="family">{t('tools.weddingSeating.family', 'Family')}</option>
                <option value="friends">{t('tools.weddingSeating.friends', 'Friends')}</option>
                <option value="general">{t('tools.weddingSeating.general', 'General')}</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddTable} className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium">
                {t('tools.weddingSeating.addTable', 'Add Table')}
              </button>
              <button
                onClick={() => {
                  setShowAddTableForm(false);
                  setTableErrors({});
                }}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                {t('tools.weddingSeating.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Add Guest Form */}
        {showAddGuestForm && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingSeating.addNewGuest', 'Add New Guest')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => {
                    setNewGuest({ ...newGuest, name: e.target.value });
                    if (guestErrors.name) setGuestErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder={t('tools.weddingSeating.guestName', 'Guest Name *')}
                  className={`w-full px-4 py-2 rounded-lg border ${guestErrors.name ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                />
                {guestErrors.name && <p className="text-red-500 text-xs mt-1">{guestErrors.name}</p>}
              </div>
              <select
                value={newGuest.group}
                onChange={(e) => setNewGuest({ ...newGuest, group: e.target.value as Guest['group'] })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="bride">{t('tools.weddingSeating.brideSSide', 'Bride\'s Side')}</option>
                <option value="groom">{t('tools.weddingSeating.groomSSide', 'Groom\'s Side')}</option>
                <option value="mutual">{t('tools.weddingSeating.mutual', 'Mutual')}</option>
              </select>
              <select
                value={selectedTableId || ''}
                onChange={(e) => setSelectedTableId(e.target.value || null)}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="">{t('tools.weddingSeating.unassigned2', 'Unassigned')}</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} ({getTableGuests(table.id).length}/{table.capacity})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddGuest} className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium">
                {t('tools.weddingSeating.addGuest', 'Add Guest')}
              </button>
              <button
                onClick={() => {
                  setShowAddGuestForm(false);
                  setGuestErrors({});
                }}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                {t('tools.weddingSeating.cancel2', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Unassigned Guests */}
        {unassignedGuests.length > 0 && (
          <div
            className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Users className="w-4 h-4 text-yellow-500" />
                Unassigned Guests ({unassignedGuests.length})
              </h4>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('tools.weddingSeating.search', 'Search...')}
                  className={`pl-9 pr-4 py-1.5 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {unassignedGuests.map((guest) => (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={() => handleDragStart(guest.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-move ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${getGroupColor(guest.group)}`} />
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{guest.name}</span>
                  <button
                    onClick={() => handleDeleteGuest(guest.id)}
                    className={`p-0.5 rounded-full ${isDark ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => {
            const tableGuests = getTableGuests(table.id);
            const isFull = tableGuests.length >= table.capacity;
            const colors = categoryColors[table.category];

            return (
              <div
                key={table.id}
                className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg} ${draggedGuestId && !isFull ? 'ring-2 ring-teal-500 ring-offset-2' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, table.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{table.name}</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={colors.text}>{table.category}</span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>|</span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{table.shape}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isFull ? 'text-red-500' : colors.text}`}>
                      {tableGuests.length}/{table.capacity}
                    </span>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-white/50 text-gray-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Capacity indicator */}
                <div className={`h-2 rounded-full mb-3 ${isDark ? 'bg-gray-700' : 'bg-white/50'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-teal-500'}`}
                    style={{ width: `${(tableGuests.length / table.capacity) * 100}%` }}
                  />
                </div>

                {/* Guests at table */}
                <div className="space-y-1">
                  {tableGuests.length === 0 ? (
                    <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('tools.weddingSeating.dragGuestsHere', 'Drag guests here')}
                    </p>
                  ) : (
                    tableGuests.map((guest) => (
                      <div
                        key={guest.id}
                        draggable
                        onDragStart={() => handleDragStart(guest.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-move ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white/70 hover:bg-white'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getGroupColor(guest.group)}`} />
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{guest.name}</span>
                        </div>
                        <button
                          onClick={() => handleAssignGuest(guest.id, null)}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          <Move className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tables.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('tools.weddingSeating.noTablesAddedYetClick', 'No tables added yet. Click "Add Table" to start.')}</p>
          </div>
        )}

        {/* Legend */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.weddingSeating.guestGroups', 'Guest Groups')}</h5>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingSeating.brideSSide2', 'Bride\'s Side')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingSeating.groomSSide2', 'Groom\'s Side')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingSeating.mutual2', 'Mutual')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingSeatingTool;
