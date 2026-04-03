import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Wrench, Clock, DollarSign, AlertCircle, Plus, Trash2, Edit2, Sparkles, Home } from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface RepairLog {
  id: string;
  itemName: string;
  category: string;
  issueDescription: string;
  repairDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  technicianName?: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes: string;
}

type StatusType = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type PriorityType = 'low' | 'normal' | 'high' | 'urgent';

interface StatusInfo {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface PriorityInfo {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const REPAIR_CATEGORIES = [
  'Appliance',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roof',
  'Windows',
  'Doors',
  'Flooring',
  'Drywall',
  'Painting',
  'Furniture',
  'Equipment',
  'Other',
];

const getStatusInfo = (status: StatusType, isDark: boolean): StatusInfo => {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        color: isDark ? 'text-green-400' : 'text-green-600',
        bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50',
        borderColor: isDark ? 'border-green-800' : 'border-green-200',
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        color: isDark ? 'text-blue-400' : 'text-blue-600',
        bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
        borderColor: isDark ? 'border-blue-800' : 'border-blue-200',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        color: isDark ? 'text-gray-400' : 'text-gray-600',
        bgColor: isDark ? 'bg-gray-700' : 'bg-gray-100',
        borderColor: isDark ? 'border-gray-600' : 'border-gray-300',
      };
    default:
      return {
        label: 'Pending',
        color: isDark ? 'text-yellow-400' : 'text-yellow-600',
        bgColor: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
        borderColor: isDark ? 'border-yellow-800' : 'border-yellow-200',
      };
  }
};

const getPriorityInfo = (priority: PriorityType, isDark: boolean): PriorityInfo => {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Urgent',
        color: isDark ? 'text-red-400' : 'text-red-600',
        bgColor: isDark ? 'bg-red-900/20' : 'bg-red-50',
        borderColor: isDark ? 'border-red-800' : 'border-red-200',
      };
    case 'high':
      return {
        label: 'High',
        color: isDark ? 'text-orange-400' : 'text-orange-600',
        bgColor: isDark ? 'bg-orange-900/20' : 'bg-orange-50',
        borderColor: isDark ? 'border-orange-800' : 'border-orange-200',
      };
    case 'normal':
      return {
        label: 'Normal',
        color: isDark ? 'text-blue-400' : 'text-blue-600',
        bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
        borderColor: isDark ? 'border-blue-800' : 'border-blue-200',
      };
    default:
      return {
        label: 'Low',
        color: isDark ? 'text-green-400' : 'text-green-600',
        bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50',
        borderColor: isDark ? 'border-green-800' : 'border-green-200',
      };
  }
};

interface RepairLogToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'itemName', header: 'Item', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'issueDescription', header: 'Issue', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'repairDate', header: 'Repair Date', type: 'date' },
  { key: 'completedDate', header: 'Completed Date', type: 'date' },
  { key: 'laborCost', header: 'Labor Cost', type: 'number' },
  { key: 'partsCost', header: 'Parts Cost', type: 'number' },
  { key: 'totalCost', header: 'Total Cost', type: 'number' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export const RepairLogTool: React.FC<RepairLogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize useToolData hook for backend sync
  const {
    data: repairs,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
  } = useToolData<RepairLog>('repair-log', [], COLUMNS);

  // Form state
  const [itemName, setItemName] = useState<string>('');
  const [category, setCategory] = useState<string>('Other');
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [repairDate, setRepairDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [completedDate, setCompletedDate] = useState<string>('');
  const [status, setStatus] = useState<StatusType>('pending');
  const [priority, setPriority] = useState<PriorityType>('normal');
  const [technicianName, setTechnicianName] = useState<string>('');
  const [laborCost, setLaborCost] = useState<string>('');
  const [partsCost, setPartsCost] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        itemName?: string;
        category?: string;
        issueDescription?: string;
      };
      if (params.itemName) setItemName(params.itemName);
      if (params.category) setCategory(params.category);
      if (params.issueDescription) setIssueDescription(params.issueDescription);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const stats = useMemo(() => {
    const completed = repairs.filter(r => r.status === 'completed').length;
    const inProgress = repairs.filter(r => r.status === 'in_progress').length;
    const pending = repairs.filter(r => r.status === 'pending').length;
    const totalCost = repairs.reduce((sum, r) => sum + r.totalCost, 0);
    const avgCost = repairs.length > 0 ? Math.round(totalCost / repairs.length) : 0;

    return {
      total: repairs.length,
      completed,
      inProgress,
      pending,
      totalCost,
      avgCost,
    };
  }, [repairs]);

  const handleAddOrUpdate = () => {
    if (!itemName.trim() || !issueDescription.trim()) {
      setValidationMessage('Please fill in Item Name and Issue Description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const labor = parseFloat(laborCost) || 0;
    const parts = parseFloat(partsCost) || 0;

    if (labor < 0 || parts < 0) {
      setValidationMessage('Costs cannot be negative');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const totalCost = labor + parts;

    const repairData: RepairLog = {
      id: editingId || Date.now().toString(),
      itemName,
      category,
      issueDescription,
      repairDate,
      completedDate: status === 'completed' ? completedDate : undefined,
      status,
      priority,
      technicianName: technicianName || undefined,
      laborCost: labor,
      partsCost: parts,
      totalCost,
      notes,
    };

    if (editingId) {
      updateItem(editingId, repairData);
      setEditingId(null);
    } else {
      addItem(repairData);
    }

    // Reset form
    setItemName('');
    setCategory('Other');
    setIssueDescription('');
    setRepairDate(new Date().toISOString().split('T')[0]);
    setCompletedDate('');
    setStatus('pending');
    setPriority('normal');
    setTechnicianName('');
    setLaborCost('');
    setPartsCost('');
    setNotes('');
  };

  const handleEdit = (repair: RepairLog) => {
    setEditingId(repair.id.toString());
    setItemName(repair.itemName);
    setCategory(repair.category);
    setIssueDescription(repair.issueDescription);
    setRepairDate(repair.repairDate);
    setCompletedDate(repair.completedDate || '');
    setStatus(repair.status);
    setPriority(repair.priority);
    setTechnicianName(repair.technicianName || '');
    setLaborCost(repair.laborCost.toString());
    setPartsCost(repair.partsCost.toString());
    setNotes(repair.notes);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setItemName('');
    setCategory('Other');
    setIssueDescription('');
    setRepairDate(new Date().toISOString().split('T')[0]);
    setCompletedDate('');
    setStatus('pending');
    setPriority('normal');
    setTechnicianName('');
    setLaborCost('');
    setPartsCost('');
    setNotes('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
              <Home className={isDark ? 'text-amber-400' : 'text-amber-600'} size={28} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.repairLog.repairLog', 'Repair Log')}
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {t('tools.repairLog.trackAndManageHomeRepair', 'Track and manage home repair projects')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="repair-log" toolName="Repair Log" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="md"
            />
            {repairs.length > 0 && (
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'repair-log' })}
                onExportExcel={() => exportExcel({ filename: 'repair-log' })}
                onExportJSON={() => exportJSON({ filename: 'repair-log' })}
                onExportPDF={async () => {
                  await exportPDF({
                    filename: 'repair-log',
                    title: 'Repair Log',
                    subtitle: `${repairs.length} repair${repairs.length !== 1 ? 's' : ''} logged`,
                  });
                }}
                onPrint={() => print('Repair Log')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            )}
          </div>
        </div>

        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.repairLog.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Stats Cards */}
        {repairs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.repairLog.total', 'Total')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
              <div className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.repairLog.completed', 'Completed')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{stats.completed}</div>
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
              <div className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{t('tools.repairLog.inProgress', 'In Progress')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{stats.inProgress}</div>
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className={`text-sm font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.repairLog.pending', 'Pending')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.pending}</div>
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{t('tools.repairLog.totalCost', 'Total Cost')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{formatCurrency(stats.totalCost)}</div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? t('tools.repairLog.editRepair', 'Edit Repair') : t('tools.repairLog.addNewRepair', 'Add New Repair')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.repairLog.itemLocation', 'Item/Location')}
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder={t('tools.repairLog.eGKitchenSinkRoof', 'e.g., Kitchen sink, Roof, Bedroom window...')}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.repairLog.category', 'Category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {REPAIR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.repairLog.issueDescription', 'Issue Description')}
              </label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder={t('tools.repairLog.describeTheIssueThatNeeds', 'Describe the issue that needs to be repaired...')}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.repairLog.repairDate', 'Repair Date')}
              </label>
              <input
                type="date"
                value={repairDate}
                onChange={(e) => setRepairDate(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.repairLog.status', 'Status')}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusType)}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="pending">{t('tools.repairLog.pending2', 'Pending')}</option>
                <option value="in_progress">{t('tools.repairLog.inProgress2', 'In Progress')}</option>
                <option value="completed">{t('tools.repairLog.completed2', 'Completed')}</option>
                <option value="cancelled">{t('tools.repairLog.cancelled', 'Cancelled')}</option>
              </select>
            </div>

            {status === 'completed' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.repairLog.completedDate', 'Completed Date')}
                </label>
                <input
                  type="date"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.repairLog.priority', 'Priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityType)}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="low">{t('tools.repairLog.low', 'Low')}</option>
                <option value="normal">{t('tools.repairLog.normal', 'Normal')}</option>
                <option value="high">{t('tools.repairLog.high', 'High')}</option>
                <option value="urgent">{t('tools.repairLog.urgent', 'Urgent')}</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.repairLog.laborCost', 'Labor Cost ($)')}
              </label>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.repairLog.partsCost', 'Parts Cost ($)')}
              </label>
              <input
                type="number"
                value={partsCost}
                onChange={(e) => setPartsCost(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.repairLog.technicianName', 'Technician Name')}
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder={t('tools.repairLog.optional', 'Optional')}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.repairLog.notesOptional', 'Notes (optional)')}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('tools.repairLog.additionalNotes', 'Additional notes...')}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddOrUpdate}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                isDark
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              <Plus size={20} />
              {editingId ? t('tools.repairLog.updateRepair', 'Update Repair') : t('tools.repairLog.addRepair', 'Add Repair')}
            </button>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {t('tools.repairLog.cancel', 'Cancel')}
              </button>
            )}
          </div>
        </div>

        {/* Repairs List */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Wrench size={20} />
            {t('tools.repairLog.repairRecords', 'Repair Records')}
          </h3>

          {repairs.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Wrench size={48} className="mx-auto mb-4 opacity-50" />
              <p>{t('tools.repairLog.noRepairsLoggedYet', 'No repairs logged yet')}</p>
              <p className="text-sm mt-1">{t('tools.repairLog.addYourFirstRepairAbove', 'Add your first repair above to get started')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {repairs.map((repair) => {
                const statusInfo = getStatusInfo(repair.status, isDark);
                const priorityInfo = getPriorityInfo(repair.priority, isDark);

                return (
                  <div
                    key={repair.id}
                    className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`p-2 rounded-lg mt-1 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <Wrench className={isDark ? 'text-amber-400' : 'text-amber-600'} size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {repair.itemName}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
                                {statusInfo.label}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityInfo.bgColor} ${priorityInfo.color} border ${priorityInfo.borderColor}`}>
                                {priorityInfo.label}
                              </span>
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                              {repair.category}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                              {repair.issueDescription}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} space-y-1`}>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {formatDate(repair.repairDate)}
                                </span>
                                {repair.technicianName && (
                                  <span className="flex items-center gap-1">
                                    <Wrench size={14} />
                                    {repair.technicianName}
                                  </span>
                                )}
                              </div>
                              {repair.notes && (
                                <div className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                                  {repair.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div className="text-xs mb-1">{t('tools.repairLog.totalCost2', 'Total Cost')}</div>
                          <div className={`text-xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                            {formatCurrency(repair.totalCost)}
                          </div>
                          <div className="text-xs mt-1 space-y-0.5">
                            <div>Labor: {formatCurrency(repair.laborCost)}</div>
                            <div>Parts: {formatCurrency(repair.partsCost)}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(repair)}
                            className={`p-2 rounded-lg transition-all ${
                              isDark
                                ? 'hover:bg-blue-900/30 text-gray-400 hover:text-blue-400'
                                : 'hover:bg-blue-50 text-gray-400 hover:text-blue-500'
                            }`}
                            title={t('tools.repairLog.editRepair2', 'Edit repair')}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteItem(repair.id.toString())}
                            className={`p-2 rounded-lg transition-all ${
                              isDark
                                ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400'
                                : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                            }`}
                            title={t('tools.repairLog.deleteRepair', 'Delete repair')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default RepairLogTool;
