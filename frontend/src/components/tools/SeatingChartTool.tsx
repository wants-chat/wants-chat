import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, Plus, X, Shuffle, RotateCcw, Sparkles, Download, Users, Table2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Table {
  id: string;
  name: string;
  seats: number;
  guests: string[];
}

interface Guest {
  name: string;
  tableId: string | null;
}

interface SeatingChartToolProps {
  uiConfig?: UIConfig;
}

export const SeatingChartTool: React.FC<SeatingChartToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [newGuest, setNewGuest] = useState('');
  const [eventName, setEventName] = useState('My Event');
  const [tableCount, setTableCount] = useState(4);
  const [seatsPerTable, setSeatsPerTable] = useState(8);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [draggedGuest, setDraggedGuest] = useState<string | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        guests?: string[];
        tableCount?: number;
        seatsPerTable?: number;
        eventName?: string;
      };
      if (params.guests) {
        setGuests(params.guests.map(name => ({ name, tableId: null })));
      }
      if (params.tableCount) setTableCount(params.tableCount);
      if (params.seatsPerTable) setSeatsPerTable(params.seatsPerTable);
      if (params.eventName) setEventName(params.eventName);
      if (params.text) {
        const names = params.text.split(/[,\n]/).map(n => n.trim()).filter(n => n);
        if (names.length > 0) {
          setGuests(names.map(name => ({ name, tableId: null })));
        }
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Initialize tables when count changes
  useEffect(() => {
    setTables(prev => {
      const newTables: Table[] = [];
      for (let i = 0; i < tableCount; i++) {
        const existingTable = prev[i];
        newTables.push({
          id: `table-${i}`,
          name: existingTable?.name || `Table ${i + 1}`,
          seats: seatsPerTable,
          guests: existingTable?.guests || [],
        });
      }
      return newTables;
    });
  }, [tableCount, seatsPerTable]);

  const addGuest = useCallback(() => {
    if (newGuest.trim() && !guests.some(g => g.name === newGuest.trim())) {
      setGuests(prev => [...prev, { name: newGuest.trim(), tableId: null }]);
      setNewGuest('');
    }
  }, [newGuest, guests]);

  const removeGuest = useCallback((name: string) => {
    setGuests(prev => prev.filter(g => g.name !== name));
    setTables(prev => prev.map(table => ({
      ...table,
      guests: table.guests.filter(g => g !== name),
    })));
  }, []);

  const addBulkGuests = useCallback(() => {
    const names = bulkInput.split(/[,\n]/).map(n => n.trim()).filter(n => n && !guests.some(g => g.name === n));
    if (names.length > 0) {
      setGuests(prev => [...prev, ...names.map(name => ({ name, tableId: null }))]);
      setBulkInput('');
      setShowBulkInput(false);
    }
  }, [bulkInput, guests]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const autoAssignSeats = useCallback(() => {
    const shuffledGuests = shuffleArray(guests.map(g => g.name));
    const newTables = tables.map(table => ({ ...table, guests: [] as string[] }));

    let tableIndex = 0;
    for (const guestName of shuffledGuests) {
      // Find next table with available seats
      let attempts = 0;
      while (newTables[tableIndex].guests.length >= seatsPerTable && attempts < tableCount) {
        tableIndex = (tableIndex + 1) % tableCount;
        attempts++;
      }

      if (newTables[tableIndex].guests.length < seatsPerTable) {
        newTables[tableIndex].guests.push(guestName);
        tableIndex = (tableIndex + 1) % tableCount;
      }
    }

    setTables(newTables);
    setGuests(prev => prev.map(g => {
      const assignedTable = newTables.find(t => t.guests.includes(g.name));
      return { ...g, tableId: assignedTable?.id || null };
    }));
  }, [guests, tables, tableCount, seatsPerTable]);

  const assignGuestToTable = useCallback((guestName: string, tableId: string | null) => {
    // Remove from current table
    setTables(prev => prev.map(table => ({
      ...table,
      guests: table.guests.filter(g => g !== guestName),
    })));

    // Add to new table if specified
    if (tableId) {
      setTables(prev => prev.map(table => {
        if (table.id === tableId && table.guests.length < seatsPerTable) {
          return { ...table, guests: [...table.guests, guestName] };
        }
        return table;
      }));
    }

    setGuests(prev => prev.map(g =>
      g.name === guestName ? { ...g, tableId } : g
    ));
  }, [seatsPerTable]);

  const clearAssignments = useCallback(() => {
    setTables(prev => prev.map(table => ({ ...table, guests: [] })));
    setGuests(prev => prev.map(g => ({ ...g, tableId: null })));
  }, []);

  const exportSeatingChart = useCallback(() => {
    let text = `${eventName} - Seating Chart\n${'='.repeat(eventName.length + 17)}\n\n`;

    tables.forEach(table => {
      text += `${table.name} (${table.guests.length}/${table.seats} seats):\n`;
      if (table.guests.length > 0) {
        table.guests.forEach((guest, idx) => {
          text += `  ${idx + 1}. ${guest}\n`;
        });
      } else {
        text += `  (Empty)\n`;
      }
      text += '\n';
    });

    const unassigned = guests.filter(g => !g.tableId);
    if (unassigned.length > 0) {
      text += `Unassigned Guests (${unassigned.length}):\n`;
      unassigned.forEach(g => {
        text += `  - ${g.name}\n`;
      });
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventName.toLowerCase().replace(/\s+/g, '-')}-seating.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tables, guests, eventName]);

  const unassignedGuests = guests.filter(g => !g.tableId);
  const totalSeats = tables.reduce((sum, t) => sum + t.seats, 0);
  const assignedCount = guests.filter(g => g.tableId).length;

  const handleDragStart = (guestName: string) => {
    setDraggedGuest(guestName);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (tableId: string | null) => {
    if (draggedGuest) {
      assignGuestToTable(draggedGuest, tableId);
      setDraggedGuest(null);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <LayoutGrid className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.seatingChart.seatingChart', 'Seating Chart')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.seatingChart.planSeatingArrangementsForYour', 'Plan seating arrangements for your event')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.seatingChart.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Event Name */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.seatingChart.eventName', 'Event Name')}
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder={t('tools.seatingChart.enterEventName', 'Enter event name...')}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>

        {/* Table Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.seatingChart.numberOfTables', 'Number of Tables')}
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={tableCount}
              onChange={(e) => setTableCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.seatingChart.seatsPerTable', 'Seats per Table')}
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={seatsPerTable}
              onChange={(e) => setSeatsPerTable(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className={`grid grid-cols-3 gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{guests.length}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.seatingChart.totalGuests', 'Total Guests')}</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalSeats}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.seatingChart.availableSeats', 'Available Seats')}</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${assignedCount === guests.length ? 'text-green-500' : 'text-amber-500'}`}>
              {assignedCount}/{guests.length}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.seatingChart.assigned', 'Assigned')}</div>
          </div>
        </div>

        {/* Add Guest */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.seatingChart.addGuests', 'Add Guests')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newGuest}
              onChange={(e) => setNewGuest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGuest()}
              placeholder={t('tools.seatingChart.enterGuestName', 'Enter guest name...')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            <button
              onClick={addGuest}
              disabled={!newGuest.trim()}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                newGuest.trim()
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className={`text-sm ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
          >
            {showBulkInput ? t('tools.seatingChart.hideBulkInput', 'Hide bulk input') : t('tools.seatingChart.addMultipleGuests', 'Add multiple guests')}
          </button>
        </div>

        {/* Bulk Input */}
        {showBulkInput && (
          <div className="space-y-2">
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={t('tools.seatingChart.enterNamesSeparatedByCommas', 'Enter names separated by commas or new lines...')}
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            <button
              onClick={addBulkGuests}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.seatingChart.addAll', 'Add All')}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={autoAssignSeats}
            disabled={guests.length === 0}
            className={`flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 ${
              guests.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Shuffle className="w-5 h-5" />
            {t('tools.seatingChart.autoAssignSeats', 'Auto-Assign Seats')}
          </button>
          <button
            onClick={clearAssignments}
            className={`px-4 py-3 rounded-xl transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={exportSeatingChart}
            disabled={guests.length === 0}
            className={`px-4 py-3 rounded-xl transition-colors ${
              guests.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Unassigned Guests */}
        {unassignedGuests.length > 0 && (
          <div
            className={`p-4 rounded-xl border-2 border-dashed ${
              isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(null)}
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Unassigned Guests ({unassignedGuests.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {unassignedGuests.map((guest) => (
                <div
                  key={guest.name}
                  draggable
                  onDragStart={() => handleDragStart(guest.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-move ${
                    isDark
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm font-medium">{guest.name}</span>
                  <button
                    onClick={() => removeGuest(guest.name)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tables.map((table, idx) => (
            <div
              key={table.id}
              className={`p-4 rounded-xl border-2 ${
                table.guests.length >= table.seats
                  ? isDark
                    ? 'border-green-600 bg-green-900/20'
                    : 'border-green-400 bg-green-50'
                  : isDark
                  ? 'border-gray-700 bg-gray-800'
                  : 'border-gray-200 bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(table.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Table2 className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                  <input
                    type="text"
                    value={table.name}
                    onChange={(e) => setTables(prev => prev.map((t, i) =>
                      i === idx ? { ...t, name: e.target.value } : t
                    ))}
                    className={`font-semibold bg-transparent border-none focus:outline-none focus:ring-0 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  />
                </div>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  table.guests.length >= table.seats
                    ? 'bg-green-500/20 text-green-500'
                    : isDark
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {table.guests.length}/{table.seats}
                </span>
              </div>

              {table.guests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {table.guests.map((guestName) => (
                    <div
                      key={guestName}
                      draggable
                      onDragStart={() => handleDragStart(guestName)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-move ${
                        isDark
                          ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900/70'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      <span className="text-sm font-medium">{guestName}</span>
                      <button
                        onClick={() => assignGuestToTable(guestName, null)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('tools.seatingChart.dragGuestsHereToAssign', 'Drag guests here to assign seats')}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.seatingChart.tip', 'Tip:')}</strong> Drag and drop guests between tables to manually arrange seating. Use "Auto-Assign" for random distribution. Click the X to unassign a guest from their table.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeatingChartTool;
