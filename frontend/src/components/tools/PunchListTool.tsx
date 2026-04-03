'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ListChecks,
  Plus,
  Trash2,
  Save,
  Calendar,
  User,
  Building2,
  FileText,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Edit2,
  X,
  Camera,
  Filter,
  MapPin,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface PunchListToolProps {
  uiConfig?: UIConfig;
}

// Types
type ItemStatus = 'open' | 'in_progress' | 'completed' | 'verified' | 'not_applicable';
type Priority = 'critical' | 'high' | 'medium' | 'low';

interface PunchItem {
  id: string;
  itemNumber: number;
  location: string;
  room: string;
  description: string;
  trade: string;
  assignedTo: string;
  priority: Priority;
  status: ItemStatus;
  dueDate: string;
  completedDate: string;
  verifiedBy: string;
  verifiedDate: string;
  photos: string[];
  notes: string;
}

interface PunchList {
  id: string;
  projectName: string;
  projectNumber: string;
  phase: string;
  building: string;
  createdBy: string;
  createdDate: string;
  dueDate: string;
  items: PunchItem[];
  totalItems: number;
  completedItems: number;
  percentComplete: number;
  status: 'active' | 'completed' | 'archived';
  walkDate: string;
  attendees: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const TRADES = [
  'General',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Flooring',
  'Painting',
  'Drywall',
  'Carpentry',
  'Glazing',
  'Roofing',
  'Landscaping',
  'Fire Protection',
  'Security',
  'Other',
];

const STATUS_CONFIG: Record<ItemStatus, { color: string; label: string; icon: any }> = {
  open: { color: 'bg-red-100 text-red-800', label: 'Open', icon: Circle },
  in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: Clock },
  completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed', icon: CheckCircle },
  verified: { color: 'bg-green-100 text-green-800', label: 'Verified', icon: CheckCircle },
  not_applicable: { color: 'bg-gray-100 text-gray-800', label: 'N/A', icon: AlertCircle },
};

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string }> = {
  critical: { color: 'bg-red-100 text-red-800', label: 'Critical' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  low: { color: 'bg-green-100 text-green-800', label: 'Low' },
};

// Column configuration
const PUNCHLIST_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'phase', header: 'Phase', type: 'string' },
  { key: 'totalItems', header: 'Total Items', type: 'number' },
  { key: 'completedItems', header: 'Completed', type: 'number' },
  { key: 'percentComplete', header: '% Complete', type: 'number' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
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

// Main Component
export const PunchListTool: React.FC<PunchListToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const {
    data: punchLists,
    addItem: addPunchList,
    updateItem: updatePunchList,
    deleteItem: deletePunchList,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
  } = useToolData<PunchList>('punch-lists', [], PUNCHLIST_COLUMNS);

  // UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit' | 'items'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrade, setFilterTrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPunchList, setSelectedPunchList] = useState<PunchList | null>(null);

  // New Punch List State
  const [newPunchList, setNewPunchList] = useState<Partial<PunchList>>({
    projectName: '',
    projectNumber: '',
    phase: 'Final',
    building: '',
    createdBy: '',
    createdDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [],
    walkDate: '',
    attendees: '',
    notes: '',
    status: 'active',
  });

  // Calculate stats
  const calculateStats = (items: PunchItem[]): { totalItems: number; completedItems: number; percentComplete: number } => {
    const totalItems = items.length;
    const completedItems = items.filter(i => i.status === 'completed' || i.status === 'verified').length;
    const percentComplete = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { totalItems, completedItems, percentComplete };
  };

  // Add punch item
  const addPunchItem = () => {
    if (!selectedPunchList) return;
    const nextNumber = (selectedPunchList.items?.length || 0) + 1;
    const newItem: PunchItem = {
      id: generateId(),
      itemNumber: nextNumber,
      location: '',
      room: '',
      description: '',
      trade: 'General',
      assignedTo: '',
      priority: 'medium',
      status: 'open',
      dueDate: selectedPunchList.dueDate || '',
      completedDate: '',
      verifiedBy: '',
      verifiedDate: '',
      photos: [],
      notes: '',
    };
    const updatedItems = [...(selectedPunchList.items || []), newItem];
    const stats = calculateStats(updatedItems);
    const updated = { ...selectedPunchList, items: updatedItems, ...stats };
    setSelectedPunchList(updated);
    updatePunchList(selectedPunchList.id, { items: updatedItems, ...stats, updatedAt: new Date().toISOString() });
  };

  // Update punch item
  const updatePunchItem = (itemId: string, field: keyof PunchItem, value: any) => {
    if (!selectedPunchList) return;
    const updatedItems = selectedPunchList.items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        if (field === 'status' && value === 'completed') {
          updated.completedDate = new Date().toISOString().split('T')[0];
        }
        return updated;
      }
      return item;
    });
    const stats = calculateStats(updatedItems);
    const updated = { ...selectedPunchList, items: updatedItems, ...stats };
    setSelectedPunchList(updated);
    updatePunchList(selectedPunchList.id, { items: updatedItems, ...stats, updatedAt: new Date().toISOString() });
  };

  // Delete punch item
  const deletePunchItem = (itemId: string) => {
    if (!selectedPunchList) return;
    const updatedItems = selectedPunchList.items.filter(item => item.id !== itemId);
    const stats = calculateStats(updatedItems);
    const updated = { ...selectedPunchList, items: updatedItems, ...stats };
    setSelectedPunchList(updated);
    updatePunchList(selectedPunchList.id, { items: updatedItems, ...stats, updatedAt: new Date().toISOString() });
  };

  // Save punch list
  const handleSave = () => {
    const stats = calculateStats(newPunchList.items || []);
    const punchList: PunchList = {
      id: generateId(),
      projectName: newPunchList.projectName || '',
      projectNumber: newPunchList.projectNumber || '',
      phase: newPunchList.phase || 'Final',
      building: newPunchList.building || '',
      createdBy: newPunchList.createdBy || '',
      createdDate: newPunchList.createdDate || new Date().toISOString().split('T')[0],
      dueDate: newPunchList.dueDate || '',
      items: newPunchList.items || [],
      ...stats,
      status: 'active',
      walkDate: newPunchList.walkDate || '',
      attendees: newPunchList.attendees || '',
      notes: newPunchList.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addPunchList(punchList);
    setNewPunchList({
      projectName: '',
      phase: 'Final',
      createdDate: new Date().toISOString().split('T')[0],
      items: [],
      status: 'active',
    });
    setActiveTab('list');
  };

  // Filter punch lists
  const filteredPunchLists = useMemo(() => {
    return punchLists.filter(pl => {
      const matchesSearch =
        pl.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pl.building.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [punchLists, searchTerm]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!selectedPunchList) return [];
    return selectedPunchList.items.filter(item => {
      const matchesTrade = filterTrade === 'all' || item.trade === filterTrade;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesTrade && matchesStatus;
    });
  }, [selectedPunchList, filterTrade, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const allItems = punchLists.flatMap(pl => pl.items);
    return {
      totalLists: punchLists.length,
      totalItems: allItems.length,
      openItems: allItems.filter(i => i.status === 'open').length,
      completedToday: allItems.filter(i => i.completedDate === new Date().toISOString().split('T')[0]).length,
    };
  }, [punchLists]);

  // Handle export
  const handleExport = async (format: string) => {
    switch (format) {
      case 'csv': exportCSV({ filename: 'punch-lists' }); break;
      case 'excel': exportExcel({ filename: 'punch-lists' }); break;
      case 'json': exportJSON({ filename: 'punch-lists' }); break;
      case 'pdf': await exportPDF({ filename: 'punch-lists', title: 'Punch Lists' }); break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <ListChecks className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('tools.punchList.punchListTracker', 'Punch List Tracker')}</h1>
            <p className="text-gray-500">{t('tools.punchList.trackAndManageProjectPunch', 'Track and manage project punch list items')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="punch-list" toolName="Punch List" />

          <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onSync={forceSync} />
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.punchList.activeLists', 'Active Lists')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalLists}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ListChecks className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.punchList.totalItems', 'Total Items')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Circle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.punchList.openItems', 'Open Items')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.openItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('tools.punchList.completedToday', 'Completed Today')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.completedToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('list'); setSelectedPunchList(null); }}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'list' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t('tools.punchList.allPunchLists', 'All Punch Lists')}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'create' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t('tools.punchList.newPunchList2', 'New Punch List')}
        </button>
        {selectedPunchList && (
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'items' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Items ({selectedPunchList.totalItems})
          </button>
        )}
      </div>

      {/* List View */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('tools.punchList.searchPunchLists', 'Search punch lists...')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="space-y-4">
            {filteredPunchLists.map(pl => (
              <div key={pl.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === pl.id ? null : pl.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <ListChecks className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{pl.projectName}</h3>
                        <p className="text-sm text-gray-500">{pl.phase} - {pl.building || 'All Areas'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{pl.percentComplete}%</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${pl.percentComplete}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{pl.completedItems}/{pl.totalItems} items</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${pl.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {pl.status}
                      </span>
                      {expandedId === pl.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {expandedId === pl.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.punchList.createdBy', 'Created By')}</p>
                        <p className="font-medium">{pl.createdBy || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.punchList.walkDate', 'Walk Date')}</p>
                        <p className="font-medium">{formatDate(pl.walkDate) || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.punchList.dueDate', 'Due Date')}</p>
                        <p className="font-medium">{formatDate(pl.dueDate) || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('tools.punchList.openItems2', 'Open Items')}</p>
                        <p className="font-medium text-red-600">{pl.totalItems - pl.completedItems}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedPunchList(pl); setActiveTab('items'); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                      >
                        <ListChecks className="w-4 h-4" />
                        {t('tools.punchList.viewItems', 'View Items')}
                      </button>
                      <button
                        onClick={() => deletePunchList(pl.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredPunchLists.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <ListChecks className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{t('tools.punchList.noPunchListsFound', 'No punch lists found')}</h3>
                <button onClick={() => setActiveTab('create')} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  {t('tools.punchList.createPunchList', 'Create Punch List')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Punch List */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t('tools.punchList.newPunchList', 'New Punch List')}</h2>
            <button onClick={() => setActiveTab('list')} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.punchList.projectName', 'Project Name')}</label>
              <input
                type="text"
                value={newPunchList.projectName}
                onChange={e => setNewPunchList({ ...newPunchList, projectName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.punchList.phase', 'Phase')}</label>
              <input
                type="text"
                value={newPunchList.phase}
                onChange={e => setNewPunchList({ ...newPunchList, phase: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={t('tools.punchList.eGFinalPreFinal', 'e.g., Final, Pre-Final, Phase 1')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.punchList.buildingArea', 'Building/Area')}</label>
              <input
                type="text"
                value={newPunchList.building}
                onChange={e => setNewPunchList({ ...newPunchList, building: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.punchList.createdBy2', 'Created By')}</label>
              <input
                type="text"
                value={newPunchList.createdBy}
                onChange={e => setNewPunchList({ ...newPunchList, createdBy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.punchList.walkDate2', 'Walk Date')}</label>
              <input
                type="date"
                value={newPunchList.walkDate}
                onChange={e => setNewPunchList({ ...newPunchList, walkDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.punchList.dueDate2', 'Due Date')}</label>
              <input
                type="date"
                value={newPunchList.dueDate}
                onChange={e => setNewPunchList({ ...newPunchList, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.punchList.attendees', 'Attendees')}</label>
            <input
              type="text"
              value={newPunchList.attendees}
              onChange={e => setNewPunchList({ ...newPunchList, attendees: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('tools.punchList.namesOfWalkParticipants', 'Names of walk participants')}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setActiveTab('list')} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('tools.punchList.cancel', 'Cancel')}</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Save className="w-4 h-4" />
              {t('tools.punchList.createPunchList2', 'Create Punch List')}
            </button>
          </div>
        </div>
      )}

      {/* Items View */}
      {activeTab === 'items' && selectedPunchList && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedPunchList.projectName}</h2>
                <p className="text-gray-500">{selectedPunchList.phase} - {selectedPunchList.building || 'All Areas'}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-2xl text-teal-600">{selectedPunchList.percentComplete}%</p>
                  <p className="text-sm text-gray-500">{selectedPunchList.completedItems}/{selectedPunchList.totalItems} complete</p>
                </div>
                <button
                  onClick={addPunchItem}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.punchList.addItem', 'Add Item')}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <select value={filterTrade} onChange={e => setFilterTrade(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.punchList.allTrades', 'All Trades')}</option>
              {TRADES.map(trade => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.punchList.allStatus', 'All Status')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {filteredItems.map(item => {
              const StatusIcon = STATUS_CONFIG[item.status].icon;
              return (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => {
                        const nextStatus = item.status === 'open' ? 'in_progress' :
                                          item.status === 'in_progress' ? 'completed' :
                                          item.status === 'completed' ? 'verified' : 'open';
                        updatePunchItem(item.id, 'status', nextStatus);
                      }}
                      className={`p-2 rounded-full ${STATUS_CONFIG[item.status].color}`}
                    >
                      <StatusIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-500">#{item.itemNumber}</span>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updatePunchItem(item.id, 'description', e.target.value)}
                          placeholder={t('tools.punchList.description', 'Description')}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded"
                        />
                        <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_CONFIG[item.priority].color}`}>
                          {PRIORITY_CONFIG[item.priority].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={item.location}
                            onChange={e => updatePunchItem(item.id, 'location', e.target.value)}
                            placeholder={t('tools.punchList.location', 'Location')}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <select
                          value={item.trade}
                          onChange={e => updatePunchItem(item.id, 'trade', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {TRADES.map(trade => (
                            <option key={trade} value={trade}>{trade}</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={item.assignedTo}
                            onChange={e => updatePunchItem(item.id, 'assignedTo', e.target.value)}
                            placeholder={t('tools.punchList.assignedTo', 'Assigned to')}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <select
                          value={item.priority}
                          onChange={e => updatePunchItem(item.id, 'priority', e.target.value as Priority)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => deletePunchItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <ListChecks className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">{t('tools.punchList.noItemsFound', 'No items found')}</h3>
                <p className="text-gray-500 mt-1">{t('tools.punchList.addItemsToStartTracking', 'Add items to start tracking punch list')}</p>
                <button onClick={addPunchItem} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  {t('tools.punchList.addFirstItem', 'Add First Item')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PunchListTool;
