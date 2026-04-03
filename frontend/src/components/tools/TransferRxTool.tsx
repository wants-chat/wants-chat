'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftRight,
  User,
  Pill,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building,
  Phone,
  FileText,
  ArrowRight,
  ArrowLeft,
  Copy,
  Printer,
  Send,
  AlertCircle,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface Transfer {
  id: string;
  type: 'incoming' | 'outgoing';
  patientName: string;
  patientDob: string;
  patientPhone: string;
  patientAddress: string;

  // Medication Info
  rxNumber: string;
  originalRxNumber: string;
  drugName: string;
  strength: string;
  quantity: number;
  daysSupply: number;
  directions: string;
  refillsRemaining: number;
  originalRefills: number;
  dateFilled: string;
  dateWritten: string;
  expirationDate: string;

  // Prescriber Info
  prescriberName: string;
  prescriberNpi: string;
  prescriberPhone: string;
  prescriberAddress: string;
  prescriberDea?: string;

  // Other Pharmacy Info
  otherPharmacyName: string;
  otherPharmacyPhone: string;
  otherPharmacyAddress: string;
  otherPharmacyNpi: string;
  pharmacistName: string;

  // Transfer Info
  transferDate: string;
  transferredBy: string;
  receivedBy?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  notes: string;
  isControlled: boolean;
  schedule?: 'II' | 'III' | 'IV' | 'V';

  createdAt: string;
  updatedAt: string;
}

interface TransferRxToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'transfer-rx';

// Column configuration for export
const TRANSFER_COLUMNS: ColumnConfig[] = [
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'drugName', header: 'Drug', type: 'string' },
  { key: 'rxNumber', header: 'Rx#', type: 'string' },
  { key: 'otherPharmacyName', header: 'Other Pharmacy', type: 'string' },
  { key: 'transferDate', header: 'Transfer Date', type: 'date' },
  { key: 'refillsRemaining', header: 'Refills', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'transferredBy', header: 'Transferred By', type: 'string' },
];

const TransferRxTool: React.FC<TransferRxToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: transfers,
    setData: setTransfers,
    syncStatus,
    lastSynced,
    sync,
  } = useToolData<Transfer>(TOOL_ID, [], TRANSFER_COLUMNS);

  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing' | 'new'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  const [formData, setFormData] = useState<Partial<Transfer>>({
    type: 'incoming',
    patientName: '',
    patientDob: '',
    patientPhone: '',
    patientAddress: '',
    rxNumber: '',
    originalRxNumber: '',
    drugName: '',
    strength: '',
    quantity: 0,
    daysSupply: 30,
    directions: '',
    refillsRemaining: 0,
    originalRefills: 0,
    dateFilled: '',
    dateWritten: '',
    expirationDate: '',
    prescriberName: '',
    prescriberNpi: '',
    prescriberPhone: '',
    prescriberAddress: '',
    prescriberDea: '',
    otherPharmacyName: '',
    otherPharmacyPhone: '',
    otherPharmacyAddress: '',
    otherPharmacyNpi: '',
    pharmacistName: '',
    transferDate: new Date().toISOString().split('T')[0],
    transferredBy: '',
    status: 'pending',
    notes: '',
    isControlled: false,
  });

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const matchesSearch = !searchTerm ||
        transfer.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.rxNumber.includes(searchTerm);
      const matchesTab = activeTab === 'all' || transfer.type === activeTab.replace('new', 'incoming');
      const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus;
      return matchesSearch && matchesTab && matchesStatus;
    }).sort((a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime());
  }, [transfers, searchTerm, activeTab, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTransfers = transfers.filter(t => t.transferDate === today).length;
    const pending = transfers.filter(t => t.status === 'pending').length;
    const incoming = transfers.filter(t => t.type === 'incoming').length;
    const outgoing = transfers.filter(t => t.type === 'outgoing').length;

    return { todayTransfers, pending, incoming, outgoing };
  }, [transfers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTransfer) {
      setTransfers(transfers.map(t =>
        t.id === editingTransfer.id
          ? { ...t, ...formData, updatedAt: new Date().toISOString() }
          : t
      ));
    } else {
      const newTransfer: Transfer = {
        ...formData as Transfer,
        id: `TRF-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTransfers([...transfers, newTransfer]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'incoming',
      patientName: '',
      patientDob: '',
      patientPhone: '',
      patientAddress: '',
      rxNumber: '',
      originalRxNumber: '',
      drugName: '',
      strength: '',
      quantity: 0,
      daysSupply: 30,
      directions: '',
      refillsRemaining: 0,
      originalRefills: 0,
      dateFilled: '',
      dateWritten: '',
      expirationDate: '',
      prescriberName: '',
      prescriberNpi: '',
      prescriberPhone: '',
      prescriberAddress: '',
      prescriberDea: '',
      otherPharmacyName: '',
      otherPharmacyPhone: '',
      otherPharmacyAddress: '',
      otherPharmacyNpi: '',
      pharmacistName: '',
      transferDate: new Date().toISOString().split('T')[0],
      transferredBy: '',
      status: 'pending',
      notes: '',
      isControlled: false,
    });
    setEditingTransfer(null);
    setShowForm(false);
    setActiveTab('all');
  };

  const handleEdit = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setFormData(transfer);
    setShowForm(true);
    setActiveTab('new');
  };

  const handleDelete = (id: string) => {
    setTransfers(transfers.filter(t => t.id !== id));
    if (selectedTransfer?.id === id) setSelectedTransfer(null);
  };

  const handleStatusUpdate = (id: string, newStatus: Transfer['status']) => {
    setTransfers(transfers.map(t =>
      t.id === id
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
        : t
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7 text-cyan-500" />
            {t('tools.transferRx.prescriptionTransfers', 'Prescription Transfers')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.transferRx.manageIncomingAndOutgoingPrescription', 'Manage incoming and outgoing prescription transfers')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="transfer-rx" toolName="Transfer Rx" />

          <SyncStatus status={syncStatus} lastSynced={lastSynced} onSync={sync} />
          <ExportDropdown data={filteredTransfers} columns={TRANSFER_COLUMNS} filename="rx-transfers" />
          <button
            onClick={() => { resetForm(); setShowForm(true); setActiveTab('new'); }}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tools.transferRx.newTransfer', 'New Transfer')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <ArrowLeftRight className="w-5 h-5 text-cyan-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.transferRx.today', 'Today')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.todayTransfers}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.transferRx.pending', 'Pending')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <ArrowRight className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.transferRx.incoming', 'Incoming')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.incoming}</p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <ArrowLeft className="w-5 h-5 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.transferRx.outgoing', 'Outgoing')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.outgoing}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 mb-6 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        {[
          { id: 'all', label: 'All Transfers', icon: FileText },
          { id: 'incoming', label: 'Incoming', icon: ArrowRight },
          { id: 'outgoing', label: 'Outgoing', icon: ArrowLeft },
          { id: 'new', label: showForm ? (editingTransfer ? t('tools.transferRx.edit', 'Edit') : t('tools.transferRx.newTransfer2', 'New Transfer')) : 'New Transfer', icon: Plus },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'new') {
                setShowForm(true);
              } else {
                setShowForm(false);
              }
              setActiveTab(tab.id as any);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Transfer List */}
      {!showForm && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={t('tools.transferRx.searchByPatientDrugOr', 'Search by patient, drug, or Rx#...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">{t('tools.transferRx.allStatus', 'All Status')}</option>
              <option value="pending">{t('tools.transferRx.pending2', 'Pending')}</option>
              <option value="in-progress">{t('tools.transferRx.inProgress', 'In Progress')}</option>
              <option value="completed">{t('tools.transferRx.completed', 'Completed')}</option>
              <option value="cancelled">{t('tools.transferRx.cancelled', 'Cancelled')}</option>
              <option value="rejected">{t('tools.transferRx.rejected', 'Rejected')}</option>
            </select>
          </div>

          {/* Transfers Table */}
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.transferRx.type', 'Type')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.transferRx.patient', 'Patient')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.transferRx.medication', 'Medication')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.transferRx.otherPharmacy', 'Other Pharmacy')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.transferRx.date', 'Date')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t('tools.transferRx.status', 'Status')}</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">{t('tools.transferRx.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransfers.map(transfer => (
                    <tr key={transfer.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          transfer.type === 'incoming'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {transfer.type === 'incoming' ? <ArrowRight className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                          {transfer.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{transfer.patientName}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Rx: {transfer.rxNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{transfer.drugName}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {transfer.strength} • {transfer.refillsRemaining} refills
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{transfer.otherPharmacyName}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {transfer.otherPharmacyPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(transfer.transferDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setSelectedTransfer(transfer)}
                            className="p-1.5 text-gray-500 hover:text-cyan-500 hover:bg-cyan-50 rounded"
                            title={t('tools.transferRx.viewDetails', 'View Details')}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(transfer)}
                            className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded"
                            title={t('tools.transferRx.edit2', 'Edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transfer.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded"
                            title="Delete"
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

            {filteredTransfers.length === 0 && (
              <div className="p-8 text-center">
                <ArrowLeftRight className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.transferRx.noTransfersFound', 'No transfers found')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New/Edit Transfer Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transfer Type */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">{t('tools.transferRx.transferType', 'Transfer Type')}</h3>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${
                formData.type === 'incoming'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : isDark ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="incoming"
                  checked={formData.type === 'incoming'}
                  onChange={(e) => setFormData({ ...formData, type: 'incoming' })}
                  className="hidden"
                />
                <ArrowRight className={`w-6 h-6 ${formData.type === 'incoming' ? 'text-green-500' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium">{t('tools.transferRx.incomingTransfer', 'Incoming Transfer')}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.transferRx.receivingRxFromAnotherPharmacy', 'Receiving Rx from another pharmacy')}
                  </p>
                </div>
              </label>

              <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${
                formData.type === 'outgoing'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : isDark ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="outgoing"
                  checked={formData.type === 'outgoing'}
                  onChange={(e) => setFormData({ ...formData, type: 'outgoing' })}
                  className="hidden"
                />
                <ArrowLeft className={`w-6 h-6 ${formData.type === 'outgoing' ? 'text-blue-500' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium">{t('tools.transferRx.outgoingTransfer', 'Outgoing Transfer')}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.transferRx.sendingRxToAnotherPharmacy', 'Sending Rx to another pharmacy')}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Patient Info */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-500" />
              {t('tools.transferRx.patientInformation', 'Patient Information')}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.patientName', 'Patient Name *')}</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.dateOfBirth', 'Date of Birth *')}</label>
                <input
                  type="date"
                  value={formData.patientDob}
                  onChange={(e) => setFormData({ ...formData, patientDob: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.phone', 'Phone')}</label>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.address', 'Address')}</label>
                <input
                  type="text"
                  value={formData.patientAddress}
                  onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Prescription Info */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-cyan-500" />
              {t('tools.transferRx.prescriptionInformation', 'Prescription Information')}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.newRxNumber', 'New Rx Number *')}</label>
                <input
                  type="text"
                  value={formData.rxNumber}
                  onChange={(e) => setFormData({ ...formData, rxNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.originalRxNumber', 'Original Rx Number')}</label>
                <input
                  type="text"
                  value={formData.originalRxNumber}
                  onChange={(e) => setFormData({ ...formData, originalRxNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isControlled}
                    onChange={(e) => setFormData({ ...formData, isControlled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-cyan-600"
                  />
                  <span className="text-sm">{t('tools.transferRx.controlledSubstance', 'Controlled Substance')}</span>
                </label>
                {formData.isControlled && (
                  <select
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value as any })}
                    className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="II">{t('tools.transferRx.scheduleIi', 'Schedule II')}</option>
                    <option value="III">{t('tools.transferRx.scheduleIii', 'Schedule III')}</option>
                    <option value="IV">{t('tools.transferRx.scheduleIv', 'Schedule IV')}</option>
                    <option value="V">{t('tools.transferRx.scheduleV', 'Schedule V')}</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.drugName', 'Drug Name *')}</label>
                <input
                  type="text"
                  value={formData.drugName}
                  onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.strength', 'Strength *')}</label>
                <input
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.quantity', 'Quantity *')}</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.directions', 'Directions *')}</label>
                <input
                  type="text"
                  value={formData.directions}
                  onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.daysSupply', 'Days Supply')}</label>
                <input
                  type="number"
                  value={formData.daysSupply}
                  onChange={(e) => setFormData({ ...formData, daysSupply: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.refillsRemaining', 'Refills Remaining *')}</label>
                <input
                  type="number"
                  value={formData.refillsRemaining}
                  onChange={(e) => setFormData({ ...formData, refillsRemaining: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.originalRefills', 'Original Refills')}</label>
                <input
                  type="number"
                  value={formData.originalRefills}
                  onChange={(e) => setFormData({ ...formData, originalRefills: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.dateWritten', 'Date Written')}</label>
                <input
                  type="date"
                  value={formData.dateWritten}
                  onChange={(e) => setFormData({ ...formData, dateWritten: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.lastFillDate', 'Last Fill Date')}</label>
                <input
                  type="date"
                  value={formData.dateFilled}
                  onChange={(e) => setFormData({ ...formData, dateFilled: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.expirationDate', 'Expiration Date')}</label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Prescriber Info */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-500" />
              {t('tools.transferRx.prescriberInformation', 'Prescriber Information')}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.prescriberName', 'Prescriber Name *')}</label>
                <input
                  type="text"
                  value={formData.prescriberName}
                  onChange={(e) => setFormData({ ...formData, prescriberName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.npi', 'NPI')}</label>
                <input
                  type="text"
                  value={formData.prescriberNpi}
                  onChange={(e) => setFormData({ ...formData, prescriberNpi: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.phone2', 'Phone')}</label>
                <input
                  type="tel"
                  value={formData.prescriberPhone}
                  onChange={(e) => setFormData({ ...formData, prescriberPhone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              {formData.isControlled && (
                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.transferRx.deaNumber', 'DEA Number')}</label>
                  <input
                    type="text"
                    value={formData.prescriberDea}
                    onChange={(e) => setFormData({ ...formData, prescriberDea: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              )}
              <div className={formData.isControlled ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.address2', 'Address')}</label>
                <input
                  type="text"
                  value={formData.prescriberAddress}
                  onChange={(e) => setFormData({ ...formData, prescriberAddress: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Other Pharmacy Info */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-cyan-500" />
              {formData.type === 'incoming' ? t('tools.transferRx.transferringFrom', 'Transferring From') : t('tools.transferRx.transferringTo', 'Transferring To')} Pharmacy
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.pharmacyName', 'Pharmacy Name *')}</label>
                <input
                  type="text"
                  value={formData.otherPharmacyName}
                  onChange={(e) => setFormData({ ...formData, otherPharmacyName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.phone3', 'Phone *')}</label>
                <input
                  type="tel"
                  value={formData.otherPharmacyPhone}
                  onChange={(e) => setFormData({ ...formData, otherPharmacyPhone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.npi2', 'NPI')}</label>
                <input
                  type="text"
                  value={formData.otherPharmacyNpi}
                  onChange={(e) => setFormData({ ...formData, otherPharmacyNpi: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.pharmacistName', 'Pharmacist Name *')}</label>
                <input
                  type="text"
                  value={formData.pharmacistName}
                  onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.address3', 'Address')}</label>
                <input
                  type="text"
                  value={formData.otherPharmacyAddress}
                  onChange={(e) => setFormData({ ...formData, otherPharmacyAddress: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Transfer Details */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-500" />
              {t('tools.transferRx.transferDetails2', 'Transfer Details')}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.transferDate', 'Transfer Date *')}</label>
                <input
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.transferredBy', 'Transferred By *')}</label>
                <input
                  type="text"
                  value={formData.transferredBy}
                  onChange={(e) => setFormData({ ...formData, transferredBy: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t('tools.transferRx.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              {t('tools.transferRx.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingTransfer ? t('tools.transferRx.updateTransfer', 'Update Transfer') : t('tools.transferRx.createTransfer', 'Create Transfer')}
            </button>
          </div>
        </form>
      )}

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{t('tools.transferRx.transferDetails', 'Transfer Details')}</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedTransfer.type === 'incoming' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedTransfer.type}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTransfer.status)}`}>
                  {selectedTransfer.status}
                </span>
              </div>
              <button onClick={() => setSelectedTransfer(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient & Prescription */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.transferRx.patient2', 'Patient')}</h3>
                  <p className="font-medium">{selectedTransfer.patientName}</p>
                  <p className="text-sm">DOB: {new Date(selectedTransfer.patientDob).toLocaleDateString()}</p>
                  <p className="text-sm">{selectedTransfer.patientPhone}</p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.transferRx.medication2', 'Medication')}</h3>
                  <p className="font-medium">{selectedTransfer.drugName} {selectedTransfer.strength}</p>
                  <p className="text-sm">Qty: {selectedTransfer.quantity} • {selectedTransfer.daysSupply} days</p>
                  <p className="text-sm">Refills: {selectedTransfer.refillsRemaining}/{selectedTransfer.originalRefills}</p>
                </div>
              </div>

              {/* Prescriber & Pharmacy */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.transferRx.prescriber', 'Prescriber')}</h3>
                  <p className="font-medium">{selectedTransfer.prescriberName}</p>
                  <p className="text-sm">NPI: {selectedTransfer.prescriberNpi}</p>
                  <p className="text-sm">{selectedTransfer.prescriberPhone}</p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedTransfer.type === 'incoming' ? 'From' : 'To'} Pharmacy
                  </h3>
                  <p className="font-medium">{selectedTransfer.otherPharmacyName}</p>
                  <p className="text-sm">{selectedTransfer.otherPharmacyPhone}</p>
                  <p className="text-sm">RPh: {selectedTransfer.pharmacistName}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700">
                {selectedTransfer.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedTransfer.id, 'in-progress');
                      setSelectedTransfer({ ...selectedTransfer, status: 'in-progress' });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('tools.transferRx.startProcessing', 'Start Processing')}
                  </button>
                )}
                {selectedTransfer.status === 'in-progress' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedTransfer.id, 'completed');
                      setSelectedTransfer({ ...selectedTransfer, status: 'completed' });
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t('tools.transferRx.markComplete', 'Mark Complete')}
                  </button>
                )}
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  {t('tools.transferRx.print', 'Print')}
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  {t('tools.transferRx.copy', 'Copy')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferRxTool;
export { TransferRxTool };
