import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
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
  TrendingUp,
  Percent,
  Receipt,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';

interface DrawLineItem {
  id: string;
  description: string;
  scheduledValue: number;
  previouslyBilled: number;
  currentDraw: number;
  retainage: number;
  percentComplete: number;
}

interface DrawRequest {
  id: string;
  drawNumber: number;
  projectName: string;
  projectAddress: string;
  ownerName: string;
  contractorName: string;
  contractAmount: number;
  applicationDate: string;
  periodFrom: string;
  periodTo: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'paid' | 'rejected';
  lineItems: DrawLineItem[];
  totalScheduledValue: number;
  totalPreviouslyBilled: number;
  totalCurrentDraw: number;
  totalRetainage: number;
  retainagePercent: number;
  lessRetainage: number;
  netPayment: number;
  changeOrdersToDate: number;
  approvedBy?: string;
  approvalDate?: string;
  paymentDate?: string;
  paymentMethod?: string;
  checkNumber?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const defaultDraws: DrawRequest[] = [];

const drawColumns: ColumnConfig[] = [
  { key: 'drawNumber', header: 'Draw #', width: 10 },
  { key: 'projectName', header: 'Project', width: 20 },
  { key: 'ownerName', header: 'Owner', width: 15 },
  { key: 'contractAmount', header: 'Contract Amount', width: 15 },
  { key: 'totalCurrentDraw', header: 'Current Draw', width: 15 },
  { key: 'netPayment', header: 'Net Payment', width: 15 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'applicationDate', header: 'Application Date', width: 12 },
  { key: 'periodFrom', header: 'Period From', width: 12 },
  { key: 'periodTo', header: 'Period To', width: 12 },
  { key: 'paymentDate', header: 'Payment Date', width: 12 },
  { key: 'createdAt', header: 'Created', width: 15 },
];

const DrawScheduleTool: React.FC = () => {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: draws,
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
  } = useToolData<DrawRequest>('draw-schedule', defaultDraws, drawColumns);

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedDraw, setExpandedDraw] = useState<string | null>(null);
  const [editingDraw, setEditingDraw] = useState<DrawRequest | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DrawRequest>>({
    drawNumber: 1,
    projectName: '',
    projectAddress: '',
    ownerName: '',
    contractorName: '',
    contractAmount: 0,
    applicationDate: new Date().toISOString().split('T')[0],
    periodFrom: '',
    periodTo: '',
    status: 'draft',
    lineItems: [],
    totalScheduledValue: 0,
    totalPreviouslyBilled: 0,
    totalCurrentDraw: 0,
    totalRetainage: 0,
    retainagePercent: 10,
    lessRetainage: 0,
    netPayment: 0,
    changeOrdersToDate: 0,
    approvedBy: '',
    approvalDate: '',
    paymentDate: '',
    paymentMethod: '',
    checkNumber: '',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<DrawLineItem[]>([]);

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'submitted', label: 'Submitted', color: 'blue' },
    { value: 'under_review', label: 'Under Review', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'paid', label: 'Paid', color: 'purple' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
  ];

  const paymentMethods = [
    'Check',
    'ACH Transfer',
    'Wire Transfer',
    'Credit Card',
  ];

  const getNextDrawNumber = (projectName: string) => {
    const projectDraws = draws.filter((d) => d.projectName === projectName);
    return projectDraws.length > 0
      ? Math.max(...projectDraws.map((d) => d.drawNumber)) + 1
      : 1;
  };

  const filteredDraws = draws.filter((draw) => {
    const matchesSearch =
      draw.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draw.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draw.contractorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || draw.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculateTotals = (items: DrawLineItem[]) => {
    const totalScheduledValue = items.reduce((sum, item) => sum + item.scheduledValue, 0);
    const totalPreviouslyBilled = items.reduce((sum, item) => sum + item.previouslyBilled, 0);
    const totalCurrentDraw = items.reduce((sum, item) => sum + item.currentDraw, 0);
    const totalRetainage = items.reduce((sum, item) => sum + item.retainage, 0);
    const retainagePercent = formData.retainagePercent || 10;
    const lessRetainage = (totalCurrentDraw * retainagePercent) / 100;
    const netPayment = totalCurrentDraw - lessRetainage;

    return {
      totalScheduledValue,
      totalPreviouslyBilled,
      totalCurrentDraw,
      totalRetainage,
      lessRetainage,
      netPayment,
    };
  };

  const addLineItem = () => {
    const newItem: DrawLineItem = {
      id: `item-${Date.now()}`,
      description: '',
      scheduledValue: 0,
      previouslyBilled: 0,
      currentDraw: 0,
      retainage: 0,
      percentComplete: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof DrawLineItem, value: any) => {
    const updatedItems = lineItems.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Calculate percent complete
        if (updated.scheduledValue > 0) {
          updated.percentComplete = Math.round(
            ((updated.previouslyBilled + updated.currentDraw) / updated.scheduledValue) * 100
          );
        }
        // Calculate retainage for this item
        updated.retainage = (updated.currentDraw * (formData.retainagePercent || 10)) / 100;
        return updated;
      }
      return item;
    });
    setLineItems(updatedItems);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    if (!formData.projectName || !formData.ownerName) {
      setValidationMessage('Please fill in required fields: Project Name and Owner Name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const totals = calculateTotals(lineItems);

    if (editingDraw) {
      updateItem(editingDraw.id, {
        ...formData,
        lineItems,
        ...totals,
        updatedAt: now,
      } as Partial<DrawRequest>);
      setEditingDraw(null);
    } else {
      const newDraw: DrawRequest = {
        id: `draw-${Date.now()}`,
        drawNumber: formData.drawNumber || getNextDrawNumber(formData.projectName || ''),
        projectName: formData.projectName || '',
        projectAddress: formData.projectAddress || '',
        ownerName: formData.ownerName || '',
        contractorName: formData.contractorName || '',
        contractAmount: formData.contractAmount || 0,
        applicationDate: formData.applicationDate || new Date().toISOString().split('T')[0],
        periodFrom: formData.periodFrom || '',
        periodTo: formData.periodTo || '',
        status: formData.status || 'draft',
        lineItems,
        ...totals,
        retainagePercent: formData.retainagePercent || 10,
        changeOrdersToDate: formData.changeOrdersToDate || 0,
        approvedBy: formData.approvedBy,
        approvalDate: formData.approvalDate,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        checkNumber: formData.checkNumber,
        notes: formData.notes || '',
        createdAt: now,
        updatedAt: now,
      };
      addItem(newDraw);
    }

    resetForm();
    setActiveTab('list');
  };

  const resetForm = () => {
    setFormData({
      drawNumber: 1,
      projectName: '',
      projectAddress: '',
      ownerName: '',
      contractorName: '',
      contractAmount: 0,
      applicationDate: new Date().toISOString().split('T')[0],
      periodFrom: '',
      periodTo: '',
      status: 'draft',
      lineItems: [],
      totalScheduledValue: 0,
      totalPreviouslyBilled: 0,
      totalCurrentDraw: 0,
      totalRetainage: 0,
      retainagePercent: 10,
      lessRetainage: 0,
      netPayment: 0,
      changeOrdersToDate: 0,
      approvedBy: '',
      approvalDate: '',
      paymentDate: '',
      paymentMethod: '',
      checkNumber: '',
      notes: '',
    });
    setLineItems([]);
    setEditingDraw(null);
  };

  const handleEdit = (draw: DrawRequest) => {
    setEditingDraw(draw);
    setFormData(draw);
    setLineItems(draw.lineItems || []);
    setActiveTab('edit');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Draw Request',
      message: 'Are you sure you want to delete this draw request? This action cannot be undone.',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Stats calculations
  const stats = {
    totalDraws: draws.length,
    pending: draws.filter((d) => ['draft', 'submitted', 'under_review'].includes(d.status)).length,
    approved: draws.filter((d) => d.status === 'approved').length,
    paid: draws.filter((d) => d.status === 'paid').length,
    totalRequested: draws.reduce((sum, d) => sum + d.totalCurrentDraw, 0),
    totalPaid: draws
      .filter((d) => d.status === 'paid')
      .reduce((sum, d) => sum + d.netPayment, 0),
    totalRetained: draws.reduce((sum, d) => sum + d.lessRetainage, 0),
    avgDrawAmount: draws.length > 0
      ? draws.reduce((sum, d) => sum + d.totalCurrentDraw, 0) / draws.length
      : 0,
  };

  const totals = calculateTotals(lineItems);

  const renderForm = () => (
    <div className="space-y-6">
      {/* Project Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          Project Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Draw Number
            </label>
            <input
              type="number"
              value={formData.drawNumber}
              onChange={(e) => setFormData({ ...formData, drawNumber: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              min="1"
            />
          </div>
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
              Contract Amount
            </label>
            <input
              type="number"
              value={formData.contractAmount}
              onChange={(e) => setFormData({ ...formData, contractAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div className="md:col-span-3">
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

      {/* Parties */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          Parties
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner/Client Name *
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Property owner or client"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contractor Name
            </label>
            <input
              type="text"
              value={formData.contractorName}
              onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="General contractor"
            />
          </div>
        </div>
      </div>

      {/* Application Period */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Application Period
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Date
            </label>
            <input
              type="date"
              value={formData.applicationDate}
              onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period From
            </label>
            <input
              type="date"
              value={formData.periodFrom}
              onChange={(e) => setFormData({ ...formData, periodFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period To
            </label>
            <input
              type="date"
              value={formData.periodTo}
              onChange={(e) => setFormData({ ...formData, periodTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
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
        </div>
      </div>

      {/* Schedule of Values / Line Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            Schedule of Values
          </h3>
          <button
            onClick={addLineItem}
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {lineItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No line items added yet. Click "Add Item" to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-right py-2 px-2">Scheduled Value</th>
                  <th className="text-right py-2 px-2">Previously Billed</th>
                  <th className="text-right py-2 px-2">Current Draw</th>
                  <th className="text-right py-2 px-2">% Complete</th>
                  <th className="text-center py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                        placeholder="Work description"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={item.scheduledValue}
                        onChange={(e) => updateLineItem(item.id, 'scheduledValue', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={item.previouslyBilled}
                        onChange={(e) => updateLineItem(item.id, 'previouslyBilled', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={item.currentDraw}
                        onChange={(e) => updateLineItem(item.id, 'currentDraw', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className="font-medium">{item.percentComplete}%</span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr className="font-medium">
                  <td className="py-2 px-2">Totals</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(totals.totalScheduledValue)}</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(totals.totalPreviouslyBilled)}</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(totals.totalCurrentDraw)}</td>
                  <td className="py-2 px-2 text-right">-</td>
                  <td className="py-2 px-2">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Retainage & Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" />
          Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retainage Percentage
              </label>
              <input
                type="number"
                value={formData.retainagePercent}
                onChange={(e) => setFormData({ ...formData, retainagePercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="10"
                min="0"
                max="100"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change Orders to Date
              </label>
              <input
                type="number"
                value={formData.changeOrdersToDate}
                onChange={(e) => setFormData({ ...formData, changeOrdersToDate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Draw Amount:</span>
              <span className="font-medium">{formatCurrency(totals.totalCurrentDraw)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Less Retainage ({formData.retainagePercent}%):</span>
              <span className="font-medium text-red-600">-{formatCurrency(totals.lessRetainage)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between">
              <span className="font-medium text-gray-900">Net Payment Due:</span>
              <span className="font-bold text-teal-600 text-lg">{formatCurrency(totals.netPayment)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-teal-600" />
          Payment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approved By
            </label>
            <input
              type="text"
              value={formData.approvedBy}
              onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Approver name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Date
            </label>
            <input
              type="date"
              value={formData.approvalDate}
              onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select method</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check/Reference Number
            </label>
            <input
              type="text"
              value={formData.checkNumber}
              onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Check # or reference"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          rows={3}
          placeholder="Additional notes..."
        />
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
          {editingDraw ? 'Update Draw' : 'Create Draw'}
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
            placeholder="Search draw requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
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
      </div>

      {/* Draws List */}
      {filteredDraws.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Draw Requests Found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'No draw requests match your filters'
              : 'Create your first draw request to get started'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => {
                resetForm();
                setActiveTab('create');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Draw Request
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDraws.map((draw) => (
            <div
              key={draw.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedDraw(expandedDraw === draw.id ? null : draw.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-teal-600">#{draw.drawNumber}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{draw.projectName}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(draw.status)}`}>
                          {statuses.find((s) => s.value === draw.status)?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {draw.ownerName} | {new Date(draw.applicationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(draw.netPayment)}</p>
                      <p className="text-xs text-gray-500">
                        Draw: {formatCurrency(draw.totalCurrentDraw)}
                      </p>
                    </div>
                    {expandedDraw === draw.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedDraw === draw.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Contract Amount</p>
                      <p className="text-sm font-medium">{formatCurrency(draw.contractAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Scheduled Value</p>
                      <p className="text-sm font-medium">{formatCurrency(draw.totalScheduledValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Previously Billed</p>
                      <p className="text-sm font-medium">{formatCurrency(draw.totalPreviouslyBilled)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Current Draw</p>
                      <p className="text-sm font-medium">{formatCurrency(draw.totalCurrentDraw)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Retainage ({draw.retainagePercent}%)</p>
                      <p className="text-sm font-medium text-red-600">-{formatCurrency(draw.lessRetainage)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Net Payment</p>
                      <p className="text-sm font-medium text-teal-600">{formatCurrency(draw.netPayment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Period</p>
                      <p className="text-sm font-medium">
                        {draw.periodFrom && draw.periodTo
                          ? `${new Date(draw.periodFrom).toLocaleDateString()} - ${new Date(draw.periodTo).toLocaleDateString()}`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Date</p>
                      <p className="text-sm font-medium">
                        {draw.paymentDate ? new Date(draw.paymentDate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Line Items Summary */}
                  {draw.lineItems && draw.lineItems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Line Items ({draw.lineItems.length})</p>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left py-2 px-2">Description</th>
                              <th className="text-right py-2 px-2">Scheduled</th>
                              <th className="text-right py-2 px-2">Current</th>
                              <th className="text-right py-2 px-2">% Complete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {draw.lineItems.slice(0, 5).map((item) => (
                              <tr key={item.id} className="border-t border-gray-100">
                                <td className="py-1.5 px-2">{item.description || '-'}</td>
                                <td className="py-1.5 px-2 text-right">{formatCurrency(item.scheduledValue)}</td>
                                <td className="py-1.5 px-2 text-right">{formatCurrency(item.currentDraw)}</td>
                                <td className="py-1.5 px-2 text-right">{item.percentComplete}%</td>
                              </tr>
                            ))}
                            {draw.lineItems.length > 5 && (
                              <tr className="border-t border-gray-100 bg-gray-50">
                                <td colSpan={4} className="py-1.5 px-2 text-center text-gray-500">
                                  +{draw.lineItems.length - 5} more items
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {draw.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm">{draw.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(draw)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(draw.id)}
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
              <Wallet className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('tools.drawSchedule.drawScheduleManager', 'Draw Schedule Manager')}</h1>
              <p className="text-sm text-gray-500">{t('tools.drawSchedule.trackConstructionPaymentApplicationsAnd', 'Track construction payment applications and draws')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="draw-schedule" toolName="Draw Schedule" />

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
              disabled={draws.length === 0}
            />
            {activeTab === 'list' && (
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('create');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.drawSchedule.newDraw', 'New Draw')}
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
              <span className="text-xs">{t('tools.drawSchedule.totalDraws', 'Total Draws')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDraws}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">{t('tools.drawSchedule.pending', 'Pending')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs">{t('tools.drawSchedule.approved', 'Approved')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-purple-500 mb-1">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs">{t('tools.drawSchedule.paid', 'Paid')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">{t('tools.drawSchedule.requested', 'Requested')}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRequested)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-teal-500 mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-xs">{t('tools.drawSchedule.totalPaid', 'Total Paid')}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <Percent className="w-4 h-4" />
              <span className="text-xs">{t('tools.drawSchedule.retainage', 'Retainage')}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRetained)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-indigo-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">{t('tools.drawSchedule.avgDraw', 'Avg Draw')}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.avgDrawAmount)}</p>
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
            {t('tools.drawSchedule.allDraws', 'All Draws')}
          </button>
          <button
            onClick={() => {
              resetForm();
              setActiveTab('create');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {t('tools.drawSchedule.createDraw', 'Create Draw')}
          </button>
          {activeTab === 'edit' && (
            <button
              className="px-4 py-2 rounded-lg font-medium bg-teal-600 text-white"
            >
              {t('tools.drawSchedule.editDraw', 'Edit Draw')}
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'list' && renderList()}
        {(activeTab === 'create' || activeTab === 'edit') && renderForm()}
      </div>

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium text-red-800">{validationMessage}</p>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default DrawScheduleTool;
