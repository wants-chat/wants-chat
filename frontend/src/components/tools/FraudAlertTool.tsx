import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  User,
  CreditCard,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  Phone,
  Mail,
  Shield,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Loader2 } from 'lucide-react';

interface FraudAlert {
  id: string;
  alertId: string;
  alertType: 'transaction' | 'account' | 'identity' | 'card' | 'ach' | 'wire' | 'check' | 'atm';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved' | 'escalated';
  customerName: string;
  customerId: string;
  accountNumber: string;
  cardNumber: string;
  alertDescription: string;
  triggerReason: string;
  riskScore: number;
  transactionAmount: number;
  transactionDate: string;
  transactionLocation: string;
  merchantName: string;
  merchantCategory: string;
  ipAddress: string;
  deviceId: string;
  previousAlerts: number;
  customerContacted: boolean;
  contactMethod: string;
  contactDate: string;
  customerResponse: string;
  investigator: string;
  investigationNotes: string;
  actionTaken: string;
  lossAmount: number;
  recoveredAmount: number;
  fraudConfirmed: boolean;
  reportedToAuthorities: boolean;
  sarFiled: boolean;
  createdAt: string;
  resolvedAt: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'alertId', header: 'Alert ID', width: 12 },
  { key: 'alertType', header: 'Type', width: 10 },
  { key: 'severity', header: 'Severity', width: 10 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'customerName', header: 'Customer', width: 15 },
  { key: 'accountNumber', header: 'Account', width: 12 },
  { key: 'riskScore', header: 'Risk Score', width: 10 },
  { key: 'transactionAmount', header: 'Amount', width: 12 },
  { key: 'transactionDate', header: 'Date', width: 12 },
  { key: 'investigator', header: 'Investigator', width: 12 },
  { key: 'lossAmount', header: 'Loss', width: 10 },
];

const STATUS_CONFIG = {
  new: { color: 'bg-red-100 text-red-800', icon: AlertOctagon, label: 'New' },
  investigating: { color: 'bg-yellow-100 text-yellow-800', icon: Eye, label: 'Investigating' },
  confirmed: { color: 'bg-red-100 text-red-800', icon: ShieldAlert, label: 'Confirmed Fraud' },
  false_positive: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'False Positive' },
  resolved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Resolved' },
  escalated: { color: 'bg-purple-100 text-purple-800', icon: TrendingUp, label: 'Escalated' },
};

const SEVERITY_CONFIG = {
  critical: { color: 'bg-red-100 text-red-800', label: 'Critical', textColor: 'text-red-600' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High', textColor: 'text-orange-600' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium', textColor: 'text-yellow-600' },
  low: { color: 'bg-green-100 text-green-800', label: 'Low', textColor: 'text-green-600' },
};

const TYPE_CONFIG = {
  transaction: { icon: DollarSign, label: 'Transaction' },
  account: { icon: User, label: 'Account Takeover' },
  identity: { icon: Shield, label: 'Identity Theft' },
  card: { icon: CreditCard, label: 'Card Fraud' },
  ach: { icon: Activity, label: 'ACH Fraud' },
  wire: { icon: TrendingUp, label: 'Wire Fraud' },
  check: { icon: FileText, label: 'Check Fraud' },
  atm: { icon: DollarSign, label: 'ATM Fraud' },
};

export default function FraudAlertTool() {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const {
    data: alerts,
    isLoading,
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
    importCSV,
    importJSON,
    copyToClipboard,
    print,
  } = useToolData<FraudAlert>('fraud-alert-tool', [], COLUMNS);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'alerts' | 'new' | 'analytics'>('alerts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingAlert, setEditingAlert] = useState<FraudAlert | null>(null);

  const [formData, setFormData] = useState({
    alertType: 'transaction' as const,
    severity: 'medium' as const,
    customerName: '',
    customerId: '',
    accountNumber: '',
    cardNumber: '',
    alertDescription: '',
    triggerReason: '',
    riskScore: 0,
    transactionAmount: 0,
    transactionDate: '',
    transactionLocation: '',
    merchantName: '',
    merchantCategory: '',
    ipAddress: '',
    deviceId: '',
    previousAlerts: 0,
    investigator: '',
    investigationNotes: '',
  });

  const resetForm = () => {
    setFormData({
      alertType: 'transaction',
      severity: 'medium',
      customerName: '',
      customerId: '',
      accountNumber: '',
      cardNumber: '',
      alertDescription: '',
      triggerReason: '',
      riskScore: 0,
      transactionAmount: 0,
      transactionDate: '',
      transactionLocation: '',
      merchantName: '',
      merchantCategory: '',
      ipAddress: '',
      deviceId: '',
      previousAlerts: 0,
      investigator: '',
      investigationNotes: '',
    });
    setEditingAlert(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAlert) {
      updateItem(editingAlert.id, formData);
    } else {
      const newAlert: FraudAlert = {
        id: Date.now().toString(),
        alertId: `FRD${Date.now().toString().slice(-8)}`,
        ...formData,
        status: 'new',
        customerContacted: false,
        contactMethod: '',
        contactDate: '',
        customerResponse: '',
        actionTaken: '',
        lossAmount: 0,
        recoveredAmount: 0,
        fraudConfirmed: false,
        reportedToAuthorities: false,
        sarFiled: false,
        resolvedAt: '',
        createdAt: new Date().toISOString(),
      };
      addItem(newAlert);
    }

    resetForm();
    setActiveTab('alerts');
  };

  const handleEdit = (alert: FraudAlert) => {
    setEditingAlert(alert);
    setFormData({
      alertType: alert.alertType,
      severity: alert.severity,
      customerName: alert.customerName,
      customerId: alert.customerId,
      accountNumber: alert.accountNumber,
      cardNumber: alert.cardNumber,
      alertDescription: alert.alertDescription,
      triggerReason: alert.triggerReason,
      riskScore: alert.riskScore,
      transactionAmount: alert.transactionAmount,
      transactionDate: alert.transactionDate,
      transactionLocation: alert.transactionLocation,
      merchantName: alert.merchantName,
      merchantCategory: alert.merchantCategory,
      ipAddress: alert.ipAddress,
      deviceId: alert.deviceId,
      previousAlerts: alert.previousAlerts,
      investigator: alert.investigator,
      investigationNotes: alert.investigationNotes,
    });
    setActiveTab('new');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Fraud Alert',
      message: 'Are you sure you want to delete this fraud alert? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const updateStatus = (id: string, status: FraudAlert['status']) => {
    const updates: Partial<FraudAlert> = { status };
    if (status === 'resolved') {
      updates.resolvedAt = new Date().toISOString();
    }
    if (status === 'confirmed') {
      updates.fraudConfirmed = true;
    }
    updateItem(id, updates);
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.alertId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alertDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'all' || alert.alertType === typeFilter;
    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  // Analytics calculations
  const totalAlerts = alerts.length;
  const newAlerts = alerts.filter((a) => a.status === 'new').length;
  const investigatingAlerts = alerts.filter((a) => a.status === 'investigating').length;
  const confirmedFraud = alerts.filter((a) => a.status === 'confirmed' || a.fraudConfirmed).length;
  const falsePositives = alerts.filter((a) => a.status === 'false_positive').length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;
  const totalLoss = alerts.reduce((sum, a) => sum + a.lossAmount, 0);
  const totalRecovered = alerts.reduce((sum, a) => sum + a.recoveredAmount, 0);
  const avgRiskScore = totalAlerts > 0
    ? (alerts.reduce((sum, a) => sum + a.riskScore, 0) / totalAlerts).toFixed(1)
    : '0.0';

  const bySeverity = alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byType = alerts.reduce((acc, a) => {
    acc[a.alertType] = (acc[a.alertType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{t('tools.fraudAlert.fraudAlertSystem', 'Fraud Alert System')}</h1>
              <p className="text-sm text-gray-500">{t('tools.fraudAlert.monitorAndInvestigateSuspiciousActivities', 'Monitor and investigate suspicious activities')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="fraud-alert" toolName="Fraud Alert" />

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
              onExportPDF={() => exportPDF('Fraud Alerts')}
              onImportCSV={importCSV}
              onImportJSON={importJSON}
              onCopyClipboard={copyToClipboard}
              onPrint={() => print('Fraud Alerts')}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Alerts ({newAlerts} new)
          </button>
          <button
            onClick={() => {
              resetForm();
              setActiveTab('new');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'new'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.fraudAlert.createAlert', 'Create Alert')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('tools.fraudAlert.analytics', 'Analytics')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.fraudAlert.searchByAlertIdCustomer', 'Search by alert ID, customer, account...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">{t('tools.fraudAlert.allTypes', 'All Types')}</option>
                  <option value="transaction">{t('tools.fraudAlert.transaction', 'Transaction')}</option>
                  <option value="account">{t('tools.fraudAlert.accountTakeover', 'Account Takeover')}</option>
                  <option value="identity">{t('tools.fraudAlert.identityTheft', 'Identity Theft')}</option>
                  <option value="card">{t('tools.fraudAlert.cardFraud', 'Card Fraud')}</option>
                  <option value="ach">{t('tools.fraudAlert.achFraud', 'ACH Fraud')}</option>
                  <option value="wire">{t('tools.fraudAlert.wireFraud', 'Wire Fraud')}</option>
                  <option value="check">{t('tools.fraudAlert.checkFraud', 'Check Fraud')}</option>
                  <option value="atm">{t('tools.fraudAlert.atmFraud', 'ATM Fraud')}</option>
                </select>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">{t('tools.fraudAlert.allSeverities', 'All Severities')}</option>
                  <option value="critical">{t('tools.fraudAlert.critical', 'Critical')}</option>
                  <option value="high">{t('tools.fraudAlert.high', 'High')}</option>
                  <option value="medium">{t('tools.fraudAlert.medium', 'Medium')}</option>
                  <option value="low">{t('tools.fraudAlert.low', 'Low')}</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">{t('tools.fraudAlert.allStatuses', 'All Statuses')}</option>
                  <option value="new">{t('tools.fraudAlert.new', 'New')}</option>
                  <option value="investigating">{t('tools.fraudAlert.investigating', 'Investigating')}</option>
                  <option value="confirmed">{t('tools.fraudAlert.confirmed', 'Confirmed')}</option>
                  <option value="false_positive">{t('tools.fraudAlert.falsePositive', 'False Positive')}</option>
                  <option value="resolved">{t('tools.fraudAlert.resolved', 'Resolved')}</option>
                  <option value="escalated">{t('tools.fraudAlert.escalated', 'Escalated')}</option>
                </select>
              </div>
            </div>

            {/* Alert List */}
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('tools.fraudAlert.noFraudAlertsFound', 'No fraud alerts found')}</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const statusConfig = STATUS_CONFIG[alert.status];
                  const StatusIcon = statusConfig.icon;
                  const severityConfig = SEVERITY_CONFIG[alert.severity];
                  const typeConfig = TYPE_CONFIG[alert.alertType];
                  const TypeIcon = typeConfig.icon;
                  const isExpanded = expandedId === alert.id;

                  return (
                    <div
                      key={alert.id}
                      className={`bg-white rounded-lg border ${alert.severity === 'critical' ? 'border-red-300 border-l-4 border-l-red-500' : 'border-gray-200'} overflow-hidden`}
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-red-100' : 'bg-orange-50'}`}>
                              <TypeIcon className={`w-5 h-5 ${alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{alert.alertId}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityConfig.color}`}>
                                  {severityConfig.label}
                                </span>
                                {alert.status === 'new' && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white animate-pulse">
                                    {t('tools.fraudAlert.new2', 'NEW')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {alert.customerName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  {alert.accountNumber}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  Risk: {alert.riskScore}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                ${alert.transactionAmount.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {alert.transactionDate}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Alert Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Alert Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">{t('tools.fraudAlert.description', 'Description:')}</span>
                                  <p className="font-medium mt-1">{alert.alertDescription}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">{t('tools.fraudAlert.triggerReason', 'Trigger Reason:')}</span>
                                  <p className="font-medium mt-1">{alert.triggerReason}</p>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.riskScore', 'Risk Score:')}</span>
                                  <span className={`font-medium ${alert.riskScore >= 80 ? 'text-red-600' : alert.riskScore >= 50 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {alert.riskScore}/100
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.previousAlerts', 'Previous Alerts:')}</span>
                                  <span className="font-medium">{alert.previousAlerts}</span>
                                </div>
                              </div>
                            </div>

                            {/* Transaction Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Transaction Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.merchant', 'Merchant:')}</span>
                                  <span className="font-medium">{alert.merchantName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.category', 'Category:')}</span>
                                  <span className="font-medium">{alert.merchantCategory || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.location', 'Location:')}</span>
                                  <span className="font-medium">{alert.transactionLocation || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.ipAddress', 'IP Address:')}</span>
                                  <span className="font-medium font-mono">{alert.ipAddress || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.deviceId', 'Device ID:')}</span>
                                  <span className="font-medium font-mono text-xs">{alert.deviceId || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Customer Contact */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Phone className="w-4 h-4" /> Customer Contact
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.contacted', 'Contacted:')}</span>
                                  <span className={`font-medium ${alert.customerContacted ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {alert.customerContacted ? 'Yes' : 'No'}
                                  </span>
                                </div>
                                {alert.customerContacted && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">{t('tools.fraudAlert.method', 'Method:')}</span>
                                      <span className="font-medium">{alert.contactMethod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">{t('tools.fraudAlert.date', 'Date:')}</span>
                                      <span className="font-medium">{alert.contactDate}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">{t('tools.fraudAlert.response', 'Response:')}</span>
                                      <p className="font-medium mt-1">{alert.customerResponse || 'No response recorded'}</p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Investigation & Resolution */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Investigation
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.investigator', 'Investigator:')}</span>
                                  <span className="font-medium">{alert.investigator || 'Not assigned'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.fraudConfirmed', 'Fraud Confirmed:')}</span>
                                  <span className={`font-medium ${alert.fraudConfirmed ? 'text-red-600' : 'text-gray-600'}`}>
                                    {alert.fraudConfirmed ? 'Yes' : 'No'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.lossAmount', 'Loss Amount:')}</span>
                                  <span className="font-medium text-red-600">${alert.lossAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.recovered', 'Recovered:')}</span>
                                  <span className="font-medium text-green-600">${alert.recoveredAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.fraudAlert.sarFiled', 'SAR Filed:')}</span>
                                  <span className={`font-medium ${alert.sarFiled ? 'text-green-600' : 'text-gray-600'}`}>
                                    {alert.sarFiled ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {alert.investigationNotes && (
                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>{t('tools.fraudAlert.investigationNotes', 'Investigation Notes:')}</strong> {alert.investigationNotes}
                              </p>
                            </div>
                          )}

                          {alert.actionTaken && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>{t('tools.fraudAlert.actionTaken', 'Action Taken:')}</strong> {alert.actionTaken}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                            <div className="flex gap-2">
                              {alert.status === 'new' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(alert.id, 'investigating');
                                  }}
                                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                                >
                                  {t('tools.fraudAlert.startInvestigation', 'Start Investigation')}
                                </button>
                              )}
                              {alert.status === 'investigating' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateStatus(alert.id, 'confirmed');
                                    }}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                  >
                                    {t('tools.fraudAlert.confirmFraud', 'Confirm Fraud')}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateStatus(alert.id, 'false_positive');
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                  >
                                    {t('tools.fraudAlert.falsePositive2', 'False Positive')}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateStatus(alert.id, 'escalated');
                                    }}
                                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                                  >
                                    {t('tools.fraudAlert.escalate', 'Escalate')}
                                  </button>
                                </>
                              )}
                              {(alert.status === 'confirmed' || alert.status === 'false_positive') && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(alert.id, 'resolved');
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                  {t('tools.fraudAlert.markResolved', 'Mark Resolved')}
                                </button>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(alert);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(alert.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {editingAlert ? t('tools.fraudAlert.editFraudAlert', 'Edit Fraud Alert') : t('tools.fraudAlert.createFraudAlert', 'Create Fraud Alert')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Alert Classification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.fraudAlert.alertType', 'Alert Type')}
                    </label>
                    <select
                      value={formData.alertType}
                      onChange={(e) => setFormData({ ...formData, alertType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="transaction">{t('tools.fraudAlert.transactionFraud', 'Transaction Fraud')}</option>
                      <option value="account">{t('tools.fraudAlert.accountTakeover2', 'Account Takeover')}</option>
                      <option value="identity">{t('tools.fraudAlert.identityTheft2', 'Identity Theft')}</option>
                      <option value="card">{t('tools.fraudAlert.cardFraud2', 'Card Fraud')}</option>
                      <option value="ach">{t('tools.fraudAlert.achFraud2', 'ACH Fraud')}</option>
                      <option value="wire">{t('tools.fraudAlert.wireFraud2', 'Wire Fraud')}</option>
                      <option value="check">{t('tools.fraudAlert.checkFraud2', 'Check Fraud')}</option>
                      <option value="atm">{t('tools.fraudAlert.atmFraud2', 'ATM Fraud')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.fraudAlert.severity', 'Severity')}
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="critical">{t('tools.fraudAlert.critical2', 'Critical')}</option>
                      <option value="high">{t('tools.fraudAlert.high2', 'High')}</option>
                      <option value="medium">{t('tools.fraudAlert.medium2', 'Medium')}</option>
                      <option value="low">{t('tools.fraudAlert.low2', 'Low')}</option>
                    </select>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.customerName', 'Customer Name')}
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.customerId', 'Customer ID')}
                      </label>
                      <input
                        type="text"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.accountNumber', 'Account Number')}
                      </label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.cardNumberIfApplicable', 'Card Number (if applicable)')}
                      </label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="****-****-****-1234"
                      />
                    </div>
                  </div>
                </div>

                {/* Alert Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Alert Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.alertDescription', 'Alert Description')}
                      </label>
                      <textarea
                        value={formData.alertDescription}
                        onChange={(e) => setFormData({ ...formData, alertDescription: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder={t('tools.fraudAlert.describeTheSuspiciousActivity', 'Describe the suspicious activity...')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.triggerReason2', 'Trigger Reason')}
                      </label>
                      <input
                        type="text"
                        value={formData.triggerReason}
                        onChange={(e) => setFormData({ ...formData, triggerReason: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder={t('tools.fraudAlert.eGUnusualLocationHigh', 'e.g., Unusual location, High amount, Pattern deviation')}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('tools.fraudAlert.riskScore0100', 'Risk Score (0-100)')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.riskScore}
                          onChange={(e) => setFormData({ ...formData, riskScore: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('tools.fraudAlert.previousAlerts2', 'Previous Alerts')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.previousAlerts}
                          onChange={(e) => setFormData({ ...formData, previousAlerts: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Transaction Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.transactionAmount', 'Transaction Amount')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.transactionAmount}
                        onChange={(e) => setFormData({ ...formData, transactionAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.transactionDate', 'Transaction Date')}
                      </label>
                      <input
                        type="date"
                        value={formData.transactionDate}
                        onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.transactionLocation', 'Transaction Location')}
                      </label>
                      <input
                        type="text"
                        value={formData.transactionLocation}
                        onChange={(e) => setFormData({ ...formData, transactionLocation: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder={t('tools.fraudAlert.cityStateCountry', 'City, State, Country')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.merchantName', 'Merchant Name')}
                      </label>
                      <input
                        type="text"
                        value={formData.merchantName}
                        onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.merchantCategory', 'Merchant Category')}
                      </label>
                      <input
                        type="text"
                        value={formData.merchantCategory}
                        onChange={(e) => setFormData({ ...formData, merchantCategory: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder={t('tools.fraudAlert.eGRetailOnlineAtm', 'e.g., Retail, Online, ATM')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.ipAddress2', 'IP Address')}
                      </label>
                      <input
                        type="text"
                        value={formData.ipAddress}
                        onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="192.168.1.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.deviceId2', 'Device ID')}
                      </label>
                      <input
                        type="text"
                        value={formData.deviceId}
                        onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Assignment */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Assignment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.investigator2', 'Investigator')}
                      </label>
                      <input
                        type="text"
                        value={formData.investigator}
                        onChange={(e) => setFormData({ ...formData, investigator: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder={t('tools.fraudAlert.assignInvestigator', 'Assign investigator...')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.fraudAlert.investigationNotes2', 'Investigation Notes')}
                      </label>
                      <input
                        type="text"
                        value={formData.investigationNotes}
                        onChange={(e) => setFormData({ ...formData, investigationNotes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder={t('tools.fraudAlert.initialNotes', 'Initial notes...')}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('alerts');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    {t('tools.fraudAlert.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {editingAlert ? t('tools.fraudAlert.updateAlert', 'Update Alert') : t('tools.fraudAlert.createAlert2', 'Create Alert')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.fraudAlert.totalAlerts', 'Total Alerts')}</p>
                    <p className="text-2xl font-bold text-gray-900">{totalAlerts}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.fraudAlert.confirmedFraud', 'Confirmed Fraud')}</p>
                    <p className="text-2xl font-bold text-gray-900">{confirmedFraud}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Eye className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.fraudAlert.investigating2', 'Investigating')}</p>
                    <p className="text-2xl font-bold text-gray-900">{investigatingAlerts}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.fraudAlert.falsePositives', 'False Positives')}</p>
                    <p className="text-2xl font-bold text-gray-900">{falsePositives}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Impact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.fraudAlert.totalLoss', 'Total Loss')}</p>
                    <p className="text-2xl font-bold text-red-600">${totalLoss.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.fraudAlert.recovered2', 'Recovered')}</p>
                    <p className="text-2xl font-bold text-green-600">${totalRecovered.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.fraudAlert.avgRiskScore', 'Avg Risk Score')}</p>
                    <p className="text-2xl font-bold text-gray-900">{avgRiskScore}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Severity */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4">{t('tools.fraudAlert.alertsBySeverity', 'Alerts by Severity')}</h3>
                <div className="space-y-3">
                  {Object.entries(bySeverity).map(([severity, count]) => {
                    const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
                    return (
                      <div key={severity} className="flex items-center justify-between">
                        <span className={`text-sm px-2 py-0.5 rounded ${config?.color || ''}`}>
                          {config?.label || severity}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${severity === 'critical' ? 'bg-red-600' : severity === 'high' ? 'bg-orange-600' : severity === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}`}
                              style={{ width: `${(count / totalAlerts) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By Type */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4">{t('tools.fraudAlert.alertsByType', 'Alerts by Type')}</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {Object.entries(byType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => {
                      const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{config?.label || type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-600 h-2 rounded-full"
                                style={{ width: `${(count / totalAlerts) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">{t('tools.fraudAlert.quickStatistics', 'Quick Statistics')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.fraudAlert.criticalAlerts', 'Critical Alerts')}</p>
                  <p className="text-xl font-bold text-red-600">{criticalAlerts}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.fraudAlert.newAlerts', 'New Alerts')}</p>
                  <p className="text-xl font-bold text-orange-600">{newAlerts}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.fraudAlert.netLoss', 'Net Loss')}</p>
                  <p className="text-xl font-bold text-blue-600">${(totalLoss - totalRecovered).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.fraudAlert.recoveryRate', 'Recovery Rate')}</p>
                  <p className="text-xl font-bold text-green-600">
                    {totalLoss > 0 ? ((totalRecovered / totalLoss) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
}
