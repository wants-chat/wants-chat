'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  ShieldAlert,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Pill,
  FileText,
  Clock,
  User,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Lock,
  Calendar,
  Hash,
  Package,
  ClipboardList,
  BarChart3,
} from 'lucide-react';

// Types
interface ControlledSubstanceLog {
  id: string;
  date: string;
  time: string;
  drugName: string;
  drugNDC: string;
  schedule: 'II' | 'III' | 'IV' | 'V';
  deaNumber: string;
  transactionType: 'receipt' | 'dispensing' | 'destruction' | 'transfer' | 'inventory' | 'theft_loss';
  quantity: number;
  unit: string;
  runningBalance: number;
  rxNumber: string;
  patientName: string;
  prescriberName: string;
  prescriberDEA: string;
  pharmacistInitials: string;
  witnessInitials: string;
  invoiceNumber: string;
  lotNumber: string;
  expirationDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryCount {
  id: string;
  date: string;
  drugName: string;
  drugNDC: string;
  schedule: string;
  expectedCount: number;
  actualCount: number;
  discrepancy: number;
  countedBy: string;
  verifiedBy: string;
  notes: string;
  status: 'matched' | 'discrepancy' | 'investigating' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

const SCHEDULE_OPTIONS = [
  { value: 'II', label: 'Schedule II', description: 'High potential for abuse (oxycodone, fentanyl, morphine)' },
  { value: 'III', label: 'Schedule III', description: 'Moderate potential (codeine combinations, ketamine)' },
  { value: 'IV', label: 'Schedule IV', description: 'Low potential (benzodiazepines, tramadol)' },
  { value: 'V', label: 'Schedule V', description: 'Lowest potential (low-dose codeine cough syrups)' },
];

const TRANSACTION_TYPES = [
  { value: 'receipt', label: 'Receipt', icon: Package },
  { value: 'dispensing', label: 'Dispensing', icon: Pill },
  { value: 'destruction', label: 'Destruction', icon: Trash2 },
  { value: 'transfer', label: 'Transfer', icon: RefreshCw },
  { value: 'inventory', label: 'Inventory Count', icon: ClipboardList },
  { value: 'theft_loss', label: 'Theft/Loss', icon: AlertTriangle },
];

const COMMON_CONTROLLED = [
  { name: 'Oxycodone HCl 5mg', schedule: 'II' as const },
  { name: 'Oxycodone HCl 10mg', schedule: 'II' as const },
  { name: 'Hydrocodone/APAP 5-325mg', schedule: 'II' as const },
  { name: 'Hydrocodone/APAP 10-325mg', schedule: 'II' as const },
  { name: 'Morphine Sulfate ER 15mg', schedule: 'II' as const },
  { name: 'Fentanyl Patch 25mcg/hr', schedule: 'II' as const },
  { name: 'Adderall 10mg', schedule: 'II' as const },
  { name: 'Adderall 20mg', schedule: 'II' as const },
  { name: 'Methylphenidate 10mg', schedule: 'II' as const },
  { name: 'Alprazolam 0.5mg', schedule: 'IV' as const },
  { name: 'Alprazolam 1mg', schedule: 'IV' as const },
  { name: 'Lorazepam 1mg', schedule: 'IV' as const },
  { name: 'Diazepam 5mg', schedule: 'IV' as const },
  { name: 'Tramadol 50mg', schedule: 'IV' as const },
  { name: 'Zolpidem 10mg', schedule: 'IV' as const },
];

// Column configurations
const LOG_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'drugName', header: 'Drug', type: 'string' },
  { key: 'schedule', header: 'Schedule', type: 'string' },
  { key: 'transactionType', header: 'Transaction', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'runningBalance', header: 'Balance', type: 'number' },
  { key: 'rxNumber', header: 'Rx #', type: 'string' },
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'pharmacistInitials', header: 'RPh', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const INVENTORY_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'drugName', header: 'Drug', type: 'string' },
  { key: 'schedule', header: 'Schedule', type: 'string' },
  { key: 'expectedCount', header: 'Expected', type: 'number' },
  { key: 'actualCount', header: 'Actual', type: 'number' },
  { key: 'discrepancy', header: 'Discrepancy', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'countedBy', header: 'Counted By', type: 'string' },
];

interface ControlledSubstanceToolProps {
  uiConfig?: UIConfig;
}

export const ControlledSubstanceTool = ({
  uiConfig }: ControlledSubstanceToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // useToolData for perpetual log
  const {
    data: logs,
    addItem: addLog,
    updateItem: updateLog,
    deleteItem: deleteLog,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ControlledSubstanceLog>('controlled-substance-log', [], LOG_COLUMNS);

  // useToolData for inventory counts
  const {
    data: inventoryCounts,
    addItem: addInventory,
    updateItem: updateInventory,
    deleteItem: deleteInventory,
  } = useToolData<InventoryCount>('controlled-inventory', [], INVENTORY_COLUMNS);

  // Local state
  const [activeTab, setActiveTab] = useState<'log' | 'inventory' | 'reports'>('log');
  const [showLogForm, setShowLogForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingLog, setEditingLog] = useState<ControlledSubstanceLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState<string>('all');
  const [transactionFilter, setTransactionFilter] = useState<string>('all');

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

      if (params.schedule && SCHEDULE_OPTIONS.find(s => s.value === params.schedule)) {
        setScheduleFilter(params.schedule);
        hasChanges = true;
      }
      if (params.transactionType && TRANSACTION_TYPES.find(t => t.value === params.transactionType)) {
        setTransactionFilter(params.transactionType);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const defaultLogForm = {
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    drugName: '',
    drugNDC: '',
    schedule: 'II' as const,
    deaNumber: '',
    transactionType: 'dispensing' as const,
    quantity: 0,
    unit: 'tablets',
    runningBalance: 0,
    rxNumber: '',
    patientName: '',
    prescriberName: '',
    prescriberDEA: '',
    pharmacistInitials: '',
    witnessInitials: '',
    invoiceNumber: '',
    lotNumber: '',
    expirationDate: '',
    notes: '',
  };

  const [logForm, setLogForm] = useState(defaultLogForm);

  const defaultInventoryForm = {
    date: new Date().toISOString().split('T')[0],
    drugName: '',
    drugNDC: '',
    schedule: 'II',
    expectedCount: 0,
    actualCount: 0,
    countedBy: '',
    verifiedBy: '',
    notes: '',
  };

  const [inventoryForm, setInventoryForm] = useState(defaultInventoryForm);

  // Calculate running balance for a drug
  const getRunningBalance = (drugName: string): number => {
    const drugLogs = logs
      .filter(l => l.drugName.toLowerCase() === drugName.toLowerCase())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (drugLogs.length === 0) return 0;
    return drugLogs[drugLogs.length - 1].runningBalance;
  };

  // Update running balance when drug is selected
  useEffect(() => {
    if (logForm.drugName && !editingLog) {
      const currentBalance = getRunningBalance(logForm.drugName);
      setLogForm(prev => ({ ...prev, runningBalance: currentBalance }));
    }
  }, [logForm.drugName]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        log.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.rxNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSchedule = scheduleFilter === 'all' || log.schedule === scheduleFilter;
      const matchesTransaction = transactionFilter === 'all' || log.transactionType === transactionFilter;

      return matchesSearch && matchesSchedule && matchesTransaction;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [logs, searchTerm, scheduleFilter, transactionFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.date === today);
    const discrepancies = inventoryCounts.filter(i => i.status === 'discrepancy' || i.status === 'investigating');

    return {
      todayDispensed: todayLogs.filter(l => l.transactionType === 'dispensing').length,
      todayReceived: todayLogs.filter(l => l.transactionType === 'receipt').length,
      totalDrugs: new Set(logs.map(l => l.drugName)).size,
      openDiscrepancies: discrepancies.length,
    };
  }, [logs, inventoryCounts]);

  // Handle log form submit
  const handleLogSubmit = () => {
    const now = new Date().toISOString();

    // Calculate new balance
    let newBalance = logForm.runningBalance;
    if (logForm.transactionType === 'receipt') {
      newBalance += logForm.quantity;
    } else if (logForm.transactionType === 'dispensing' || logForm.transactionType === 'destruction' || logForm.transactionType === 'transfer' || logForm.transactionType === 'theft_loss') {
      newBalance -= logForm.quantity;
    }

    if (editingLog) {
      updateLog(editingLog.id, {
        ...logForm,
        runningBalance: newBalance,
        updatedAt: now,
      });
      setEditingLog(null);
    } else {
      const newLog: ControlledSubstanceLog = {
        ...logForm,
        id: crypto.randomUUID(),
        runningBalance: newBalance,
        createdAt: now,
        updatedAt: now,
      };
      addLog(newLog);
    }

    setLogForm(defaultLogForm);
    setShowLogForm(false);
  };

  // Handle inventory form submit
  const handleInventorySubmit = () => {
    const now = new Date().toISOString();
    const discrepancy = inventoryForm.actualCount - inventoryForm.expectedCount;

    const newInventory: InventoryCount = {
      id: crypto.randomUUID(),
      ...inventoryForm,
      discrepancy,
      status: discrepancy === 0 ? 'matched' : 'discrepancy',
      createdAt: now,
      updatedAt: now,
    };

    addInventory(newInventory);
    setInventoryForm(defaultInventoryForm);
    setShowInventoryForm(false);
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
            <ShieldAlert className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('tools.controlledSubstance.controlledSubstanceLog', 'Controlled Substance Log')}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.controlledSubstance.deaPerpetualInventoryTracking21', 'DEA Perpetual Inventory Tracking (21 CFR 1304)')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="controlled-substance" toolName="Controlled Substance" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
          />
          <ExportDropdown
            onExportCSV={exportCSV}
            onExportExcel={exportExcel}
            onExportJSON={exportJSON}
            onExportPDF={exportPDF}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.controlledSubstance.dispensedToday', 'Dispensed Today')}</p>
                <p className="text-2xl font-bold text-blue-500">{stats.todayDispensed}</p>
              </div>
              <Pill className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.controlledSubstance.receivedToday', 'Received Today')}</p>
                <p className="text-2xl font-bold text-green-500">{stats.todayReceived}</p>
              </div>
              <Package className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.controlledSubstance.trackedDrugs', 'Tracked Drugs')}</p>
                <p className="text-2xl font-bold text-purple-500">{stats.totalDrugs}</p>
              </div>
              <Lock className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.controlledSubstance.openDiscrepancies', 'Open Discrepancies')}</p>
                <p className={`text-2xl font-bold ${stats.openDiscrepancies > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {stats.openDiscrepancies}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${stats.openDiscrepancies > 0 ? 'text-red-500' : 'text-gray-500'} opacity-50`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'log', label: 'Perpetual Log', icon: FileText },
          { id: 'inventory', label: 'Inventory Counts', icon: ClipboardList },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Log Tab */}
      {activeTab === 'log' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('tools.controlledSubstance.transactionLog', 'Transaction Log')}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <select
                  value={scheduleFilter}
                  onChange={(e) => setScheduleFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">{t('tools.controlledSubstance.allSchedules', 'All Schedules')}</option>
                  {SCHEDULE_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">{t('tools.controlledSubstance.allTransactions', 'All Transactions')}</option>
                  {TRANSACTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.controlledSubstance.search', 'Search...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <button
                  onClick={() => {
                    setShowLogForm(true);
                    setEditingLog(null);
                    setLogForm(defaultLogForm);
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.controlledSubstance.newEntry', 'New Entry')}
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showLogForm ? (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">
                  {editingLog ? t('tools.controlledSubstance.editLogEntry', 'Edit Log Entry') : t('tools.controlledSubstance.newLogEntry', 'New Log Entry')}
                </h3>

                {/* Drug Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.controlledSubstance.drugName', 'Drug Name *')}</label>
                    <select
                      value={logForm.drugName}
                      onChange={(e) => {
                        const selected = COMMON_CONTROLLED.find(d => d.name === e.target.value);
                        setLogForm({
                          ...logForm,
                          drugName: e.target.value,
                          schedule: selected?.schedule || 'II',
                        });
                      }}
                      className={inputClass}
                    >
                      <option value="">{t('tools.controlledSubstance.selectOrTypeDrug', 'Select or type drug...')}</option>
                      {COMMON_CONTROLLED.map(drug => (
                        <option key={drug.name} value={drug.name}>{drug.name} (C-{drug.schedule})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.schedule', 'Schedule *')}</label>
                    <select
                      value={logForm.schedule}
                      onChange={(e) => setLogForm({ ...logForm, schedule: e.target.value as ControlledSubstanceLog['schedule'] })}
                      className={inputClass}
                    >
                      {SCHEDULE_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.ndc', 'NDC')}</label>
                    <input
                      type="text"
                      value={logForm.drugNDC}
                      onChange={(e) => setLogForm({ ...logForm, drugNDC: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.date', 'Date *')}</label>
                    <input
                      type="date"
                      value={logForm.date}
                      onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.time', 'Time *')}</label>
                    <input
                      type="time"
                      value={logForm.time}
                      onChange={(e) => setLogForm({ ...logForm, time: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.transactionType', 'Transaction Type *')}</label>
                    <select
                      value={logForm.transactionType}
                      onChange={(e) => setLogForm({ ...logForm, transactionType: e.target.value as ControlledSubstanceLog['transactionType'] })}
                      className={inputClass}
                    >
                      {TRANSACTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.quantity', 'Quantity *')}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={logForm.quantity}
                        onChange={(e) => setLogForm({ ...logForm, quantity: parseInt(e.target.value) || 0 })}
                        className={`${inputClass} flex-1`}
                        min="0"
                      />
                      <select
                        value={logForm.unit}
                        onChange={(e) => setLogForm({ ...logForm, unit: e.target.value })}
                        className={`${inputClass} w-28`}
                      >
                        <option value="tablets">tablets</option>
                        <option value="capsules">capsules</option>
                        <option value="ml">ml</option>
                        <option value="patches">patches</option>
                        <option value="vials">vials</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Patient/Rx Info (for dispensing) */}
                {logForm.transactionType === 'dispensing' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.controlledSubstance.rxNumber', 'Rx Number *')}</label>
                      <input
                        type="text"
                        value={logForm.rxNumber}
                        onChange={(e) => setLogForm({ ...logForm, rxNumber: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.controlledSubstance.patientName', 'Patient Name *')}</label>
                      <input
                        type="text"
                        value={logForm.patientName}
                        onChange={(e) => setLogForm({ ...logForm, patientName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.controlledSubstance.prescriberName', 'Prescriber Name')}</label>
                      <input
                        type="text"
                        value={logForm.prescriberName}
                        onChange={(e) => setLogForm({ ...logForm, prescriberName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {/* Receipt Info */}
                {logForm.transactionType === 'receipt' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.controlledSubstance.invoiceNumber', 'Invoice Number *')}</label>
                      <input
                        type="text"
                        value={logForm.invoiceNumber}
                        onChange={(e) => setLogForm({ ...logForm, invoiceNumber: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.controlledSubstance.lotNumber', 'Lot Number')}</label>
                      <input
                        type="text"
                        value={logForm.lotNumber}
                        onChange={(e) => setLogForm({ ...logForm, lotNumber: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.controlledSubstance.expirationDate', 'Expiration Date')}</label>
                      <input
                        type="date"
                        value={logForm.expirationDate}
                        onChange={(e) => setLogForm({ ...logForm, expirationDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {/* Verification */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.runningBalance', 'Running Balance')}</label>
                    <input
                      type="number"
                      value={logForm.runningBalance}
                      onChange={(e) => setLogForm({ ...logForm, runningBalance: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      readOnly={!editingLog}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.pharmacistInitials', 'Pharmacist Initials *')}</label>
                    <input
                      type="text"
                      value={logForm.pharmacistInitials}
                      onChange={(e) => setLogForm({ ...logForm, pharmacistInitials: e.target.value.toUpperCase() })}
                      className={inputClass}
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.witnessInitials', 'Witness Initials')}</label>
                    <input
                      type="text"
                      value={logForm.witnessInitials}
                      onChange={(e) => setLogForm({ ...logForm, witnessInitials: e.target.value.toUpperCase() })}
                      className={inputClass}
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.deaNumber', 'DEA Number')}</label>
                    <input
                      type="text"
                      value={logForm.deaNumber}
                      onChange={(e) => setLogForm({ ...logForm, deaNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.controlledSubstance.notes', 'Notes')}</label>
                  <textarea
                    value={logForm.notes}
                    onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                    className={`${inputClass} h-20`}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowLogForm(false);
                      setEditingLog(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {t('tools.controlledSubstance.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleLogSubmit}
                    disabled={!logForm.drugName || !logForm.quantity || !logForm.pharmacistInitials}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    {t('tools.controlledSubstance.saveEntry', 'Save Entry')}
                  </button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {t('tools.controlledSubstance.noLogEntriesFound', 'No log entries found')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className="text-left py-3 px-3 font-medium">{t('tools.controlledSubstance.dateTime', 'Date/Time')}</th>
                      <th className="text-left py-3 px-3 font-medium">{t('tools.controlledSubstance.drug', 'Drug')}</th>
                      <th className="text-left py-3 px-3 font-medium">{t('tools.controlledSubstance.sch', 'Sch')}</th>
                      <th className="text-left py-3 px-3 font-medium">{t('tools.controlledSubstance.type', 'Type')}</th>
                      <th className="text-right py-3 px-3 font-medium">{t('tools.controlledSubstance.qty', 'Qty')}</th>
                      <th className="text-right py-3 px-3 font-medium">{t('tools.controlledSubstance.balance', 'Balance')}</th>
                      <th className="text-left py-3 px-3 font-medium">{t('tools.controlledSubstance.rxInvoice', 'Rx/Invoice')}</th>
                      <th className="text-left py-3 px-3 font-medium">{t('tools.controlledSubstance.patient', 'Patient')}</th>
                      <th className="text-left py-3 px-3 font-medium">{t('tools.controlledSubstance.rph', 'RPh')}</th>
                      <th className="text-left py-3 px-3 font-medium">{t('tools.controlledSubstance.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr
                        key={log.id}
                        className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td className="py-3 px-3">
                          <div>{log.date}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{log.time}</div>
                        </td>
                        <td className="py-3 px-3 font-medium">{log.drugName}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            C-{log.schedule}
                          </span>
                        </td>
                        <td className="py-3 px-3 capitalize">{log.transactionType.replace('_', ' ')}</td>
                        <td className={`py-3 px-3 text-right font-mono ${
                          log.transactionType === 'receipt' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {log.transactionType === 'receipt' ? '+' : '-'}{log.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold">{log.runningBalance}</td>
                        <td className="py-3 px-3">{log.rxNumber || log.invoiceNumber || '-'}</td>
                        <td className="py-3 px-3">{log.patientName || '-'}</td>
                        <td className="py-3 px-3">{log.pharmacistInitials}</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingLog(log);
                                setLogForm(log);
                                setShowLogForm(true);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteLog(log.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                {t('tools.controlledSubstance.inventoryCounts', 'Inventory Counts')}
              </CardTitle>
              <button
                onClick={() => setShowInventoryForm(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.controlledSubstance.newCount', 'New Count')}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {showInventoryForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.date2', 'Date')}</label>
                    <input
                      type="date"
                      value={inventoryForm.date}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.drugName2', 'Drug Name *')}</label>
                    <select
                      value={inventoryForm.drugName}
                      onChange={(e) => {
                        const selected = COMMON_CONTROLLED.find(d => d.name === e.target.value);
                        const expectedCount = getRunningBalance(e.target.value);
                        setInventoryForm({
                          ...inventoryForm,
                          drugName: e.target.value,
                          schedule: selected?.schedule || 'II',
                          expectedCount,
                        });
                      }}
                      className={inputClass}
                    >
                      <option value="">{t('tools.controlledSubstance.selectDrug', 'Select drug...')}</option>
                      {COMMON_CONTROLLED.map(drug => (
                        <option key={drug.name} value={drug.name}>{drug.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.schedule2', 'Schedule')}</label>
                    <input
                      type="text"
                      value={inventoryForm.schedule}
                      className={inputClass}
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.expectedCount', 'Expected Count')}</label>
                    <input
                      type="number"
                      value={inventoryForm.expectedCount}
                      className={inputClass}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.actualCount', 'Actual Count *')}</label>
                    <input
                      type="number"
                      value={inventoryForm.actualCount}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, actualCount: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.discrepancy', 'Discrepancy')}</label>
                    <input
                      type="number"
                      value={inventoryForm.actualCount - inventoryForm.expectedCount}
                      className={`${inputClass} ${
                        inventoryForm.actualCount - inventoryForm.expectedCount !== 0
                          ? 'text-red-500 font-bold'
                          : 'text-green-500'
                      }`}
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.countedBy', 'Counted By *')}</label>
                    <input
                      type="text"
                      value={inventoryForm.countedBy}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, countedBy: e.target.value.toUpperCase() })}
                      className={inputClass}
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.controlledSubstance.verifiedBy', 'Verified By *')}</label>
                    <input
                      type="text"
                      value={inventoryForm.verifiedBy}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, verifiedBy: e.target.value.toUpperCase() })}
                      className={inputClass}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.controlledSubstance.notes2', 'Notes')}</label>
                  <textarea
                    value={inventoryForm.notes}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                    className={`${inputClass} h-20`}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowInventoryForm(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    {t('tools.controlledSubstance.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={handleInventorySubmit}
                    disabled={!inventoryForm.drugName || !inventoryForm.countedBy || !inventoryForm.verifiedBy}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                  >
                    {t('tools.controlledSubstance.saveCount', 'Save Count')}
                  </button>
                </div>
              </div>
            ) : inventoryCounts.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.controlledSubstance.noInventoryCountsRecorded', 'No inventory counts recorded')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className="text-left py-3 px-3">{t('tools.controlledSubstance.date3', 'Date')}</th>
                      <th className="text-left py-3 px-3">{t('tools.controlledSubstance.drug2', 'Drug')}</th>
                      <th className="text-right py-3 px-3">{t('tools.controlledSubstance.expected', 'Expected')}</th>
                      <th className="text-right py-3 px-3">{t('tools.controlledSubstance.actual', 'Actual')}</th>
                      <th className="text-right py-3 px-3">{t('tools.controlledSubstance.discrepancy2', 'Discrepancy')}</th>
                      <th className="text-left py-3 px-3">{t('tools.controlledSubstance.status', 'Status')}</th>
                      <th className="text-left py-3 px-3">{t('tools.controlledSubstance.countedBy2', 'Counted By')}</th>
                      <th className="text-left py-3 px-3">{t('tools.controlledSubstance.actions2', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryCounts.map(count => (
                      <tr key={count.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="py-3 px-3">{count.date}</td>
                        <td className="py-3 px-3">{count.drugName}</td>
                        <td className="py-3 px-3 text-right">{count.expectedCount}</td>
                        <td className="py-3 px-3 text-right">{count.actualCount}</td>
                        <td className={`py-3 px-3 text-right font-bold ${
                          count.discrepancy !== 0 ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {count.discrepancy > 0 ? '+' : ''}{count.discrepancy}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={count.status}
                            onChange={(e) => updateInventory(count.id, {
                              status: e.target.value as InventoryCount['status'],
                              updatedAt: new Date().toISOString()
                            })}
                            className={`px-2 py-1 rounded text-xs ${
                              count.status === 'matched' ? 'bg-green-500 text-white' :
                              count.status === 'resolved' ? 'bg-blue-500 text-white' :
                              'bg-red-500 text-white'
                            }`}
                          >
                            <option value="matched">{t('tools.controlledSubstance.matched', 'Matched')}</option>
                            <option value="discrepancy">{t('tools.controlledSubstance.discrepancy3', 'Discrepancy')}</option>
                            <option value="investigating">{t('tools.controlledSubstance.investigating', 'Investigating')}</option>
                            <option value="resolved">{t('tools.controlledSubstance.resolved', 'Resolved')}</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">{count.countedBy}</td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => deleteInventory(count.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('tools.controlledSubstance.reportsAnalytics', 'Reports & Analytics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drug Summary */}
              <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="font-semibold mb-4">{t('tools.controlledSubstance.currentInventoryByDrug', 'Current Inventory by Drug')}</h4>
                <div className="space-y-2">
                  {Array.from(new Set(logs.map(l => l.drugName))).map(drugName => {
                    const balance = getRunningBalance(drugName);
                    const drugLog = logs.find(l => l.drugName === drugName);
                    return (
                      <div key={drugName} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <div>
                          <span className="font-medium">{drugName}</span>
                          <span className="ml-2 px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            C-{drugLog?.schedule}
                          </span>
                        </div>
                        <span className="font-mono font-bold">{balance}</span>
                      </div>
                    );
                  })}
                  {logs.length === 0 && (
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.controlledSubstance.noDataAvailable', 'No data available')}</p>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="font-semibold mb-4">{t('tools.controlledSubstance.recentActivityLast7Days', 'Recent Activity (Last 7 Days)')}</h4>
                <div className="space-y-2">
                  {logs.slice(0, 10).map(log => (
                    <div key={log.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <span className="font-medium">{log.drugName}</span>
                        <span className={`ml-2 text-sm ${
                          log.transactionType === 'receipt' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {log.transactionType === 'receipt' ? '+' : '-'}{log.quantity}
                        </span>
                      </div>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{log.date}</span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.controlledSubstance.noActivityRecorded', 'No activity recorded')}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ControlledSubstanceTool;
