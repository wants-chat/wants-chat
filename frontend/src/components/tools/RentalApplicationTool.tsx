'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  User,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Building,
  AlertCircle,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface RentalApplication {
  id: string;
  propertyAddress: string;
  applicantName: string;
  email: string;
  phone: string;
  currentAddress: string;
  currentLandlord?: string;
  landlordPhone?: string;
  employer: string;
  jobTitle: string;
  annualIncome: number;
  employmentLength: string;
  creditScore?: number;
  moveInDate: string;
  leaseTerm: number;
  pets: boolean;
  petDetails?: string;
  smoker: boolean;
  occupants: number;
  emergencyContact: string;
  emergencyPhone: string;
  status: 'pending' | 'under_review' | 'approved' | 'denied' | 'withdrawn';
  notes?: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'applicantName', header: 'Applicant', type: 'string' },
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'employer', header: 'Employer', type: 'string' },
  { key: 'annualIncome', header: 'Annual Income', type: 'currency' },
  { key: 'creditScore', header: 'Credit Score', type: 'number' },
  { key: 'moveInDate', header: 'Move-in Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'submittedAt', header: 'Submitted', type: 'date' },
];

const APPLICATION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'text-gray-500 bg-gray-500/10', icon: Clock },
  { value: 'under_review', label: 'Under Review', color: 'text-amber-500 bg-amber-500/10', icon: AlertCircle },
  { value: 'approved', label: 'Approved', color: 'text-green-500 bg-green-500/10', icon: CheckCircle },
  { value: 'denied', label: 'Denied', color: 'text-red-500 bg-red-500/10', icon: XCircle },
  { value: 'withdrawn', label: 'Withdrawn', color: 'text-purple-500 bg-purple-500/10', icon: XCircle },
];

export const RentalApplicationTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: applications,
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
  } = useToolData<RentalApplication>('rental-application', [], columns);

  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<RentalApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<RentalApplication | null>(null);

  const [form, setForm] = useState<Partial<RentalApplication>>({
    propertyAddress: '',
    applicantName: '',
    email: '',
    phone: '',
    currentAddress: '',
    employer: '',
    jobTitle: '',
    annualIncome: 0,
    employmentLength: '',
    moveInDate: '',
    leaseTerm: 12,
    pets: false,
    smoker: false,
    occupants: 1,
    emergencyContact: '',
    emergencyPhone: '',
    status: 'pending',
  });

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = !searchQuery ||
        app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    denied: applications.filter(a => a.status === 'denied').length,
  }), [applications]);

  const handleSubmit = () => {
    if (!form.applicantName || !form.propertyAddress || !form.email) return;

    const now = new Date().toISOString();
    if (editingApp) {
      updateItem(editingApp.id, { ...form, updatedAt: now });
    } else {
      const newApp: RentalApplication = {
        id: `app-${Date.now()}`,
        propertyAddress: form.propertyAddress || '',
        applicantName: form.applicantName || '',
        email: form.email || '',
        phone: form.phone || '',
        currentAddress: form.currentAddress || '',
        currentLandlord: form.currentLandlord,
        landlordPhone: form.landlordPhone,
        employer: form.employer || '',
        jobTitle: form.jobTitle || '',
        annualIncome: form.annualIncome || 0,
        employmentLength: form.employmentLength || '',
        creditScore: form.creditScore,
        moveInDate: form.moveInDate || '',
        leaseTerm: form.leaseTerm || 12,
        pets: form.pets || false,
        petDetails: form.petDetails,
        smoker: form.smoker || false,
        occupants: form.occupants || 1,
        emergencyContact: form.emergencyContact || '',
        emergencyPhone: form.emergencyPhone || '',
        status: 'pending',
        notes: form.notes,
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newApp);
    }
    resetForm();
    setShowModal(false);
    setEditingApp(null);
  };

  const handleStatusChange = (id: string, status: RentalApplication['status']) => {
    const now = new Date().toISOString();
    updateItem(id, { status, reviewedAt: now, updatedAt: now });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Application',
      message: 'Are you sure you want to delete this application?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedApp?.id === id) setSelectedApp(null);
    }
  };

  const resetForm = () => {
    setForm({
      propertyAddress: '',
      applicantName: '',
      email: '',
      phone: '',
      currentAddress: '',
      employer: '',
      jobTitle: '',
      annualIncome: 0,
      employmentLength: '',
      moveInDate: '',
      leaseTerm: 12,
      pets: false,
      smoker: false,
      occupants: 1,
      emergencyContact: '',
      emergencyPhone: '',
      status: 'pending',
    });
  };

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.rentalApplication.rentalApplications', 'Rental Applications')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.rentalApplication.trackAndManageRentalApplications', 'Track and manage rental applications')}
                  </p>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="rental-application" toolName="Rental Application" />

              <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-gray-500/10 text-gray-500' },
            { label: 'Pending', value: stats.pending, color: 'bg-gray-500/10 text-gray-500' },
            { label: 'Under Review', value: stats.underReview, color: 'bg-amber-500/10 text-amber-500' },
            { label: 'Approved', value: stats.approved, color: 'bg-green-500/10 text-green-500' },
            { label: 'Denied', value: stats.denied, color: 'bg-red-500/10 text-red-500' },
          ].map(stat => (
            <div key={stat.label} className={`${cardClass} p-4`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={cardClass}>
          <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder={t('tools.rentalApplication.searchApplications', 'Search applications...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-10 w-64`} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.rentalApplication.allStatus', 'All Status')}</option>
                {APPLICATION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'rental-applications' })}
                onExportExcel={() => exportExcel({ filename: 'rental-applications' })}
                onExportJSON={() => exportJSON({ filename: 'rental-applications' })}
                onExportPDF={async () => { await exportPDF({ filename: 'rental-applications', title: 'Rental Applications' }); }}
                onPrint={() => print('Rental Applications')}
                onCopyToClipboard={() => copyToClipboard()}
                disabled={applications.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => setShowModal(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" />
                {t('tools.rentalApplication.newApplication', 'New Application')}
              </button>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className={cardClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.applicant', 'Applicant')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.property', 'Property')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.income', 'Income')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.moveIn', 'Move-in')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.status', 'Status')}</th>
                  <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(app => {
                  const statusInfo = APPLICATION_STATUSES.find(s => s.value === app.status);
                  const StatusIcon = statusInfo?.icon || Clock;
                  return (
                    <tr key={app.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} hover:${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <p className="font-medium">{app.applicantName}</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{app.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          {app.propertyAddress}
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${app.annualIncome.toLocaleString()}/yr
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {app.moveInDate ? new Date(app.moveInDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedApp(app)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                            <FileText className="w-4 h-4 text-indigo-500" />
                          </button>
                          {app.status === 'pending' || app.status === 'under_review' ? (
                            <>
                              <button onClick={() => handleStatusChange(app.id, 'approved')} className="p-2 rounded-lg hover:bg-green-500/10">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </button>
                              <button onClick={() => handleStatusChange(app.id, 'denied')} className="p-2 rounded-lg hover:bg-red-500/10">
                                <XCircle className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          ) : null}
                          <button onClick={() => handleDelete(app.id)} className="p-2 rounded-lg hover:bg-red-500/10">
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
          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.noApplicationsFound', 'No applications found')}</p>
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentalApplication.applicationDetails', 'Application Details')}</h2>
                <button onClick={() => setSelectedApp(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.applicant2', 'Applicant')}</p><p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedApp.applicantName}</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.property2', 'Property')}</p><p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedApp.propertyAddress}</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.email', 'Email')}</p><p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApp.email}</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.phone', 'Phone')}</p><p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApp.phone}</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.employer', 'Employer')}</p><p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApp.employer}</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.jobTitle', 'Job Title')}</p><p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApp.jobTitle}</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.annualIncome', 'Annual Income')}</p><p className="font-medium text-green-500">${selectedApp.annualIncome.toLocaleString()}</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.creditScore', 'Credit Score')}</p><p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApp.creditScore || 'N/A'}</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.moveInDate', 'Move-in Date')}</p><p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApp.moveInDate ? new Date(selectedApp.moveInDate).toLocaleDateString() : 'N/A'}</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.leaseTerm', 'Lease Term')}</p><p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApp.leaseTerm} months</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.occupants', 'Occupants')}</p><p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApp.occupants}</p></div>
                  <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalApplication.pets', 'Pets')}</p><p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApp.pets ? `Yes - ${selectedApp.petDetails || 'No details'}` : 'No'}</p></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingApp ? t('tools.rentalApplication.editApplication', 'Edit Application') : t('tools.rentalApplication.newRentalApplication', 'New Rental Application')}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingApp(null); resetForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.rentalApplication.propertyAddress', 'Property Address *')}</label>
                  <input type="text" value={form.propertyAddress || ''} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.applicantName', 'Applicant Name *')}</label>
                    <input type="text" value={form.applicantName || ''} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.email2', 'Email *')}</label>
                    <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.phone2', 'Phone')}</label>
                    <input type="tel" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.currentAddress', 'Current Address')}</label>
                    <input type="text" value={form.currentAddress || ''} onChange={(e) => setForm({ ...form, currentAddress: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.employer2', 'Employer')}</label>
                    <input type="text" value={form.employer || ''} onChange={(e) => setForm({ ...form, employer: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.jobTitle2', 'Job Title')}</label>
                    <input type="text" value={form.jobTitle || ''} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.annualIncome2', 'Annual Income ($)')}</label>
                    <input type="number" value={form.annualIncome || ''} onChange={(e) => setForm({ ...form, annualIncome: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.creditScore2', 'Credit Score')}</label>
                    <input type="number" value={form.creditScore || ''} onChange={(e) => setForm({ ...form, creditScore: parseInt(e.target.value) || undefined })} min="300" max="850" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.desiredMoveInDate', 'Desired Move-in Date')}</label>
                    <input type="date" value={form.moveInDate || ''} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.leaseTermMonths', 'Lease Term (months)')}</label>
                    <select value={form.leaseTerm || 12} onChange={(e) => setForm({ ...form, leaseTerm: parseInt(e.target.value) })} className={inputClass}>
                      <option value={6}>6 months</option>
                      <option value={12}>12 months</option>
                      <option value={18}>18 months</option>
                      <option value={24}>24 months</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.occupants2', 'Occupants')}</label>
                    <input type="number" value={form.occupants || 1} onChange={(e) => setForm({ ...form, occupants: parseInt(e.target.value) || 1 })} min="1" className={inputClass} />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" checked={form.pets || false} onChange={(e) => setForm({ ...form, pets: e.target.checked })} className="w-4 h-4 text-indigo-500" />
                    <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.rentalApplication.hasPets', 'Has Pets')}</label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" checked={form.smoker || false} onChange={(e) => setForm({ ...form, smoker: e.target.checked })} className="w-4 h-4 text-indigo-500" />
                    <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.rentalApplication.smoker', 'Smoker')}</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.emergencyContact', 'Emergency Contact')}</label>
                    <input type="text" value={form.emergencyContact || ''} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.rentalApplication.emergencyPhone', 'Emergency Phone')}</label>
                    <input type="tel" value={form.emergencyPhone || ''} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.rentalApplication.notes', 'Notes')}</label>
                  <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputClass} />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowModal(false); setEditingApp(null); resetForm(); }} className={buttonSecondary}>{t('tools.rentalApplication.cancel', 'Cancel')}</button>
                <button onClick={handleSubmit} disabled={!form.applicantName || !form.propertyAddress || !form.email} className={`${buttonPrimary} disabled:opacity-50`}>
                  <Save className="w-4 h-4" />
                  {editingApp ? t('tools.rentalApplication.update', 'Update') : t('tools.rentalApplication.submit', 'Submit')} Application
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

export default RentalApplicationTool;
