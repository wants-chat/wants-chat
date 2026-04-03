'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  ClipboardList,
  Calendar,
  Clock,
  User,
  MapPin,
  Bug,
  FlaskConical,
  Shield,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  FileText,
  Camera,
  Droplets,
  ThermometerSun,
  Wind,
  Eye,
  Sparkles,
} from 'lucide-react';

// Types
interface TreatmentLog {
  id: string;
  date: string;
  time: string;
  customerId: string;
  customerName: string;
  address: string;
  technicianId: string;
  technicianName: string;
  serviceType: 'initial' | 'regular' | 'callback' | 'emergency' | 'follow-up';
  pestTypes: string[];
  treatmentAreas: string[];
  productsApplied: ProductApplication[];
  applicationMethods: string[];
  weatherConditions: WeatherConditions;
  findings: string;
  treatmentNotes: string;
  recommendations: string;
  customerSignature: boolean;
  followUpRequired: boolean;
  followUpDate: string;
  photos: string[];
  status: 'completed' | 'partial' | 'cancelled' | 'requires-return';
  duration: number;
  createdAt: string;
}

interface ProductApplication {
  productId: string;
  productName: string;
  activeIngredient: string;
  epaNumber: string;
  quantity: number;
  unit: string;
  dilutionRate: string;
  applicationRate: string;
  targetPests: string[];
  areas: string[];
}

interface WeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'overcast';
}

interface Technician {
  id: string;
  name: string;
  licenseNumber: string;
}

interface Product {
  id: string;
  name: string;
  activeIngredient: string;
  epaNumber: string;
  unit: string;
}

// Column configuration for exports
const TREATMENT_LOG_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'Log ID', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'technicianName', header: 'Technician', type: 'string' },
  { key: 'serviceType', header: 'Service Type', type: 'string' },
  { key: 'pestTypes', header: 'Pest Types', type: 'string' },
  { key: 'treatmentAreas', header: 'Treatment Areas', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'followUpRequired', header: 'Follow-up Required', type: 'boolean' },
  { key: 'followUpDate', header: 'Follow-up Date', type: 'date' },
];

// Default data
const defaultTechnicians: Technician[] = [
  { id: '1', name: 'John Smith', licenseNumber: 'PCT-12345' },
  { id: '2', name: 'Sarah Johnson', licenseNumber: 'PCT-12346' },
  { id: '3', name: 'Mike Williams', licenseNumber: 'PCT-12347' },
];

const defaultProducts: Product[] = [
  { id: '1', name: 'Termidor SC', activeIngredient: 'Fipronil 9.1%', epaNumber: '7969-210', unit: 'oz' },
  { id: '2', name: 'Advion Cockroach Gel', activeIngredient: 'Indoxacarb 0.6%', epaNumber: '352-652', unit: 'g' },
  { id: '3', name: 'Contrac Blox', activeIngredient: 'Bromadiolone 0.005%', epaNumber: '12455-79', unit: 'blocks' },
  { id: '4', name: 'Suspend Polyzone', activeIngredient: 'Deltamethrin 4.75%', epaNumber: '432-1514', unit: 'oz' },
  { id: '5', name: 'Phantom', activeIngredient: 'Chlorfenapyr 21.45%', epaNumber: '241-392', unit: 'oz' },
];

const pestTypeOptions = [
  'Ants', 'Termites', 'Cockroaches', 'Bed Bugs', 'Mice', 'Rats', 'Wasps', 'Spiders', 'Mosquitoes', 'Fleas', 'Ticks', 'Flies', 'Moths', 'Silverfish', 'Centipedes'
];

const treatmentAreaOptions = [
  'Interior - Kitchen', 'Interior - Bathroom', 'Interior - Basement', 'Interior - Attic', 'Interior - Garage',
  'Interior - Living Areas', 'Interior - Bedrooms', 'Exterior - Foundation', 'Exterior - Perimeter',
  'Exterior - Lawn', 'Exterior - Trees/Shrubs', 'Exterior - Eaves/Soffits', 'Crawl Space', 'Wall Voids'
];

const applicationMethodOptions = [
  'Crack & Crevice', 'Spot Treatment', 'Broadcast Spray', 'Barrier Treatment', 'Baiting', 'Dusting',
  'Fogging', 'Fumigation', 'Injection', 'Trapping', 'Exclusion', 'Granular Application'
];

const defaultLogs: TreatmentLog[] = [];

interface TreatmentLogToolProps {
  uiConfig?: UIConfig;
}

export const TreatmentLogTool = ({ uiConfig }: TreatmentLogToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use useToolData for backend sync
  const {
    data: logs,
    setData: setLogs,
    addItem: addLog,
    updateItem: updateLog,
    deleteItem: deleteLog,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<TreatmentLog>('pest-treatment-logs', defaultLogs, TREATMENT_LOG_COLUMNS);

  // Static data
  const [technicians] = useState<Technician[]>(defaultTechnicians);
  const [products] = useState<Product[]>(defaultProducts);

  // UI State
  const [activeTab, setActiveTab] = useState<'logs' | 'today' | 'follow-ups'>('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showAddLog, setShowAddLog] = useState(false);
  const [showViewLog, setShowViewLog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TreatmentLog | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Form state
  const [logForm, setLogForm] = useState<Partial<TreatmentLog>>({
    serviceType: 'regular',
    pestTypes: [],
    treatmentAreas: [],
    productsApplied: [],
    applicationMethods: [],
    weatherConditions: { temperature: 70, humidity: 50, windSpeed: 5, conditions: 'sunny' },
    customerSignature: false,
    followUpRequired: false,
    photos: [],
    status: 'completed',
    duration: 30,
  });

  const [productForm, setProductForm] = useState<Partial<ProductApplication>>({
    quantity: 0,
    dilutionRate: '',
    applicationRate: '',
    targetPests: [],
    areas: [],
  });

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.customerName || params.address || params.technicianName) {
        setIsPrefilled(true);
        setLogForm(prev => ({
          ...prev,
          customerName: params.customerName || '',
          address: params.address || '',
        }));
      }
    }
  }, [uiConfig?.params]);

  // Computed values
  const todayLogs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(l => l.date === today);
  }, [logs]);

  const followUpLogs = useMemo(() => {
    const today = new Date();
    return logs.filter(l => {
      if (!l.followUpRequired || !l.followUpDate) return false;
      const followUp = new Date(l.followUpDate);
      return followUp >= today;
    }).sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return logs.filter(log => {
      const logDate = new Date(log.date);

      const matchesSearch = searchTerm === '' ||
        log.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.pestTypes.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

      let matchesDate = true;
      if (filterDateRange === 'today') {
        matchesDate = log.date === today.toISOString().split('T')[0];
      } else if (filterDateRange === 'week') {
        matchesDate = logDate >= weekAgo;
      } else if (filterDateRange === 'month') {
        matchesDate = logDate >= monthAgo;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [logs, searchTerm, filterStatus, filterDateRange]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    return {
      totalLogs: logs.length,
      todayLogs: logs.filter(l => l.date === today).length,
      thisMonthLogs: logs.filter(l => l.date.startsWith(thisMonth)).length,
      pendingFollowUps: followUpLogs.length,
      completedToday: logs.filter(l => l.date === today && l.status === 'completed').length,
      requiresReturn: logs.filter(l => l.status === 'requires-return').length,
    };
  }, [logs, followUpLogs]);

  // Handlers
  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleAddLog = useCallback(() => {
    if (!logForm.date || !logForm.customerName || !logForm.technicianId) {
      setValidationMessage('Please fill in required fields (Date, Customer, Technician)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const technician = technicians.find(t => t.id === logForm.technicianId);

    const newLog: TreatmentLog = {
      id: generateId(),
      date: logForm.date || '',
      time: logForm.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      customerId: logForm.customerId || generateId(),
      customerName: logForm.customerName || '',
      address: logForm.address || '',
      technicianId: logForm.technicianId || '',
      technicianName: technician?.name || '',
      serviceType: logForm.serviceType || 'regular',
      pestTypes: logForm.pestTypes || [],
      treatmentAreas: logForm.treatmentAreas || [],
      productsApplied: logForm.productsApplied || [],
      applicationMethods: logForm.applicationMethods || [],
      weatherConditions: logForm.weatherConditions || { temperature: 70, humidity: 50, windSpeed: 5, conditions: 'sunny' },
      findings: logForm.findings || '',
      treatmentNotes: logForm.treatmentNotes || '',
      recommendations: logForm.recommendations || '',
      customerSignature: logForm.customerSignature || false,
      followUpRequired: logForm.followUpRequired || false,
      followUpDate: logForm.followUpDate || '',
      photos: logForm.photos || [],
      status: logForm.status || 'completed',
      duration: logForm.duration || 30,
      createdAt: new Date().toISOString(),
    };

    addLog(newLog);
    setShowAddLog(false);
    resetForm();
  }, [logForm, technicians, addLog]);

  const resetForm = () => {
    setLogForm({
      serviceType: 'regular',
      pestTypes: [],
      treatmentAreas: [],
      productsApplied: [],
      applicationMethods: [],
      weatherConditions: { temperature: 70, humidity: 50, windSpeed: 5, conditions: 'sunny' },
      customerSignature: false,
      followUpRequired: false,
      photos: [],
      status: 'completed',
      duration: 30,
    });
    setProductForm({
      quantity: 0,
      dilutionRate: '',
      applicationRate: '',
      targetPests: [],
      areas: [],
    });
  };

  const handleAddProduct = () => {
    if (!productForm.productId || !productForm.quantity) {
      setValidationMessage('Please select a product and enter quantity');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const product = products.find(p => p.id === productForm.productId);
    if (!product) return;

    const newProduct: ProductApplication = {
      productId: product.id,
      productName: product.name,
      activeIngredient: product.activeIngredient,
      epaNumber: product.epaNumber,
      quantity: productForm.quantity || 0,
      unit: product.unit,
      dilutionRate: productForm.dilutionRate || '',
      applicationRate: productForm.applicationRate || '',
      targetPests: productForm.targetPests || [],
      areas: productForm.areas || [],
    };

    setLogForm(prev => ({
      ...prev,
      productsApplied: [...(prev.productsApplied || []), newProduct],
    }));

    setProductForm({
      quantity: 0,
      dilutionRate: '',
      applicationRate: '',
      targetPests: [],
      areas: [],
    });
  };

  const handleRemoveProduct = (index: number) => {
    setLogForm(prev => ({
      ...prev,
      productsApplied: (prev.productsApplied || []).filter((_, i) => i !== index),
    }));
  };

  const toggleLogExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'requires-return': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  // Export handlers
  const handleExportCSV = () => {
    const exportData = logs.map(l => ({
      ...l,
      pestTypes: l.pestTypes.join(', '),
      treatmentAreas: l.treatmentAreas.join(', '),
    }));
    exportToCSV(exportData, TREATMENT_LOG_COLUMNS, { filename: 'pest-treatment-logs' });
  };

  const handleExportExcel = () => {
    const exportData = logs.map(l => ({
      ...l,
      pestTypes: l.pestTypes.join(', '),
      treatmentAreas: l.treatmentAreas.join(', '),
    }));
    exportToExcel(exportData, TREATMENT_LOG_COLUMNS, { filename: 'pest-treatment-logs' });
  };

  const handleExportJSON = () => {
    exportToJSON(logs, { filename: 'pest-treatment-logs' });
  };

  const handleExportPDF = async () => {
    const exportData = logs.map(l => ({
      ...l,
      pestTypes: l.pestTypes.join(', '),
      treatmentAreas: l.treatmentAreas.join(', '),
    }));
    await exportToPDF(exportData, TREATMENT_LOG_COLUMNS, {
      filename: 'pest-treatment-logs',
      title: 'Pest Control Treatment Logs',
      subtitle: `${logs.length} treatment records`,
    });
  };

  const handlePrint = () => {
    const exportData = logs.map(l => ({
      ...l,
      pestTypes: l.pestTypes.join(', '),
      treatmentAreas: l.treatmentAreas.join(', '),
    }));
    printData(exportData, TREATMENT_LOG_COLUMNS, { title: 'Pest Control Treatment Logs' });
  };

  const handleCopyToClipboard = async () => {
    const exportData = logs.map(l => ({
      ...l,
      pestTypes: l.pestTypes.join(', '),
      treatmentAreas: l.treatmentAreas.join(', '),
    }));
    return await copyUtil(exportData, TREATMENT_LOG_COLUMNS, 'tab');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.treatmentLog.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.treatmentLog.treatmentLog', 'Treatment Log')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.treatmentLog.trackAndDocumentPestControl', 'Track and document pest control treatments')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="treatment-log" toolName="Treatment Log" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalLogs}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.treatmentLog.totalLogs', 'Total Logs')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.todayLogs}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.treatmentLog.today', 'Today')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.thisMonthLogs}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.treatmentLog.thisMonth', 'This Month')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-green-500`}>
                {stats.completedToday}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.treatmentLog.completedToday', 'Completed Today')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-yellow-500`}>
                {stats.pendingFollowUps}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.treatmentLog.pendingFollowUps', 'Pending Follow-ups')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-orange-500`}>
                {stats.requiresReturn}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.treatmentLog.requiresReturn', 'Requires Return')}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'logs', label: 'All Logs', icon: <ClipboardList className="w-4 h-4" /> },
              { id: 'today', label: "Today's Logs", icon: <Calendar className="w-4 h-4" /> },
              { id: 'follow-ups', label: 'Follow-ups', icon: <AlertTriangle className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'follow-ups' && stats.pendingFollowUps > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                    {stats.pendingFollowUps}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.treatmentLog.searchByCustomerTechnicianAddress', 'Search by customer, technician, address, pest type...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            >
              <option value="all">{t('tools.treatmentLog.allStatus', 'All Status')}</option>
              <option value="completed">{t('tools.treatmentLog.completed', 'Completed')}</option>
              <option value="partial">{t('tools.treatmentLog.partial', 'Partial')}</option>
              <option value="requires-return">{t('tools.treatmentLog.requiresReturn2', 'Requires Return')}</option>
              <option value="cancelled">{t('tools.treatmentLog.cancelled', 'Cancelled')}</option>
            </select>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value as typeof filterDateRange)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            >
              <option value="all">{t('tools.treatmentLog.allTime', 'All Time')}</option>
              <option value="today">{t('tools.treatmentLog.today2', 'Today')}</option>
              <option value="week">{t('tools.treatmentLog.last7Days', 'Last 7 Days')}</option>
              <option value="month">{t('tools.treatmentLog.last30Days', 'Last 30 Days')}</option>
            </select>
            <button
              onClick={() => setShowAddLog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('tools.treatmentLog.addLog', 'Add Log')}
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-4">
          {(activeTab === 'today' ? todayLogs : activeTab === 'follow-ups' ? followUpLogs : filteredLogs).map((log) => (
            <div
              key={log.id}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}
            >
              {/* Log Header */}
              <div
                className={`p-4 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                onClick={() => toggleLogExpanded(log.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <FileText className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {log.customerName}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                        {log.followUpRequired && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30">
                            Follow-up: {formatDate(log.followUpDate)}
                          </span>
                        )}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {log.address}
                        </span>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-4`}>
                        <span>{formatDate(log.date)} at {log.time}</span>
                        <span>|</span>
                        <span>{log.technicianName}</span>
                        <span>|</span>
                        <span>{log.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.pestTypes.length > 0 && (
                      <div className="hidden md:flex items-center gap-1">
                        <Bug className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {log.pestTypes.slice(0, 2).join(', ')}{log.pestTypes.length > 2 ? ` +${log.pestTypes.length - 2}` : ''}
                        </span>
                      </div>
                    )}
                    {expandedLogs.has(log.id) ? (
                      <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedLogs.has(log.id) && (
                <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.treatmentLog.serviceDetails', 'Service Details')}
                        </h4>
                        <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div>Service Type: <span className="font-medium">{log.serviceType}</span></div>
                          <div>Pest Types: <span className="font-medium">{log.pestTypes.join(', ') || 'None specified'}</span></div>
                          <div>Treatment Areas: <span className="font-medium">{log.treatmentAreas.join(', ') || 'None specified'}</span></div>
                          <div>Application Methods: <span className="font-medium">{log.applicationMethods.join(', ') || 'None specified'}</span></div>
                        </div>
                      </div>

                      {log.productsApplied.length > 0 && (
                        <div>
                          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.treatmentLog.productsApplied', 'Products Applied')}
                          </h4>
                          <div className="space-y-2">
                            {log.productsApplied.map((product, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                              >
                                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {product.productName}
                                </div>
                                <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                  {product.quantity} {product.unit} | EPA: {product.epaNumber}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.treatmentLog.weatherConditions', 'Weather Conditions')}
                        </h4>
                        <div className={`flex gap-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="flex items-center gap-1">
                            <ThermometerSun className="w-4 h-4" />
                            {log.weatherConditions.temperature}°F
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets className="w-4 h-4" />
                            {log.weatherConditions.humidity}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Wind className="w-4 h-4" />
                            {log.weatherConditions.windSpeed} mph
                          </span>
                        </div>
                      </div>

                      {log.findings && (
                        <div>
                          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.treatmentLog.findings', 'Findings')}
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {log.findings}
                          </p>
                        </div>
                      )}

                      {log.recommendations && (
                        <div>
                          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.treatmentLog.recommendations', 'Recommendations')}
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {log.recommendations}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-2">
                        <span className={`flex items-center gap-1 text-sm ${log.customerSignature ? 'text-green-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <CheckCircle className="w-4 h-4" />
                          {log.customerSignature ? t('tools.treatmentLog.signed', 'Signed') : t('tools.treatmentLog.notSigned', 'Not signed')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex gap-2`}>
                    <button
                      onClick={() => { setSelectedLog(log); setShowViewLog(true); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      {t('tools.treatmentLog.viewFullReport', 'View Full Report')}
                    </button>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
              <ClipboardList className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.treatmentLog.noTreatmentLogsFound', 'No treatment logs found')}
              </h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.treatmentLog.startDocumentingYourPestControl', 'Start documenting your pest control treatments.')}
              </p>
              <button
                onClick={() => setShowAddLog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-5 h-5" />
                {t('tools.treatmentLog.addTreatmentLog', 'Add Treatment Log')}
              </button>
            </div>
          )}
        </div>

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />

        {/* Add Log Modal */}
        {showAddLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.treatmentLog.addTreatmentLog2', 'Add Treatment Log')}
                </h3>
                <button
                  onClick={() => { setShowAddLog(false); resetForm(); }}
                  className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={logForm.date || ''}
                      onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.time', 'Time')}
                    </label>
                    <input
                      type="time"
                      value={logForm.time || ''}
                      onChange={(e) => setLogForm({ ...logForm, time: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.technician', 'Technician *')}
                    </label>
                    <select
                      value={logForm.technicianId || ''}
                      onChange={(e) => setLogForm({ ...logForm, technicianId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    >
                      <option value="">{t('tools.treatmentLog.selectTechnician', 'Select Technician')}</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.licenseNumber})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.customerName', 'Customer Name *')}
                    </label>
                    <input
                      type="text"
                      value={logForm.customerName || ''}
                      onChange={(e) => setLogForm({ ...logForm, customerName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                      placeholder={t('tools.treatmentLog.enterCustomerName', 'Enter customer name')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.address', 'Address')}
                    </label>
                    <input
                      type="text"
                      value={logForm.address || ''}
                      onChange={(e) => setLogForm({ ...logForm, address: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                      placeholder={t('tools.treatmentLog.serviceAddress', 'Service address')}
                    />
                  </div>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.serviceType', 'Service Type')}
                    </label>
                    <select
                      value={logForm.serviceType || 'regular'}
                      onChange={(e) => setLogForm({ ...logForm, serviceType: e.target.value as TreatmentLog['serviceType'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    >
                      <option value="initial">Initial</option>
                      <option value="regular">{t('tools.treatmentLog.regular', 'Regular')}</option>
                      <option value="callback">{t('tools.treatmentLog.callback', 'Callback')}</option>
                      <option value="follow-up">{t('tools.treatmentLog.followUp', 'Follow-up')}</option>
                      <option value="emergency">{t('tools.treatmentLog.emergency', 'Emergency')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.durationMinutes', 'Duration (minutes)')}
                    </label>
                    <input
                      type="number"
                      value={logForm.duration || 30}
                      onChange={(e) => setLogForm({ ...logForm, duration: parseInt(e.target.value) || 30 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.status', 'Status')}
                    </label>
                    <select
                      value={logForm.status || 'completed'}
                      onChange={(e) => setLogForm({ ...logForm, status: e.target.value as TreatmentLog['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    >
                      <option value="completed">{t('tools.treatmentLog.completed2', 'Completed')}</option>
                      <option value="partial">{t('tools.treatmentLog.partial2', 'Partial')}</option>
                      <option value="requires-return">{t('tools.treatmentLog.requiresReturn3', 'Requires Return')}</option>
                      <option value="cancelled">{t('tools.treatmentLog.cancelled2', 'Cancelled')}</option>
                    </select>
                  </div>
                </div>

                {/* Pest Types */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.treatmentLog.pestTypes', 'Pest Types')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {pestTypeOptions.map((pest) => (
                      <button
                        key={pest}
                        type="button"
                        onClick={() => setLogForm({
                          ...logForm,
                          pestTypes: toggleArrayItem(logForm.pestTypes || [], pest),
                        })}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          (logForm.pestTypes || []).includes(pest)
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Treatment Areas */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.treatmentLog.treatmentAreas', 'Treatment Areas')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {treatmentAreaOptions.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setLogForm({
                          ...logForm,
                          treatmentAreas: toggleArrayItem(logForm.treatmentAreas || [], area),
                        })}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          (logForm.treatmentAreas || []).includes(area)
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.findings2', 'Findings')}
                    </label>
                    <textarea
                      value={logForm.findings || ''}
                      onChange={(e) => setLogForm({ ...logForm, findings: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                      placeholder={t('tools.treatmentLog.describeFindingsDuringInspection', 'Describe findings during inspection...')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.recommendations2', 'Recommendations')}
                    </label>
                    <textarea
                      value={logForm.recommendations || ''}
                      onChange={(e) => setLogForm({ ...logForm, recommendations: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                      placeholder={t('tools.treatmentLog.recommendationsForCustomer', 'Recommendations for customer...')}
                    />
                  </div>
                </div>

                {/* Follow-up */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logForm.followUpRequired || false}
                      onChange={(e) => setLogForm({ ...logForm, followUpRequired: e.target.checked })}
                      className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.treatmentLog.followUpRequired', 'Follow-up Required')}
                    </span>
                  </label>
                  {logForm.followUpRequired && (
                    <input
                      type="date"
                      value={logForm.followUpDate || ''}
                      onChange={(e) => setLogForm({ ...logForm, followUpDate: e.target.value })}
                      className={`px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-inherit">
                <button
                  onClick={() => { setShowAddLog(false); resetForm(); }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.treatmentLog.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddLog}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.treatmentLog.saveTreatmentLog', 'Save Treatment Log')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentLogTool;
