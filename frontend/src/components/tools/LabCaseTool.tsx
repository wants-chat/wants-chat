'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  FlaskConical,
  User,
  Calendar,
  Phone,
  Mail,
  Package,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Truck,
  Building,
  DollarSign,
  Filter,
  Eye,
  Printer,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
type CaseType = 'crown' | 'bridge' | 'denture' | 'partial' | 'implant' | 'night_guard' | 'whitening_tray' | 'retainer' | 'veneer' | 'inlay_onlay' | 'other';
type CaseStatus = 'pending' | 'in_progress' | 'at_lab' | 'shipped' | 'received' | 'try_in' | 'adjustment' | 'completed' | 'cancelled';
type MaterialType = 'pfm' | 'zirconia' | 'emax' | 'gold' | 'acrylic' | 'flexible' | 'metal' | 'composite' | 'other';
type ShadeGuide = 'vita_classical' | 'vita_3d' | 'ivoclar' | 'custom';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface DentalLab {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  turnaroundDays: number;
}

interface LabCase {
  id: string;
  caseNumber: string;
  patientId: string;
  patient: Patient;
  labId: string;
  lab: DentalLab;
  caseType: CaseType;
  material: MaterialType;
  shade: string;
  shadeGuide: ShadeGuide;
  toothNumbers: number[];
  status: CaseStatus;
  priority: 'normal' | 'rush' | 'stat';
  sentToLabDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  appointmentDate?: string;
  cost: number;
  patientCharge: number;
  prescriptionNotes: string;
  labNotes: string;
  tracking: CaseTracking[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface CaseTracking {
  id: string;
  date: string;
  status: CaseStatus;
  notes: string;
  updatedBy: string;
}

type TabType = 'cases' | 'labs' | 'analytics';

const CASE_TYPES: { value: CaseType; label: string; avgDays: number }[] = [
  { value: 'crown', label: 'Crown', avgDays: 10 },
  { value: 'bridge', label: 'Bridge', avgDays: 12 },
  { value: 'denture', label: 'Full Denture', avgDays: 21 },
  { value: 'partial', label: 'Partial Denture', avgDays: 14 },
  { value: 'implant', label: 'Implant Crown/Abutment', avgDays: 14 },
  { value: 'night_guard', label: 'Night Guard', avgDays: 7 },
  { value: 'whitening_tray', label: 'Whitening Tray', avgDays: 5 },
  { value: 'retainer', label: 'Retainer', avgDays: 7 },
  { value: 'veneer', label: 'Veneer', avgDays: 10 },
  { value: 'inlay_onlay', label: 'Inlay/Onlay', avgDays: 10 },
  { value: 'other', label: 'Other', avgDays: 14 },
];

const MATERIALS: { value: MaterialType; label: string }[] = [
  { value: 'pfm', label: 'Porcelain Fused to Metal (PFM)' },
  { value: 'zirconia', label: 'Zirconia' },
  { value: 'emax', label: 'E.max (Lithium Disilicate)' },
  { value: 'gold', label: 'Gold' },
  { value: 'acrylic', label: 'Acrylic' },
  { value: 'flexible', label: 'Flexible Partial' },
  { value: 'metal', label: 'Metal Framework' },
  { value: 'composite', label: 'Composite' },
  { value: 'other', label: 'Other' },
];

const STATUS_COLORS: Record<CaseStatus, string> = {
  pending: '#6b7280',
  in_progress: '#3b82f6',
  at_lab: '#8b5cf6',
  shipped: '#f59e0b',
  received: '#10b981',
  try_in: '#ec4899',
  adjustment: '#f97316',
  completed: '#059669',
  cancelled: '#dc2626',
};

const SHADE_TABS = ['A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D2', 'D3', 'D4'];

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateCaseNumber = () => `LAB-${Date.now().toString().slice(-6)}`;

// Column configurations for export
const labCaseColumns: ColumnConfig[] = [
  { key: 'caseNumber', header: 'Case #', type: 'string' },
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'labName', header: 'Lab', type: 'string' },
  { key: 'caseType', header: 'Type', type: 'string' },
  { key: 'material', header: 'Material', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'sentToLabDate', header: 'Sent Date', type: 'date' },
  { key: 'expectedReturnDate', header: 'Expected Return', type: 'date' },
  { key: 'cost', header: 'Lab Cost', type: 'currency' },
  { key: 'patientCharge', header: 'Patient Charge', type: 'currency' },
];

const DEFAULT_LABS: DentalLab[] = [
  {
    id: generateId(),
    name: 'Premier Dental Lab',
    contactName: 'John Smith',
    phone: '(555) 123-4567',
    email: 'orders@premierlab.com',
    address: '123 Lab Street, City, ST 12345',
    turnaroundDays: 10,
  },
  {
    id: generateId(),
    name: 'Excellence Dental Studio',
    contactName: 'Sarah Johnson',
    phone: '(555) 987-6543',
    email: 'cases@excellencelab.com',
    address: '456 Dental Ave, Town, ST 67890',
    turnaroundDays: 7,
  },
];

interface LabCaseToolProps {
  uiConfig?: UIConfig;
}

export const LabCaseTool: React.FC<LabCaseToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('cases');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<CaseStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<CaseType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLabForm, setShowLabForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LabCase | null>(null);
  const [editingCase, setEditingCase] = useState<LabCase | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Initialize useToolData hooks for backend persistence
  const {
    data: cases,
    addItem: addCase,
    updateItem: updateCase,
    deleteItem: deleteCase,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<LabCase>(
    'dental-lab-cases',
    [],
    labCaseColumns,
    { autoSave: true }
  );

  const {
    data: labs,
    addItem: addLab,
    updateItem: updateLab,
    deleteItem: deleteLab,
  } = useToolData<DentalLab>(
    'dental-labs',
    DEFAULT_LABS,
    [],
    { autoSave: true }
  );

  // Form state
  const [newCase, setNewCase] = useState<Partial<LabCase>>({
    patient: { id: '', firstName: '', lastName: '', phone: '', email: '' },
    lab: labs[0] || { id: '', name: '', contactName: '', phone: '', email: '', address: '', turnaroundDays: 10 },
    caseType: 'crown',
    material: 'zirconia',
    shade: 'A2',
    shadeGuide: 'vita_classical',
    toothNumbers: [],
    priority: 'normal',
    cost: 0,
    patientCharge: 0,
  });

  const [newLab, setNewLab] = useState<Partial<DentalLab>>({});

  // Export handlers
  const handleExportCSV = () => {
    const exportData = cases.map(c => ({
      ...c,
      patientName: `${c.patient.firstName} ${c.patient.lastName}`,
      labName: c.lab.name,
    }));
    exportToCSV(exportData, labCaseColumns, { filename: 'lab-cases-export' });
  };

  const handleExportExcel = () => {
    const exportData = cases.map(c => ({
      ...c,
      patientName: `${c.patient.firstName} ${c.patient.lastName}`,
      labName: c.lab.name,
    }));
    exportToExcel(exportData, labCaseColumns, { filename: 'lab-cases-export' });
  };

  const handleExportJSON = () => {
    exportToJSON(cases, { filename: 'lab-cases-export' });
  };

  const handleExportPDF = async () => {
    const exportData = cases.map(c => ({
      ...c,
      patientName: `${c.patient.firstName} ${c.patient.lastName}`,
      labName: c.lab.name,
    }));
    await exportToPDF(exportData, labCaseColumns, {
      filename: 'lab-cases-export',
      title: 'Lab Case Tracking Report',
    });
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const exportData = cases.map(c => ({
      ...c,
      patientName: `${c.patient.firstName} ${c.patient.lastName}`,
      labName: c.lab.name,
    }));
    return copyUtil(exportData, labCaseColumns);
  };

  const handlePrint = () => {
    const exportData = cases.map(c => ({
      ...c,
      patientName: `${c.patient.firstName} ${c.patient.lastName}`,
      labName: c.lab.name,
    }));
    printData(exportData, labCaseColumns, { title: 'Lab Case Tracking Report' });
  };

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.patientName || params.firstName) {
        setNewCase({
          ...newCase,
          patient: {
            ...newCase.patient!,
            firstName: params.firstName || '',
            lastName: params.lastName || '',
          },
        });
        setShowAddForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch =
      `${c.patient.firstName} ${c.patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lab.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesType = filterType === 'all' || c.caseType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort cases by expected return date
  const sortedCases = [...filteredCases].sort((a, b) => {
    if (!a.expectedReturnDate) return 1;
    if (!b.expectedReturnDate) return -1;
    return new Date(a.expectedReturnDate).getTime() - new Date(b.expectedReturnDate).getTime();
  });

  // Add new case
  const handleAddCase = () => {
    if (!newCase.patient?.firstName || !newCase.patient?.lastName) {
      setValidationMessage('Please fill in patient name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const selectedLab = labs.find(l => l.id === newCase.labId) || labs[0];
    const caseTypeInfo = CASE_TYPES.find(t => t.value === newCase.caseType);
    const turnaroundDays = selectedLab?.turnaroundDays || caseTypeInfo?.avgDays || 10;

    const sentDate = new Date();
    const expectedReturn = new Date();
    expectedReturn.setDate(expectedReturn.getDate() + turnaroundDays);

    const labCase: LabCase = {
      id: generateId(),
      caseNumber: generateCaseNumber(),
      patientId: newCase.patient.id || generateId(),
      patient: {
        id: newCase.patient.id || generateId(),
        firstName: newCase.patient.firstName,
        lastName: newCase.patient.lastName,
        phone: newCase.patient.phone || '',
        email: newCase.patient.email || '',
      },
      labId: selectedLab.id,
      lab: selectedLab,
      caseType: newCase.caseType || 'crown',
      material: newCase.material || 'zirconia',
      shade: newCase.shade || 'A2',
      shadeGuide: newCase.shadeGuide || 'vita_classical',
      toothNumbers: newCase.toothNumbers || [],
      status: 'pending',
      priority: newCase.priority || 'normal',
      sentToLabDate: sentDate.toISOString().split('T')[0],
      expectedReturnDate: expectedReturn.toISOString().split('T')[0],
      cost: newCase.cost || 0,
      patientCharge: newCase.patientCharge || 0,
      prescriptionNotes: newCase.prescriptionNotes || '',
      labNotes: '',
      tracking: [
        {
          id: generateId(),
          date: new Date().toISOString(),
          status: 'pending',
          notes: 'Case created',
          updatedBy: 'System',
        },
      ],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addCase(labCase);
    setNewCase({
      patient: { id: '', firstName: '', lastName: '', phone: '', email: '' },
      lab: labs[0] || { id: '', name: '', contactName: '', phone: '', email: '', address: '', turnaroundDays: 10 },
      caseType: 'crown',
      material: 'zirconia',
      shade: 'A2',
      shadeGuide: 'vita_classical',
      toothNumbers: [],
      priority: 'normal',
      cost: 0,
      patientCharge: 0,
    });
    setShowAddForm(false);
  };

  // Update case status
  const handleUpdateStatus = (caseId: string, status: CaseStatus, notes?: string) => {
    const labCase = cases.find(c => c.id === caseId);
    if (!labCase) return;

    const tracking: CaseTracking = {
      id: generateId(),
      date: new Date().toISOString(),
      status,
      notes: notes || `Status changed to ${status}`,
      updatedBy: 'User',
    };

    const updates: Partial<LabCase> = {
      status,
      tracking: [...labCase.tracking, tracking],
      updatedAt: new Date().toISOString(),
    };

    if (status === 'received') {
      updates.actualReturnDate = new Date().toISOString().split('T')[0];
    }

    updateCase(caseId, updates);
  };

  // Add new lab
  const handleAddLab = () => {
    if (!newLab.name) {
      setValidationMessage('Please enter lab name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const lab: DentalLab = {
      id: generateId(),
      name: newLab.name || '',
      contactName: newLab.contactName || '',
      phone: newLab.phone || '',
      email: newLab.email || '',
      address: newLab.address || '',
      turnaroundDays: newLab.turnaroundDays || 10,
    };

    addLab(lab);
    setNewLab({});
    setShowLabForm(false);
  };

  // Analytics
  const getAnalytics = () => {
    const activeCases = cases.filter(c => c.status !== 'completed' && c.status !== 'cancelled');
    const completedCases = cases.filter(c => c.status === 'completed');
    const overdueCases = activeCases.filter(c => {
      if (!c.expectedReturnDate) return false;
      return new Date(c.expectedReturnDate) < new Date();
    });

    const totalLabCost = cases.reduce((acc, c) => acc + c.cost, 0);
    const totalPatientCharge = cases.reduce((acc, c) => acc + c.patientCharge, 0);
    const profit = totalPatientCharge - totalLabCost;

    const casesByType = CASE_TYPES.map(type => ({
      ...type,
      count: cases.filter(c => c.caseType === type.value).length,
    }));

    const casesByLab = labs.map(lab => ({
      ...lab,
      caseCount: cases.filter(c => c.labId === lab.id).length,
    }));

    return {
      totalCases: cases.length,
      activeCases: activeCases.length,
      completedCases: completedCases.length,
      overdueCases: overdueCases.length,
      totalLabCost,
      totalPatientCharge,
      profit,
      casesByType,
      casesByLab,
    };
  };

  const analytics = getAnalytics();

  const getCaseTypeLabel = (type: CaseType) => CASE_TYPES.find(t => t.value === type)?.label || type;
  const getMaterialLabel = (material: MaterialType) => MATERIALS.find(m => m.value === material)?.label || material;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
              <FlaskConical className={`w-6 h-6 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <div>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.labCase.dentalLabCaseTracker', 'Dental Lab Case Tracker')}
              </CardTitle>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.labCase.trackAndManageDentalLab', 'Track and manage dental lab cases')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="lab-case" toolName="Lab Case" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopyToClipboard}
              onPrint={handlePrint}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <Package className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.activeCases}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.labCase.activeCases', 'Active Cases')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'}`}>
                <AlertCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.overdueCases}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.labCase.overdue', 'Overdue')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <CheckCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.completedCases}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.labCase.completed3', 'Completed')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
                <DollarSign className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.profit.toLocaleString()}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.labCase.profit2', 'Profit')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {(['cases', 'labs', 'analytics'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab
                ? theme === 'dark'
                  ? 'bg-gray-800 text-white border-b-2 border-amber-500'
                  : 'bg-white text-amber-600 border-b-2 border-amber-500'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-4 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.labCase.searchCases', 'Search cases...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                {t('tools.labCase.filters', 'Filters')}
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                <Plus className="w-4 h-4" />
                {t('tools.labCase.newCase', 'New Case')}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.labCase.status', 'Status')}
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as CaseStatus | 'all')}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.labCase.allStatuses', 'All Statuses')}</option>
                    <option value="pending">{t('tools.labCase.pending', 'Pending')}</option>
                    <option value="in_progress">{t('tools.labCase.inProgress', 'In Progress')}</option>
                    <option value="at_lab">{t('tools.labCase.atLab', 'At Lab')}</option>
                    <option value="shipped">{t('tools.labCase.shipped', 'Shipped')}</option>
                    <option value="received">{t('tools.labCase.received', 'Received')}</option>
                    <option value="try_in">{t('tools.labCase.tryIn', 'Try In')}</option>
                    <option value="completed">{t('tools.labCase.completed', 'Completed')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.labCase.caseType', 'Case Type')}
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as CaseType | 'all')}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.labCase.allTypes', 'All Types')}</option>
                    {CASE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Add Form */}
            {showAddForm && (
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.labCase.newLabCase', 'New Lab Case')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.patientFirstName', 'Patient First Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCase.patient?.firstName || ''}
                      onChange={(e) => setNewCase({
                        ...newCase,
                        patient: { ...newCase.patient!, firstName: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.patientLastName', 'Patient Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCase.patient?.lastName || ''}
                      onChange={(e) => setNewCase({
                        ...newCase,
                        patient: { ...newCase.patient!, lastName: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.lab', 'Lab')}
                    </label>
                    <select
                      value={newCase.labId || labs[0]?.id || ''}
                      onChange={(e) => setNewCase({ ...newCase, labId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {labs.map(lab => (
                        <option key={lab.id} value={lab.id}>{lab.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.caseType2', 'Case Type')}
                    </label>
                    <select
                      value={newCase.caseType || 'crown'}
                      onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value as CaseType })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {CASE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.material', 'Material')}
                    </label>
                    <select
                      value={newCase.material || 'zirconia'}
                      onChange={(e) => setNewCase({ ...newCase, material: e.target.value as MaterialType })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {MATERIALS.map(material => (
                        <option key={material.value} value={material.value}>{material.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.shade', 'Shade')}
                    </label>
                    <select
                      value={newCase.shade || 'A2'}
                      onChange={(e) => setNewCase({ ...newCase, shade: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {SHADE_TABS.map(shade => (
                        <option key={shade} value={shade}>{shade}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.toothNumbersCommaSeparated', 'Tooth Numbers (comma separated)')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 14, 15, 16"
                      onChange={(e) => {
                        const numbers = e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                        setNewCase({ ...newCase, toothNumbers: numbers });
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.labCost', 'Lab Cost ($)')}
                    </label>
                    <input
                      type="number"
                      value={newCase.cost || ''}
                      onChange={(e) => setNewCase({ ...newCase, cost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.patientCharge', 'Patient Charge ($)')}
                    </label>
                    <input
                      type="number"
                      value={newCase.patientCharge || ''}
                      onChange={(e) => setNewCase({ ...newCase, patientCharge: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.labCase.prescriptionNotes', 'Prescription Notes')}
                  </label>
                  <textarea
                    value={newCase.prescriptionNotes || ''}
                    onChange={(e) => setNewCase({ ...newCase, prescriptionNotes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.labCase.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleAddCase}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    {t('tools.labCase.createCase', 'Create Case')}
                  </button>
                </div>
              </div>
            )}

            {/* Cases List */}
            <div className="space-y-4">
              {sortedCases.length === 0 ? (
                <div className="text-center py-12">
                  <FlaskConical className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.labCase.noLabCasesFoundCreate', 'No lab cases found. Create a new case to get started.')}
                  </p>
                </div>
              ) : (
                sortedCases.map((labCase) => (
                  <div
                    key={labCase.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                          <FlaskConical className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {labCase.caseNumber}
                            </h3>
                            {labCase.priority === 'rush' && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
                                {t('tools.labCase.rush', 'RUSH')}
                              </span>
                            )}
                            {labCase.priority === 'stat' && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                                {t('tools.labCase.stat', 'STAT')}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {labCase.patient.firstName} {labCase.patient.lastName}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getCaseTypeLabel(labCase.caseType)} - {getMaterialLabel(labCase.material)} - Shade: {labCase.shade}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Lab: {labCase.lab.name} | Teeth: {labCase.toothNumbers.join(', ') || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-center">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.labCase.expected', 'Expected')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {labCase.expectedReturnDate ? new Date(labCase.expectedReturnDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.labCase.cost', 'Cost')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${labCase.cost}
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full text-white"
                          style={{ backgroundColor: STATUS_COLORS[labCase.status] }}
                        >
                          {labCase.status.replace('_', ' ')}
                        </span>
                        <select
                          value={labCase.status}
                          onChange={(e) => handleUpdateStatus(labCase.id, e.target.value as CaseStatus)}
                          className={`px-2 py-1 text-sm rounded border ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="pending">{t('tools.labCase.pending2', 'Pending')}</option>
                          <option value="in_progress">{t('tools.labCase.inProgress2', 'In Progress')}</option>
                          <option value="at_lab">{t('tools.labCase.atLab2', 'At Lab')}</option>
                          <option value="shipped">{t('tools.labCase.shipped2', 'Shipped')}</option>
                          <option value="received">{t('tools.labCase.received2', 'Received')}</option>
                          <option value="try_in">{t('tools.labCase.tryIn2', 'Try In')}</option>
                          <option value="adjustment">{t('tools.labCase.adjustment', 'Adjustment')}</option>
                          <option value="completed">{t('tools.labCase.completed2', 'Completed')}</option>
                          <option value="cancelled">{t('tools.labCase.cancelled', 'Cancelled')}</option>
                        </select>
                        <button
                          onClick={() => deleteCase(labCase.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Labs Tab */}
      {activeTab === 'labs' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              {t('tools.labCase.dentalLabs', 'Dental Labs')}
            </CardTitle>
            <button
              onClick={() => setShowLabForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              {t('tools.labCase.addLab', 'Add Lab')}
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showLabForm && (
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.labName', 'Lab Name *')}
                    </label>
                    <input
                      type="text"
                      value={newLab.name || ''}
                      onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.contactName', 'Contact Name')}
                    </label>
                    <input
                      type="text"
                      value={newLab.contactName || ''}
                      onChange={(e) => setNewLab({ ...newLab, contactName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newLab.phone || ''}
                      onChange={(e) => setNewLab({ ...newLab, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={newLab.email || ''}
                      onChange={(e) => setNewLab({ ...newLab, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.labCase.turnaroundDays', 'Turnaround Days')}
                    </label>
                    <input
                      type="number"
                      value={newLab.turnaroundDays || 10}
                      onChange={(e) => setNewLab({ ...newLab, turnaroundDays: parseInt(e.target.value) || 10 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowLabForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.labCase.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={handleAddLab}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    {t('tools.labCase.addLab2', 'Add Lab')}
                  </button>
                </div>
              </div>
            )}

            {labs.map((lab) => (
              <div
                key={lab.id}
                className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                      <Building className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {lab.name}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Contact: {lab.contactName || 'N/A'} | {lab.phone || 'No phone'}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Avg turnaround: {lab.turnaroundDays} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {analytics.casesByLab.find(l => l.id === lab.id)?.caseCount || 0} cases
                    </span>
                    <button
                      onClick={() => deleteLab(lab.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              {t('tools.labCase.labCaseAnalytics', 'Lab Case Analytics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.labCase.casesByType', 'Cases by Type')}
                </h4>
                <div className="space-y-3">
                  {analytics.casesByType.filter(t => t.count > 0).map((type) => (
                    <div key={type.value} className="flex items-center justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {type.label}
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {type.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.labCase.financialSummary', 'Financial Summary')}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.labCase.totalLabCosts', 'Total Lab Costs')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${analytics.totalLabCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.labCase.totalPatientCharges', 'Total Patient Charges')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${analytics.totalPatientCharge.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-600">
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.labCase.profit', 'Profit')}</span>
                    <span className={`font-bold text-green-500`}>
                      ${analytics.profit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-4 sm:max-w-md bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{validationMessage}</span>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default LabCaseTool;
