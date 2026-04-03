'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Moon,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  RefreshCw,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  AlertTriangle,
  Bed,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface NightAuditToolProps {
  uiConfig?: UIConfig;
}

interface NightAuditReport {
  id: string;
  auditDate: string;
  auditedBy: string;
  startTime: string;
  endTime: string;
  status: AuditStatus;
  roomsOccupied: number;
  roomsAvailable: number;
  totalRevenue: number;
  roomRevenue: number;
  fbRevenue: number;
  otherRevenue: number;
  noShows: number;
  walkins: number;
  cancellations: number;
  checkIns: number;
  checkOuts: number;
  discrepancies: Discrepancy[];
  occupancyRate: number;
  adr: number;
  revpar: number;
  notes: string;
  createdAt: string;
}

interface Discrepancy {
  id: string;
  type: string;
  description: string;
  amount: number;
  resolved: boolean;
}

type AuditStatus = 'pending' | 'in-progress' | 'completed' | 'issues-found';

const AUDIT_STATUSES: { value: AuditStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'issues-found', label: 'Issues Found', color: 'red' },
];

const auditColumns: ColumnConfig[] = [
  { key: 'id', header: 'Report ID', type: 'string' },
  { key: 'auditDate', header: 'Date', type: 'date' },
  { key: 'auditedBy', header: 'Audited By', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'totalRevenue', header: 'Total Revenue', type: 'currency' },
  { key: 'occupancyRate', header: 'Occupancy %', type: 'number' },
  { key: 'adr', header: 'ADR', type: 'currency' },
  { key: 'revpar', header: 'RevPAR', type: 'currency' },
];

const generateSampleReports = (): NightAuditReport[] => {
  const today = new Date();
  return [
    {
      id: 'NA-001',
      auditDate: new Date(today.getTime() - 86400000).toISOString().split('T')[0],
      auditedBy: 'Night Auditor - James',
      startTime: '23:00',
      endTime: '01:30',
      status: 'completed',
      roomsOccupied: 85,
      roomsAvailable: 15,
      totalRevenue: 18750,
      roomRevenue: 15200,
      fbRevenue: 2800,
      otherRevenue: 750,
      noShows: 2,
      walkins: 3,
      cancellations: 1,
      checkIns: 28,
      checkOuts: 25,
      discrepancies: [],
      occupancyRate: 85,
      adr: 178.82,
      revpar: 152,
      notes: 'Smooth night, all reconciled',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'NA-002',
      auditDate: today.toISOString().split('T')[0],
      auditedBy: 'Night Auditor - Sarah',
      startTime: '23:00',
      endTime: '',
      status: 'in-progress',
      roomsOccupied: 78,
      roomsAvailable: 22,
      totalRevenue: 16420,
      roomRevenue: 13500,
      fbRevenue: 2200,
      otherRevenue: 720,
      noShows: 1,
      walkins: 2,
      cancellations: 3,
      checkIns: 22,
      checkOuts: 30,
      discrepancies: [
        { id: 'D-001', type: 'Cash', description: 'Cash drawer $50 short', amount: 50, resolved: false },
      ],
      occupancyRate: 78,
      adr: 173.08,
      revpar: 135,
      notes: 'Cash discrepancy needs investigation',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const NightAuditTool: React.FC<NightAuditToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const reportsData = useToolData<NightAuditReport>(
    'night-audits',
    generateSampleReports(),
    auditColumns,
    { autoSave: true }
  );

  const reports = reportsData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<NightAuditReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AuditStatus | ''>('');

  const [newReport, setNewReport] = useState<Partial<NightAuditReport>>({
    auditDate: new Date().toISOString().split('T')[0],
    auditedBy: '',
    startTime: '23:00',
    status: 'pending',
    roomsOccupied: 0,
    roomsAvailable: 100,
    roomRevenue: 0,
    fbRevenue: 0,
    otherRevenue: 0,
    noShows: 0,
    walkins: 0,
    cancellations: 0,
    checkIns: 0,
    checkOuts: 0,
    notes: '',
  });

  const calculateMetrics = (report: Partial<NightAuditReport>) => {
    const totalRooms = (report.roomsOccupied || 0) + (report.roomsAvailable || 0);
    const occupancyRate = totalRooms > 0 ? Math.round(((report.roomsOccupied || 0) / totalRooms) * 100) : 0;
    const totalRevenue = (report.roomRevenue || 0) + (report.fbRevenue || 0) + (report.otherRevenue || 0);
    const adr = (report.roomsOccupied || 0) > 0 ? (report.roomRevenue || 0) / (report.roomsOccupied || 1) : 0;
    const revpar = totalRooms > 0 ? (report.roomRevenue || 0) / totalRooms : 0;
    return { occupancyRate, totalRevenue, adr: Math.round(adr * 100) / 100, revpar: Math.round(revpar * 100) / 100 };
  };

  const handleAddReport = () => {
    if (!newReport.auditedBy) return;
    const metrics = calculateMetrics(newReport);
    const report: NightAuditReport = {
      id: `NA-${Date.now().toString().slice(-6)}`,
      auditDate: newReport.auditDate || new Date().toISOString().split('T')[0],
      auditedBy: newReport.auditedBy || '',
      startTime: newReport.startTime || '23:00',
      endTime: '',
      status: 'in-progress',
      roomsOccupied: newReport.roomsOccupied || 0,
      roomsAvailable: newReport.roomsAvailable || 100,
      totalRevenue: metrics.totalRevenue,
      roomRevenue: newReport.roomRevenue || 0,
      fbRevenue: newReport.fbRevenue || 0,
      otherRevenue: newReport.otherRevenue || 0,
      noShows: newReport.noShows || 0,
      walkins: newReport.walkins || 0,
      cancellations: newReport.cancellations || 0,
      checkIns: newReport.checkIns || 0,
      checkOuts: newReport.checkOuts || 0,
      discrepancies: [],
      occupancyRate: metrics.occupancyRate,
      adr: metrics.adr,
      revpar: metrics.revpar,
      notes: newReport.notes || '',
      createdAt: new Date().toISOString(),
    };
    reportsData.addItem(report);
    setNewReport({
      auditDate: new Date().toISOString().split('T')[0],
      auditedBy: '',
      startTime: '23:00',
      status: 'pending',
      roomsOccupied: 0,
      roomsAvailable: 100,
      roomRevenue: 0,
      fbRevenue: 0,
      otherRevenue: 0,
      noShows: 0,
      walkins: 0,
      cancellations: 0,
      checkIns: 0,
      checkOuts: 0,
      notes: '',
    });
    setShowForm(false);
  };

  const handleUpdateReport = () => {
    if (!editingReport) return;
    const metrics = calculateMetrics(editingReport);
    reportsData.updateItem(editingReport.id, { ...editingReport, ...metrics });
    setEditingReport(null);
  };

  const handleDeleteReport = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Report',
      message: 'Delete this audit report?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) reportsData.deleteItem(id);
  };

  const handleCompleteAudit = (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      const hasDiscrepancies = report.discrepancies.some(d => !d.resolved);
      reportsData.updateItem(id, {
        status: hasDiscrepancies ? 'issues-found' : 'completed',
        endTime: new Date().toTimeString().slice(0, 5),
      });
    }
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Data',
      message: 'Reset all audit reports to sample data?',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) reportsData.resetToDefault(generateSampleReports());
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.auditedBy.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) return false;
      }
      if (filterStatus && r.status !== filterStatus) return false;
      return true;
    });
  }, [reports, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const latestCompleted = reports.filter(r => r.status === 'completed').sort((a, b) => b.auditDate.localeCompare(a.auditDate))[0];
    return {
      total: reports.length,
      completed: reports.filter(r => r.status === 'completed').length,
      pending: reports.filter(r => r.status === 'pending' || r.status === 'in-progress').length,
      avgOccupancy: latestCompleted?.occupancyRate || 0,
      avgRevenue: latestCompleted?.totalRevenue || 0,
    };
  }, [reports]);

  const inputClass = `w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;
  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const getStatusColor = (status: AuditStatus) => {
    const colors: Record<string, string> = {
      pending: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'in-progress': isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      completed: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      'issues-found': isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.pending;
  };

  const renderForm = (report: Partial<NightAuditReport>, isEditing = false) => {
    const setData = isEditing
      ? (updates: Partial<NightAuditReport>) => setEditingReport({ ...editingReport!, ...updates })
      : (updates: Partial<NightAuditReport>) => setNewReport({ ...newReport, ...updates });

    const metrics = calculateMetrics(report);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.nightAudit.auditDate', 'Audit Date')}</label>
            <input type="date" value={report.auditDate || ''} onChange={(e) => setData({ auditDate: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.nightAudit.auditedBy', 'Audited By *')}</label>
            <input type="text" value={report.auditedBy || ''} onChange={(e) => setData({ auditedBy: e.target.value })} placeholder={t('tools.nightAudit.auditorName', 'Auditor name')} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.nightAudit.startTime', 'Start Time')}</label>
            <input type="time" value={report.startTime || ''} onChange={(e) => setData({ startTime: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nightAudit.roomStatistics', 'Room Statistics')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.nightAudit.roomsOccupied', 'Rooms Occupied')}</label>
              <input type="number" value={report.roomsOccupied || 0} onChange={(e) => setData({ roomsOccupied: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.nightAudit.roomsAvailable', 'Rooms Available')}</label>
              <input type="number" value={report.roomsAvailable || 0} onChange={(e) => setData({ roomsAvailable: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.nightAudit.checkIns', 'Check-Ins')}</label>
              <input type="number" value={report.checkIns || 0} onChange={(e) => setData({ checkIns: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.nightAudit.checkOuts', 'Check-Outs')}</label>
              <input type="number" value={report.checkOuts || 0} onChange={(e) => setData({ checkOuts: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nightAudit.revenue', 'Revenue')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.nightAudit.roomRevenue', 'Room Revenue ($)')}</label>
              <input type="number" value={report.roomRevenue || 0} onChange={(e) => setData({ roomRevenue: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.nightAudit.fBRevenue', 'F&B Revenue ($)')}</label>
              <input type="number" value={report.fbRevenue || 0} onChange={(e) => setData({ fbRevenue: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.nightAudit.otherRevenue', 'Other Revenue ($)')}</label>
              <input type="number" value={report.otherRevenue || 0} onChange={(e) => setData({ otherRevenue: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? t('tools.nightAudit.bg0d948810', 'bg-[#0D9488]/10') : t('tools.nightAudit.bg0d94885', 'bg-[#0D9488]/5')}`}>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nightAudit.totalRevenue', 'Total Revenue')}</p><p className="text-xl font-bold text-[#0D9488]">${metrics.totalRevenue.toLocaleString()}</p></div>
            <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nightAudit.occupancy', 'Occupancy')}</p><p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{metrics.occupancyRate}%</p></div>
            <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nightAudit.adr', 'ADR')}</p><p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${metrics.adr}</p></div>
            <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nightAudit.revpar', 'RevPAR')}</p><p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${metrics.revpar}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.nightAudit.noShows', 'No Shows')}</label>
            <input type="number" value={report.noShows || 0} onChange={(e) => setData({ noShows: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.nightAudit.walkIns', 'Walk-Ins')}</label>
            <input type="number" value={report.walkins || 0} onChange={(e) => setData({ walkins: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.nightAudit.cancellations', 'Cancellations')}</label>
            <input type="number" value={report.cancellations || 0} onChange={(e) => setData({ cancellations: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.nightAudit.notes', 'Notes')}</label>
          <textarea value={report.notes || ''} onChange={(e) => setData({ notes: e.target.value })} placeholder={t('tools.nightAudit.auditNotesObservations', 'Audit notes, observations...')} rows={2} className={inputClass} />
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
              <div className="p-3 bg-[#0D9488]/10 rounded-xl"><Moon className="w-6 h-6 text-[#0D9488]" /></div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nightAudit.nightAudit', 'Night Audit')}</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nightAudit.dailyNightAuditReportsAnd', 'Daily night audit reports and reconciliation')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="night-audit" toolName="Night Audit" />

              <SyncStatus isSynced={reportsData.isSynced} isSaving={reportsData.isSaving} lastSaved={reportsData.lastSaved} syncError={reportsData.syncError} onForceSync={() => reportsData.forceSync()} theme={isDark ? 'dark' : 'light'} showLabel={true} size="sm" />
              <ExportDropdown onExportCSV={() => reportsData.exportCSV({ filename: 'night-audits' })} onExportExcel={() => reportsData.exportExcel({ filename: 'night-audits' })} onExportJSON={() => reportsData.exportJSON({ filename: 'night-audits' })} onExportPDF={() => reportsData.exportPDF({ filename: 'night-audits', title: 'Night Audit Reports' })} onPrint={() => reportsData.print('Night Audit Reports')} onCopyToClipboard={() => reportsData.copyToClipboard('tab')} theme={isDark ? 'dark' : 'light'} />
              <button onClick={handleReset} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}><RefreshCw className="w-4 h-4" />{t('tools.nightAudit.reset', 'Reset')}</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nightAudit.totalReports', 'Total Reports')}</p><p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nightAudit.completed', 'Completed')}</p><p className="text-2xl font-bold text-green-500">{stats.completed}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nightAudit.lastOccupancy', 'Last Occupancy')}</p><p className="text-2xl font-bold text-blue-500">{stats.avgOccupancy}%</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nightAudit.lastRevenue', 'Last Revenue')}</p><p className="text-2xl font-bold text-[#0D9488]">${stats.avgRevenue.toLocaleString()}</p></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.nightAudit.searchReports', 'Search reports...')} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AuditStatus | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.nightAudit.allStatuses', 'All Statuses')}</option>
            {AUDIT_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2"><Plus className="w-5 h-5" />{t('tools.nightAudit.newAudit', 'New Audit')}</button>
        </div>

        {/* Forms */}
        {showForm && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nightAudit.newNightAudit', 'New Night Audit')}</h3>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(newReport)}
            <button onClick={handleAddReport} disabled={!newReport.auditedBy} className="mt-4 w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5" />{t('tools.nightAudit.startAudit', 'Start Audit')}</button>
          </div>
        )}

        {editingReport && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nightAudit.editAuditReport', 'Edit Audit Report')}</h3>
              <button onClick={() => setEditingReport(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(editingReport, true)}
            <div className="flex gap-3 mt-4">
              <button onClick={handleUpdateReport} className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"><Save className="w-5 h-5" />{t('tools.nightAudit.save', 'Save')}</button>
              <button onClick={() => setEditingReport(null)} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('tools.nightAudit.cancel', 'Cancel')}</button>
            </div>
          </div>
        )}

        {/* Report List */}
        <div className="space-y-3">
          {filteredReports.map(report => (
            <div key={report.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(report.auditDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(report.status)}`}>{AUDIT_STATUSES.find(s => s.value === report.status)?.label}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div><p className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.nightAudit.revenue2', 'Revenue')}</p><p className="font-semibold text-[#0D9488]">${report.totalRevenue.toLocaleString()}</p></div>
                    <div><p className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.nightAudit.occupancy2', 'Occupancy')}</p><p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{report.occupancyRate}%</p></div>
                    <div><p className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.nightAudit.adr2', 'ADR')}</p><p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>${report.adr}</p></div>
                    <div><p className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.nightAudit.revpar2', 'RevPAR')}</p><p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>${report.revpar}</p></div>
                    <div><p className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.nightAudit.auditedBy2', 'Audited By')}</p><p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{report.auditedBy}</p></div>
                  </div>
                  {report.discrepancies.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{report.discrepancies.length} discrepancy found</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {report.status === 'in-progress' && (<button onClick={() => handleCompleteAudit(report.id)} className="p-2 rounded-lg text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20" title={t('tools.nightAudit.complete', 'Complete')}><CheckCircle className="w-4 h-4" /></button>)}
                  <button onClick={() => setEditingReport(report)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
                  <button onClick={() => handleDeleteReport(report.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <Moon className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.nightAudit.noAuditReportsFound', 'No audit reports found.')}</p>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default NightAuditTool;
