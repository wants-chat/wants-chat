import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Building2,
  User,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  Send,
  FileSignature,
  AlertCircle,
} from 'lucide-react';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';

interface LienWaiver {
  id: string;
  waiverNumber: string;
  projectName: string;
  projectAddress: string;
  partyName: string; // contractor/subcontractor/supplier name
  partyType: 'general_contractor' | 'subcontractor' | 'supplier' | 'equipment_rental';
  waiverType: 'conditional' | 'unconditional';
  releaseType: 'progress' | 'final';
  throughDate: string; // work performed through this date
  paymentAmount: number;
  checkNumber?: string;
  paymentDate?: string;
  status: 'draft' | 'sent' | 'received' | 'signed' | 'filed' | 'expired';
  dueDate: string;
  signedDate?: string;
  signedBy?: string;
  notarized: boolean;
  notaryDate?: string;
  notaryName?: string;
  description: string;
  notes: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const defaultWaivers: LienWaiver[] = [];

const waiverColumns: ColumnConfig[] = [
  { key: 'waiverNumber', header: 'Waiver #', width: 15 },
  { key: 'projectName', header: 'Project', width: 20 },
  { key: 'partyName', header: 'Party Name', width: 20 },
  { key: 'partyType', header: 'Party Type', width: 12 },
  { key: 'waiverType', header: 'Waiver Type', width: 12 },
  { key: 'releaseType', header: 'Release Type', width: 10 },
  { key: 'paymentAmount', header: 'Amount', width: 12 },
  { key: 'status', header: 'Status', width: 10 },
  { key: 'throughDate', header: 'Through Date', width: 12 },
  { key: 'dueDate', header: 'Due Date', width: 12 },
  { key: 'signedDate', header: 'Signed Date', width: 12 },
  { key: 'notarized', header: 'Notarized', width: 10 },
  { key: 'createdAt', header: 'Created', width: 15 },
];

const LienWaiverTool: React.FC = () => {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const {
    data: waivers,
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
  } = useToolData<LienWaiver>('lien-waiver', defaultWaivers, waiverColumns);

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedWaiver, setExpandedWaiver] = useState<string | null>(null);
  const [editingWaiver, setEditingWaiver] = useState<LienWaiver | null>(null);
  const [formData, setFormData] = useState<Partial<LienWaiver>>({
    waiverNumber: '',
    projectName: '',
    projectAddress: '',
    partyName: '',
    partyType: 'subcontractor',
    waiverType: 'conditional',
    releaseType: 'progress',
    throughDate: '',
    paymentAmount: 0,
    checkNumber: '',
    paymentDate: '',
    status: 'draft',
    dueDate: '',
    signedDate: '',
    signedBy: '',
    notarized: false,
    notaryDate: '',
    notaryName: '',
    description: '',
    notes: '',
    documentUrl: '',
  });

  const partyTypes = [
    { value: 'general_contractor', label: 'General Contractor' },
    { value: 'subcontractor', label: 'Subcontractor' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'equipment_rental', label: 'Equipment Rental' },
  ];

  const waiverTypes = [
    { value: 'conditional', label: 'Conditional' },
    { value: 'unconditional', label: 'Unconditional' },
  ];

  const releaseTypes = [
    { value: 'progress', label: 'Progress Payment' },
    { value: 'final', label: 'Final Payment' },
  ];

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'sent', label: 'Sent', color: 'blue' },
    { value: 'received', label: 'Received', color: 'yellow' },
    { value: 'signed', label: 'Signed', color: 'green' },
    { value: 'filed', label: 'Filed', color: 'purple' },
    { value: 'expired', label: 'Expired', color: 'red' },
  ];

  const generateWaiverNumber = () => {
    const prefix = 'LW';
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const seq = String(waivers.length + 1).padStart(3, '0');
    return `${prefix}-${date}-${seq}`;
  };

  const filteredWaivers = waivers.filter((waiver) => {
    const matchesSearch =
      waiver.waiverNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waiver.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waiver.partyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || waiver.status === statusFilter;
    const matchesType = typeFilter === 'all' || waiver.waiverType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSubmit = () => {
    if (!formData.projectName || !formData.partyName || !formData.throughDate) {
      setValidationMessage('Please fill in required fields: Project Name, Party Name, and Through Date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();

    if (editingWaiver) {
      updateItem(editingWaiver.id, {
        ...formData,
        updatedAt: now,
      } as Partial<LienWaiver>);
      setEditingWaiver(null);
    } else {
      const newWaiver: LienWaiver = {
        id: `waiver-${Date.now()}`,
        waiverNumber: formData.waiverNumber || generateWaiverNumber(),
        projectName: formData.projectName || '',
        projectAddress: formData.projectAddress || '',
        partyName: formData.partyName || '',
        partyType: formData.partyType || 'subcontractor',
        waiverType: formData.waiverType || 'conditional',
        releaseType: formData.releaseType || 'progress',
        throughDate: formData.throughDate || '',
        paymentAmount: formData.paymentAmount || 0,
        checkNumber: formData.checkNumber,
        paymentDate: formData.paymentDate,
        status: formData.status || 'draft',
        dueDate: formData.dueDate || '',
        signedDate: formData.signedDate,
        signedBy: formData.signedBy,
        notarized: formData.notarized || false,
        notaryDate: formData.notaryDate,
        notaryName: formData.notaryName,
        description: formData.description || '',
        notes: formData.notes || '',
        documentUrl: formData.documentUrl,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newWaiver);
    }

    resetForm();
    setActiveTab('list');
  };

  const resetForm = () => {
    setFormData({
      waiverNumber: generateWaiverNumber(),
      projectName: '',
      projectAddress: '',
      partyName: '',
      partyType: 'subcontractor',
      waiverType: 'conditional',
      releaseType: 'progress',
      throughDate: '',
      paymentAmount: 0,
      checkNumber: '',
      paymentDate: '',
      status: 'draft',
      dueDate: '',
      signedDate: '',
      signedBy: '',
      notarized: false,
      notaryDate: '',
      notaryName: '',
      description: '',
      notes: '',
      documentUrl: '',
    });
    setEditingWaiver(null);
  };

  const handleEdit = (waiver: LienWaiver) => {
    setEditingWaiver(waiver);
    setFormData(waiver);
    setActiveTab('edit');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Lien Waiver',
      message: 'Are you sure you want to delete this lien waiver?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const getStatusColor = (status: string) => {
    const statusInfo = statuses.find((s) => s.value === status);
    const colors: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800',
    };
    return colors[statusInfo?.color || 'gray'];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      case 'received':
        return <Download className="w-4 h-4" />;
      case 'signed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'filed':
        return <FileCheck className="w-4 h-4" />;
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Stats calculations
  const stats = {
    total: waivers.length,
    pending: waivers.filter((w) => ['draft', 'sent', 'received'].includes(w.status)).length,
    signed: waivers.filter((w) => w.status === 'signed').length,
    filed: waivers.filter((w) => w.status === 'filed').length,
    expired: waivers.filter((w) => w.status === 'expired').length,
    totalAmount: waivers.reduce((sum, w) => sum + w.paymentAmount, 0),
    conditional: waivers.filter((w) => w.waiverType === 'conditional').length,
    unconditional: waivers.filter((w) => w.waiverType === 'unconditional').length,
  };

  const renderForm = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-teal-600" />
          Waiver Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Waiver Number
            </label>
            <input
              type="text"
              value={formData.waiverNumber}
              onChange={(e) => setFormData({ ...formData, waiverNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Auto-generated"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Waiver Type *
            </label>
            <select
              value={formData.waiverType}
              onChange={(e) => setFormData({ ...formData, waiverType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {waiverTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Type *
            </label>
            <select
              value={formData.releaseType}
              onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {releaseTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          Project Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter project name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Address
            </label>
            <input
              type="text"
              value={formData.projectAddress}
              onChange={(e) => setFormData({ ...formData, projectAddress: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter project address"
            />
          </div>
        </div>
      </div>

      {/* Party Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          Party Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Party Name *
            </label>
            <input
              type="text"
              value={formData.partyName}
              onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Contractor/Subcontractor/Supplier name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Party Type *
            </label>
            <select
              value={formData.partyType}
              onChange={(e) => setFormData({ ...formData, partyType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {partyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal-600" />
          Payment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Through Date *
            </label>
            <input
              type="date"
              value={formData.throughDate}
              onChange={(e) => setFormData({ ...formData, throughDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount
            </label>
            <input
              type="number"
              value={formData.paymentAmount}
              onChange={(e) => setFormData({ ...formData, paymentAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check Number
            </label>
            <input
              type="text"
              value={formData.checkNumber}
              onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Check #"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Status & Dates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Status & Dates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signed Date
            </label>
            <input
              type="date"
              value={formData.signedDate}
              onChange={(e) => setFormData({ ...formData, signedDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signed By
            </label>
            <input
              type="text"
              value={formData.signedBy}
              onChange={(e) => setFormData({ ...formData, signedBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Signatory name"
            />
          </div>
        </div>
      </div>

      {/* Notarization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-teal-600" />
          Notarization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="notarized"
              checked={formData.notarized}
              onChange={(e) => setFormData({ ...formData, notarized: e.target.checked })}
              className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="notarized" className="text-sm font-medium text-gray-700">
              Document is notarized
            </label>
          </div>
          {formData.notarized && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notary Date
                </label>
                <input
                  type="date"
                  value={formData.notaryDate}
                  onChange={(e) => setFormData({ ...formData, notaryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notary Name
                </label>
                <input
                  type="text"
                  value={formData.notaryName}
                  onChange={(e) => setFormData({ ...formData, notaryName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Notary public name"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description & Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Description & Notes</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={3}
              placeholder="Describe work/materials covered by this waiver..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document URL
            </label>
            <input
              type="url"
              value={formData.documentUrl}
              onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Link to signed document..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            resetForm();
            setActiveTab('list');
          }}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {editingWaiver ? 'Update Waiver' : 'Create Waiver'}
        </button>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search waivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Status</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Types</option>
            {waiverTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Waivers List */}
      {filteredWaivers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Lien Waivers Found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No waivers match your filters'
              : 'Create your first lien waiver to get started'}
          </p>
          {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
            <button
              onClick={() => {
                resetForm();
                setFormData({ ...formData, waiverNumber: generateWaiverNumber() });
                setActiveTab('create');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Waiver
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWaivers.map((waiver) => (
            <div
              key={waiver.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedWaiver(expandedWaiver === waiver.id ? null : waiver.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{waiver.waiverNumber}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(waiver.status)}`}>
                          {statuses.find((s) => s.value === waiver.status)?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {waiver.projectName} - {waiver.partyName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(waiver.paymentAmount)}</p>
                      <p className="text-xs text-gray-500">
                        {waiverTypes.find((t) => t.value === waiver.waiverType)?.label} - {releaseTypes.find((t) => t.value === waiver.releaseType)?.label}
                      </p>
                    </div>
                    {expandedWaiver === waiver.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedWaiver === waiver.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Party Type</p>
                      <p className="text-sm font-medium">
                        {partyTypes.find((t) => t.value === waiver.partyType)?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Through Date</p>
                      <p className="text-sm font-medium">
                        {new Date(waiver.throughDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm font-medium">
                        {waiver.dueDate ? new Date(waiver.dueDate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    {waiver.checkNumber && (
                      <div>
                        <p className="text-xs text-gray-500">Check Number</p>
                        <p className="text-sm font-medium">{waiver.checkNumber}</p>
                      </div>
                    )}
                    {waiver.signedDate && (
                      <div>
                        <p className="text-xs text-gray-500">Signed Date</p>
                        <p className="text-sm font-medium">
                          {new Date(waiver.signedDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Notarized</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        {waiver.notarized ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Yes
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            No
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  {waiver.projectAddress && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">Project Address</p>
                      <p className="text-sm">{waiver.projectAddress}</p>
                    </div>
                  )}
                  {waiver.description && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm">{waiver.description}</p>
                    </div>
                  )}
                  {waiver.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm">{waiver.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(waiver)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    {waiver.documentUrl && (
                      <a
                        href={waiver.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        View Document
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(waiver.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('tools.lienWaiver.lienWaiverTracker', 'Lien Waiver Tracker')}</h1>
              <p className="text-sm text-gray-500">{t('tools.lienWaiver.trackAndManageConstructionLien', 'Track and manage construction lien waivers')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="lien-waiver" toolName="Lien Waiver" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={exportPDF}
              disabled={waivers.length === 0}
            />
            {activeTab === 'list' && (
              <button
                onClick={() => {
                  resetForm();
                  setFormData({ ...formData, waiverNumber: generateWaiverNumber() });
                  setActiveTab('create');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.lienWaiver.newWaiver', 'New Waiver')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-xs">{t('tools.lienWaiver.total', 'Total')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">{t('tools.lienWaiver.pending', 'Pending')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs">{t('tools.lienWaiver.signed', 'Signed')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.signed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-purple-500 mb-1">
              <FileCheck className="w-4 h-4" />
              <span className="text-xs">{t('tools.lienWaiver.filed', 'Filed')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.filed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{t('tools.lienWaiver.expired', 'Expired')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-teal-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">{t('tools.lienWaiver.totalAmount', 'Total Amount')}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">{t('tools.lienWaiver.conditional', 'Conditional')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.conditional}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs">{t('tools.lienWaiver.unconditional', 'Unconditional')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.unconditional}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {t('tools.lienWaiver.allWaivers', 'All Waivers')}
          </button>
          <button
            onClick={() => {
              resetForm();
              setFormData({ ...formData, waiverNumber: generateWaiverNumber() });
              setActiveTab('create');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {t('tools.lienWaiver.createWaiver', 'Create Waiver')}
          </button>
          {activeTab === 'edit' && (
            <button
              className="px-4 py-2 rounded-lg font-medium bg-teal-600 text-white"
            >
              {t('tools.lienWaiver.editWaiver', 'Edit Waiver')}
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'list' && renderList()}
        {(activeTab === 'create' || activeTab === 'edit') && renderForm()}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800 font-medium">{validationMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default LienWaiverTool;
