import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, Music2, TrendingUp, Users, Plus, Trash2, Sparkles, Loader2, Edit2, Calendar, DollarSign, Globe, BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface RoyaltyPayment {
  id: string;
  period: string;
  platform: string;
  streams: number;
  downloads: number;
  syncLicenses: number;
  mechanicals: number;
  performance: number;
  grossRevenue: number;
  netRevenue: number;
  paymentDate: string;
  status: 'pending' | 'processing' | 'paid' | 'disputed';
}

interface RoyaltyEntry {
  id: string;
  songTitle: string;
  artist: string;
  album: string;
  releaseDate: string;
  isrcCode: string;
  publisher: string;
  writers: string[];
  splitPercentage: number;
  distributor: string;
  label: string;
  territory: 'worldwide' | 'us' | 'uk' | 'eu' | 'asia' | 'latam' | 'other';
  royaltyType: 'streaming' | 'mechanical' | 'performance' | 'sync' | 'master' | 'publishing';
  payments: RoyaltyPayment[];
  totalEarnings: number;
  pendingPayments: number;
  notes: string;
  createdAt: string;
}

const territories = [
  { value: 'worldwide', label: 'Worldwide' },
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'eu', label: 'European Union' },
  { value: 'asia', label: 'Asia Pacific' },
  { value: 'latam', label: 'Latin America' },
  { value: 'other', label: 'Other' },
];

const royaltyTypes = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'performance', label: 'Performance' },
  { value: 'sync', label: 'Sync Licensing' },
  { value: 'master', label: 'Master Recording' },
  { value: 'publishing', label: 'Publishing' },
];

const platforms = [
  'Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Tidal', 'Deezer',
  'Pandora', 'SoundCloud', 'iHeartRadio', 'ASCAP', 'BMI', 'SESAC', 'SoundExchange',
  'DistroKid', 'CD Baby', 'TuneCore', 'Sony ATV', 'Warner Chappell', 'Other'
];

const COLUMNS: ColumnConfig[] = [
  { key: 'songTitle', header: 'Song Title', type: 'string' },
  { key: 'artist', header: 'Artist', type: 'string' },
  { key: 'album', header: 'Album', type: 'string' },
  { key: 'isrcCode', header: 'ISRC', type: 'string' },
  { key: 'royaltyType', header: 'Royalty Type', type: 'string' },
  { key: 'territory', header: 'Territory', type: 'string' },
  { key: 'splitPercentage', header: 'Split %', type: 'percent' },
  { key: 'totalEarnings', header: 'Total Earnings', type: 'currency' },
  { key: 'pendingPayments', header: 'Pending', type: 'currency' },
  { key: 'distributor', header: 'Distributor', type: 'string' },
  { key: 'publisher', header: 'Publisher', type: 'string' },
];

interface RoyaltyTrackerToolProps {
  uiConfig?: UIConfig;
}

export const RoyaltyTrackerTool: React.FC<RoyaltyTrackerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'payments' | 'analytics'>('catalog');

  const emptyPayment: RoyaltyPayment = {
    id: '',
    period: '',
    platform: platforms[0],
    streams: 0,
    downloads: 0,
    syncLicenses: 0,
    mechanicals: 0,
    performance: 0,
    grossRevenue: 0,
    netRevenue: 0,
    paymentDate: '',
    status: 'pending',
  };

  const emptyForm: Omit<RoyaltyEntry, 'id' | 'createdAt'> = {
    songTitle: '',
    artist: '',
    album: '',
    releaseDate: '',
    isrcCode: '',
    publisher: '',
    writers: [],
    splitPercentage: 100,
    distributor: '',
    label: '',
    territory: 'worldwide',
    royaltyType: 'streaming',
    payments: [],
    totalEarnings: 0,
    pendingPayments: 0,
    notes: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [newPayment, setNewPayment] = useState(emptyPayment);
  const [writerInput, setWriterInput] = useState('');

  const {
    data: entries,
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
  } = useToolData<RoyaltyEntry>('royalty-tracker', [], COLUMNS);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.songTitle || params.title) {
        setFormData(prev => ({ ...prev, songTitle: (params.songTitle || params.title) as string }));
        hasChanges = true;
      }
      if (params.artist) {
        setFormData(prev => ({ ...prev, artist: params.artist as string }));
        hasChanges = true;
      }
      if (params.album) {
        setFormData(prev => ({ ...prev, album: params.album as string }));
        hasChanges = true;
      }
      if (params.isrcCode || params.isrc) {
        setFormData(prev => ({ ...prev, isrcCode: (params.isrcCode || params.isrc) as string }));
        hasChanges = true;
      }
      if (params.royaltyType) {
        setFormData(prev => ({ ...prev, royaltyType: params.royaltyType as RoyaltyEntry['royaltyType'] }));
        hasChanges = true;
      }
      if (params.splitPercentage || params.split) {
        setFormData(prev => ({ ...prev, splitPercentage: (params.splitPercentage || params.split) as number }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
        setShowForm(true);
      }
    }
  }, [uiConfig?.params]);

  const addWriter = () => {
    if (!writerInput.trim()) return;
    setFormData({ ...formData, writers: [...formData.writers, writerInput.trim()] });
    setWriterInput('');
  };

  const removeWriter = (writer: string) => {
    setFormData({ ...formData, writers: formData.writers.filter(w => w !== writer) });
  };

  const addPayment = () => {
    if (!newPayment.period || !newPayment.platform) return;
    const payment: RoyaltyPayment = { ...newPayment, id: Date.now().toString() };
    const newTotal = formData.totalEarnings + payment.netRevenue;
    const newPending = payment.status === 'pending' ? formData.pendingPayments + payment.netRevenue : formData.pendingPayments;
    setFormData({
      ...formData,
      payments: [...formData.payments, payment],
      totalEarnings: newTotal,
      pendingPayments: newPending,
    });
    setNewPayment(emptyPayment);
  };

  const removePayment = (paymentId: string) => {
    const payment = formData.payments.find(p => p.id === paymentId);
    if (!payment) return;
    const newTotal = formData.totalEarnings - payment.netRevenue;
    const newPending = payment.status === 'pending' ? formData.pendingPayments - payment.netRevenue : formData.pendingPayments;
    setFormData({
      ...formData,
      payments: formData.payments.filter(p => p.id !== paymentId),
      totalEarnings: Math.max(0, newTotal),
      pendingPayments: Math.max(0, newPending),
    });
  };

  const saveEntry = () => {
    if (!formData.songTitle || !formData.artist) return;

    if (editingId) {
      updateItem(editingId, formData);
      setEditingId(null);
    } else {
      const newEntry: RoyaltyEntry = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      addItem(newEntry);
    }
    setShowForm(false);
    setFormData(emptyForm);
  };

  const handleEdit = (entry: RoyaltyEntry) => {
    setFormData({
      songTitle: entry.songTitle,
      artist: entry.artist,
      album: entry.album,
      releaseDate: entry.releaseDate,
      isrcCode: entry.isrcCode,
      publisher: entry.publisher,
      writers: entry.writers,
      splitPercentage: entry.splitPercentage,
      distributor: entry.distributor,
      label: entry.label,
      territory: entry.territory,
      royaltyType: entry.royaltyType,
      payments: entry.payments,
      totalEarnings: entry.totalEarnings,
      pendingPayments: entry.pendingPayments,
      notes: entry.notes,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const filteredEntries = entries.filter(e => {
    const matchesType = filter === 'all' || e.royaltyType === filter;
    const matchesSearch = searchTerm === '' ||
      e.songTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.album.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.isrcCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate all payments across all entries
  const allPayments = entries.flatMap(e => e.payments.map(p => ({ ...p, songTitle: e.songTitle, artist: e.artist })));

  const stats = {
    totalSongs: entries.length,
    totalEarnings: entries.reduce((sum, e) => sum + e.totalEarnings, 0),
    pendingPayments: entries.reduce((sum, e) => sum + e.pendingPayments, 0),
    totalStreams: allPayments.reduce((sum, p) => sum + p.streams, 0),
    paidThisMonth: allPayments.filter(p => {
      if (!p.paymentDate) return false;
      const paymentMonth = new Date(p.paymentDate).getMonth();
      const currentMonth = new Date().getMonth();
      return p.status === 'paid' && paymentMonth === currentMonth;
    }).reduce((sum, p) => sum + p.netRevenue, 0),
    avgPerSong: entries.length > 0 ? entries.reduce((sum, e) => sum + e.totalEarnings, 0) / entries.length : 0,
  };

  // Analytics data
  const earningsByPlatform = allPayments.reduce((acc, p) => {
    acc[p.platform] = (acc[p.platform] || 0) + p.netRevenue;
    return acc;
  }, {} as Record<string, number>);

  const earningsByType = entries.reduce((acc, e) => {
    acc[e.royaltyType] = (acc[e.royaltyType] || 0) + e.totalEarnings;
    return acc;
  }, {} as Record<string, number>);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    paid: 'bg-green-500/10 text-green-500 border-green-500/20',
    disputed: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const typeColors: Record<string, string> = {
    streaming: 'bg-purple-500/10 text-purple-500',
    mechanical: 'bg-blue-500/10 text-blue-500',
    performance: 'bg-green-500/10 text-green-500',
    sync: 'bg-orange-500/10 text-orange-500',
    master: 'bg-pink-500/10 text-pink-500',
    publishing: 'bg-cyan-500/10 text-cyan-500',
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
          <Coins className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.royaltyTracker.royaltyTracker', 'Royalty Tracker')}</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.royaltyTracker.trackMusicRoyaltiesAndRevenue', 'Track music royalties and revenue streams')}</p>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.royaltyTracker.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Music2 className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.royaltyTracker.catalog', 'Catalog')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalSongs}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.royaltyTracker.totalEarned', 'Total Earned')}</p>
              <p className="text-xl font-bold text-green-500">${stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Coins className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.royaltyTracker.pending', 'Pending')}</p>
              <p className="text-xl font-bold text-yellow-500">${stats.pendingPayments.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.royaltyTracker.streams', 'Streams')}</p>
              <p className="text-xl font-bold text-purple-500">{(stats.totalStreams / 1000).toFixed(1)}K</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.royaltyTracker.thisMonth', 'This Month')}</p>
              <p className="text-xl font-bold text-blue-500">${stats.paidThisMonth.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.royaltyTracker.avgSong', 'Avg/Song')}</p>
              <p className="text-xl font-bold text-pink-500">${stats.avgPerSong.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {[
          { id: 'catalog', label: 'Catalog', icon: Music2 },
          { id: 'payments', label: 'Payments', icon: Coins },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0D9488] text-white'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t('tools.royaltyTracker.searchSongs', 'Search songs...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('tools.royaltyTracker.allTypes', 'All Types')}</option>
            {royaltyTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <WidgetEmbedButton toolSlug="royalty-tracker" toolName="Royalty Tracker" />

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
            onExportCSV={() => exportCSV({ filename: 'royalty-tracker' })}
            onExportExcel={() => exportExcel({ filename: 'royalty-tracker' })}
            onExportJSON={() => exportJSON({ filename: 'royalty-tracker' })}
            onExportPDF={() => exportPDF({
              filename: 'royalty-tracker',
              title: 'Royalty Report',
              subtitle: `${stats.totalSongs} songs - $${stats.totalEarnings.toLocaleString()} total earnings`
            })}
            onPrint={() => print('Royalty Report')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            theme={isDark ? 'dark' : 'light'}
            disabled={entries.length === 0}
          />
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.royaltyTracker.addSong', 'Add Song')}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className={cardClass}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? t('tools.royaltyTracker.editSong', 'Edit Song') : t('tools.royaltyTracker.addSongToCatalog', 'Add Song to Catalog')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>{t('tools.royaltyTracker.songTitle', 'Song Title *')}</label>
              <input
                type="text"
                value={formData.songTitle}
                onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                className={inputClass}
                placeholder={t('tools.royaltyTracker.songTitle2', 'Song title')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.royaltyTracker.artist', 'Artist *')}</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className={inputClass}
                placeholder={t('tools.royaltyTracker.artistName', 'Artist name')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.royaltyTracker.album', 'Album')}</label>
              <input
                type="text"
                value={formData.album}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                className={inputClass}
                placeholder={t('tools.royaltyTracker.albumTitle', 'Album title')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.royaltyTracker.isrcCode', 'ISRC Code')}</label>
              <input
                type="text"
                value={formData.isrcCode}
                onChange={(e) => setFormData({ ...formData, isrcCode: e.target.value })}
                className={inputClass}
                placeholder={t('tools.royaltyTracker.usrc12345678', 'USRC12345678')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.royaltyTracker.releaseDate', 'Release Date')}</label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.royaltyTracker.royaltyType', 'Royalty Type')}</label>
              <select
                value={formData.royaltyType}
                onChange={(e) => setFormData({ ...formData, royaltyType: e.target.value as RoyaltyEntry['royaltyType'] })}
                className={inputClass}
              >
                {royaltyTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.royaltyTracker.territory', 'Territory')}</label>
              <select
                value={formData.territory}
                onChange={(e) => setFormData({ ...formData, territory: e.target.value as RoyaltyEntry['territory'] })}
                className={inputClass}
              >
                {territories.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.royaltyTracker.yourSplit', 'Your Split (%)')}</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.splitPercentage}
                onChange={(e) => setFormData({ ...formData, splitPercentage: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.royaltyTracker.publisher', 'Publisher')}</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className={inputClass}
                placeholder={t('tools.royaltyTracker.publishingCompany', 'Publishing company')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('tools.royaltyTracker.distributor', 'Distributor')}</label>
              <input
                type="text"
                value={formData.distributor}
                onChange={(e) => setFormData({ ...formData, distributor: e.target.value })}
                className={inputClass}
                placeholder={t('tools.royaltyTracker.distrokidCdBabyEtc', 'DistroKid, CD Baby, etc.')}
              />
            </div>
            <div>
              <label className={labelClass}>Label</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className={inputClass}
                placeholder={t('tools.royaltyTracker.recordLabel', 'Record label')}
              />
            </div>
          </div>

          {/* Writers */}
          <div className="mt-4">
            <label className={labelClass}>{t('tools.royaltyTracker.writersSongwriters', 'Writers/Songwriters')}</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder={t('tools.royaltyTracker.addWriterName', 'Add writer name')}
                value={writerInput}
                onChange={(e) => setWriterInput(e.target.value)}
                className={`${inputClass} flex-1`}
                onKeyDown={(e) => e.key === 'Enter' && addWriter()}
              />
              <button
                onClick={addWriter}
                disabled={!writerInput.trim()}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50"
              >
                {t('tools.royaltyTracker.add', 'Add')}
              </button>
            </div>
            {formData.writers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.writers.map((writer, idx) => (
                  <span key={idx} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${isDark ? 'bg-[#252525] text-white' : 'bg-gray-100 text-gray-800'}`}>
                    {writer}
                    <button onClick={() => removeWriter(writer)} className="ml-1 text-red-500 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Payments */}
          <div className="mt-6">
            <label className={labelClass}>Payments ({formData.payments.length})</label>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2">
              <input
                type="text"
                placeholder={t('tools.royaltyTracker.periodEGQ12024', 'Period (e.g., Q1 2024)')}
                value={newPayment.period}
                onChange={(e) => setNewPayment({ ...newPayment, period: e.target.value })}
                className={inputClass}
              />
              <select
                value={newPayment.platform}
                onChange={(e) => setNewPayment({ ...newPayment, platform: e.target.value })}
                className={inputClass}
              >
                {platforms.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder={t('tools.royaltyTracker.streams2', 'Streams')}
                value={newPayment.streams || ''}
                onChange={(e) => setNewPayment({ ...newPayment, streams: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
              <input
                type="number"
                placeholder={t('tools.royaltyTracker.netRevenue', 'Net Revenue ($)')}
                value={newPayment.netRevenue || ''}
                onChange={(e) => setNewPayment({ ...newPayment, netRevenue: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
              <select
                value={newPayment.status}
                onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value as RoyaltyPayment['status'] })}
                className={inputClass}
              >
                <option value="pending">{t('tools.royaltyTracker.pending2', 'Pending')}</option>
                <option value="processing">{t('tools.royaltyTracker.processing', 'Processing')}</option>
                <option value="paid">{t('tools.royaltyTracker.paid', 'Paid')}</option>
                <option value="disputed">{t('tools.royaltyTracker.disputed', 'Disputed')}</option>
              </select>
              <button
                onClick={addPayment}
                disabled={!newPayment.period}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.payments.length > 0 && (
              <div className="space-y-2 mt-4">
                {formData.payments.map(payment => (
                  <div key={payment.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#252525]' : 'bg-gray-50'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{payment.period}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-[#333] text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{payment.platform}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{payment.streams.toLocaleString()} streams</span>
                    <span className={`flex-1 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${payment.netRevenue.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColors[payment.status]}`}>{payment.status}</span>
                    <button onClick={() => removePayment(payment.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className={labelClass}>{t('tools.royaltyTracker.notes', 'Notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`${inputClass} h-20 resize-none`}
              placeholder={t('tools.royaltyTracker.additionalNotes', 'Additional notes...')}
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={saveEntry}
              disabled={!formData.songTitle || !formData.artist}
              className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? t('tools.royaltyTracker.updateSong', 'Update Song') : t('tools.royaltyTracker.saveSong', 'Save Song')}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#252525] text-white hover:bg-[#333]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {t('tools.royaltyTracker.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className={`${cardClass} text-center py-12`}>
              <Music2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.royaltyTracker.noSongsInYourCatalog', 'No songs in your catalog')}</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-[#0D9488] hover:underline"
              >
                {t('tools.royaltyTracker.addYourFirstSong', 'Add your first song')}
              </button>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div key={entry.id} className={cardClass}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {entry.songTitle}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[entry.royaltyType]}`}>
                        {royaltyTypes.find(t => t.value === entry.royaltyType)?.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-[#252525] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {entry.splitPercentage}% split
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {entry.artist} {entry.album && `• ${entry.album}`}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {entry.isrcCode && `ISRC: ${entry.isrcCode}`}
                      {entry.distributor && ` • ${entry.distributor}`}
                      {entry.publisher && ` • ${entry.publisher}`}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Globe className="w-3 h-3" />
                        {territories.find(t => t.value === entry.territory)?.label}
                      </span>
                      <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Users className="w-3 h-3" />
                        {entry.writers.length} writer(s)
                      </span>
                      <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Coins className="w-3 h-3" />
                        {entry.payments.length} payment(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-500">
                        ${entry.totalEarnings.toLocaleString()}
                      </span>
                      {entry.pendingPayments > 0 && (
                        <p className="text-xs text-yellow-500">${entry.pendingPayments} pending</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-100'}`}
                      >
                        <Coins className="w-4 h-4 text-[#0D9488]" />
                      </button>
                      <button
                        onClick={() => handleEdit(entry)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 className="w-4 h-4 text-[#0D9488]" />
                      </button>
                      <button
                        onClick={() => deleteItem(entry.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Payments */}
                {selectedEntry === entry.id && entry.payments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.royaltyTracker.paymentHistory', 'Payment History')}</h5>
                    <div className="space-y-2">
                      {entry.payments.map(payment => (
                        <div key={payment.id} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'bg-[#252525]' : 'bg-gray-50'}`}>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{payment.period}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-[#333] text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{payment.platform}</span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{payment.streams.toLocaleString()} streams</span>
                          <span className={`flex-1 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${payment.netRevenue.toFixed(2)}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColors[payment.status]}`}>{payment.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          {allPayments.length === 0 ? (
            <div className={`${cardClass} text-center py-12`}>
              <Coins className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.royaltyTracker.noPaymentsRecordedYet', 'No payments recorded yet')}</p>
            </div>
          ) : (
            <div className={cardClass}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.royaltyTracker.allPayments', 'All Payments')}</h3>
              <div className="space-y-2">
                {allPayments.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || '')).map((payment, idx) => (
                  <div key={`${payment.id}-${idx}`} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#252525]' : 'bg-gray-50'}`}>
                    <div className="flex-1">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{payment.songTitle}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{payment.artist}</p>
                    </div>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{payment.period}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-[#333] text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{payment.platform}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{payment.streams.toLocaleString()} streams</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${payment.netRevenue.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColors[payment.status]}`}>{payment.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings by Platform */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.royaltyTracker.earningsByPlatform', 'Earnings by Platform')}</h3>
            <div className="space-y-3">
              {Object.entries(earningsByPlatform)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([platform, amount]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <span className={`w-32 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{platform}</span>
                    <div className={`flex-1 h-6 rounded-full ${isDark ? 'bg-[#252525]' : 'bg-gray-100'} overflow-hidden`}>
                      <div
                        className="h-full bg-[#0D9488] rounded-full"
                        style={{ width: `${(amount / Math.max(...Object.values(earningsByPlatform))) * 100}%` }}
                      />
                    </div>
                    <span className={`w-24 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Earnings by Type */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.royaltyTracker.earningsByRoyaltyType', 'Earnings by Royalty Type')}</h3>
            <div className="space-y-3">
              {Object.entries(earningsByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, amount]) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className={`w-32 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {royaltyTypes.find(t => t.value === type)?.label}
                    </span>
                    <div className={`flex-1 h-6 rounded-full ${isDark ? 'bg-[#252525]' : 'bg-gray-100'} overflow-hidden`}>
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(amount / Math.max(...Object.values(earningsByType), 1)) * 100}%` }}
                      />
                    </div>
                    <span className={`w-24 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoyaltyTrackerTool;
