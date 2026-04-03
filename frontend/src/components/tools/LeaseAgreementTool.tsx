'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileCheck,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Calendar,
  DollarSign,
  User,
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface LeaseAgreement {
  id: string;
  propertyAddress: string;
  propertyType: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  landlordName: string;
  landlordEmail: string;
  monthlyRent: number;
  securityDeposit: number;
  leaseStartDate: string;
  leaseEndDate: string;
  leaseTerm: number;
  rentDueDay: number;
  lateFee: number;
  lateFeeGracePeriod: number;
  petDeposit?: number;
  petPolicy: 'allowed' | 'not_allowed' | 'case_by_case';
  utilitiesIncluded: string[];
  parkingSpaces: number;
  renewalOption: boolean;
  terminationClause: string;
  status: 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated';
  signedByTenant?: boolean;
  signedByLandlord?: boolean;
  tenantSignDate?: string;
  landlordSignDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'tenantName', header: 'Tenant', type: 'string' },
  { key: 'landlordName', header: 'Landlord', type: 'string' },
  { key: 'monthlyRent', header: 'Rent', type: 'currency' },
  { key: 'leaseStartDate', header: 'Start Date', type: 'date' },
  { key: 'leaseEndDate', header: 'End Date', type: 'date' },
  { key: 'leaseTerm', header: 'Term (months)', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

const LEASE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'text-gray-500 bg-gray-500/10' },
  { value: 'pending_signature', label: 'Pending Signature', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'active', label: 'Active', color: 'text-green-500 bg-green-500/10' },
  { value: 'expired', label: 'Expired', color: 'text-red-500 bg-red-500/10' },
  { value: 'terminated', label: 'Terminated', color: 'text-purple-500 bg-purple-500/10' },
];

const UTILITIES = ['Electricity', 'Gas', 'Water', 'Sewer', 'Trash', 'Internet', 'Cable', 'Heating', 'Cooling'];

export const LeaseAgreementTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: leases,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    forceSync,
  } = useToolData<LeaseAgreement>('lease-agreement', [], columns);

  const [showModal, setShowModal] = useState(false);
  const [editingLease, setEditingLease] = useState<LeaseAgreement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [form, setForm] = useState<Partial<LeaseAgreement>>({
    propertyAddress: '',
    propertyType: 'apartment',
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    landlordName: '',
    landlordEmail: '',
    monthlyRent: 0,
    securityDeposit: 0,
    leaseStartDate: '',
    leaseEndDate: '',
    leaseTerm: 12,
    rentDueDay: 1,
    lateFee: 50,
    lateFeeGracePeriod: 5,
    petPolicy: 'not_allowed',
    utilitiesIncluded: [],
    parkingSpaces: 0,
    renewalOption: true,
    terminationClause: '30 days written notice required',
    status: 'draft',
  });

  const filteredLeases = useMemo(() => {
    return leases.filter(lease => {
      const matchesSearch = !searchQuery ||
        lease.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lease.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lease.landlordName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lease.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leases, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const active = leases.filter(l => l.status === 'active');
    const expiringIn30Days = active.filter(l => {
      const endDate = new Date(l.leaseEndDate);
      const today = new Date();
      const diffDays = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    });
    const totalMonthlyRevenue = active.reduce((sum, l) => sum + l.monthlyRent, 0);
    return {
      total: leases.length,
      active: active.length,
      pending: leases.filter(l => l.status === 'pending_signature').length,
      expiringSoon: expiringIn30Days.length,
      totalMonthlyRevenue,
    };
  }, [leases]);

  const handleSubmit = () => {
    if (!form.propertyAddress || !form.tenantName || !form.monthlyRent) return;

    const now = new Date().toISOString();
    if (editingLease) {
      updateItem(editingLease.id, { ...form, updatedAt: now });
    } else {
      const newLease: LeaseAgreement = {
        id: `lease-${Date.now()}`,
        propertyAddress: form.propertyAddress || '',
        propertyType: form.propertyType || 'apartment',
        tenantName: form.tenantName || '',
        tenantEmail: form.tenantEmail || '',
        tenantPhone: form.tenantPhone || '',
        landlordName: form.landlordName || '',
        landlordEmail: form.landlordEmail || '',
        monthlyRent: form.monthlyRent || 0,
        securityDeposit: form.securityDeposit || 0,
        leaseStartDate: form.leaseStartDate || '',
        leaseEndDate: form.leaseEndDate || '',
        leaseTerm: form.leaseTerm || 12,
        rentDueDay: form.rentDueDay || 1,
        lateFee: form.lateFee || 50,
        lateFeeGracePeriod: form.lateFeeGracePeriod || 5,
        petDeposit: form.petDeposit,
        petPolicy: form.petPolicy || 'not_allowed',
        utilitiesIncluded: form.utilitiesIncluded || [],
        parkingSpaces: form.parkingSpaces || 0,
        renewalOption: form.renewalOption ?? true,
        terminationClause: form.terminationClause || '',
        status: form.status || 'draft',
        signedByTenant: false,
        signedByLandlord: false,
        notes: form.notes,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newLease);
    }
    resetForm();
    setShowModal(false);
    setEditingLease(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Lease Agreement',
      message: 'Are you sure you want to delete this lease agreement? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleStatusChange = (id: string, status: LeaseAgreement['status']) => {
    updateItem(id, { status, updatedAt: new Date().toISOString() });
  };

  const resetForm = () => {
    setForm({
      propertyAddress: '',
      propertyType: 'apartment',
      tenantName: '',
      tenantEmail: '',
      tenantPhone: '',
      landlordName: '',
      landlordEmail: '',
      monthlyRent: 0,
      securityDeposit: 0,
      leaseStartDate: '',
      leaseEndDate: '',
      leaseTerm: 12,
      rentDueDay: 1,
      lateFee: 50,
      lateFeeGracePeriod: 5,
      petPolicy: 'not_allowed',
      utilitiesIncluded: [],
      parkingSpaces: 0,
      renewalOption: true,
      terminationClause: '30 days written notice required',
      status: 'draft',
    });
  };

  const calculateEndDate = (startDate: string, termMonths: number) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + termMonths);
    return date.toISOString().split('T')[0];
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    return Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <FileCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.leaseAgreement.leaseAgreements', 'Lease Agreements')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.leaseAgreement.generateAndManageLeaseAgreements', 'Generate and manage lease agreements')}
                  </p>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="lease-agreement" toolName="Lease Agreement" />

              <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.leaseAgreement.totalLeases', 'Total Leases')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.leaseAgreement.active', 'Active')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.active}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.leaseAgreement.pending', 'Pending')}</p>
            <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.leaseAgreement.expiringSoon', 'Expiring Soon')}</p>
            <p className="text-2xl font-bold text-red-500">{stats.expiringSoon}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.leaseAgreement.monthlyRevenue', 'Monthly Revenue')}</p>
            <p className="text-2xl font-bold text-emerald-500">${stats.totalMonthlyRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={cardClass}>
          <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder={t('tools.leaseAgreement.searchLeases', 'Search leases...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-10 w-64`} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.leaseAgreement.allStatus', 'All Status')}</option>
                {LEASE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'lease-agreements' })}
                onExportExcel={() => exportExcel({ filename: 'lease-agreements' })}
                onExportJSON={() => exportJSON({ filename: 'lease-agreements' })}
                onExportPDF={async () => { await exportPDF({ filename: 'lease-agreements', title: 'Lease Agreements' }); }}
                onPrint={() => print('Lease Agreements')}
                onCopyToClipboard={() => copyToClipboard()}
                disabled={leases.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => setShowModal(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" />
                {t('tools.leaseAgreement.newLease', 'New Lease')}
              </button>
            </div>
          </div>
        </div>

        {/* Leases List */}
        <div className="space-y-4">
          {filteredLeases.map(lease => {
            const statusInfo = LEASE_STATUSES.find(s => s.value === lease.status);
            const daysUntilExpiry = getDaysUntilExpiry(lease.leaseEndDate);
            const isExpiringSoon = lease.status === 'active' && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

            return (
              <div key={lease.id} className={`${cardClass} p-4`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <FileText className={`w-6 h-6 ${lease.status === 'active' ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{lease.propertyAddress}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
                        {isExpiringSoon && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium text-red-500 bg-red-500/10 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Expires in {daysUntilExpiry} days
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <User className="w-4 h-4" />
                          {lease.tenantName}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <DollarSign className="w-4 h-4" />
                          ${lease.monthlyRent.toLocaleString()}/mo
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Calendar className="w-4 h-4" />
                          {new Date(lease.leaseStartDate).toLocaleDateString()} - {new Date(lease.leaseEndDate).toLocaleDateString()}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Clock className="w-4 h-4" />
                          {lease.leaseTerm} months
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lease.status === 'draft' && (
                      <button onClick={() => handleStatusChange(lease.id, 'pending_signature')} className="px-3 py-1.5 text-sm rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                        {t('tools.leaseAgreement.sendForSignature', 'Send for Signature')}
                      </button>
                    )}
                    {lease.status === 'pending_signature' && (
                      <button onClick={() => handleStatusChange(lease.id, 'active')} className="px-3 py-1.5 text-sm rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {t('tools.leaseAgreement.markSigned', 'Mark Signed')}
                      </button>
                    )}
                    {lease.status === 'active' && isExpiringSoon && (
                      <button className="px-3 py-1.5 text-sm rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 flex items-center gap-1">
                        <RefreshCw className="w-4 h-4" />
                        {t('tools.leaseAgreement.renewLease', 'Renew Lease')}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingLease(lease);
                        setForm(lease);
                        setShowModal(true);
                      }}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    <button onClick={() => handleDelete(lease.id)} className="p-2 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLeases.length === 0 && (
          <div className={`${cardClass} text-center py-12`}>
            <FileCheck className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.leaseAgreement.noLeaseAgreementsFound', 'No lease agreements found')}</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.leaseAgreement.createYourFirstLeaseAgreement', 'Create your first lease agreement')}</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingLease ? t('tools.leaseAgreement.editLeaseAgreement', 'Edit Lease Agreement') : t('tools.leaseAgreement.newLeaseAgreement', 'New Lease Agreement')}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingLease(null); resetForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Property Info */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.leaseAgreement.propertyInformation', 'Property Information')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelClass}>{t('tools.leaseAgreement.propertyAddress', 'Property Address *')}</label>
                      <input type="text" value={form.propertyAddress || ''} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.propertyType', 'Property Type')}</label>
                      <select value={form.propertyType || 'apartment'} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className={inputClass}>
                        <option value="apartment">{t('tools.leaseAgreement.apartment', 'Apartment')}</option>
                        <option value="house">{t('tools.leaseAgreement.house', 'House')}</option>
                        <option value="condo">{t('tools.leaseAgreement.condo', 'Condo')}</option>
                        <option value="townhouse">{t('tools.leaseAgreement.townhouse', 'Townhouse')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tenant Info */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.leaseAgreement.tenantInformation', 'Tenant Information')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.tenantName', 'Tenant Name *')}</label>
                      <input type="text" value={form.tenantName || ''} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.email', 'Email')}</label>
                      <input type="email" value={form.tenantEmail || ''} onChange={(e) => setForm({ ...form, tenantEmail: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.phone', 'Phone')}</label>
                      <input type="tel" value={form.tenantPhone || ''} onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Landlord Info */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.leaseAgreement.landlordInformation', 'Landlord Information')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.landlordName', 'Landlord Name')}</label>
                      <input type="text" value={form.landlordName || ''} onChange={(e) => setForm({ ...form, landlordName: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.landlordEmail', 'Landlord Email')}</label>
                      <input type="email" value={form.landlordEmail || ''} onChange={(e) => setForm({ ...form, landlordEmail: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Lease Terms */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.leaseAgreement.leaseTerms', 'Lease Terms')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.monthlyRent', 'Monthly Rent ($) *')}</label>
                      <input type="number" value={form.monthlyRent || ''} onChange={(e) => setForm({ ...form, monthlyRent: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.securityDeposit', 'Security Deposit ($)')}</label>
                      <input type="number" value={form.securityDeposit || ''} onChange={(e) => setForm({ ...form, securityDeposit: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.startDate', 'Start Date')}</label>
                      <input type="date" value={form.leaseStartDate || ''} onChange={(e) => {
                        const startDate = e.target.value;
                        setForm({
                          ...form,
                          leaseStartDate: startDate,
                          leaseEndDate: calculateEndDate(startDate, form.leaseTerm || 12)
                        });
                      }} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.leaseTermMonths', 'Lease Term (months)')}</label>
                      <select value={form.leaseTerm || 12} onChange={(e) => {
                        const term = parseInt(e.target.value);
                        setForm({
                          ...form,
                          leaseTerm: term,
                          leaseEndDate: calculateEndDate(form.leaseStartDate || '', term)
                        });
                      }} className={inputClass}>
                        <option value={6}>6 months</option>
                        <option value={12}>12 months</option>
                        <option value={18}>18 months</option>
                        <option value={24}>24 months</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.rentDueDay', 'Rent Due Day')}</label>
                      <input type="number" value={form.rentDueDay || 1} onChange={(e) => setForm({ ...form, rentDueDay: parseInt(e.target.value) || 1 })} min="1" max="31" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.lateFee', 'Late Fee ($)')}</label>
                      <input type="number" value={form.lateFee || ''} onChange={(e) => setForm({ ...form, lateFee: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Additional Terms */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.leaseAgreement.additionalTerms', 'Additional Terms')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.petPolicy', 'Pet Policy')}</label>
                      <select value={form.petPolicy || 'not_allowed'} onChange={(e) => setForm({ ...form, petPolicy: e.target.value as LeaseAgreement['petPolicy'] })} className={inputClass}>
                        <option value="allowed">{t('tools.leaseAgreement.petsAllowed', 'Pets Allowed')}</option>
                        <option value="not_allowed">{t('tools.leaseAgreement.noPets', 'No Pets')}</option>
                        <option value="case_by_case">{t('tools.leaseAgreement.caseByCase', 'Case by Case')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.leaseAgreement.parkingSpaces', 'Parking Spaces')}</label>
                      <input type="number" value={form.parkingSpaces || 0} onChange={(e) => setForm({ ...form, parkingSpaces: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>{t('tools.leaseAgreement.utilitiesIncluded', 'Utilities Included')}</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {UTILITIES.map(utility => (
                          <label key={utility} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                            form.utilitiesIncluded?.includes(utility)
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                              : isDark ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'
                          }`}>
                            <input
                              type="checkbox"
                              checked={form.utilitiesIncluded?.includes(utility) || false}
                              onChange={(e) => {
                                const current = form.utilitiesIncluded || [];
                                setForm({
                                  ...form,
                                  utilitiesIncluded: e.target.checked
                                    ? [...current, utility]
                                    : current.filter(u => u !== utility)
                                });
                              }}
                              className="sr-only"
                            />
                            <span className="text-sm">{utility}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>{t('tools.leaseAgreement.terminationClause', 'Termination Clause')}</label>
                      <textarea value={form.terminationClause || ''} onChange={(e) => setForm({ ...form, terminationClause: e.target.value })} rows={2} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowModal(false); setEditingLease(null); resetForm(); }} className={buttonSecondary}>{t('tools.leaseAgreement.cancel', 'Cancel')}</button>
                <button onClick={handleSubmit} disabled={!form.propertyAddress || !form.tenantName || !form.monthlyRent} className={`${buttonPrimary} disabled:opacity-50`}>
                  <Save className="w-4 h-4" />
                  {editingLease ? t('tools.leaseAgreement.update', 'Update') : t('tools.leaseAgreement.create', 'Create')} Lease
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default LeaseAgreementTool;
