'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Pill,
  User,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Phone,
  Building2,
  Calendar,
  Hash,
  Loader2,
  RefreshCw,
  Package,
  CreditCard,
  Stethoscope,
} from 'lucide-react';

// Types
interface Prescription {
  id: string;
  rxNumber: string;
  patientName: string;
  patientPhone: string;
  patientDOB: string;
  patientAllergies: string;
  prescriberName: string;
  prescriberNPI: string;
  prescriberPhone: string;
  drugName: string;
  drugNDC: string;
  strength: string;
  quantity: number;
  daysSupply: number;
  directions: string;
  refillsRemaining: number;
  refillsAuthorized: number;
  dateWritten: string;
  dateReceived: string;
  dateFilled: string;
  datePickedUp: string;
  expirationDate: string;
  insuranceName: string;
  insuranceBIN: string;
  insurancePCN: string;
  insuranceGroupId: string;
  insuranceMemberId: string;
  copay: number;
  totalCost: number;
  insurancePaid: number;
  status: 'received' | 'in_progress' | 'ready' | 'picked_up' | 'cancelled' | 'on_hold';
  priority: 'normal' | 'urgent' | 'stat';
  pharmacistInitials: string;
  technicianInitials: string;
  notes: string;
  daw: number; // Dispense as Written code
  createdAt: string;
  updatedAt: string;
}

// Default values
const defaultPrescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'> = {
  rxNumber: '',
  patientName: '',
  patientPhone: '',
  patientDOB: '',
  patientAllergies: '',
  prescriberName: '',
  prescriberNPI: '',
  prescriberPhone: '',
  drugName: '',
  drugNDC: '',
  strength: '',
  quantity: 0,
  daysSupply: 30,
  directions: '',
  refillsRemaining: 0,
  refillsAuthorized: 0,
  dateWritten: '',
  dateReceived: new Date().toISOString().split('T')[0],
  dateFilled: '',
  datePickedUp: '',
  expirationDate: '',
  insuranceName: '',
  insuranceBIN: '',
  insurancePCN: '',
  insuranceGroupId: '',
  insuranceMemberId: '',
  copay: 0,
  totalCost: 0,
  insurancePaid: 0,
  status: 'received',
  priority: 'normal',
  pharmacistInitials: '',
  technicianInitials: '',
  notes: '',
  daw: 0,
};

const STATUS_OPTIONS = [
  { value: 'received', label: 'Received', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'ready', label: 'Ready for Pickup', color: 'bg-green-500' },
  { value: 'picked_up', label: 'Picked Up', color: 'bg-gray-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-orange-500' },
];

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal', color: 'text-gray-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-orange-600' },
  { value: 'stat', label: 'STAT', color: 'text-red-600' },
];

const DAW_CODES = [
  { value: 0, label: '0 - No product selection indicated' },
  { value: 1, label: '1 - Substitution not allowed by prescriber' },
  { value: 2, label: '2 - Substitution allowed - patient requested' },
  { value: 3, label: '3 - Substitution allowed - pharmacist selected' },
  { value: 4, label: '4 - Substitution allowed - generic not in stock' },
  { value: 5, label: '5 - Substitution allowed - brand dispensed as generic' },
  { value: 6, label: '6 - Override' },
  { value: 7, label: '7 - Substitution not allowed - brand mandated by law' },
  { value: 8, label: '8 - Substitution allowed - generic not available' },
  { value: 9, label: '9 - Other' },
];

// Column configuration for exports
const PRESCRIPTION_COLUMNS: ColumnConfig[] = [
  { key: 'rxNumber', header: 'Rx Number', type: 'string' },
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'patientPhone', header: 'Patient Phone', type: 'string' },
  { key: 'drugName', header: 'Drug Name', type: 'string' },
  { key: 'strength', header: 'Strength', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'daysSupply', header: 'Days Supply', type: 'number' },
  { key: 'directions', header: 'Directions', type: 'string' },
  { key: 'refillsRemaining', header: 'Refills Remaining', type: 'number' },
  { key: 'prescriberName', header: 'Prescriber', type: 'string' },
  { key: 'dateWritten', header: 'Date Written', type: 'date' },
  { key: 'dateFilled', header: 'Date Filled', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'copay', header: 'Copay', type: 'currency' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'insurancePaid', header: 'Insurance Paid', type: 'currency' },
  { key: 'pharmacistInitials', header: 'Pharmacist', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

interface PrescriptionFillingToolProps {
  uiConfig?: UIConfig;
}

export const PrescriptionFillingTool = ({ uiConfig }: PrescriptionFillingToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // useToolData hook for backend persistence
  const {
    data: prescriptions,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<Prescription>('prescription-filling', [], PRESCRIPTION_COLUMNS);

  // Local state
  const [activeTab, setActiveTab] = useState<'queue' | 'form' | 'search'>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultPrescription);
  const [showForm, setShowForm] = useState(false);

  // Generate Rx number
  const generateRxNumber = () => {
    const prefix = 'RX';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
  };

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.patientName) {
        setFormData(prev => ({ ...prev, patientName: params.patientName as string }));
        setShowForm(true);
        setActiveTab('form');
      }
      if (params.drugName) {
        setFormData(prev => ({ ...prev, drugName: params.drugName as string }));
      }
    }
  }, [uiConfig?.params]);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(rx => {
      const matchesSearch =
        rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.rxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.drugName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || rx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      received: prescriptions.filter(rx => rx.status === 'received').length,
      inProgress: prescriptions.filter(rx => rx.status === 'in_progress').length,
      ready: prescriptions.filter(rx => rx.status === 'ready').length,
      filledToday: prescriptions.filter(rx => rx.dateFilled === today).length,
      urgent: prescriptions.filter(rx => rx.priority === 'urgent' || rx.priority === 'stat').length,
    };
  }, [prescriptions]);

  // Handle form submit
  const handleSubmit = () => {
    const now = new Date().toISOString();

    if (editingId) {
      updateItem(editingId, {
        ...formData,
        updatedAt: now,
      });
      setEditingId(null);
    } else {
      const newRx: Prescription = {
        ...formData,
        id: crypto.randomUUID(),
        rxNumber: formData.rxNumber || generateRxNumber(),
        createdAt: now,
        updatedAt: now,
      };
      addItem(newRx);
    }

    setFormData(defaultPrescription);
    setShowForm(false);
    setActiveTab('queue');
  };

  // Handle edit
  const handleEdit = (rx: Prescription) => {
    setFormData(rx);
    setEditingId(rx.id);
    setShowForm(true);
    setActiveTab('form');
  };

  // Handle status change
  const handleStatusChange = (id: string, newStatus: Prescription['status']) => {
    const rx = prescriptions.find(p => p.id === id);
    if (rx) {
      const updates: Partial<Prescription> = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      if (newStatus === 'ready' && !rx.dateFilled) {
        updates.dateFilled = new Date().toISOString().split('T')[0];
      }
      if (newStatus === 'picked_up' && !rx.datePickedUp) {
        updates.datePickedUp = new Date().toISOString().split('T')[0];
      }

      updateItem(id, updates);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData(defaultPrescription);
    setEditingId(null);
    setShowForm(false);
    setActiveTab('queue');
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
            <Pill className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('tools.prescriptionFilling.prescriptionFilling', 'Prescription Filling')}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.prescriptionFilling.manageAndTrackPrescriptionOrders', 'Manage and track prescription orders')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="prescription-filling" toolName="Prescription Filling" />

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
          <button
            onClick={forceSync}
            disabled={isSaving}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title={t('tools.prescriptionFilling.forceSync', 'Force sync')}
          >
            <RefreshCw className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionFilling.received', 'Received')}</p>
                <p className="text-2xl font-bold text-blue-500">{stats.received}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionFilling.inProgress', 'In Progress')}</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionFilling.ready', 'Ready')}</p>
                <p className="text-2xl font-bold text-green-500">{stats.ready}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionFilling.filledToday', 'Filled Today')}</p>
                <p className="text-2xl font-bold text-purple-500">{stats.filledToday}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.prescriptionFilling.urgent', 'Urgent')}</p>
                <p className="text-2xl font-bold text-red-500">{stats.urgent}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'queue', label: 'Rx Queue', icon: FileText },
          { id: 'form', label: showForm ? (editingId ? t('tools.prescriptionFilling.editRx', 'Edit Rx') : t('tools.prescriptionFilling.newRx', 'New Rx')) : 'New Rx', icon: Plus },
          { id: 'search', label: 'Search', icon: Search },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as typeof activeTab);
              if (tab.id === 'form' && !showForm) {
                setShowForm(true);
                setFormData(defaultPrescription);
                setEditingId(null);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
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

      {/* Queue Tab */}
      {activeTab === 'queue' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('tools.prescriptionFilling.prescriptionQueue', 'Prescription Queue')}
              </CardTitle>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">{t('tools.prescriptionFilling.allStatus', 'All Status')}</option>
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.prescriptionFilling.search', 'Search...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {t('tools.prescriptionFilling.noPrescriptionsFound', 'No prescriptions found')}
                </p>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setActiveTab('form');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {t('tools.prescriptionFilling.addFirstPrescription', 'Add First Prescription')}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                      <th className="text-left py-3 px-4 font-medium">{t('tools.prescriptionFilling.rx', 'Rx #')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('tools.prescriptionFilling.patient', 'Patient')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('tools.prescriptionFilling.drug', 'Drug')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('tools.prescriptionFilling.qty', 'Qty')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('tools.prescriptionFilling.status', 'Status')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('tools.prescriptionFilling.priority', 'Priority')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('tools.prescriptionFilling.copay', 'Copay')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('tools.prescriptionFilling.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrescriptions.map(rx => {
                      const statusOpt = STATUS_OPTIONS.find(s => s.value === rx.status);
                      const priorityOpt = PRIORITY_OPTIONS.find(p => p.value === rx.priority);
                      return (
                        <tr
                          key={rx.id}
                          className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}
                        >
                          <td className="py-3 px-4 font-mono text-sm">{rx.rxNumber}</td>
                          <td className="py-3 px-4">
                            <div>{rx.patientName}</div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {rx.patientPhone}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>{rx.drugName}</div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {rx.strength}
                            </div>
                          </td>
                          <td className="py-3 px-4">{rx.quantity}</td>
                          <td className="py-3 px-4">
                            <select
                              value={rx.status}
                              onChange={(e) => handleStatusChange(rx.id, e.target.value as Prescription['status'])}
                              className={`px-2 py-1 rounded text-xs font-medium ${statusOpt?.color} text-white`}
                            >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${priorityOpt?.color}`}>
                              {priorityOpt?.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">${rx.copay.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(rx)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                title={t('tools.prescriptionFilling.edit', 'Edit')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteItem(rx.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Tab */}
      {activeTab === 'form' && showForm && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingId ? t('tools.prescriptionFilling.editPrescription', 'Edit Prescription') : t('tools.prescriptionFilling.newPrescription', 'New Prescription')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('tools.prescriptionFilling.patientInformation', 'Patient Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.patientName', 'Patient Name *')}</label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={formData.patientPhone}
                      onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.dateOfBirth', 'Date of Birth')}</label>
                    <input
                      type="date"
                      value={formData.patientDOB}
                      onChange={(e) => setFormData({ ...formData, patientDOB: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>{t('tools.prescriptionFilling.allergies', 'Allergies')}</label>
                    <input
                      type="text"
                      value={formData.patientAllergies}
                      onChange={(e) => setFormData({ ...formData, patientAllergies: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.prescriptionFilling.listKnownAllergies', 'List known allergies...')}
                    />
                  </div>
                </div>
              </div>

              {/* Prescriber Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  {t('tools.prescriptionFilling.prescriberInformation', 'Prescriber Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.prescriberName', 'Prescriber Name *')}</label>
                    <input
                      type="text"
                      value={formData.prescriberName}
                      onChange={(e) => setFormData({ ...formData, prescriberName: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.npi', 'NPI')}</label>
                    <input
                      type="text"
                      value={formData.prescriberNPI}
                      onChange={(e) => setFormData({ ...formData, prescriberNPI: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.phone2', 'Phone')}</label>
                    <input
                      type="tel"
                      value={formData.prescriberPhone}
                      onChange={(e) => setFormData({ ...formData, prescriberPhone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Drug Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  {t('tools.prescriptionFilling.drugInformation', 'Drug Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.prescriptionFilling.drugName', 'Drug Name *')}</label>
                    <input
                      type="text"
                      value={formData.drugName}
                      onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.ndc', 'NDC')}</label>
                    <input
                      type="text"
                      value={formData.drugNDC}
                      onChange={(e) => setFormData({ ...formData, drugNDC: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.strength', 'Strength')}</label>
                    <input
                      type="text"
                      value={formData.strength}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.prescriptionFilling.eG10mg', 'e.g., 10mg')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.quantity', 'Quantity *')}</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.daysSupply', 'Days Supply')}</label>
                    <input
                      type="number"
                      value={formData.daysSupply}
                      onChange={(e) => setFormData({ ...formData, daysSupply: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.refillsAuthorized', 'Refills Authorized')}</label>
                    <input
                      type="number"
                      value={formData.refillsAuthorized}
                      onChange={(e) => setFormData({ ...formData, refillsAuthorized: parseInt(e.target.value) || 0, refillsRemaining: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.dawCode', 'DAW Code')}</label>
                    <select
                      value={formData.daw}
                      onChange={(e) => setFormData({ ...formData, daw: parseInt(e.target.value) })}
                      className={inputClass}
                    >
                      {DAW_CODES.map(code => (
                        <option key={code.value} value={code.value}>{code.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className={labelClass}>{t('tools.prescriptionFilling.directionsSig', 'Directions (SIG) *')}</label>
                    <input
                      type="text"
                      value={formData.directions}
                      onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
                      className={inputClass}
                      placeholder={t('tools.prescriptionFilling.take1TabletByMouth', 'Take 1 tablet by mouth daily')}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t('tools.prescriptionFilling.dates', 'Dates')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.dateWritten', 'Date Written')}</label>
                    <input
                      type="date"
                      value={formData.dateWritten}
                      onChange={(e) => setFormData({ ...formData, dateWritten: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.dateReceived', 'Date Received')}</label>
                    <input
                      type="date"
                      value={formData.dateReceived}
                      onChange={(e) => setFormData({ ...formData, dateReceived: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.dateFilled', 'Date Filled')}</label>
                    <input
                      type="date"
                      value={formData.dateFilled}
                      onChange={(e) => setFormData({ ...formData, dateFilled: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.expirationDate', 'Expiration Date')}</label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t('tools.prescriptionFilling.insuranceInformation', 'Insurance Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.insuranceName', 'Insurance Name')}</label>
                    <input
                      type="text"
                      value={formData.insuranceName}
                      onChange={(e) => setFormData({ ...formData, insuranceName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.bin', 'BIN')}</label>
                    <input
                      type="text"
                      value={formData.insuranceBIN}
                      onChange={(e) => setFormData({ ...formData, insuranceBIN: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.pcn', 'PCN')}</label>
                    <input
                      type="text"
                      value={formData.insurancePCN}
                      onChange={(e) => setFormData({ ...formData, insurancePCN: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.groupId', 'Group ID')}</label>
                    <input
                      type="text"
                      value={formData.insuranceGroupId}
                      onChange={(e) => setFormData({ ...formData, insuranceGroupId: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.memberId', 'Member ID')}</label>
                    <input
                      type="text"
                      value={formData.insuranceMemberId}
                      onChange={(e) => setFormData({ ...formData, insuranceMemberId: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t('tools.prescriptionFilling.pricing', 'Pricing')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.totalCost', 'Total Cost')}</label>
                    <input
                      type="number"
                      value={formData.totalCost}
                      onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.insurancePaid', 'Insurance Paid')}</label>
                    <input
                      type="number"
                      value={formData.insurancePaid}
                      onChange={(e) => setFormData({ ...formData, insurancePaid: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.copay2', 'Copay')}</label>
                    <input
                      type="number"
                      value={formData.copay}
                      onChange={(e) => setFormData({ ...formData, copay: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Processing */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t('tools.prescriptionFilling.statusProcessing', 'Status & Processing')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.status2', 'Status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Prescription['status'] })}
                      className={inputClass}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.priority2', 'Priority')}</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Prescription['priority'] })}
                      className={inputClass}
                    >
                      {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.technicianInitials', 'Technician Initials')}</label>
                    <input
                      type="text"
                      value={formData.technicianInitials}
                      onChange={(e) => setFormData({ ...formData, technicianInitials: e.target.value.toUpperCase() })}
                      className={inputClass}
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.prescriptionFilling.pharmacistInitials', 'Pharmacist Initials')}</label>
                    <input
                      type="text"
                      value={formData.pharmacistInitials}
                      onChange={(e) => setFormData({ ...formData, pharmacistInitials: e.target.value.toUpperCase() })}
                      className={inputClass}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('tools.prescriptionFilling.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`${inputClass} h-24`}
                  placeholder={t('tools.prescriptionFilling.additionalNotes', 'Additional notes...')}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCancel}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <X className="w-4 h-4 inline mr-2" />
                  {t('tools.prescriptionFilling.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.patientName || !formData.drugName || !formData.directions}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {editingId ? t('tools.prescriptionFilling.update', 'Update') : t('tools.prescriptionFilling.save', 'Save')} Prescription
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('tools.prescriptionFilling.searchPrescriptions', 'Search Prescriptions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.prescriptionFilling.searchByPatientNameRx', 'Search by patient name, Rx number, or drug name...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {searchTerm && filteredPrescriptions.length > 0 && (
              <div className="space-y-3">
                {filteredPrescriptions.map(rx => (
                  <div
                    key={rx.id}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-blue-500">{rx.rxNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            STATUS_OPTIONS.find(s => s.value === rx.status)?.color
                          } text-white`}>
                            {STATUS_OPTIONS.find(s => s.value === rx.status)?.label}
                          </span>
                        </div>
                        <h4 className="font-semibold mt-1">{rx.patientName}</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {rx.drugName} {rx.strength} - Qty: {rx.quantity}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {rx.directions}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(rx)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && filteredPrescriptions.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  No prescriptions found matching "{searchTerm}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionFillingTool;
