'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Calculator,
  MapPin,
  Home,
  DollarSign,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface HomeValuation {
  id: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'house' | 'condo' | 'townhouse' | 'multi_family';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: number;
  yearBuilt: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  recentRenovations: string[];
  purchasePrice?: number;
  purchaseDate?: string;
  estimatedValue: number;
  comparablePrice1?: number;
  comparablePrice2?: number;
  comparablePrice3?: number;
  pricePerSqft: number;
  marketTrend: 'appreciating' | 'stable' | 'depreciating';
  appreciationRate?: number;
  lastValuationDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnConfig[] = [
  { key: 'propertyAddress', header: 'Property', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'propertyType', header: 'Type', type: 'string' },
  { key: 'bedrooms', header: 'Beds', type: 'number' },
  { key: 'bathrooms', header: 'Baths', type: 'number' },
  { key: 'sqft', header: 'Sqft', type: 'number' },
  { key: 'estimatedValue', header: 'Value', type: 'currency' },
  { key: 'pricePerSqft', header: '$/Sqft', type: 'currency' },
  { key: 'lastValuationDate', header: 'Last Updated', type: 'date' },
];

const PROPERTY_TYPES = [
  { value: 'house', label: 'Single Family Home' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi_family', label: 'Multi-Family' },
];

const CONDITIONS = [
  { value: 'excellent', label: 'Excellent', multiplier: 1.1 },
  { value: 'good', label: 'Good', multiplier: 1.0 },
  { value: 'fair', label: 'Fair', multiplier: 0.9 },
  { value: 'poor', label: 'Poor', multiplier: 0.75 },
];

const RENOVATIONS = [
  'Kitchen Remodel',
  'Bathroom Remodel',
  'New Roof',
  'HVAC Replacement',
  'Windows Replaced',
  'Flooring Update',
  'Exterior Paint',
  'Landscaping',
  'Pool Addition',
  'Garage Addition',
  'Basement Finishing',
  'Solar Panels',
];

export const HomeValuationTool: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: valuations,
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
  } = useToolData<HomeValuation>('home-valuation', [], columns);

  const [showModal, setShowModal] = useState(false);
  const [editingValuation, setEditingValuation] = useState<HomeValuation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [form, setForm] = useState<Partial<HomeValuation>>({
    propertyAddress: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 0,
    lotSize: 0,
    yearBuilt: 2000,
    condition: 'good',
    recentRenovations: [],
    estimatedValue: 0,
    pricePerSqft: 0,
    marketTrend: 'stable',
    lastValuationDate: new Date().toISOString().split('T')[0],
  });

  const filteredValuations = useMemo(() => {
    return valuations.filter(val => {
      const matchesSearch = !searchQuery ||
        val.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        val.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || val.propertyType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [valuations, searchQuery, typeFilter]);

  const stats = useMemo(() => {
    const totalValue = valuations.reduce((sum, v) => sum + v.estimatedValue, 0);
    const avgValue = valuations.length > 0 ? totalValue / valuations.length : 0;
    const avgPricePerSqft = valuations.length > 0
      ? valuations.reduce((sum, v) => sum + v.pricePerSqft, 0) / valuations.length
      : 0;
    const appreciating = valuations.filter(v => v.marketTrend === 'appreciating').length;
    return { totalValue, avgValue, avgPricePerSqft, appreciating, total: valuations.length };
  }, [valuations]);

  const calculateEstimatedValue = (formData: Partial<HomeValuation>) => {
    const { sqft, pricePerSqft, condition, recentRenovations } = formData;
    if (!sqft || !pricePerSqft) return 0;

    const conditionMultiplier = CONDITIONS.find(c => c.value === condition)?.multiplier || 1;
    const renovationBonus = (recentRenovations?.length || 0) * 0.02; // 2% per renovation

    const baseValue = sqft * pricePerSqft;
    const adjustedValue = baseValue * conditionMultiplier * (1 + renovationBonus);

    return Math.round(adjustedValue);
  };

  const handleSubmit = () => {
    if (!form.propertyAddress || !form.sqft) return;

    const estimatedValue = form.estimatedValue || calculateEstimatedValue(form);
    const now = new Date().toISOString();

    if (editingValuation) {
      updateItem(editingValuation.id, { ...form, estimatedValue, updatedAt: now });
    } else {
      const newValuation: HomeValuation = {
        id: `val-${Date.now()}`,
        propertyAddress: form.propertyAddress || '',
        city: form.city || '',
        state: form.state || '',
        zipCode: form.zipCode || '',
        propertyType: form.propertyType || 'house',
        bedrooms: form.bedrooms || 0,
        bathrooms: form.bathrooms || 0,
        sqft: form.sqft || 0,
        lotSize: form.lotSize || 0,
        yearBuilt: form.yearBuilt || 2000,
        condition: form.condition || 'good',
        recentRenovations: form.recentRenovations || [],
        purchasePrice: form.purchasePrice,
        purchaseDate: form.purchaseDate,
        estimatedValue,
        comparablePrice1: form.comparablePrice1,
        comparablePrice2: form.comparablePrice2,
        comparablePrice3: form.comparablePrice3,
        pricePerSqft: form.pricePerSqft || 0,
        marketTrend: form.marketTrend || 'stable',
        appreciationRate: form.appreciationRate,
        lastValuationDate: form.lastValuationDate || now.split('T')[0],
        notes: form.notes,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newValuation);
    }
    resetForm();
    setShowModal(false);
    setEditingValuation(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Valuation',
      message: 'Are you sure you want to delete this valuation? This action cannot be undone.',
      confirmText: 'Delete',
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
      city: '',
      state: '',
      zipCode: '',
      propertyType: 'house',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 0,
      lotSize: 0,
      yearBuilt: 2000,
      condition: 'good',
      recentRenovations: [],
      estimatedValue: 0,
      pricePerSqft: 0,
      marketTrend: 'stable',
      lastValuationDate: new Date().toISOString().split('T')[0],
    });
  };

  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.homeValuation.homeValuation', 'Home Valuation')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.homeValuation.estimatePropertyValuesAndTrack', 'Estimate property values and track market trends')}
                  </p>
                </div>
              </div>
              <WidgetEmbedButton toolSlug="home-valuation" toolName="Home Valuation" />

              <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeValuation.properties', 'Properties')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeValuation.totalValue', 'Total Value')}</p>
            <p className="text-2xl font-bold text-cyan-500">${(stats.totalValue / 1000000).toFixed(2)}M</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeValuation.avgValue', 'Avg Value')}</p>
            <p className="text-2xl font-bold text-blue-500">${(stats.avgValue / 1000).toFixed(0)}K</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeValuation.avgSqft', 'Avg $/Sqft')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.avgPricePerSqft.toFixed(0)}</p>
          </div>
          <div className={`${cardClass} p-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeValuation.appreciating', 'Appreciating')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.appreciating}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={cardClass}>
          <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder={t('tools.homeValuation.searchProperties', 'Search properties...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-10 w-64`} />
              </div>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={inputClass}>
                <option value="all">{t('tools.homeValuation.allTypes', 'All Types')}</option>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'home-valuations' })}
                onExportExcel={() => exportExcel({ filename: 'home-valuations' })}
                onExportJSON={() => exportJSON({ filename: 'home-valuations' })}
                onExportPDF={async () => { await exportPDF({ filename: 'home-valuations', title: 'Home Valuations' }); }}
                onPrint={() => print('Home Valuations')}
                onCopyToClipboard={() => copyToClipboard()}
                disabled={valuations.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
              <button onClick={() => setShowModal(true)} className={buttonPrimary}>
                <Plus className="w-4 h-4" />
                {t('tools.homeValuation.newValuation', 'New Valuation')}
              </button>
            </div>
          </div>
        </div>

        {/* Valuations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredValuations.map(valuation => {
            const trendIcon = valuation.marketTrend === 'appreciating' ? ArrowUpRight :
                             valuation.marketTrend === 'depreciating' ? ArrowDownRight : null;
            const trendColor = valuation.marketTrend === 'appreciating' ? 'text-green-500' :
                              valuation.marketTrend === 'depreciating' ? 'text-red-500' : 'text-gray-500';

            return (
              <div key={valuation.id} className={`${cardClass} p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Home className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{valuation.propertyAddress}</h3>
                      <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <MapPin className="w-3.5 h-3.5" />
                        {valuation.city}, {valuation.state}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-4 mb-3 border-y ${isDark ? 'border-gray-700' : 'border-gray-100'}">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeValuation.estimatedValue', 'Estimated Value')}</p>
                  <p className="text-3xl font-bold text-cyan-500">${valuation.estimatedValue.toLocaleString()}</p>
                  <div className={`flex items-center justify-center gap-1 mt-1 ${trendColor}`}>
                    {trendIcon && React.createElement(trendIcon, { className: 'w-4 h-4' })}
                    <span className="text-sm capitalize">{valuation.marketTrend}</span>
                    {valuation.appreciationRate && (
                      <span className="text-sm">({valuation.appreciationRate}%/yr)</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{valuation.bedrooms}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeValuation.beds', 'Beds')}</p>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{valuation.bathrooms}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeValuation.baths', 'Baths')}</p>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{valuation.sqft.toLocaleString()}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeValuation.sqft', 'Sqft')}</p>
                  </div>
                </div>

                <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                  <span>${valuation.pricePerSqft}/sqft</span>
                  <span className="capitalize">{valuation.condition}</span>
                  <span>Built {valuation.yearBuilt}</span>
                </div>

                <div className={`flex gap-2 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <button
                    onClick={() => {
                      setEditingValuation(valuation);
                      setForm(valuation);
                      setShowModal(true);
                    }}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm ${buttonSecondary}`}
                  >
                    <Edit2 className="w-4 h-4" />
                    {t('tools.homeValuation.edit', 'Edit')}
                  </button>
                  <button onClick={() => void handleDelete(valuation.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredValuations.length === 0 && (
          <div className={`${cardClass} text-center py-12`}>
            <TrendingUp className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeValuation.noValuationsFound', 'No valuations found')}</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.homeValuation.addYourFirstPropertyValuation', 'Add your first property valuation')}</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingValuation ? t('tools.homeValuation.editValuation', 'Edit Valuation') : t('tools.homeValuation.newHomeValuation', 'New Home Valuation')}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingValuation(null); resetForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Property Location */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeValuation.propertyLocation', 'Property Location')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelClass}>{t('tools.homeValuation.address', 'Address *')}</label>
                      <input type="text" value={form.propertyAddress || ''} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.city', 'City')}</label>
                      <input type="text" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.state', 'State')}</label>
                      <input type="text" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.zipCode', 'Zip Code')}</label>
                      <input type="text" value={form.zipCode || ''} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.propertyType', 'Property Type')}</label>
                      <select value={form.propertyType || 'house'} onChange={(e) => setForm({ ...form, propertyType: e.target.value as HomeValuation['propertyType'] })} className={inputClass}>
                        {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeValuation.propertyDetails', 'Property Details')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.bedrooms', 'Bedrooms')}</label>
                      <input type="number" value={form.bedrooms || ''} onChange={(e) => setForm({ ...form, bedrooms: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.bathrooms', 'Bathrooms')}</label>
                      <input type="number" value={form.bathrooms || ''} onChange={(e) => setForm({ ...form, bathrooms: parseFloat(e.target.value) || 0 })} min="0" step="0.5" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.squareFeet', 'Square Feet *')}</label>
                      <input type="number" value={form.sqft || ''} onChange={(e) => setForm({ ...form, sqft: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.lotSizeSqft', 'Lot Size (sqft)')}</label>
                      <input type="number" value={form.lotSize || ''} onChange={(e) => setForm({ ...form, lotSize: parseInt(e.target.value) || 0 })} min="0" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.yearBuilt', 'Year Built')}</label>
                      <input type="number" value={form.yearBuilt || ''} onChange={(e) => setForm({ ...form, yearBuilt: parseInt(e.target.value) || 2000 })} min="1800" max="2030" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.condition', 'Condition')}</label>
                      <select value={form.condition || 'good'} onChange={(e) => setForm({ ...form, condition: e.target.value as HomeValuation['condition'] })} className={inputClass}>
                        {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Valuation Data */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeValuation.valuationData', 'Valuation Data')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.pricePerSqft', 'Price per Sqft ($)')}</label>
                      <input type="number" value={form.pricePerSqft || ''} onChange={(e) => {
                        const pricePerSqft = parseFloat(e.target.value) || 0;
                        setForm({ ...form, pricePerSqft, estimatedValue: calculateEstimatedValue({ ...form, pricePerSqft }) });
                      }} min="0" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.estimatedValue2', 'Estimated Value ($)')}</label>
                      <input type="number" value={form.estimatedValue || ''} onChange={(e) => setForm({ ...form, estimatedValue: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.marketTrend', 'Market Trend')}</label>
                      <select value={form.marketTrend || 'stable'} onChange={(e) => setForm({ ...form, marketTrend: e.target.value as HomeValuation['marketTrend'] })} className={inputClass}>
                        <option value="appreciating">{t('tools.homeValuation.appreciating2', 'Appreciating')}</option>
                        <option value="stable">{t('tools.homeValuation.stable', 'Stable')}</option>
                        <option value="depreciating">{t('tools.homeValuation.depreciating', 'Depreciating')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.annualAppreciationRate', 'Annual Appreciation Rate (%)')}</label>
                      <input type="number" value={form.appreciationRate || ''} onChange={(e) => setForm({ ...form, appreciationRate: parseFloat(e.target.value) || undefined })} step="0.1" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Comparable Sales */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeValuation.comparableSalesOptional', 'Comparable Sales (Optional)')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.comp1', 'Comp #1 ($)')}</label>
                      <input type="number" value={form.comparablePrice1 || ''} onChange={(e) => setForm({ ...form, comparablePrice1: parseFloat(e.target.value) || undefined })} min="0" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.comp2', 'Comp #2 ($)')}</label>
                      <input type="number" value={form.comparablePrice2 || ''} onChange={(e) => setForm({ ...form, comparablePrice2: parseFloat(e.target.value) || undefined })} min="0" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.homeValuation.comp3', 'Comp #3 ($)')}</label>
                      <input type="number" value={form.comparablePrice3 || ''} onChange={(e) => setForm({ ...form, comparablePrice3: parseFloat(e.target.value) || undefined })} min="0" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Recent Renovations */}
                <div>
                  <label className={labelClass}>{t('tools.homeValuation.recentRenovations', 'Recent Renovations')}</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {RENOVATIONS.map(renovation => (
                      <label key={renovation} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                        form.recentRenovations?.includes(renovation)
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                          : isDark ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}>
                        <input
                          type="checkbox"
                          checked={form.recentRenovations?.includes(renovation) || false}
                          onChange={(e) => {
                            const current = form.recentRenovations || [];
                            const updated = e.target.checked
                              ? [...current, renovation]
                              : current.filter(r => r !== renovation);
                            setForm({ ...form, recentRenovations: updated, estimatedValue: calculateEstimatedValue({ ...form, recentRenovations: updated }) });
                          }}
                          className="sr-only"
                        />
                        <span className="text-sm">{renovation}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={labelClass}>{t('tools.homeValuation.notes', 'Notes')}</label>
                  <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputClass} />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => { setShowModal(false); setEditingValuation(null); resetForm(); }} className={buttonSecondary}>{t('tools.homeValuation.cancel', 'Cancel')}</button>
                <button onClick={handleSubmit} disabled={!form.propertyAddress || !form.sqft} className={`${buttonPrimary} disabled:opacity-50`}>
                  <Save className="w-4 h-4" />
                  {editingValuation ? t('tools.homeValuation.update', 'Update') : t('tools.homeValuation.save', 'Save')} Valuation
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

export default HomeValuationTool;
