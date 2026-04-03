'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Key,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Calendar,
  DollarSign,
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  MapPin,
  BedDouble,
  Bath,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface VacancyRecord {
  id: string;
  propertyAddress: string;
  unitNumber?: string;
  propertyType: 'house' | 'apartment' | 'condo' | 'townhouse' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  marketRent: number;
  previousRent?: number;
  lastTenantName?: string;
  vacantSince: string;
  expectedReadyDate?: string;
  listingDate?: string;
  status: 'turn_in_progress' | 'ready_to_list' | 'listed' | 'application_pending' | 'leased';
  turnoverCosts?: number;
  daysVacant: number;
  lostRevenue: number;
  marketingChannels: string[];
  showingsCount: number;
  applicationsCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'unitNumber', header: 'Unit', type: 'string' },
  { key: 'bedrooms', header: 'Beds', type: 'number' },
  { key: 'marketRent', header: 'Rent', type: 'currency' },
  { key: 'vacantSince', header: 'Vacant Since', type: 'date' },
  { key: 'daysVacant', header: 'Days Vacant', type: 'number' },
  { key: 'lostRevenue', header: 'Lost Revenue', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const VACANCY_STATUSES = [
  { value: 'turn_in_progress', label: 'Turn In Progress', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'ready_to_list', label: 'Ready to List', color: 'text-blue-500 bg-blue-500/10' },
  { value: 'listed', label: 'Listed', color: 'text-purple-500 bg-purple-500/10' },
  { value: 'application_pending', label: 'Application Pending', color: 'text-cyan-500 bg-cyan-500/10' },
  { value: 'leased', label: 'Leased', color: 'text-green-500 bg-green-500/10' },
];

const MARKETING_CHANNELS = [
  'Zillow',
  'Apartments.com',
  'Trulia',
  'Craigslist',
  'Facebook Marketplace',
  'Realtor.com',
  'HotPads',
  'Local MLS',
  'Company Website',
  'Yard Sign',
];

export const VacancyTrackerTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: vacancies,
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
  } = useToolData<VacancyRecord>('vacancy-tracker', [], columns);

  const [showModal, setShowModal] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<VacancyRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [form, setForm] = useState<Partial<VacancyRecord>>({
    propertyAddress: '',
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 0,
    marketRent: 0,
    vacantSince: new Date().toISOString().split('T')[0],
    status: 'turn_in_progress',
    marketingChannels: [],
    showingsCount: 0,
    applicationsCount: 0,
  });

  const calculateVacancyMetrics = (vacantSince: string, marketRent: number) => {
    const startDate = new Date(vacantSince);
    const today = new Date();
    const daysVacant = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const lostRevenue = Math.round((daysVacant / 30) * marketRent);
    return { daysVacant, lostRevenue };
  };

  const filteredVacancies = useMemo(() => {
    return vacancies.filter(vacancy => {
      const matchesSearch = !searchQuery ||
        vacancy.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vacancy.unitNumber && vacancy.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || vacancy.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).map(vacancy => {
      const { daysVacant, lostRevenue } = calculateVacancyMetrics(vacancy.vacantSince, vacancy.marketRent);
      return { ...vacancy, daysVacant, lostRevenue };
    });
  }, [vacancies, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const activeVacancies = vacancies.filter(v => v.status !== 'leased');
    const totalVacant = activeVacancies.length;
    const totalLostRevenue = activeVacancies.reduce((sum, v) => {
      const { lostRevenue } = calculateVacancyMetrics(v.vacantSince, v.marketRent);
      return sum + lostRevenue;
    }, 0);
    const avgDaysVacant = totalVacant > 0
      ? Math.round(activeVacancies.reduce((sum, v) => {
          const { daysVacant } = calculateVacancyMetrics(v.vacantSince, v.marketRent);
          return sum + daysVacant;
        }, 0) / totalVacant)
      : 0;
    const potentialMonthlyRent = activeVacancies.reduce((sum, v) => sum + v.marketRent, 0);
    const leasedThisMonth = vacancies.filter(v => {
      if (v.status !== 'leased') return false;
      const updated = new Date(v.updatedAt);
      const now = new Date();
      return updated.getMonth() === now.getMonth() && updated.getFullYear() === now.getFullYear();
    }).length;

    return { totalVacant, totalLostRevenue, avgDaysVacant, potentialMonthlyRent, leasedThisMonth };
  }, [vacancies]);

  const handleSubmit = () => {
    if (!form.propertyAddress || !form.marketRent) return;

    const now = new Date().toISOString();
    const { daysVacant, lostRevenue } = calculateVacancyMetrics(
      form.vacantSince || now.split('T')[0],
      form.marketRent || 0
    );

    if (editingVacancy) {
      updateItem(editingVacancy.id, { ...form, daysVacant, lostRevenue, updatedAt: now });
    } else {
      const newVacancy: VacancyRecord = {
        id: `vac-${Date.now()}`,
        propertyAddress: form.propertyAddress || '',
        unitNumber: form.unitNumber,
        propertyType: form.propertyType || 'apartment',
        bedrooms: form.bedrooms || 1,
        bathrooms: form.bathrooms || 1,
        sqft: form.sqft || 0,
        marketRent: form.marketRent || 0,
        previousRent: form.previousRent,
        lastTenantName: form.lastTenantName,
        vacantSince: form.vacantSince || now.split('T')[0],
        expectedReadyDate: form.expectedReadyDate,
        listingDate: form.listingDate,
        status: form.status || 'turn_in_progress',
        turnoverCosts: form.turnoverCosts,
        daysVacant,
        lostRevenue,
        marketingChannels: form.marketingChannels || [],
        showingsCount: form.showingsCount || 0,
        applicationsCount: form.applicationsCount || 0,
        notes: form.notes,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newVacancy);
    }
    resetForm();
    setShowModal(false);
    setEditingVacancy(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Vacancy',
      message: 'Are you sure you want to delete this vacancy record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleStatusChange = (id: string, status: VacancyRecord['status']) => {
    updateItem(id, { status, updatedAt: new Date().toISOString() });
  };

  const resetForm = () => {
    setForm({
      propertyAddress: '',
      propertyType: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 0,
      marketRent: 0,
      vacantSince: new Date().toISOString().split('T')[0],
      status: 'turn_in_progress',
      marketingChannels: [],
      showingsCount: 0,
      applicationsCount: 0,
    });
  };

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Key className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.vacancyTracker.vacancyTracker', 'Vacancy Tracker')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.vacancyTracker.trackVacantUnitsAndMinimize', 'Track vacant units and minimize lost revenue')}
                  </p>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="vacancy-tracker" toolName="Vacancy Tracker" />

              <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.vacantUnits', 'Vacant Units')}</p>
            <p className={`text-2xl font-bold ${stats.totalVacant > 0 ? 'text-red-500' : 'text-green-500'}`}>{stats.totalVacant}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.lostRevenue', 'Lost Revenue')}</p>
            <p className="text-2xl font-bold text-red-500">${stats.totalLostRevenue.toLocaleString()}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.avgDaysVacant', 'Avg Days Vacant')}</p>
            <p className={`text-2xl font-bold ${stats.avgDaysVacant > 30 ? 'text-amber-500' : 'text-blue-500'}`}>{stats.avgDaysVacant}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.potentialRent', 'Potential Rent')}</p>
            <p className="text-2xl font-bold text-blue-500">${stats.potentialMonthlyRent.toLocaleString()}/mo</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.leasedThisMonth', 'Leased This Month')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.leasedThisMonth}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={cardClass}>
          <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder={t('tools.vacancyTracker.searchProperties', 'Search properties...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-10 w-64`} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.vacancyTracker.allStatus', 'All Status')}</option>
                {VACANCY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'vacancies' })}
                onExportExcel={() => exportExcel({ filename: 'vacancies' })}
                onExportJSON={() => exportJSON({ filename: 'vacancies' })}
                onExportPDF={async () => { await exportPDF({ filename: 'vacancies', title: 'Vacancy Report' }); }}
                onPrint={() => print('Vacancy Report')}
                onCopyToClipboard={() => copyToClipboard()}
                disabled={vacancies.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => setShowModal(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" />
                {t('tools.vacancyTracker.addVacancy', 'Add Vacancy')}
              </button>
            </div>
          </div>
        </div>

        {/* Vacancies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVacancies.map(vacancy => {
            const statusInfo = VACANCY_STATUSES.find(s => s.value === vacancy.status);
            const isOverdue = vacancy.daysVacant > 30;

            return (
              <div key={vacancy.id} className={`${cardClass} p-4 ${isOverdue ? 'ring-2 ring-amber-500' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${isOverdue ? 'bg-amber-500/10' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Key className={`w-5 h-5 ${isOverdue ? 'text-amber-500' : 'text-blue-500'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{vacancy.propertyAddress}</h3>
                      {vacancy.unitNumber && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Unit {vacancy.unitNumber}</p>}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{vacancy.bedrooms}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.beds', 'Beds')}</p>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{vacancy.bathrooms}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.baths', 'Baths')}</p>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{vacancy.sqft.toLocaleString()}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.sqft', 'Sqft')}</p>
                  </div>
                </div>

                <div className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.marketRent', 'Market Rent')}</span>
                    <span className="font-bold text-blue-500">${vacancy.marketRent.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.daysVacant', 'Days Vacant')}</span>
                    <span className={`font-bold ${isOverdue ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'}`}>{vacancy.daysVacant}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.lostRevenue2', 'Lost Revenue')}</span>
                    <span className="font-bold text-red-500">-${vacancy.lostRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className={`flex items-center justify-between text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>Showings: {vacancy.showingsCount}</span>
                  <span>Applications: {vacancy.applicationsCount}</span>
                </div>

                <div className={`flex gap-2 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  {vacancy.status !== 'leased' && (
                    <select
                      value={vacancy.status}
                      onChange={(e) => handleStatusChange(vacancy.id, e.target.value as VacancyRecord['status'])}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'} border`}
                    >
                      {VACANCY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  )}
                  <button
                    onClick={() => { setEditingVacancy(vacancy); setForm(vacancy); setShowModal(true); }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                  <button onClick={() => handleDelete(vacancy.id)} className="p-2 rounded-lg hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVacancies.length === 0 && (
          <div className={`${cardClass} text-center py-12`}>
            <Key className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyTracker.noVacanciesTracked', 'No vacancies tracked')}</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.vacancyTracker.addAVacantPropertyTo', 'Add a vacant property to start tracking')}</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingVacancy ? t('tools.vacancyTracker.editVacancy', 'Edit Vacancy') : t('tools.vacancyTracker.addVacancy2', 'Add Vacancy')}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingVacancy(null); resetForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>{t('tools.vacancyTracker.propertyAddress', 'Property Address *')}</label>
                    <input type="text" value={form.propertyAddress || ''} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.unitNumber', 'Unit Number')}</label>
                    <input type="text" value={form.unitNumber || ''} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.propertyType', 'Property Type')}</label>
                    <select value={form.propertyType || 'apartment'} onChange={(e) => setForm({ ...form, propertyType: e.target.value as VacancyRecord['propertyType'] })} className={inputClass}>
                      <option value="apartment">{t('tools.vacancyTracker.apartment', 'Apartment')}</option>
                      <option value="house">{t('tools.vacancyTracker.house', 'House')}</option>
                      <option value="condo">{t('tools.vacancyTracker.condo', 'Condo')}</option>
                      <option value="townhouse">{t('tools.vacancyTracker.townhouse', 'Townhouse')}</option>
                      <option value="commercial">{t('tools.vacancyTracker.commercial', 'Commercial')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.bedrooms', 'Bedrooms')}</label>
                    <input type="number" value={form.bedrooms || ''} onChange={(e) => setForm({ ...form, bedrooms: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.bathrooms', 'Bathrooms')}</label>
                    <input type="number" value={form.bathrooms || ''} onChange={(e) => setForm({ ...form, bathrooms: parseFloat(e.target.value) || 0 })} min="0" step="0.5" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.squareFeet', 'Square Feet')}</label>
                    <input type="number" value={form.sqft || ''} onChange={(e) => setForm({ ...form, sqft: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.marketRent2', 'Market Rent ($) *')}</label>
                    <input type="number" value={form.marketRent || ''} onChange={(e) => setForm({ ...form, marketRent: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.previousRent', 'Previous Rent ($)')}</label>
                    <input type="number" value={form.previousRent || ''} onChange={(e) => setForm({ ...form, previousRent: parseFloat(e.target.value) || undefined })} min="0" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.vacantSince', 'Vacant Since')}</label>
                    <input type="date" value={form.vacantSince || ''} onChange={(e) => setForm({ ...form, vacantSince: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.expectedReadyDate', 'Expected Ready Date')}</label>
                    <input type="date" value={form.expectedReadyDate || ''} onChange={(e) => setForm({ ...form, expectedReadyDate: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.turnoverCosts', 'Turnover Costs ($)')}</label>
                    <input type="number" value={form.turnoverCosts || ''} onChange={(e) => setForm({ ...form, turnoverCosts: parseFloat(e.target.value) || undefined })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.lastTenantName', 'Last Tenant Name')}</label>
                    <input type="text" value={form.lastTenantName || ''} onChange={(e) => setForm({ ...form, lastTenantName: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.showingsCount', 'Showings Count')}</label>
                    <input type="number" value={form.showingsCount || 0} onChange={(e) => setForm({ ...form, showingsCount: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.vacancyTracker.applicationsCount', 'Applications Count')}</label>
                    <input type="number" value={form.applicationsCount || 0} onChange={(e) => setForm({ ...form, applicationsCount: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.vacancyTracker.marketingChannels', 'Marketing Channels')}</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {MARKETING_CHANNELS.map(channel => (
                      <label key={channel} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                        form.marketingChannels?.includes(channel)
                          ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                          : isDark ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}>
                        <input
                          type="checkbox"
                          checked={form.marketingChannels?.includes(channel) || false}
                          onChange={(e) => {
                            const current = form.marketingChannels || [];
                            setForm({
                              ...form,
                              marketingChannels: e.target.checked
                                ? [...current, channel]
                                : current.filter(c => c !== channel)
                            });
                          }}
                          className="sr-only"
                        />
                        <span className="text-sm">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.vacancyTracker.notes', 'Notes')}</label>
                  <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputClass} />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowModal(false); setEditingVacancy(null); resetForm(); }} className={buttonSecondary}>{t('tools.vacancyTracker.cancel', 'Cancel')}</button>
                <button onClick={handleSubmit} disabled={!form.propertyAddress || !form.marketRent} className={`${buttonPrimary} disabled:opacity-50`}>
                  <Save className="w-4 h-4" />
                  {editingVacancy ? t('tools.vacancyTracker.update', 'Update') : t('tools.vacancyTracker.add', 'Add')} Vacancy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default VacancyTrackerTool;
