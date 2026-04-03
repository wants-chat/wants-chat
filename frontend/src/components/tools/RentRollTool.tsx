'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Calendar,
  DollarSign,
  Building,
  User,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface RentRollEntry {
  id: string;
  propertyAddress: string;
  unitNumber?: string;
  tenantName: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  securityDeposit: number;
  lastRentIncrease?: string;
  nextRentIncrease?: string;
  rentIncreaseAmount?: number;
  paymentStatus: 'current' | 'late' | 'delinquent';
  lateFees: number;
  otherCharges: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'unitNumber', header: 'Unit', type: 'string' },
  { key: 'tenantName', header: 'Tenant', type: 'string' },
  { key: 'monthlyRent', header: 'Monthly Rent', type: 'currency' },
  { key: 'leaseStartDate', header: 'Lease Start', type: 'date' },
  { key: 'leaseEndDate', header: 'Lease End', type: 'date' },
  { key: 'paymentStatus', header: 'Status', type: 'string' },
];

const PAYMENT_STATUSES = [
  { value: 'current', label: 'Current', color: 'text-green-500 bg-green-500/10' },
  { value: 'late', label: 'Late', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'delinquent', label: 'Delinquent', color: 'text-red-500 bg-red-500/10' },
];

export const RentRollTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: rentRoll,
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
  } = useToolData<RentRollEntry>('rent-roll', [], columns);

  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RentRollEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [form, setForm] = useState<Partial<RentRollEntry>>({
    propertyAddress: '',
    unitNumber: '',
    tenantName: '',
    leaseStartDate: '',
    leaseEndDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    paymentStatus: 'current',
    lateFees: 0,
    otherCharges: 0,
  });

  const filteredEntries = useMemo(() => {
    return rentRoll.filter(entry => {
      const matchesSearch = !searchQuery ||
        entry.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.unitNumber && entry.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || entry.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rentRoll, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalMonthlyRent = rentRoll.reduce((sum, e) => sum + e.monthlyRent, 0);
    const totalAnnualRent = totalMonthlyRent * 12;
    const totalLateFees = rentRoll.reduce((sum, e) => sum + e.lateFees, 0);
    const totalOtherCharges = rentRoll.reduce((sum, e) => sum + e.otherCharges, 0);
    const currentCount = rentRoll.filter(e => e.paymentStatus === 'current').length;
    const lateCount = rentRoll.filter(e => e.paymentStatus === 'late').length;
    const delinquentCount = rentRoll.filter(e => e.paymentStatus === 'delinquent').length;
    const occupancyRate = rentRoll.length > 0 ? (currentCount / rentRoll.length) * 100 : 0;
    const avgRent = rentRoll.length > 0 ? totalMonthlyRent / rentRoll.length : 0;

    return {
      totalMonthlyRent,
      totalAnnualRent,
      totalLateFees,
      totalOtherCharges,
      currentCount,
      lateCount,
      delinquentCount,
      occupancyRate,
      avgRent,
      totalUnits: rentRoll.length,
    };
  }, [rentRoll]);

  const handleSubmit = () => {
    if (!form.propertyAddress || !form.tenantName || !form.monthlyRent) return;

    const now = new Date().toISOString();
    if (editingEntry) {
      updateItem(editingEntry.id, { ...form, updatedAt: now });
    } else {
      const newEntry: RentRollEntry = {
        id: `rr-${Date.now()}`,
        propertyAddress: form.propertyAddress || '',
        unitNumber: form.unitNumber,
        tenantName: form.tenantName || '',
        leaseStartDate: form.leaseStartDate || '',
        leaseEndDate: form.leaseEndDate || '',
        monthlyRent: form.monthlyRent || 0,
        securityDeposit: form.securityDeposit || 0,
        lastRentIncrease: form.lastRentIncrease,
        nextRentIncrease: form.nextRentIncrease,
        rentIncreaseAmount: form.rentIncreaseAmount,
        paymentStatus: form.paymentStatus || 'current',
        lateFees: form.lateFees || 0,
        otherCharges: form.otherCharges || 0,
        notes: form.notes,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newEntry);
    }
    resetForm();
    setShowModal(false);
    setEditingEntry(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this entry?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const resetForm = () => {
    setForm({
      propertyAddress: '',
      unitNumber: '',
      tenantName: '',
      leaseStartDate: '',
      leaseEndDate: '',
      monthlyRent: 0,
      securityDeposit: 0,
      paymentStatus: 'current',
      lateFees: 0,
      otherCharges: 0,
    });
  };

  const getLeaseStatus = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffDays = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Expired', color: 'text-red-500' };
    if (diffDays <= 30) return { text: `${diffDays} days left`, color: 'text-amber-500' };
    if (diffDays <= 90) return { text: `${Math.floor(diffDays / 30)} months left`, color: 'text-blue-500' };
    return { text: `${Math.floor(diffDays / 30)} months left`, color: 'text-green-500' };
  };

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg">
                  <Receipt className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.rentRoll.rentRoll', 'Rent Roll')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.rentRoll.trackRentalIncomeAcrossYour', 'Track rental income across your portfolio')}
                  </p>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="rent-roll" toolName="Rent Roll" />

              <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.monthlyIncome', 'Monthly Income')}</p>
            <p className="text-2xl font-bold text-violet-500">${stats.totalMonthlyRent.toLocaleString()}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.annualIncome', 'Annual Income')}</p>
            <p className="text-2xl font-bold text-purple-500">${stats.totalAnnualRent.toLocaleString()}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.totalUnits', 'Total Units')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalUnits}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.avgRent', 'Avg Rent')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.avgRent.toLocaleString()}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.currentLateDelinq', 'Current/Late/Delinq')}</p>
            <div className="flex gap-2 text-lg font-bold">
              <span className="text-green-500">{stats.currentCount}</span>
              <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>/</span>
              <span className="text-amber-500">{stats.lateCount}</span>
              <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>/</span>
              <span className="text-red-500">{stats.delinquentCount}</span>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.lateFees', 'Late Fees')}</p>
            <p className="text-2xl font-bold text-amber-500">${stats.totalLateFees.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={cardClass}>
          <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder={t('tools.rentRoll.searchPropertiesOrTenants', 'Search properties or tenants...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-10 w-72`} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.rentRoll.allStatus', 'All Status')}</option>
                {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'rent-roll' })}
                onExportExcel={() => exportExcel({ filename: 'rent-roll' })}
                onExportJSON={() => exportJSON({ filename: 'rent-roll' })}
                onExportPDF={async () => { await exportPDF({ filename: 'rent-roll', title: 'Rent Roll Report' }); }}
                onPrint={() => print('Rent Roll Report')}
                onCopyToClipboard={() => copyToClipboard()}
                disabled={rentRoll.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => setShowModal(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" />
                {t('tools.rentRoll.addEntry', 'Add Entry')}
              </button>
            </div>
          </div>
        </div>

        {/* Rent Roll Table */}
        <div className={cardClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.propertyUnit', 'Property / Unit')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.tenant', 'Tenant')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.monthlyRent', 'Monthly Rent')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.leaseTerm', 'Lease Term')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.status', 'Status')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.fees', 'Fees')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(entry => {
                  const statusInfo = PAYMENT_STATUSES.find(s => s.value === entry.paymentStatus);
                  const leaseStatus = getLeaseStatus(entry.leaseEndDate);

                  return (
                    <tr key={entry.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-violet-500" />
                          <div>
                            <p className="font-medium">{entry.propertyAddress}</p>
                            {entry.unitNumber && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Unit {entry.unitNumber}</p>}
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {entry.tenantName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-violet-500">${entry.monthlyRent.toLocaleString()}</p>
                        {entry.securityDeposit > 0 && (
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Deposit: ${entry.securityDeposit.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div className="text-sm">
                            <p>{new Date(entry.leaseStartDate).toLocaleDateString()}</p>
                            <p className={leaseStatus.color}>{leaseStatus.text}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {entry.lateFees > 0 && <p className="text-red-500 text-sm">Late: ${entry.lateFees}</p>}
                        {entry.otherCharges > 0 && <p className="text-amber-500 text-sm">Other: ${entry.otherCharges}</p>}
                        {entry.lateFees === 0 && entry.otherCharges === 0 && '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingEntry(entry); setForm(entry); setShowModal(true); }}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button onClick={() => handleDelete(entry.id)} className="p-2 rounded-lg hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <Receipt className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentRoll.noRentRollEntries', 'No rent roll entries')}</p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.rentRoll.addYourFirstRentalProperty', 'Add your first rental property')}</p>
            </div>
          )}
        </div>

        <ConfirmDialog />

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingEntry ? t('tools.rentRoll.editEntry', 'Edit Entry') : t('tools.rentRoll.addRentRollEntry', 'Add Rent Roll Entry')}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingEntry(null); resetForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>{t('tools.rentRoll.propertyAddress', 'Property Address *')}</label>
                    <input type="text" value={form.propertyAddress || ''} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.unitNumber', 'Unit Number')}</label>
                    <input type="text" value={form.unitNumber || ''} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })} placeholder="e.g., 101, A1" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.tenantName', 'Tenant Name *')}</label>
                    <input type="text" value={form.tenantName || ''} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.leaseStartDate', 'Lease Start Date')}</label>
                    <input type="date" value={form.leaseStartDate || ''} onChange={(e) => setForm({ ...form, leaseStartDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.leaseEndDate', 'Lease End Date')}</label>
                    <input type="date" value={form.leaseEndDate || ''} onChange={(e) => setForm({ ...form, leaseEndDate: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.monthlyRent2', 'Monthly Rent ($) *')}</label>
                    <input type="number" value={form.monthlyRent || ''} onChange={(e) => setForm({ ...form, monthlyRent: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.securityDeposit', 'Security Deposit ($)')}</label>
                    <input type="number" value={form.securityDeposit || ''} onChange={(e) => setForm({ ...form, securityDeposit: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.paymentStatus', 'Payment Status')}</label>
                    <select value={form.paymentStatus || 'current'} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as RentRollEntry['paymentStatus'] })} className={inputClass}>
                      {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.lateFees2', 'Late Fees ($)')}</label>
                    <input type="number" value={form.lateFees || ''} onChange={(e) => setForm({ ...form, lateFees: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.otherCharges', 'Other Charges ($)')}</label>
                    <input type="number" value={form.otherCharges || ''} onChange={(e) => setForm({ ...form, otherCharges: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.lastRentIncrease', 'Last Rent Increase')}</label>
                    <input type="date" value={form.lastRentIncrease || ''} onChange={(e) => setForm({ ...form, lastRentIncrease: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.nextRentIncrease', 'Next Rent Increase')}</label>
                    <input type="date" value={form.nextRentIncrease || ''} onChange={(e) => setForm({ ...form, nextRentIncrease: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentRoll.increaseAmount', 'Increase Amount ($)')}</label>
                    <input type="number" value={form.rentIncreaseAmount || ''} onChange={(e) => setForm({ ...form, rentIncreaseAmount: parseFloat(e.target.value) || undefined })} min="0" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.rentRoll.notes', 'Notes')}</label>
                  <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputClass} />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowModal(false); setEditingEntry(null); resetForm(); }} className={buttonSecondary}>{t('tools.rentRoll.cancel', 'Cancel')}</button>
                <button onClick={handleSubmit} disabled={!form.propertyAddress || !form.tenantName || !form.monthlyRent} className={`${buttonPrimary} disabled:opacity-50`}>
                  <Save className="w-4 h-4" />
                  {editingEntry ? t('tools.rentRoll.update', 'Update') : t('tools.rentRoll.add', 'Add')} Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentRollTool;
