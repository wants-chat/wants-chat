import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Disc3, User, Clock, Download, Plus, Trash2, Sparkles, Loader2, Edit2, Music2, CheckCircle2, FileAudio, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface MasterFile {
  id: string;
  fileName: string;
  format: string;
  sampleRate: string;
  bitDepth: string;
  uploadDate: string;
  version: number;
  notes: string;
}

interface ClientMaster {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectTitle: string;
  artist: string;
  releaseType: 'single' | 'ep' | 'album' | 'compilation' | 'remix';
  genre: string;
  trackCount: number;
  deliveryFormat: string[];
  deliveryDate: string;
  approvalStatus: 'pending' | 'revision-requested' | 'approved' | 'delivered';
  masterFiles: MasterFile[];
  isrcCodes: string;
  upcCode: string;
  label: string;
  distributor: string;
  totalFee: number;
  amountPaid: number;
  notes: string;
  createdAt: string;
}

const releaseTypes = [
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'album', label: 'Album' },
  { value: 'compilation', label: 'Compilation' },
  { value: 'remix', label: 'Remix' },
];

const deliveryFormats = [
  'WAV 24bit/44.1kHz', 'WAV 24bit/48kHz', 'WAV 24bit/96kHz', 'WAV 16bit/44.1kHz',
  'FLAC', 'MP3 320kbps', 'MP3 256kbps', 'AAC', 'DDP', 'Vinyl Master', 'Stem Files'
];

const genres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Country', 'Jazz', 'Classical',
  'Indie', 'Metal', 'Folk', 'Reggae', 'Latin', 'Soul', 'Blues', 'Punk', 'Other'
];

const COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'clientEmail', header: 'Email', type: 'string' },
  { key: 'projectTitle', header: 'Project', type: 'string' },
  { key: 'artist', header: 'Artist', type: 'string' },
  { key: 'releaseType', header: 'Release Type', type: 'string' },
  { key: 'genre', header: 'Genre', type: 'string' },
  { key: 'trackCount', header: 'Tracks', type: 'number' },
  { key: 'deliveryDate', header: 'Delivery Date', type: 'date' },
  { key: 'approvalStatus', header: 'Status', type: 'string' },
  { key: 'label', header: 'Label', type: 'string' },
  { key: 'totalFee', header: 'Total Fee', type: 'currency' },
  { key: 'amountPaid', header: 'Paid', type: 'currency' },
];

interface ClientMastersToolProps {
  uiConfig?: UIConfig;
}

export const ClientMastersTool: React.FC<ClientMastersToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null);

  const emptyFile: MasterFile = {
    id: '',
    fileName: '',
    format: 'WAV 24bit/44.1kHz',
    sampleRate: '44100',
    bitDepth: '24',
    uploadDate: new Date().toISOString().split('T')[0],
    version: 1,
    notes: '',
  };

  const emptyForm: Omit<ClientMaster, 'id' | 'createdAt'> = {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectTitle: '',
    artist: '',
    releaseType: 'album',
    genre: 'Pop',
    trackCount: 0,
    deliveryFormat: ['WAV 24bit/44.1kHz'],
    deliveryDate: '',
    approvalStatus: 'pending',
    masterFiles: [],
    isrcCodes: '',
    upcCode: '',
    label: '',
    distributor: '',
    totalFee: 0,
    amountPaid: 0,
    notes: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [newFile, setNewFile] = useState(emptyFile);

  const {
    data: masters,
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
  } = useToolData<ClientMaster>('client-masters', [], COLUMNS);

  // Apply prefill data
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

      if (params.clientName || params.client) {
        setFormData(prev => ({ ...prev, clientName: (params.clientName || params.client) as string }));
        hasChanges = true;
      }
      if (params.email || params.clientEmail) {
        setFormData(prev => ({ ...prev, clientEmail: (params.email || params.clientEmail) as string }));
        hasChanges = true;
      }
      if (params.projectTitle || params.project) {
        setFormData(prev => ({ ...prev, projectTitle: (params.projectTitle || params.project) as string }));
        hasChanges = true;
      }
      if (params.artist) {
        setFormData(prev => ({ ...prev, artist: params.artist as string }));
        hasChanges = true;
      }
      if (params.releaseType) {
        setFormData(prev => ({ ...prev, releaseType: params.releaseType as ClientMaster['releaseType'] }));
        hasChanges = true;
      }
      if (params.trackCount) {
        setFormData(prev => ({ ...prev, trackCount: params.trackCount as number }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
        setShowForm(true);
      }
    }
  }, [uiConfig?.params]);

  const handleFormatToggle = (format: string) => {
    const current = formData.deliveryFormat;
    const updated = current.includes(format)
      ? current.filter(f => f !== format)
      : [...current, format];
    setFormData({ ...formData, deliveryFormat: updated });
  };

  const addMasterFile = () => {
    if (!newFile.fileName) return;
    const file: MasterFile = { ...newFile, id: Date.now().toString() };
    setFormData({ ...formData, masterFiles: [...formData.masterFiles, file] });
    setNewFile({ ...emptyFile, version: newFile.version + 1 });
  };

  const removeMasterFile = (fileId: string) => {
    setFormData({ ...formData, masterFiles: formData.masterFiles.filter(f => f.id !== fileId) });
  };

  const saveMaster = () => {
    if (!formData.clientName || !formData.projectTitle) return;

    if (editingId) {
      updateItem(editingId, formData);
      setEditingId(null);
    } else {
      const newMaster: ClientMaster = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      addItem(newMaster);
    }
    setShowForm(false);
    setFormData(emptyForm);
  };

  const handleEdit = (master: ClientMaster) => {
    setFormData({
      clientName: master.clientName,
      clientEmail: master.clientEmail,
      clientPhone: master.clientPhone,
      projectTitle: master.projectTitle,
      artist: master.artist,
      releaseType: master.releaseType,
      genre: master.genre,
      trackCount: master.trackCount,
      deliveryFormat: master.deliveryFormat,
      deliveryDate: master.deliveryDate,
      approvalStatus: master.approvalStatus,
      masterFiles: master.masterFiles,
      isrcCodes: master.isrcCodes,
      upcCode: master.upcCode,
      label: master.label,
      distributor: master.distributor,
      totalFee: master.totalFee,
      amountPaid: master.amountPaid,
      notes: master.notes,
    });
    setEditingId(master.id);
    setShowForm(true);
  };

  const updateApprovalStatus = (id: string, status: ClientMaster['approvalStatus']) => {
    updateItem(id, { approvalStatus: status });
  };

  const filteredMasters = masters.filter(m => {
    const matchesFilter = filter === 'all' || m.approvalStatus === filter;
    const matchesSearch = searchTerm === '' ||
      m.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.artist.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: masters.length,
    pending: masters.filter(m => m.approvalStatus === 'pending').length,
    approved: masters.filter(m => m.approvalStatus === 'approved').length,
    delivered: masters.filter(m => m.approvalStatus === 'delivered').length,
    totalRevenue: masters.reduce((sum, m) => sum + m.totalFee, 0),
    totalPaid: masters.reduce((sum, m) => sum + m.amountPaid, 0),
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'revision-requested': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    approved: 'bg-green-500/10 text-green-500 border-green-500/20',
    delivered: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  const inputClass = `w-full p-3 rounded-lg border ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;
  const cardClass = `p-4 rounded-xl border ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'} shadow-sm`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
          <Disc3 className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.clientMasters.clientMasters', 'Client Masters')}</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.clientMasters.manageMasteredAudioDeliverablesFor', 'Manage mastered audio deliverables for clients')}</p>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.clientMasters.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Disc3 className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientMasters.total', 'Total')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientMasters.pending', 'Pending')}</p>
              <p className="text-xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientMasters.approved', 'Approved')}</p>
              <p className="text-xl font-bold text-green-500">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Download className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientMasters.delivered', 'Delivered')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.delivered}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Music2 className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientMasters.revenue', 'Revenue')}</p>
              <p className="text-xl font-bold text-purple-500">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <User className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clientMasters.paid', 'Paid')}</p>
              <p className="text-xl font-bold text-pink-500">${stats.totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t('tools.clientMasters.searchClientsOrProjects', 'Search clients or projects...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('tools.clientMasters.allStatus', 'All Status')}</option>
            <option value="pending">{t('tools.clientMasters.pending2', 'Pending')}</option>
            <option value="revision-requested">{t('tools.clientMasters.revisionRequested', 'Revision Requested')}</option>
            <option value="approved">{t('tools.clientMasters.approved2', 'Approved')}</option>
            <option value="delivered">{t('tools.clientMasters.delivered2', 'Delivered')}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="client-masters" toolName="Client Masters" />

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
            onExportCSV={() => exportCSV({ filename: 'client-masters' })}
            onExportExcel={() => exportExcel({ filename: 'client-masters' })}
            onExportJSON={() => exportJSON({ filename: 'client-masters' })}
            onExportPDF={() => exportPDF({
              filename: 'client-masters',
              title: 'Client Masters',
              subtitle: `${stats.total} projects - $${stats.totalRevenue} revenue`
            })}
            onPrint={() => print('Client Masters')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={isDark ? 'dark' : 'light'}
            disabled={masters.length === 0}
          />
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.clientMasters.newMaster', 'New Master')}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className={cardClass}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? t('tools.clientMasters.editMaster', 'Edit Master') : t('tools.clientMasters.newMaster2', 'New Master')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t('tools.clientMasters.clientName', 'Client Name *')}</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className={inputClass}
                placeholder={t('tools.clientMasters.clientOrLabelName', 'Client or label name')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.clientEmail', 'Client Email')}</label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className={inputClass}
                placeholder={t('tools.clientMasters.clientEmailCom', 'client@email.com')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.clientPhone', 'Client Phone')}</label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className={inputClass}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.projectTitle', 'Project Title *')}</label>
              <input
                type="text"
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                className={inputClass}
                placeholder={t('tools.clientMasters.albumOrReleaseTitle', 'Album or release title')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.artist', 'Artist')}</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className={inputClass}
                placeholder={t('tools.clientMasters.artistOrBandName', 'Artist or band name')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.genre', 'Genre')}</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className={inputClass}
              >
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.releaseType', 'Release Type')}</label>
              <select
                value={formData.releaseType}
                onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as ClientMaster['releaseType'] })}
                className={inputClass}
              >
                {releaseTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.trackCount', 'Track Count')}</label>
              <input
                type="number"
                value={formData.trackCount}
                onChange={(e) => setFormData({ ...formData, trackCount: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.deliveryDate', 'Delivery Date')}</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Label</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className={inputClass}
                placeholder={t('tools.clientMasters.recordLabel', 'Record label')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.distributor', 'Distributor')}</label>
              <input
                type="text"
                value={formData.distributor}
                onChange={(e) => setFormData({ ...formData, distributor: e.target.value })}
                className={inputClass}
                placeholder={t('tools.clientMasters.distrokidCdBabyEtc', 'DistroKid, CD Baby, etc.')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.approvalStatus', 'Approval Status')}</label>
              <select
                value={formData.approvalStatus}
                onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value as ClientMaster['approvalStatus'] })}
                className={inputClass}
              >
                <option value="pending">{t('tools.clientMasters.pending3', 'Pending')}</option>
                <option value="revision-requested">{t('tools.clientMasters.revisionRequested2', 'Revision Requested')}</option>
                <option value="approved">{t('tools.clientMasters.approved3', 'Approved')}</option>
                <option value="delivered">{t('tools.clientMasters.delivered3', 'Delivered')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.upcCode', 'UPC Code')}</label>
              <input
                type="text"
                value={formData.upcCode}
                onChange={(e) => setFormData({ ...formData, upcCode: e.target.value })}
                className={inputClass}
                placeholder={t('tools.clientMasters.universalProductCode', 'Universal Product Code')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.totalFee', 'Total Fee ($)')}</label>
              <input
                type="number"
                value={formData.totalFee}
                onChange={(e) => setFormData({ ...formData, totalFee: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.clientMasters.amountPaid', 'Amount Paid ($)')}</label>
              <input
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
          </div>

          {/* ISRC Codes */}
          <div className="mt-4">
            <label className={labelClass}>{t('tools.clientMasters.isrcCodesOnePerLine', 'ISRC Codes (one per line)')}</label>
            <textarea
              value={formData.isrcCodes}
              onChange={(e) => setFormData({ ...formData, isrcCodes: e.target.value })}
              className={`${inputClass} h-20 resize-none`}
              placeholder={t('tools.clientMasters.usrc1234567810Usrc12345679', 'USRC12345678&#10;USRC12345679')}
            />
          </div>

          {/* Delivery Formats */}
          <div className="mt-4">
            <label className={labelClass}>{t('tools.clientMasters.deliveryFormats', 'Delivery Formats')}</label>
            <div className="flex flex-wrap gap-2">
              {deliveryFormats.map(format => (
                <button
                  key={format}
                  type="button"
                  onClick={() => handleFormatToggle(format)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.deliveryFormat.includes(format)
                      ? 'bg-[#0D9488] text-white'
                      : isDark ? 'bg-[#252525] text-gray-300 hover:bg-[#333]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Master Files */}
          <div className="mt-6">
            <label className={labelClass}>Master Files ({formData.masterFiles.length})</label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
              <input
                type="text"
                placeholder={t('tools.clientMasters.fileName', 'File name')}
                value={newFile.fileName}
                onChange={(e) => setNewFile({ ...newFile, fileName: e.target.value })}
                className={inputClass}
              />
              <select
                value={newFile.format}
                onChange={(e) => setNewFile({ ...newFile, format: e.target.value })}
                className={inputClass}
              >
                {deliveryFormats.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder={t('tools.clientMasters.sampleRate', 'Sample Rate')}
                value={newFile.sampleRate}
                onChange={(e) => setNewFile({ ...newFile, sampleRate: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                placeholder={t('tools.clientMasters.version', 'Version')}
                value={newFile.version}
                onChange={(e) => setNewFile({ ...newFile, version: parseInt(e.target.value) || 1 })}
                className={inputClass}
              />
              <button
                onClick={addMasterFile}
                disabled={!newFile.fileName}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.masterFiles.length > 0 && (
              <div className="space-y-2 mt-4">
                {formData.masterFiles.map(file => (
                  <div key={file.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#252525]' : 'bg-gray-50'}`}>
                    <FileAudio className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{file.fileName}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{file.format}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>v{file.version}</span>
                    <button onClick={() => removeMasterFile(file.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className={labelClass}>{t('tools.clientMasters.notes', 'Notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`${inputClass} h-20 resize-none`}
              placeholder={t('tools.clientMasters.masteringNotesSpecialInstructions', 'Mastering notes, special instructions...')}
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={saveMaster}
              disabled={!formData.clientName || !formData.projectTitle}
              className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? t('tools.clientMasters.updateMaster', 'Update Master') : t('tools.clientMasters.saveMaster', 'Save Master')}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#252525] text-white hover:bg-[#333]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {t('tools.clientMasters.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Masters List */}
      <div className="space-y-4">
        {filteredMasters.length === 0 ? (
          <div className={`${cardClass} text-center py-12`}>
            <Disc3 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.clientMasters.noMastersFound', 'No masters found')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-[#0D9488] hover:underline"
            >
              {t('tools.clientMasters.addYourFirstClientMaster', 'Add your first client master')}
            </button>
          </div>
        ) : (
          filteredMasters.map(master => (
            <div key={master.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {master.projectTitle}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[master.approvalStatus]}`}>
                      {master.approvalStatus.replace('-', ' ')}
                    </span>
                    {master.amountPaid < master.totalFee && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                        ${master.totalFee - master.amountPaid} Due
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {master.artist} • {master.genre} • {releaseTypes.find(t => t.value === master.releaseType)?.label}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Client: {master.clientName} • {master.trackCount} tracks
                    {master.label && ` • ${master.label}`}
                  </p>
                  {master.deliveryDate && (
                    <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar className="w-3 h-3" /> Delivery: {master.deliveryDate}
                    </p>
                  )}

                  {/* Delivery Formats */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {master.deliveryFormat.map(fmt => (
                      <span key={fmt} className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-[#252525] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {fmt}
                      </span>
                    ))}
                  </div>

                  {/* Expandable Files */}
                  {selectedMaster === master.id && master.masterFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.clientMasters.masterFiles', 'Master Files')}</h5>
                      {master.masterFiles.map(file => (
                        <div key={file.id} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'bg-[#252525]' : 'bg-gray-50'}`}>
                          <FileAudio className="w-4 h-4 text-[#0D9488]" />
                          <span className={`flex-1 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{file.fileName}</span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{file.format}</span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>v{file.version}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-[#0D9488]">
                    ${master.totalFee}
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={master.approvalStatus}
                      onChange={(e) => updateApprovalStatus(master.id, e.target.value as ClientMaster['approvalStatus'])}
                      className={`text-xs p-1 rounded ${isDark ? 'bg-[#333] border-[#444] text-white' : 'bg-white border-gray-200'}`}
                    >
                      <option value="pending">{t('tools.clientMasters.pending4', 'Pending')}</option>
                      <option value="revision-requested">{t('tools.clientMasters.revision', 'Revision')}</option>
                      <option value="approved">{t('tools.clientMasters.approved4', 'Approved')}</option>
                      <option value="delivered">{t('tools.clientMasters.delivered4', 'Delivered')}</option>
                    </select>
                    <button
                      onClick={() => setSelectedMaster(selectedMaster === master.id ? null : master.id)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-100'}`}
                    >
                      <FileAudio className="w-4 h-4 text-[#0D9488]" />
                    </button>
                    <button
                      onClick={() => handleEdit(master)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className="w-4 h-4 text-[#0D9488]" />
                    </button>
                    <button
                      onClick={() => deleteItem(master.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientMastersTool;
