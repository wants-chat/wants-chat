'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  User,
  Building,
  Calendar,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Save,
  X,
  FileText,
  Users,
  Briefcase,
  Eye,
  Link,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface ConflictCheckToolProps {
  uiConfig?: UIConfig;
}

// Types
type PartyType = 'client' | 'adverse-party' | 'witness' | 'co-counsel' | 'opposing-counsel' | 'expert' | 'other';
type ConflictStatus = 'clear' | 'potential' | 'conflict' | 'waived' | 'pending';
type EntityType = 'individual' | 'corporation' | 'llc' | 'partnership' | 'government' | 'other';

interface ConflictParty {
  id: string;
  // Party Info
  name: string;
  aliases: string[];
  entityType: EntityType;
  partyType: PartyType;
  // Contact
  address?: string;
  phone?: string;
  email?: string;
  // Corporate Info
  parentCompany?: string;
  subsidiaries?: string[];
  officers?: string[];
  // Matter Association
  matterNumber: string;
  matterName: string;
  clientName: string;
  // Metadata
  dateAdded: string;
  addedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConflictCheck {
  id: string;
  // Check Info
  searchName: string;
  searchAliases: string[];
  requestedBy: string;
  requestDate: string;
  // Results
  status: ConflictStatus;
  matchesFound: number;
  matches: ConflictMatch[];
  // Matter
  proposedMatter: string;
  proposedClient: string;
  matterType: string;
  // Resolution
  resolvedBy?: string;
  resolvedDate?: string;
  resolution?: string;
  waiverObtained?: boolean;
  waiverDate?: string;
  waiverNotes?: string;
  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConflictMatch {
  partyId: string;
  partyName: string;
  partyType: PartyType;
  matterNumber: string;
  matterName: string;
  matchType: 'exact' | 'partial' | 'alias';
  conflictLevel: 'high' | 'medium' | 'low';
}

// Constants
const PARTY_TYPES: { value: PartyType; label: string; color: string }[] = [
  { value: 'client', label: 'Client', color: 'bg-blue-100 text-blue-800' },
  { value: 'adverse-party', label: 'Adverse Party', color: 'bg-red-100 text-red-800' },
  { value: 'witness', label: 'Witness', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'co-counsel', label: 'Co-Counsel', color: 'bg-green-100 text-green-800' },
  { value: 'opposing-counsel', label: 'Opposing Counsel', color: 'bg-orange-100 text-orange-800' },
  { value: 'expert', label: 'Expert', color: 'bg-purple-100 text-purple-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
];

const STATUS_OPTIONS: { value: ConflictStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'clear', label: 'Clear', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'potential', label: 'Potential Conflict', color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'conflict', label: 'Conflict Found', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
  { value: 'waived', label: 'Waived', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'pending', label: 'Pending Review', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-4 h-4" /> },
];

const ENTITY_TYPES: { value: EntityType; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'LLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'government', label: 'Government Entity' },
  { value: 'other', label: 'Other' },
];

// Column configuration for exports
const PARTY_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'entityType', header: 'Entity Type', type: 'string' },
  { key: 'partyType', header: 'Party Type', type: 'string' },
  { key: 'matterNumber', header: 'Matter #', type: 'string' },
  { key: 'matterName', header: 'Matter', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'dateAdded', header: 'Date Added', type: 'date' },
  { key: 'addedBy', header: 'Added By', type: 'string' },
];

const CHECK_COLUMNS: ColumnConfig[] = [
  { key: 'searchName', header: 'Search Name', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'matchesFound', header: 'Matches', type: 'number' },
  { key: 'proposedClient', header: 'Proposed Client', type: 'string' },
  { key: 'proposedMatter', header: 'Proposed Matter', type: 'string' },
  { key: 'requestedBy', header: 'Requested By', type: 'string' },
  { key: 'requestDate', header: 'Request Date', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const ConflictCheckTool: React.FC<ConflictCheckToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: parties,
    addItem: addParty,
    updateItem: updateParty,
    deleteItem: deleteParty,
    isSynced: partiesSynced,
    isSaving: partiesSaving,
    lastSaved: partiesLastSaved,
    syncError: partiesSyncError,
    forceSync: forcePartiesSync,
  } = useToolData<ConflictParty>('conflict-parties', [], PARTY_COLUMNS);

  const {
    data: checks,
    addItem: addCheck,
    updateItem: updateCheck,
    deleteItem: deleteCheck,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isSynced: checksSynced,
    isSaving: checksSaving,
    lastSaved: checksLastSaved,
    syncError: checksSyncError,
    forceSync: forceChecksSync,
  } = useToolData<ConflictCheck>('conflict-checks', [], CHECK_COLUMNS);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'database' | 'new-party'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ConflictMatch[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<ConflictCheck | null>(null);

  // New party form state
  const [newParty, setNewParty] = useState<Partial<ConflictParty>>({
    name: '',
    aliases: [],
    entityType: 'individual',
    partyType: 'client',
    matterNumber: '',
    matterName: '',
    clientName: '',
    dateAdded: new Date().toISOString().split('T')[0],
    addedBy: '',
  });

  // Search form state
  const [searchForm, setSearchForm] = useState({
    searchName: '',
    proposedClient: '',
    proposedMatter: '',
    matterType: '',
    requestedBy: '',
  });

  // Alias input
  const [newAlias, setNewAlias] = useState('');

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

      if (params.partyType && PARTY_TYPES.find(pt => pt.value === params.partyType)) {
        setNewParty(prev => ({ ...prev, partyType: params.partyType }));
        hasChanges = true;
      }
      if (params.entityType && ENTITY_TYPES.find(et => et.value === params.entityType)) {
        setNewParty(prev => ({ ...prev, entityType: params.entityType }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Statistics
  const stats = useMemo(() => {
    const totalParties = parties.length;
    const totalChecks = checks.length;
    const conflictsFound = checks.filter((c) => c.status === 'conflict').length;
    const pendingReview = checks.filter((c) => c.status === 'pending' || c.status === 'potential').length;

    return { totalParties, totalChecks, conflictsFound, pendingReview };
  }, [parties, checks]);

  // Perform conflict search
  const handleSearch = () => {
    if (!searchForm.searchName) {
      setValidationMessage('Please enter a name to search');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const searchTermLower = searchForm.searchName.toLowerCase();
    const matches: ConflictMatch[] = [];

    parties.forEach((party) => {
      let matchType: 'exact' | 'partial' | 'alias' | null = null;
      let conflictLevel: 'high' | 'medium' | 'low' = 'low';

      // Check exact match
      if (party.name.toLowerCase() === searchTermLower) {
        matchType = 'exact';
        conflictLevel = 'high';
      }
      // Check partial match
      else if (party.name.toLowerCase().includes(searchTermLower) || searchTermLower.includes(party.name.toLowerCase())) {
        matchType = 'partial';
        conflictLevel = 'medium';
      }
      // Check aliases
      else if (party.aliases?.some((alias) => alias.toLowerCase().includes(searchTermLower))) {
        matchType = 'alias';
        conflictLevel = 'medium';
      }

      if (matchType) {
        matches.push({
          partyId: party.id,
          partyName: party.name,
          partyType: party.partyType,
          matterNumber: party.matterNumber,
          matterName: party.matterName,
          matchType,
          conflictLevel,
        });
      }
    });

    setSearchResults(matches);

    // Create conflict check record
    const check: ConflictCheck = {
      id: generateId(),
      searchName: searchForm.searchName,
      searchAliases: [],
      requestedBy: searchForm.requestedBy || 'System',
      requestDate: new Date().toISOString(),
      status: matches.length === 0 ? 'clear' : matches.some((m) => m.conflictLevel === 'high') ? 'conflict' : 'potential',
      matchesFound: matches.length,
      matches,
      proposedMatter: searchForm.proposedMatter,
      proposedClient: searchForm.proposedClient,
      matterType: searchForm.matterType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addCheck(check);
  };

  // Add party to database
  const handleAddParty = () => {
    if (!newParty.name || !newParty.matterNumber) {
      setValidationMessage('Please fill in required fields (Name, Matter Number)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const party: ConflictParty = {
      id: generateId(),
      name: newParty.name || '',
      aliases: newParty.aliases || [],
      entityType: newParty.entityType || 'individual',
      partyType: newParty.partyType || 'client',
      address: newParty.address,
      phone: newParty.phone,
      email: newParty.email,
      parentCompany: newParty.parentCompany,
      subsidiaries: newParty.subsidiaries,
      officers: newParty.officers,
      matterNumber: newParty.matterNumber || '',
      matterName: newParty.matterName || '',
      clientName: newParty.clientName || '',
      dateAdded: newParty.dateAdded || new Date().toISOString().split('T')[0],
      addedBy: newParty.addedBy || '',
      notes: newParty.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addParty(party);
    resetPartyForm();
    setActiveTab('database');
  };

  const resetPartyForm = () => {
    setNewParty({
      name: '',
      aliases: [],
      entityType: 'individual',
      partyType: 'client',
      matterNumber: '',
      matterName: '',
      clientName: '',
      dateAdded: new Date().toISOString().split('T')[0],
      addedBy: '',
    });
    setNewAlias('');
  };

  const handleAddAlias = () => {
    if (newAlias.trim() && !newParty.aliases?.includes(newAlias.trim())) {
      setNewParty({
        ...newParty,
        aliases: [...(newParty.aliases || []), newAlias.trim()],
      });
      setNewAlias('');
    }
  };

  const handleRemoveAlias = (alias: string) => {
    setNewParty({
      ...newParty,
      aliases: newParty.aliases?.filter((a) => a !== alias) || [],
    });
  };

  const handleDeleteParty = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Party',
      message: 'Are you sure you want to delete this party from the database?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteParty(id);
    }
  };

  const getStatusBadge = (status: ConflictStatus) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${option?.color}`}>
        {option?.icon}
        {option?.label}
      </span>
    );
  };

  const getPartyTypeBadge = (type: PartyType) => {
    const option = PARTY_TYPES.find((p) => p.value === type);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${option?.color}`}>
        {option?.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <ShieldAlert className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('tools.conflictCheck.conflictCheck', 'Conflict Check')}</h1>
                <p className="text-gray-600">{t('tools.conflictCheck.checkForConflictsOfInterest', 'Check for conflicts of interest')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="conflict-check" toolName="Conflict Check" />

              <SyncStatus
                isSynced={checksSynced && partiesSynced}
                isSaving={checksSaving || partiesSaving}
                lastSaved={checksLastSaved || partiesLastSaved}
                syncError={checksSyncError || partiesSyncError}
                onForceSync={() => {
                  forceChecksSync();
                  forcePartiesSync();
                }}
              />
              <ExportDropdown
                onExportCSV={exportCSV}
                onExportExcel={exportExcel}
                onExportJSON={exportJSON}
                onExportPDF={exportPDF}
                onPrint={print}
                onCopyToClipboard={copyToClipboard}
                onImportCSV={importCSV}
                onImportJSON={importJSON}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalParties}</div>
              <div className="text-sm text-gray-600">{t('tools.conflictCheck.partiesInDatabase', 'Parties in Database')}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalChecks}</div>
              <div className="text-sm text-gray-600">{t('tools.conflictCheck.conflictChecks', 'Conflict Checks')}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{stats.conflictsFound}</div>
              <div className="text-sm text-gray-600">{t('tools.conflictCheck.conflictsFound', 'Conflicts Found')}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</div>
              <div className="text-sm text-gray-600">{t('tools.conflictCheck.pendingReview', 'Pending Review')}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              {t('tools.conflictCheck.search', 'Search')}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              {t('tools.conflictCheck.checkHistory', 'Check History')}
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'database'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              {t('tools.conflictCheck.partyDatabase', 'Party Database')}
            </button>
            <button
              onClick={() => setActiveTab('new-party')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'new-party'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              {t('tools.conflictCheck.addParty', 'Add Party')}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.conflictCheck.newConflictCheck', 'New Conflict Check')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Name to Search <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={searchForm.searchName}
                    onChange={(e) => setSearchForm({ ...searchForm, searchName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder={t('tools.conflictCheck.enterNameToCheck', 'Enter name to check...')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.conflictCheck.proposedClient', 'Proposed Client')}</label>
                  <input
                    type="text"
                    value={searchForm.proposedClient}
                    onChange={(e) => setSearchForm({ ...searchForm, proposedClient: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.conflictCheck.proposedMatter', 'Proposed Matter')}</label>
                  <input
                    type="text"
                    value={searchForm.proposedMatter}
                    onChange={(e) => setSearchForm({ ...searchForm, proposedMatter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.conflictCheck.requestedBy', 'Requested By')}</label>
                  <input
                    type="text"
                    value={searchForm.requestedBy}
                    onChange={(e) => setSearchForm({ ...searchForm, requestedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {t('tools.conflictCheck.runConflictCheck', 'Run Conflict Check')}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {searchResults.length} Potential Match{searchResults.length !== 1 ? 'es' : ''} Found
                  </h2>
                </div>
                <div className="space-y-3">
                  {searchResults.map((match, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-l-4 ${
                        match.conflictLevel === 'high'
                          ? 'bg-red-50 border-red-500'
                          : match.conflictLevel === 'medium'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{match.partyName}</div>
                          <div className="text-sm text-gray-500">
                            {match.matterNumber} - {match.matterName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPartyTypeBadge(match.partyType)}
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              match.matchType === 'exact'
                                ? 'bg-red-100 text-red-800'
                                : match.matchType === 'partial'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {match.matchType} match
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length === 0 && searchForm.searchName && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <h3 className="text-lg font-semibold text-green-800">{t('tools.conflictCheck.noConflictsFound', 'No Conflicts Found')}</h3>
                <p className="text-green-600">{t('tools.conflictCheck.theSearchDidNotReturn', 'The search did not return any matching parties.')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {checks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('tools.conflictCheck.noConflictChecksPerformedYet', 'No conflict checks performed yet')}</p>
                </div>
              ) : (
                checks.map((check) => (
                  <div key={check.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{check.searchName}</div>
                        <div className="text-sm text-gray-500">
                          {check.proposedClient && `Client: ${check.proposedClient} | `}
                          {check.proposedMatter && `Matter: ${check.proposedMatter}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Requested by {check.requestedBy} on {formatDate(check.requestDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{check.matchesFound} matches</div>
                        </div>
                        {getStatusBadge(check.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('tools.conflictCheck.searchParties', 'Search parties...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {parties.filter(
                (p) =>
                  searchTerm === '' ||
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.matterNumber.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('tools.conflictCheck.noPartiesInDatabase', 'No parties in database')}</p>
                </div>
              ) : (
                parties
                  .filter(
                    (p) =>
                      searchTerm === '' ||
                      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.matterNumber.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((party) => (
                    <div key={party.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{party.name}</div>
                          <div className="text-sm text-gray-500">
                            {party.matterNumber} - {party.matterName}
                          </div>
                          {party.aliases && party.aliases.length > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              Aliases: {party.aliases.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {getPartyTypeBadge(party.partyType)}
                          <button
                            onClick={() => handleDeleteParty(party.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
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

        {activeTab === 'new-party' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('tools.conflictCheck.addPartyToDatabase', 'Add Party to Database')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Party Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newParty.name || ''}
                  onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.conflictCheck.entityType', 'Entity Type')}</label>
                <select
                  value={newParty.entityType || 'individual'}
                  onChange={(e) => setNewParty({ ...newParty, entityType: e.target.value as EntityType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  {ENTITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.conflictCheck.partyType', 'Party Type')}</label>
                <select
                  value={newParty.partyType || 'client'}
                  onChange={(e) => setNewParty({ ...newParty, partyType: e.target.value as PartyType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  {PARTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matter Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newParty.matterNumber || ''}
                  onChange={(e) => setNewParty({ ...newParty, matterNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.conflictCheck.matterName', 'Matter Name')}</label>
                <input
                  type="text"
                  value={newParty.matterName || ''}
                  onChange={(e) => setNewParty({ ...newParty, matterName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.conflictCheck.clientName', 'Client Name')}</label>
                <input
                  type="text"
                  value={newParty.clientName || ''}
                  onChange={(e) => setNewParty({ ...newParty, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.conflictCheck.addedBy', 'Added By')}</label>
                <input
                  type="text"
                  value={newParty.addedBy || ''}
                  onChange={(e) => setNewParty({ ...newParty, addedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Aliases */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.conflictCheck.aliasesAkas', 'Aliases / AKAs')}</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newParty.aliases?.map((alias) => (
                  <span
                    key={alias}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {alias}
                    <button onClick={() => handleRemoveAlias(alias)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAlias()}
                  placeholder={t('tools.conflictCheck.addAlias', 'Add alias...')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <button onClick={handleAddAlias} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.conflictCheck.notes', 'Notes')}</label>
              <textarea
                value={newParty.notes || ''}
                onChange={(e) => setNewParty({ ...newParty, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button onClick={resetPartyForm} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                {t('tools.conflictCheck.reset', 'Reset')}
              </button>
              <button
                onClick={handleAddParty}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('tools.conflictCheck.addParty2', 'Add Party')}
              </button>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md shadow-lg z-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{validationMessage}</p>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ConflictCheckTool;
