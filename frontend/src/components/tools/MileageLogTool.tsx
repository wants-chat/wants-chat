import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Plus, Trash2, Calendar, MapPin, DollarSign, Edit2, X, Check, Filter, Sparkles } from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type TripPurpose = 'business' | 'medical' | 'charity' | 'moving';

interface Trip {
  id: string;
  date: string;
  startLocation: string;
  endLocation: string;
  miles: number;
  purpose: TripPurpose;
  notes?: string;
}

interface TripWithRate extends Trip {
  rate: TripPurpose;
  deduction: string;
}

// IRS Standard Mileage Rates for 2024
const MILEAGE_RATES: Record<TripPurpose, number> = {
  business: 0.67,
  medical: 0.21,
  charity: 0.14,
  moving: 0.21,
};

const PURPOSE_LABELS: Record<TripPurpose, string> = {
  business: 'Business',
  medical: 'Medical',
  charity: 'Charity',
  moving: 'Moving',
};

const PURPOSE_COLORS: Record<TripPurpose, { light: string; dark: string }> = {
  business: { light: 'bg-blue-100 text-blue-800', dark: 'bg-blue-900/50 text-blue-300' },
  medical: { light: 'bg-green-100 text-green-800', dark: 'bg-green-900/50 text-green-300' },
  charity: { light: 'bg-purple-100 text-purple-800', dark: 'bg-purple-900/50 text-purple-300' },
  moving: { light: 'bg-orange-100 text-orange-800', dark: 'bg-orange-900/50 text-orange-300' },
};

// Column configuration for export
const tripColumns: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startLocation', header: 'Start Location', type: 'string' },
  { key: 'endLocation', header: 'End Location', type: 'string' },
  { key: 'miles', header: 'Miles', type: 'number' },
  { key: 'purpose', header: 'Purpose', type: 'string', format: (v) => PURPOSE_LABELS[v as TripPurpose] || v },
  { key: 'rate', header: 'Rate', type: 'currency', format: (v) => `$${MILEAGE_RATES[v as TripPurpose]?.toFixed(2) || '0.00'}` },
  { key: 'deduction', header: 'Deduction', type: 'currency' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

interface MileageLogToolProps {
  uiConfig?: UIConfig;
}

export const MileageLogTool: React.FC<MileageLogToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize useToolData hook for backend sync
  const {
    data: trips,
    addItem: addTrip,
    updateItem: updateTrip,
    deleteItem: deleteTrip,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    isLoading,
  } = useToolData<Trip>('mileage-log', [], tripColumns);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [purposeFilter, setPurposeFilter] = useState<TripPurpose | 'all'>('all');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startLocation: '',
    endLocation: '',
    miles: '',
    purpose: 'business' as TripPurpose,
    notes: '',
  });
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.miles !== undefined || params.distance !== undefined) {
        setFormData(prev => ({ ...prev, miles: String(params.miles || params.distance) }));
        setShowAddForm(true);
        setIsPrefilled(true);
      }
      if (params.startLocation) {
        setFormData(prev => ({ ...prev, startLocation: params.startLocation }));
        setShowAddForm(true);
        setIsPrefilled(true);
      }
      if (params.endLocation) {
        setFormData(prev => ({ ...prev, endLocation: params.endLocation }));
        setShowAddForm(true);
        setIsPrefilled(true);
      }
      if (params.purpose && ['business', 'medical', 'charity', 'moving'].includes(params.purpose)) {
        setFormData(prev => ({ ...prev, purpose: params.purpose as TripPurpose }));
        setShowAddForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startLocation: '',
      endLocation: '',
      miles: '',
      purpose: 'business',
      notes: '',
    });
  };

  const handleAddTrip = () => {
    if (!formData.startLocation || !formData.endLocation || !formData.miles) return;

    const newTrip: Trip = {
      id: Date.now().toString(),
      date: formData.date,
      startLocation: formData.startLocation,
      endLocation: formData.endLocation,
      miles: parseFloat(formData.miles),
      purpose: formData.purpose,
      notes: formData.notes || undefined,
    };

    addTrip(newTrip);
    resetForm();
    setShowAddForm(false);
  };

  const handleUpdateTrip = () => {
    if (!editingId || !formData.startLocation || !formData.endLocation || !formData.miles) return;

    updateTrip(editingId, {
      date: formData.date,
      startLocation: formData.startLocation,
      endLocation: formData.endLocation,
      miles: parseFloat(formData.miles),
      purpose: formData.purpose,
      notes: formData.notes || undefined,
    });
    resetForm();
    setEditingId(null);
  };

  const handleEditTrip = (trip: Trip) => {
    setFormData({
      date: trip.date,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      miles: trip.miles.toString(),
      purpose: trip.purpose,
      notes: trip.notes || '',
    });
    setEditingId(trip.id);
    setShowAddForm(false);
  };

  const handleDeleteTrip = (id: string) => {
    deleteTrip(id);
    if (editingId === id) {
      setEditingId(null);
      resetForm();
    }
  };

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      if (purposeFilter !== 'all' && trip.purpose !== purposeFilter) return false;
      if (dateFilter.start && trip.date < dateFilter.start) return false;
      if (dateFilter.end && trip.date > dateFilter.end) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trips, purposeFilter, dateFilter]);

  const summary = useMemo(() => {
    const byPurpose: Record<TripPurpose, { miles: number; deduction: number }> = {
      business: { miles: 0, deduction: 0 },
      medical: { miles: 0, deduction: 0 },
      charity: { miles: 0, deduction: 0 },
      moving: { miles: 0, deduction: 0 },
    };

    filteredTrips.forEach(trip => {
      byPurpose[trip.purpose].miles += trip.miles;
      byPurpose[trip.purpose].deduction += trip.miles * MILEAGE_RATES[trip.purpose];
    });

    const grandTotal = Object.values(byPurpose).reduce((sum, p) => sum + p.deduction, 0);
    const totalMiles = Object.values(byPurpose).reduce((sum, p) => sum + p.miles, 0);

    return { byPurpose, grandTotal, totalMiles };
  }, [filteredTrips]);

  // Prepare data for export with computed fields
  const getExportData = (): TripWithRate[] => {
    return filteredTrips.map(trip => ({
      ...trip,
      rate: trip.purpose,
      deduction: (trip.miles * MILEAGE_RATES[trip.purpose]).toFixed(2),
    }));
  };

  // Export handlers using hook methods
  const handleExportCSV = () => {
    exportCSV({ filename: 'mileage-log' });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: 'mileage-log' });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: 'mileage-log' });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'mileage-log',
      title: 'Mileage Log for Tax Deductions',
      subtitle: `Total: ${summary.totalMiles.toFixed(1)} miles | Deduction: $${summary.grandTotal.toFixed(2)}`,
    });
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  const handlePrint = () => {
    print('Mileage Log for Tax Deductions');
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`;

  const buttonPrimaryClass = `px-4 py-2 rounded-lg font-medium transition-colors ${
    isDark
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white'
  }`;

  const buttonSecondaryClass = `px-4 py-2 rounded-lg font-medium transition-colors ${
    isDark
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  }`;

  const cardClass = `rounded-xl p-6 ${
    isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
  }`;

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.mileageLog.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <Car className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.mileageLog.mileageLog', 'Mileage Log')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.mileageLog.trackTripsForTaxDeductions', 'Track trips for tax deductions')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="mileage-log" toolName="Mileage Log" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
              } ${showFilters ? (isDark ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
                resetForm();
              }}
              className={buttonPrimaryClass}
            >
              <Plus className="w-4 h-4 inline-block mr-1" />
              {t('tools.mileageLog.addTrip', 'Add Trip')}
            </button>
          </div>
        </div>

        {/* IRS Rates Info */}
        <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
            {t('tools.mileageLog.irsStandardMileageRates2024', 'IRS Standard Mileage Rates (2024)')}
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-blue-700'}>
              <strong>{t('tools.mileageLog.business', 'Business:')}</strong> $0.67/mile
            </span>
            <span className={isDark ? 'text-gray-400' : 'text-blue-700'}>
              <strong>{t('tools.mileageLog.medicalMoving', 'Medical/Moving:')}</strong> $0.21/mile
            </span>
            <span className={isDark ? 'text-gray-400' : 'text-blue-700'}>
              <strong>{t('tools.mileageLog.charity', 'Charity:')}</strong> $0.14/mile
            </span>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.mileageLog.filters', 'Filters')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mileageLog.startDate', 'Start Date')}
                </label>
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mileageLog.endDate', 'End Date')}
                </label>
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mileageLog.purpose', 'Purpose')}
                </label>
                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value as TripPurpose | 'all')}
                  className={inputClass}
                >
                  <option value="all">{t('tools.mileageLog.allPurposes', 'All Purposes')}</option>
                  <option value="business">{t('tools.mileageLog.business2', 'Business')}</option>
                  <option value="medical">{t('tools.mileageLog.medical', 'Medical')}</option>
                  <option value="charity">{t('tools.mileageLog.charity2', 'Charity')}</option>
                  <option value="moving">{t('tools.mileageLog.moving', 'Moving')}</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                setDateFilter({ start: '', end: '' });
                setPurposeFilter('all');
              }}
              className={`mt-4 text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              {t('tools.mileageLog.clearFilters', 'Clear Filters')}
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingId ? t('tools.mileageLog.editTrip', 'Edit Trip') : t('tools.mileageLog.addNewTrip', 'Add New Trip')}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className={`p-1 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Calendar className="w-4 h-4 inline-block mr-1" />
                  {t('tools.mileageLog.date', 'Date')}
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <MapPin className="w-4 h-4 inline-block mr-1" />
                  {t('tools.mileageLog.startLocation', 'Start Location')}
                </label>
                <input
                  type="text"
                  value={formData.startLocation}
                  onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                  placeholder={t('tools.mileageLog.eGHomeOffice', 'e.g., Home Office')}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <MapPin className="w-4 h-4 inline-block mr-1" />
                  {t('tools.mileageLog.endLocation', 'End Location')}
                </label>
                <input
                  type="text"
                  value={formData.endLocation}
                  onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                  placeholder={t('tools.mileageLog.eGClientOffice', 'e.g., Client Office')}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Car className="w-4 h-4 inline-block mr-1" />
                  {t('tools.mileageLog.miles', 'Miles')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.miles}
                  onChange={(e) => setFormData({ ...formData, miles: e.target.value })}
                  placeholder="0.0"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline-block mr-1" />
                  {t('tools.mileageLog.purpose2', 'Purpose')}
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value as TripPurpose })}
                  className={inputClass}
                >
                  <option value="business">{t('tools.mileageLog.business067Mile', 'Business ($0.67/mile)')}</option>
                  <option value="medical">{t('tools.mileageLog.medical021Mile', 'Medical ($0.21/mile)')}</option>
                  <option value="charity">{t('tools.mileageLog.charity014Mile', 'Charity ($0.14/mile)')}</option>
                  <option value="moving">{t('tools.mileageLog.moving021Mile', 'Moving ($0.21/mile)')}</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mileageLog.notesOptional', 'Notes (optional)')}
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('tools.mileageLog.tripDetails', 'Trip details...')}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className={buttonSecondaryClass}
              >
                {t('tools.mileageLog.cancel', 'Cancel')}
              </button>
              <button
                onClick={editingId ? handleUpdateTrip : handleAddTrip}
                disabled={!formData.startLocation || !formData.endLocation || !formData.miles}
                className={`${buttonPrimaryClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Check className="w-4 h-4 inline-block mr-1" />
                {editingId ? t('tools.mileageLog.updateTrip', 'Update Trip') : t('tools.mileageLog.addTrip2', 'Add Trip')}
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {(Object.keys(summary.byPurpose) as TripPurpose[]).map((purpose) => {
            const data = summary.byPurpose[purpose];
            if (data.miles === 0 && trips.length > 0) return null;
            return (
              <div key={purpose} className={cardClass}>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                  isDark ? PURPOSE_COLORS[purpose].dark : PURPOSE_COLORS[purpose].light
                }`}>
                  {PURPOSE_LABELS[purpose]}
                </div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {data.miles.toFixed(1)} mi
                </p>
                <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  ${data.deduction.toFixed(2)}
                </p>
              </div>
            );
          })}

          <div className={`${cardClass} ${isDark ? 'bg-gradient-to-br from-green-900/50 to-gray-800' : 'bg-gradient-to-br from-green-50 to-white'}`}>
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
              isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
            }`}>
              {t('tools.mileageLog.totalDeduction', 'Total Deduction')}
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${summary.grandTotal.toFixed(2)}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {summary.totalMiles.toFixed(1)} total miles
            </p>
          </div>
        </div>

        {/* Trip List */}
        <div className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Trip Log ({filteredTrips.length} trips)
            </h3>

            {trips.length > 0 && (
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onCopyToClipboard={handleCopyToClipboard}
                onPrint={handlePrint}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            )}
          </div>

          {filteredTrips.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">{t('tools.mileageLog.noTripsRecorded', 'No trips recorded')}</p>
              <p className="text-sm">{t('tools.mileageLog.addYourFirstTripTo', 'Add your first trip to start tracking mileage for tax deductions.')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(trip.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isDark ? PURPOSE_COLORS[trip.purpose].dark : PURPOSE_COLORS[trip.purpose].light
                        }`}>
                          {PURPOSE_LABELS[trip.purpose]}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{trip.startLocation}</span>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>→</span>
                        <span className="font-medium">{trip.endLocation}</span>
                      </div>
                      {trip.notes && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {trip.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {trip.miles.toFixed(1)} mi
                        </p>
                        <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          ${(trip.miles * MILEAGE_RATES[trip.purpose]).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditTrip(trip)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MileageLogTool;
