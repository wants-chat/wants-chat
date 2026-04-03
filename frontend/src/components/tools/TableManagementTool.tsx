'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  Plus,
  Trash2,
  Edit2,
  Save,
  Users,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Check,
  AlertCircle,
  User,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface TableManagementToolProps {
  uiConfig?: UIConfig;
}

type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'blocked';

interface TableData {
  id: string;
  tableNumber: string;
  capacity: number;
  section: string;
  status: TableStatus;
  currentPartyName: string;
  currentPartySize: number;
  seatedAt: string;
  serverName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const TABLE_SECTIONS = ['Main Floor', 'Patio', 'Bar', 'Private Dining', 'Window'];

const STATUS_CONFIG: Record<TableStatus, { label: string; color: string; bgColor: string }> = {
  available: { label: 'Available', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  occupied: { label: 'Occupied', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  reserved: { label: 'Reserved', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  cleaning: { label: 'Cleaning', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  blocked: { label: 'Blocked', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

const TABLE_COLUMNS: ColumnConfig[] = [
  { key: 'tableNumber', header: 'Table #', type: 'string' },
  { key: 'capacity', header: 'Capacity', type: 'number' },
  { key: 'section', header: 'Section', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'currentPartyName', header: 'Party Name', type: 'string' },
  { key: 'currentPartySize', header: 'Party Size', type: 'number' },
  { key: 'seatedAt', header: 'Seated At', type: 'string' },
  { key: 'serverName', header: 'Server', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export const TableManagementTool: React.FC<TableManagementToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: tables,
    setData: setTables,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<TableData>('table-management', [], TABLE_COLUMNS);

  const [showAddForm, setShowAddForm] = useState(true);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [newTable, setNewTable] = useState<Partial<TableData>>({
    tableNumber: '',
    capacity: 4,
    section: 'Main Floor',
    status: 'available',
    currentPartyName: '',
    currentPartySize: 0,
    seatedAt: '',
    serverName: '',
    notes: '',
  });

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesSection = selectedSection === 'all' || table.section === selectedSection;
      const matchesStatus = selectedStatus === 'all' || table.status === selectedStatus;
      return matchesSection && matchesStatus;
    });
  }, [tables, selectedSection, selectedStatus]);

  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter((t) => t.status === 'available').length;
    const occupied = tables.filter((t) => t.status === 'occupied').length;
    const reserved = tables.filter((t) => t.status === 'reserved').length;
    const totalSeated = tables
      .filter((t) => t.status === 'occupied')
      .reduce((sum, t) => sum + t.currentPartySize, 0);
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

    return { total, available, occupied, reserved, totalSeated, totalCapacity };
  }, [tables]);

  const handleAddTable = () => {
    if (!newTable.tableNumber) return;

    const table: TableData = {
      id: `table-${Date.now()}`,
      tableNumber: newTable.tableNumber || '',
      capacity: newTable.capacity || 4,
      section: newTable.section || 'Main Floor',
      status: newTable.status as TableStatus || 'available',
      currentPartyName: newTable.currentPartyName || '',
      currentPartySize: newTable.currentPartySize || 0,
      seatedAt: newTable.seatedAt || '',
      serverName: newTable.serverName || '',
      notes: newTable.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(table);
    setNewTable({
      tableNumber: '',
      capacity: 4,
      section: 'Main Floor',
      status: 'available',
      currentPartyName: '',
      currentPartySize: 0,
      seatedAt: '',
      serverName: '',
      notes: '',
    });
  };

  const handleUpdateTable = () => {
    if (!editingTable) return;
    updateItem(editingTable.id, { ...editingTable, updatedAt: new Date().toISOString() });
    setEditingTable(null);
  };

  const handleQuickStatusChange = (tableId: string, newStatus: TableStatus) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const updates: Partial<TableData> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (newStatus === 'occupied' && table.status !== 'occupied') {
      updates.seatedAt = new Date().toISOString();
    } else if (newStatus === 'available') {
      updates.currentPartyName = '';
      updates.currentPartySize = 0;
      updates.seatedAt = '';
    }

    updateItem(tableId, updates);
  };

  const handleSeatParty = (tableId: string, partyName: string, partySize: number) => {
    updateItem(tableId, {
      status: 'occupied',
      currentPartyName: partyName,
      currentPartySize: partySize,
      seatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Clear All Tables',
      message: 'Are you sure you want to clear all tables? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setTables([]);
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeSinceSeated = (seatedAt: string) => {
    if (!seatedAt) return '';
    const seated = new Date(seatedAt);
    const now = new Date();
    const diffMs = now.getTime() - seated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                  <LayoutGrid className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.tableManagement.tableManagement', 'Table Management')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.tableManagement.manageRestaurantFloorTablesAnd', 'Manage restaurant floor tables and seating')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="table-management" toolName="Table Management" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={isDark ? 'dark' : 'light'}
                  size="sm"
                />
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'table-management' })}
                  onExportExcel={() => exportExcel({ filename: 'table-management' })}
                  onExportJSON={() => exportJSON({ filename: 'table-management' })}
                  onExportPDF={() => exportPDF({
                    filename: 'table-management',
                    title: 'Table Management',
                    subtitle: `${tables.length} tables`,
                  })}
                  onPrint={() => print('Table Management')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={tables.length === 0}
                />
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                    isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.tableManagement.reset', 'Reset')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tableManagement.totalTables', 'Total Tables')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-green-500">{t('tools.tableManagement.available', 'Available')}</div>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-blue-500">{t('tools.tableManagement.occupied', 'Occupied')}</div>
            <div className="text-2xl font-bold text-blue-600">{stats.occupied}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-purple-500">{t('tools.tableManagement.reserved', 'Reserved')}</div>
            <div className="text-2xl font-bold text-purple-600">{stats.reserved}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tableManagement.guestsSeated', 'Guests Seated')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalSeated}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tableManagement.totalCapacity', 'Total Capacity')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalCapacity}</div>
          </div>
        </div>

        {/* Filters */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.tableManagement.section', 'Section')}
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-200 bg-white text-gray-900'
                  } rounded-lg`}
                >
                  <option value="all">{t('tools.tableManagement.allSections', 'All Sections')}</option>
                  {TABLE_SECTIONS.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.tableManagement.status', 'Status')}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-200 bg-white text-gray-900'
                  } rounded-lg`}
                >
                  <option value="all">{t('tools.tableManagement.allStatuses', 'All Statuses')}</option>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Table Form */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Plus className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.tableManagement.addTable', 'Add Table')}
                </CardTitle>
                {showAddForm ? (
                  <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
            </CardHeader>
            {showAddForm && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.tableManagement.table', 'Table # *')}
                    </label>
                    <input
                      type="text"
                      value={newTable.tableNumber}
                      onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                      placeholder="e.g., T1"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.tableManagement.capacity', 'Capacity')}
                    </label>
                    <input
                      type="number"
                      value={newTable.capacity}
                      onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 4 })}
                      min="1"
                      max="20"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tableManagement.section2', 'Section')}
                  </label>
                  <select
                    value={newTable.section}
                    onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  >
                    {TABLE_SECTIONS.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tableManagement.serverName', 'Server Name')}
                  </label>
                  <input
                    type="text"
                    value={newTable.serverName}
                    onChange={(e) => setNewTable({ ...newTable, serverName: e.target.value })}
                    placeholder={t('tools.tableManagement.assignedServer', 'Assigned server')}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tableManagement.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newTable.notes}
                    onChange={(e) => setNewTable({ ...newTable, notes: e.target.value })}
                    placeholder={t('tools.tableManagement.anySpecialNotes', 'Any special notes...')}
                    rows={2}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg resize-none`}
                  />
                </div>
                <button
                  onClick={handleAddTable}
                  disabled={!newTable.tableNumber}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.tableManagement.addTable2', 'Add Table')}
                </button>
              </CardContent>
            )}
          </Card>

          {/* Tables Grid */}
          <div className="lg:col-span-2">
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <LayoutGrid className="w-5 h-5 text-[#0D9488]" />
                  Floor Map ({filteredTables.length} tables)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTables.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('tools.tableManagement.noTablesFound', 'No tables found')}</p>
                    <p className="text-sm mt-1">{t('tools.tableManagement.addTablesToGetStarted', 'Add tables to get started')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredTables.map((table) => {
                      const statusConfig = STATUS_CONFIG[table.status];
                      return (
                        <div
                          key={table.id}
                          className={`p-4 rounded-xl border-2 ${
                            table.status === 'available'
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : table.status === 'occupied'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : table.status === 'reserved'
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : table.status === 'cleaning'
                              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {table.tableNumber}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor}`}>
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>Capacity: {table.capacity}</span>
                            </div>
                            <div>{table.section}</div>
                            {table.serverName && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{table.serverName}</span>
                              </div>
                            )}
                            {table.status === 'occupied' && (
                              <>
                                {table.currentPartyName && (
                                  <div className="font-medium text-blue-600 dark:text-blue-400">
                                    {table.currentPartyName} ({table.currentPartySize})
                                  </div>
                                )}
                                {table.seatedAt && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Clock className="w-3 h-3" />
                                    <span>{getTimeSinceSeated(table.seatedAt)}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex gap-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            {table.status !== 'available' && (
                              <button
                                onClick={() => handleQuickStatusChange(table.id, 'available')}
                                className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                {t('tools.tableManagement.clear', 'Clear')}
                              </button>
                            )}
                            {table.status === 'available' && (
                              <button
                                onClick={() => handleQuickStatusChange(table.id, 'occupied')}
                                className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              >
                                {t('tools.tableManagement.seat', 'Seat')}
                              </button>
                            )}
                            <button
                              onClick={() => setEditingTable(table)}
                              className={`px-2 py-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteItem(table.id)}
                              className="px-2 py-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Modal */}
        {editingTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className={`w-full max-w-md ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    Edit Table {editingTable.tableNumber}
                  </CardTitle>
                  <button onClick={() => setEditingTable(null)}>
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.tableManagement.table2', 'Table #')}
                    </label>
                    <input
                      type="text"
                      value={editingTable.tableNumber}
                      onChange={(e) => setEditingTable({ ...editingTable, tableNumber: e.target.value })}
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.tableManagement.capacity2', 'Capacity')}
                    </label>
                    <input
                      type="number"
                      value={editingTable.capacity}
                      onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 4 })}
                      min="1"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tableManagement.status2', 'Status')}
                  </label>
                  <select
                    value={editingTable.status}
                    onChange={(e) => setEditingTable({ ...editingTable, status: e.target.value as TableStatus })}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tableManagement.partyName', 'Party Name')}
                  </label>
                  <input
                    type="text"
                    value={editingTable.currentPartyName}
                    onChange={(e) => setEditingTable({ ...editingTable, currentPartyName: e.target.value })}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tableManagement.partySize', 'Party Size')}
                  </label>
                  <input
                    type="number"
                    value={editingTable.currentPartySize}
                    onChange={(e) => setEditingTable({ ...editingTable, currentPartySize: parseInt(e.target.value) || 0 })}
                    min="0"
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tableManagement.serverName2', 'Server Name')}
                  </label>
                  <input
                    type="text"
                    value={editingTable.serverName}
                    onChange={(e) => setEditingTable({ ...editingTable, serverName: e.target.value })}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateTable}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {t('tools.tableManagement.save', 'Save')}
                  </button>
                  <button
                    onClick={() => setEditingTable(null)}
                    className={`px-6 py-3 rounded-xl font-medium ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.tableManagement.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default TableManagementTool;
