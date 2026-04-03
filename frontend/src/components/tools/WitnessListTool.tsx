import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  MessageSquare,
  Briefcase,
  Shield,
  Star
} from 'lucide-react';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';

// Types
type WitnessType = 'fact' | 'expert' | 'character' | 'eyewitness' | 'rebuttal' | 'impeachment';
type WitnessStatus = 'potential' | 'confirmed' | 'subpoenaed' | 'interviewed' | 'deposed' | 'testified' | 'withdrawn' | 'unavailable';
type CredibilityRating = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
type PartyAffiliation = 'plaintiff' | 'defendant' | 'neutral' | 'hostile';

interface Witness {
  id: string;
  matterId: string;
  matterName: string;
  name: string;
  witnessType: WitnessType;
  status: WitnessStatus;
  partyAffiliation: PartyAffiliation;
  credibilityRating: CredibilityRating;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  employer: string;
  relationship: string;
  knowledgeAreas: string[];
  expectedTestimony: string;
  interviewNotes: string;
  depositionDate?: string;
  depositionLocation?: string;
  trialDate?: string;
  subpoenaServed: boolean;
  subpoenaDate?: string;
  witnessFee: number;
  travelExpenses: number;
  documents: string[];
  strengths: string[];
  weaknesses: string[];
  crossExamIssues: string[];
  preparationStatus: 'not-started' | 'in-progress' | 'completed';
  lastContact?: string;
  nextFollowUp?: string;
  assignedAttorney: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const witnessTypeOptions: { value: WitnessType; label: string; color: string }[] = [
  { value: 'fact', label: 'Fact Witness', color: 'bg-blue-100 text-blue-800' },
  { value: 'expert', label: 'Expert Witness', color: 'bg-purple-100 text-purple-800' },
  { value: 'character', label: 'Character Witness', color: 'bg-green-100 text-green-800' },
  { value: 'eyewitness', label: 'Eyewitness', color: 'bg-amber-100 text-amber-800' },
  { value: 'rebuttal', label: 'Rebuttal Witness', color: 'bg-orange-100 text-orange-800' },
  { value: 'impeachment', label: 'Impeachment Witness', color: 'bg-red-100 text-red-800' },
];

const statusOptions: { value: WitnessStatus; label: string; color: string }[] = [
  { value: 'potential', label: 'Potential', color: 'bg-gray-100 text-gray-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'subpoenaed', label: 'Subpoenaed', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'interviewed', label: 'Interviewed', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'deposed', label: 'Deposed', color: 'bg-purple-100 text-purple-800' },
  { value: 'testified', label: 'Testified', color: 'bg-green-100 text-green-800' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-orange-100 text-orange-800' },
  { value: 'unavailable', label: 'Unavailable', color: 'bg-red-100 text-red-800' },
];

const credibilityOptions: { value: CredibilityRating; label: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
  { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-800' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800' },
  { value: 'unknown', label: 'Unknown', color: 'bg-gray-100 text-gray-800' },
];

const affiliationOptions: { value: PartyAffiliation; label: string; color: string }[] = [
  { value: 'plaintiff', label: 'Plaintiff', color: 'bg-blue-100 text-blue-800' },
  { value: 'defendant', label: 'Defendant', color: 'bg-red-100 text-red-800' },
  { value: 'neutral', label: 'Neutral', color: 'bg-gray-100 text-gray-800' },
  { value: 'hostile', label: 'Hostile', color: 'bg-orange-100 text-orange-800' },
];

const prepStatusOptions: { value: string; label: string; color: string }[] = [
  { value: 'not-started', label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
];

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Export columns configuration
const exportColumns: ColumnConfig[] = [
  { key: 'name', header: 'Witness Name' },
  { key: 'matterName', header: 'Matter' },
  { key: 'witnessType', header: 'Type' },
  { key: 'status', header: 'Status' },
  { key: 'partyAffiliation', header: 'Affiliation' },
  { key: 'credibilityRating', header: 'Credibility' },
  { key: 'phone', header: 'Phone' },
  { key: 'email', header: 'Email' },
  { key: 'occupation', header: 'Occupation' },
  { key: 'employer', header: 'Employer' },
  { key: 'relationship', header: 'Relationship' },
  { key: 'expectedTestimony', header: 'Expected Testimony' },
  { key: 'depositionDate', header: 'Deposition Date' },
  { key: 'trialDate', header: 'Trial Date' },
  { key: 'subpoenaServed', header: 'Subpoena Served' },
  { key: 'witnessFee', header: 'Witness Fee' },
  { key: 'travelExpenses', header: 'Travel Expenses' },
  { key: 'preparationStatus', header: 'Prep Status' },
  { key: 'assignedAttorney', header: 'Assigned Attorney' },
  { key: 'lastContact', header: 'Last Contact' },
  { key: 'nextFollowUp', header: 'Next Follow-Up' },
];

const WitnessListTool: React.FC = () => {
  const { t } = useTranslation();
  const {
    data: witnesses,
    addItem,
    updateItem,
    deleteItem,
    exportToCSV,
    exportToExcel,
    exportToJSON,
    exportToPDF,
    printData,
    copyToClipboard,
    importFromCSV,
    importFromJSON,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Witness>({
    toolId: 'witness-list',
    initialData: [],
    columns: exportColumns,
  });

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'view'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAffiliation, setFilterAffiliation] = useState<string>('all');
  const [selectedWitness, setSelectedWitness] = useState<Witness | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [formData, setFormData] = useState<Partial<Witness>>({
    matterId: '',
    matterName: '',
    name: '',
    witnessType: 'fact',
    status: 'potential',
    partyAffiliation: 'neutral',
    credibilityRating: 'unknown',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    employer: '',
    relationship: '',
    knowledgeAreas: [],
    expectedTestimony: '',
    interviewNotes: '',
    subpoenaServed: false,
    witnessFee: 0,
    travelExpenses: 0,
    documents: [],
    strengths: [],
    weaknesses: [],
    crossExamIssues: [],
    preparationStatus: 'not-started',
    assignedAttorney: '',
    notes: '',
  });

  // Filter and search witnesses
  const filteredWitnesses = useMemo(() => {
    return witnesses.filter((witness) => {
      const matchesSearch =
        witness.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        witness.matterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        witness.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        witness.occupation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || witness.witnessType === filterType;
      const matchesStatus = filterStatus === 'all' || witness.status === filterStatus;
      const matchesAffiliation = filterAffiliation === 'all' || witness.partyAffiliation === filterAffiliation;

      return matchesSearch && matchesType && matchesStatus && matchesAffiliation;
    });
  }, [witnesses, searchQuery, filterType, filterStatus, filterAffiliation]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalWitnesses = witnesses.length;
    const byType = witnessTypeOptions.reduce((acc, type) => {
      acc[type.value] = witnesses.filter(w => w.witnessType === type.value).length;
      return acc;
    }, {} as Record<string, number>);
    const confirmed = witnesses.filter(w => w.status === 'confirmed' || w.status === 'subpoenaed').length;
    const deposed = witnesses.filter(w => w.status === 'deposed').length;
    const prepared = witnesses.filter(w => w.preparationStatus === 'completed').length;
    const needsFollowUp = witnesses.filter(w => w.nextFollowUp && new Date(w.nextFollowUp) <= new Date()).length;

    return { totalWitnesses, byType, confirmed, deposed, prepared, needsFollowUp };
  }, [witnesses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && selectedWitness) {
      updateItem(selectedWitness.id, {
        ...formData,
        updatedAt: new Date().toISOString(),
      } as Witness);
    } else {
      const newWitness: Witness = {
        id: `WIT-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Witness;
      addItem(newWitness);
    }

    resetForm();
    setActiveTab('list');
  };

  const resetForm = () => {
    setFormData({
      matterId: '',
      matterName: '',
      name: '',
      witnessType: 'fact',
      status: 'potential',
      partyAffiliation: 'neutral',
      credibilityRating: 'unknown',
      phone: '',
      email: '',
      address: '',
      occupation: '',
      employer: '',
      relationship: '',
      knowledgeAreas: [],
      expectedTestimony: '',
      interviewNotes: '',
      subpoenaServed: false,
      witnessFee: 0,
      travelExpenses: 0,
      documents: [],
      strengths: [],
      weaknesses: [],
      crossExamIssues: [],
      preparationStatus: 'not-started',
      assignedAttorney: '',
      notes: '',
    });
    setIsEditing(false);
    setSelectedWitness(null);
  };

  const handleEdit = (witness: Witness) => {
    setSelectedWitness(witness);
    setFormData(witness);
    setIsEditing(true);
    setActiveTab('add');
  };

  const handleView = (witness: Witness) => {
    setSelectedWitness(witness);
    setActiveTab('view');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this witness record?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const getTypeColor = (type: WitnessType) => {
    return witnessTypeOptions.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: WitnessStatus) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getCredibilityColor = (rating: CredibilityRating) => {
    return credibilityOptions.find(c => c.value === rating)?.color || 'bg-gray-100 text-gray-800';
  };

  const getAffiliationColor = (affiliation: PartyAffiliation) => {
    return affiliationOptions.find(a => a.value === affiliation)?.color || 'bg-gray-100 text-gray-800';
  };

  const getPrepStatusColor = (status: string) => {
    return prepStatusOptions.find(p => p.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tools.witnessList.witnessListManager', 'Witness List Manager')}</h1>
              <p className="text-gray-600">{t('tools.witnessList.trackAndManageCaseWitnesses', 'Track and manage case witnesses')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="witness-list" toolName="Witness List" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
            />
            <ExportDropdown
              onExportCSV={exportToCSV}
              onExportExcel={exportToExcel}
              onExportJSON={exportToJSON}
              onExportPDF={exportToPDF}
              onPrint={printData}
              onCopyToClipboard={copyToClipboard}
              onImportCSV={importFromCSV}
              onImportJSON={importFromJSON}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">{t('tools.witnessList.total', 'Total')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalWitnesses}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm">{t('tools.witnessList.confirmed', 'Confirmed')}</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.confirmed}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm">{t('tools.witnessList.deposed', 'Deposed')}</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{stats.deposed}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{t('tools.witnessList.prepared', 'Prepared')}</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.prepared}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-sm">{t('tools.witnessList.experts', 'Experts')}</span>
            </div>
            <p className="text-2xl font-bold text-amber-900">{stats.byType.expert || 0}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{t('tools.witnessList.followUp', 'Follow-Up')}</span>
            </div>
            <p className="text-2xl font-bold text-red-900">{stats.needsFollowUp}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => { setActiveTab('list'); resetForm(); }}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t('tools.witnessList.witnessList', 'Witness List')}
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('add'); if (!isEditing) resetForm(); }}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'add'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {isEditing ? t('tools.witnessList.editWitness', 'Edit Witness') : t('tools.witnessList.addWitness', 'Add Witness')}
              </div>
            </button>
            {activeTab === 'view' && selectedWitness && (
              <button
                className="px-6 py-4 text-sm font-medium border-b-2 border-teal-500 text-teal-600"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {t('tools.witnessList.viewWitness', 'View Witness')}
                </div>
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* List Tab */}
          {activeTab === 'list' && (
            <div>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={t('tools.witnessList.searchWitnesses', 'Search witnesses...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">{t('tools.witnessList.allTypes', 'All Types')}</option>
                  {witnessTypeOptions.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">{t('tools.witnessList.allStatuses', 'All Statuses')}</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <select
                  value={filterAffiliation}
                  onChange={(e) => setFilterAffiliation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">{t('tools.witnessList.allAffiliations', 'All Affiliations')}</option>
                  {affiliationOptions.map(aff => (
                    <option key={aff.value} value={aff.value}>{aff.label}</option>
                  ))}
                </select>
              </div>

              {/* Witness List */}
              {filteredWitnesses.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('tools.witnessList.noWitnessesFound', 'No witnesses found')}</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    {t('tools.witnessList.addFirstWitness', 'Add First Witness')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredWitnesses.map((witness) => (
                    <div
                      key={witness.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{witness.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(witness.witnessType)}`}>
                              {witnessTypeOptions.find(t => t.value === witness.witnessType)?.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(witness.status)}`}>
                              {statusOptions.find(s => s.value === witness.status)?.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAffiliationColor(witness.partyAffiliation)}`}>
                              {affiliationOptions.find(a => a.value === witness.partyAffiliation)?.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {witness.matterName}
                            </span>
                            {witness.occupation && (
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-4 h-4" />
                                {witness.occupation}
                              </span>
                            )}
                            {witness.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {witness.phone}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCredibilityColor(witness.credibilityRating)}`}>
                              Credibility: {credibilityOptions.find(c => c.value === witness.credibilityRating)?.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPrepStatusColor(witness.preparationStatus)}`}>
                              Prep: {prepStatusOptions.find(p => p.value === witness.preparationStatus)?.label}
                            </span>
                            {witness.depositionDate && (
                              <span className="text-gray-500">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Depo: {formatDate(witness.depositionDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(witness)}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                            title={t('tools.witnessList.viewDetails', 'View Details')}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(witness)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title={t('tools.witnessList.edit2', 'Edit')}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(witness.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add/Edit Tab */}
          {activeTab === 'add' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">{t('tools.witnessList.basicInformation', 'Basic Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.witnessName', 'Witness Name *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.matterName', 'Matter Name *')}</label>
                    <input
                      type="text"
                      required
                      value={formData.matterName || ''}
                      onChange={(e) => setFormData({ ...formData, matterName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.witnessType', 'Witness Type *')}</label>
                    <select
                      required
                      value={formData.witnessType || 'fact'}
                      onChange={(e) => setFormData({ ...formData, witnessType: e.target.value as WitnessType })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {witnessTypeOptions.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.status', 'Status')}</label>
                    <select
                      value={formData.status || 'potential'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as WitnessStatus })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.partyAffiliation', 'Party Affiliation')}</label>
                    <select
                      value={formData.partyAffiliation || 'neutral'}
                      onChange={(e) => setFormData({ ...formData, partyAffiliation: e.target.value as PartyAffiliation })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {affiliationOptions.map(aff => (
                        <option key={aff.value} value={aff.value}>{aff.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.credibilityRating', 'Credibility Rating')}</label>
                    <select
                      value={formData.credibilityRating || 'unknown'}
                      onChange={(e) => setFormData({ ...formData, credibilityRating: e.target.value as CredibilityRating })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {credibilityOptions.map(cred => (
                        <option key={cred.value} value={cred.value}>{cred.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">{t('tools.witnessList.contactInformation', 'Contact Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.email', 'Email')}</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.address', 'Address')}</label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">{t('tools.witnessList.professionalInformation', 'Professional Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.occupation', 'Occupation')}</label>
                    <input
                      type="text"
                      value={formData.occupation || ''}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.employer', 'Employer')}</label>
                    <input
                      type="text"
                      value={formData.employer || ''}
                      onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.relationshipToCase', 'Relationship to Case')}</label>
                    <input
                      type="text"
                      value={formData.relationship || ''}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Case Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">{t('tools.witnessList.caseDetails', 'Case Details')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.expectedTestimony', 'Expected Testimony')}</label>
                    <textarea
                      rows={3}
                      value={formData.expectedTestimony || ''}
                      onChange={(e) => setFormData({ ...formData, expectedTestimony: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.interviewNotes', 'Interview Notes')}</label>
                    <textarea
                      rows={3}
                      value={formData.interviewNotes || ''}
                      onChange={(e) => setFormData({ ...formData, interviewNotes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">{t('tools.witnessList.schedulingPreparation', 'Scheduling & Preparation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.depositionDate', 'Deposition Date')}</label>
                    <input
                      type="date"
                      value={formData.depositionDate || ''}
                      onChange={(e) => setFormData({ ...formData, depositionDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.trialDate', 'Trial Date')}</label>
                    <input
                      type="date"
                      value={formData.trialDate || ''}
                      onChange={(e) => setFormData({ ...formData, trialDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.preparationStatus', 'Preparation Status')}</label>
                    <select
                      value={formData.preparationStatus || 'not-started'}
                      onChange={(e) => setFormData({ ...formData, preparationStatus: e.target.value as 'not-started' | 'in-progress' | 'completed' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {prepStatusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.assignedAttorney', 'Assigned Attorney')}</label>
                    <input
                      type="text"
                      value={formData.assignedAttorney || ''}
                      onChange={(e) => setFormData({ ...formData, assignedAttorney: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.subpoenaServed || false}
                      onChange={(e) => setFormData({ ...formData, subpoenaServed: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{t('tools.witnessList.subpoenaServed', 'Subpoena Served')}</span>
                  </label>
                </div>
              </div>

              {/* Fees */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">{t('tools.witnessList.feesExpenses', 'Fees & Expenses')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.witnessFee', 'Witness Fee ($)')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.witnessFee || 0}
                      onChange={(e) => setFormData({ ...formData, witnessFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.witnessList.travelExpenses', 'Travel Expenses ($)')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.travelExpenses || 0}
                      onChange={(e) => setFormData({ ...formData, travelExpenses: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">{t('tools.witnessList.notes', 'Notes')}</h3>
                <textarea
                  rows={4}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('tools.witnessList.additionalNotesAboutThisWitness', 'Additional notes about this witness...')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => { setActiveTab('list'); resetForm(); }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {t('tools.witnessList.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {isEditing ? t('tools.witnessList.updateWitness', 'Update Witness') : t('tools.witnessList.addWitness2', 'Add Witness')}
                </button>
              </div>
            </form>
          )}

          {/* View Tab */}
          {activeTab === 'view' && selectedWitness && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedWitness.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedWitness.witnessType)}`}>
                      {witnessTypeOptions.find(t => t.value === selectedWitness.witnessType)?.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedWitness.status)}`}>
                      {statusOptions.find(s => s.value === selectedWitness.status)?.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getAffiliationColor(selectedWitness.partyAffiliation)}`}>
                      {affiliationOptions.find(a => a.value === selectedWitness.partyAffiliation)?.label}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(selectedWitness)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    {t('tools.witnessList.edit', 'Edit')}
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('tools.witnessList.contactInformation2', 'Contact Information')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">{t('tools.witnessList.phone2', 'Phone:')}</span> {selectedWitness.phone || '-'}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.email2', 'Email:')}</span> {selectedWitness.email || '-'}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.address2', 'Address:')}</span> {selectedWitness.address || '-'}</p>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {t('tools.witnessList.professionalInfo', 'Professional Info')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">{t('tools.witnessList.occupation2', 'Occupation:')}</span> {selectedWitness.occupation || '-'}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.employer2', 'Employer:')}</span> {selectedWitness.employer || '-'}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.relationship', 'Relationship:')}</span> {selectedWitness.relationship || '-'}</p>
                  </div>
                </div>

                {/* Case Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t('tools.witnessList.caseInformation', 'Case Information')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">{t('tools.witnessList.matter', 'Matter:')}</span> {selectedWitness.matterName}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.credibility', 'Credibility:')}</span>{' '}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getCredibilityColor(selectedWitness.credibilityRating)}`}>
                        {credibilityOptions.find(c => c.value === selectedWitness.credibilityRating)?.label}
                      </span>
                    </p>
                    <p><span className="text-gray-500">{t('tools.witnessList.preparation', 'Preparation:')}</span>{' '}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getPrepStatusColor(selectedWitness.preparationStatus)}`}>
                        {prepStatusOptions.find(p => p.value === selectedWitness.preparationStatus)?.label}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('tools.witnessList.scheduling', 'Scheduling')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">{t('tools.witnessList.deposition', 'Deposition:')}</span> {formatDate(selectedWitness.depositionDate || '')}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.trialDate2', 'Trial Date:')}</span> {formatDate(selectedWitness.trialDate || '')}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.subpoena', 'Subpoena:')}</span> {selectedWitness.subpoenaServed ? t('tools.witnessList.served', 'Served') : t('tools.witnessList.notServed', 'Not Served')}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.attorney', 'Attorney:')}</span> {selectedWitness.assignedAttorney || '-'}</p>
                  </div>
                </div>

                {/* Fees */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {t('tools.witnessList.feesExpenses2', 'Fees & Expenses')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">{t('tools.witnessList.witnessFee2', 'Witness Fee:')}</span> {formatCurrency(selectedWitness.witnessFee)}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.travel', 'Travel:')}</span> {formatCurrency(selectedWitness.travelExpenses)}</p>
                    <p className="font-semibold">
                      <span className="text-gray-500">{t('tools.witnessList.total2', 'Total:')}</span>{' '}
                      {formatCurrency(selectedWitness.witnessFee + selectedWitness.travelExpenses)}
                    </p>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {t('tools.witnessList.recordInfo', 'Record Info')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">{t('tools.witnessList.created', 'Created:')}</span> {formatDate(selectedWitness.createdAt)}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.updated', 'Updated:')}</span> {formatDate(selectedWitness.updatedAt)}</p>
                    <p><span className="text-gray-500">{t('tools.witnessList.lastContact', 'Last Contact:')}</span> {formatDate(selectedWitness.lastContact || '')}</p>
                  </div>
                </div>
              </div>

              {/* Expected Testimony */}
              {selectedWitness.expectedTestimony && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {t('tools.witnessList.expectedTestimony2', 'Expected Testimony')}
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedWitness.expectedTestimony}</p>
                </div>
              )}

              {/* Interview Notes */}
              {selectedWitness.interviewNotes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t('tools.witnessList.interviewNotes2', 'Interview Notes')}
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedWitness.interviewNotes}</p>
                </div>
              )}

              {/* Notes */}
              {selectedWitness.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{t('tools.witnessList.additionalNotes', 'Additional Notes')}</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedWitness.notes}</p>
                </div>
              )}

              {/* Back Button */}
              <div className="flex justify-start">
                <button
                  onClick={() => { setActiveTab('list'); setSelectedWitness(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {t('tools.witnessList.backToList', 'Back to List')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default WitnessListTool;
export { WitnessListTool };
