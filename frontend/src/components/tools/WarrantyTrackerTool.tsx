import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  X,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface WarrantyTrackerToolProps {
  uiConfig?: UIConfig;
}

interface Warranty {
  id: string;
  productName: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  warrantyType: 'standard' | 'extended' | 'lifetime';
  status: 'active' | 'expired' | 'about-to-expire';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface WarrantyCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const DEFAULT_CATEGORIES: WarrantyCategory[] = [
  { id: 'electronics', name: 'Electronics', icon: 'zap', color: '#3B82F6' },
  { id: 'appliances', name: 'Appliances', icon: 'home', color: '#8B5CF6' },
  { id: 'furniture', name: 'Furniture', icon: 'shield', color: '#10B981' },
  { id: 'tools', name: 'Tools', icon: 'hammer', color: '#F59E0B' },
  { id: 'vehicles', name: 'Vehicles', icon: 'car', color: '#EF4444' },
  { id: 'other', name: 'Other', icon: 'tag', color: '#6B7280' },
];

const WARRANTY_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'extended', label: 'Extended' },
  { value: 'lifetime', label: 'Lifetime' },
];

// Column configuration for exports
const WARRANTY_COLUMNS: ColumnConfig[] = [
  { key: 'productName', header: 'Product Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'serialNumber', header: 'Serial Number', type: 'string' },
  { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
  { key: 'warrantyExpiry', header: 'Warranty Expiry', type: 'date' },
  { key: 'warrantyType', header: 'Warranty Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, React.FC<{ className?: string }>> = {
    zap: AlertCircle,
    home: Shield,
    shield: Shield,
    hammer: Shield,
    car: Shield,
    tag: AlertCircle,
  };
  return icons[iconName] || Shield;
};

export const WarrantyTrackerTool: React.FC<WarrantyTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // useToolData hook for warranty management
  const {
    data: warranties,
    addItem: addWarranty,
    updateItem: updateWarranty,
    deleteItem: deleteWarranty,
    isLoading: warrantiesLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Warranty>('warranty-tracker', [], WARRANTY_COLUMNS);

  // State
  const [categories, setCategories] = useState<WarrantyCategory[]>(DEFAULT_CATEGORIES);
  const [error, setError] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // UI State
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    productName: '',
    category: 'electronics',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    warrantyType: 'standard' as Warranty['warrantyType'],
    notes: '',
  });

  const [newCategory, setNewCategory] = useState({ name: '', color: '#6B7280' });

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description) {
        setFormData((prev) => ({
          ...prev,
          productName: params.title || prev.productName,
          notes: params.description || prev.notes,
        }));
        setShowWarrantyModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Check warranty status
  const updateWarrantyStatus = (warranty: Warranty): Warranty['status'] => {
    const today = new Date();
    const expiryDate = new Date(warranty.warrantyExpiry);
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (expiryDate < today) {
      return 'expired';
    } else if (expiryDate < thirtyDaysFromNow) {
      return 'about-to-expire';
    }
    return 'active';
  };

  // Check for expired warranties and update when warranties change
  useEffect(() => {
    warranties.forEach((warranty) => {
      const newStatus = updateWarrantyStatus(warranty);
      if (warranty.status !== newStatus) {
        updateWarranty(warranty.id, { status: newStatus, updatedAt: new Date().toISOString() });
      }
    });
  }, [warranties]);

  // CRUD Operations
  const handleAddWarranty = () => {
    if (!formData.productName || !formData.warrantyExpiry) {
      setError('Please fill in all required fields');
      return;
    }

    const newWarranty: Warranty = {
      id: Date.now().toString(),
      productName: formData.productName,
      category: formData.category,
      serialNumber: formData.serialNumber,
      purchaseDate: formData.purchaseDate,
      warrantyExpiry: formData.warrantyExpiry,
      warrantyType: formData.warrantyType,
      status: updateWarrantyStatus({
        id: '',
        productName: '',
        category: '',
        serialNumber: '',
        purchaseDate: formData.purchaseDate,
        warrantyExpiry: formData.warrantyExpiry,
        warrantyType: formData.warrantyType,
        status: 'active',
        notes: formData.notes,
        createdAt: '',
        updatedAt: '',
      }),
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addWarranty(newWarranty);
    resetForm();
    setShowWarrantyModal(false);
  };

  const handleUpdateWarranty = () => {
    if (!editingWarranty) return;

    const newStatus = updateWarrantyStatus({
      ...editingWarranty,
      warrantyExpiry: formData.warrantyExpiry,
    });

    updateWarranty(editingWarranty.id, {
      productName: formData.productName,
      category: formData.category,
      serialNumber: formData.serialNumber,
      purchaseDate: formData.purchaseDate,
      warrantyExpiry: formData.warrantyExpiry,
      warrantyType: formData.warrantyType,
      status: newStatus,
      notes: formData.notes,
      updatedAt: new Date().toISOString(),
    });

    resetForm();
    setShowWarrantyModal(false);
    setEditingWarranty(null);
  };

  const handleDeleteWarranty = (warrantyId: string) => {
    deleteWarranty(warrantyId);
  };

  const handleAddCategory = () => {
    if (!newCategory.name) return;

    const category: WarrantyCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      icon: 'tag',
      color: newCategory.color,
    };

    const customCategories = categories.filter((c) => !DEFAULT_CATEGORIES.find((dc) => dc.id === c.id));
    const updatedCustomCategories = [...customCategories, category];
    setCategories([...DEFAULT_CATEGORIES, ...updatedCustomCategories]);
    setNewCategory({ name: '', color: '#6B7280' });
    setShowCategoryModal(false);
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      category: 'electronics',
      serialNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      warrantyType: 'standard',
      notes: '',
    });
    setError(null);
  };

  const openEditModal = (warranty: Warranty) => {
    setEditingWarranty(warranty);
    setFormData({
      productName: warranty.productName,
      category: warranty.category,
      serialNumber: warranty.serialNumber,
      purchaseDate: warranty.purchaseDate,
      warrantyExpiry: warranty.warrantyExpiry,
      warrantyType: warranty.warrantyType,
      notes: warranty.notes || '',
    });
    setShowWarrantyModal(true);
  };

  // Computed values
  const filteredWarranties = useMemo(() => {
    return warranties.filter((warranty) => {
      const matchesSearch =
        warranty.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warranty.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || warranty.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || warranty.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [warranties, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const active = warranties.filter((w) => w.status === 'active').length;
    const expired = warranties.filter((w) => w.status === 'expired').length;
    const aboutToExpire = warranties.filter((w) => w.status === 'about-to-expire').length;

    return { active, expired, aboutToExpire };
  }, [warranties]);

  // Styles
  const cardClass = `rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`;
  const inputClass = `w-full px-4 py-2.5 rounded-lg border ${
    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all`;
  const buttonPrimary = 'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium';
  const buttonSecondary = `px-4 py-2 rounded-lg border ${
    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  } transition-colors`;

  const getStatusColor = (status: Warranty['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-500/10';
      case 'expired':
        return 'text-red-500 bg-red-500/10';
      case 'about-to-expire':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: Warranty['status']) => {
    switch (status) {
      case 'active':
        return CheckCircle2;
      case 'expired':
        return AlertTriangle;
      case 'about-to-expire':
        return Clock;
      default:
        return Shield;
    }
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
  };

  return (
    <div className="space-y-6">
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-500 font-medium">{t('tools.warrantyTracker.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.warrantyTracker.warrantyTracker', 'Warranty Tracker')}</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.warrantyTracker.keepTrackOfYourProduct', 'Keep track of your product warranties')}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyTracker.activeWarranties', 'Active Warranties')}</p>
              <p className="text-xl font-bold text-green-500">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyTracker.aboutToExpire', 'About to Expire')}</p>
              <p className="text-xl font-bold text-yellow-500">{stats.aboutToExpire}</p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-4`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyTracker.expired', 'Expired')}</p>
              <p className="text-xl font-bold text-red-500">{stats.expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.warrantyTracker.searchWarranties', 'Search warranties...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>

        <button onClick={() => setShowFilters(!showFilters)} className={buttonSecondary}>
          <Filter className="w-4 h-4 inline mr-2" />
          Filters
          {showFilters ? <ChevronUp className="w-4 h-4 inline ml-2" /> : <ChevronDown className="w-4 h-4 inline ml-2" />}
        </button>

        <ExportDropdown
          onExportCSV={() => exportToCSV(filteredWarranties, WARRANTY_COLUMNS, { filename: 'warranties' })}
          onExportExcel={() => exportToExcel(filteredWarranties, WARRANTY_COLUMNS, { filename: 'warranties' })}
          onExportJSON={() => exportToJSON(filteredWarranties, { filename: 'warranty-data' })}
          onExportPDF={async () => {
            await exportToPDF(filteredWarranties, WARRANTY_COLUMNS, {
              filename: 'warranties',
              title: 'Warranty Report',
              subtitle: `Active: ${stats.active} | About to Expire: ${stats.aboutToExpire} | Expired: ${stats.expired}`,
            });
          }}
          onPrint={() => printData(filteredWarranties, WARRANTY_COLUMNS, { title: 'Warranty Report' })}
          onCopyToClipboard={() => copyUtil(filteredWarranties, WARRANTY_COLUMNS, 'tab')}
          theme={isDark ? 'dark' : 'light'}
        />

        <button
          onClick={() => {
            resetForm();
            setEditingWarranty(null);
            setShowWarrantyModal(true);
          }}
          className={buttonPrimary}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          {t('tools.warrantyTracker.addWarranty', 'Add Warranty')}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`${cardClass} p-4 flex flex-wrap gap-4`}>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.warrantyTracker.status', 'Status')}</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
              <option value="all">{t('tools.warrantyTracker.allStatuses', 'All Statuses')}</option>
              <option value="active">{t('tools.warrantyTracker.active', 'Active')}</option>
              <option value="about-to-expire">{t('tools.warrantyTracker.aboutToExpire2', 'About to Expire')}</option>
              <option value="expired">{t('tools.warrantyTracker.expired2', 'Expired')}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.warrantyTracker.category', 'Category')}</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={inputClass}>
              <option value="all">{t('tools.warrantyTracker.allCategories', 'All Categories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowCategoryModal(true)} className={buttonSecondary}>
              <Plus className="w-4 h-4 inline mr-1" />
              {t('tools.warrantyTracker.newCategory', 'New Category')}
            </button>
          </div>
        </div>
      )}

      {/* Sync Status */}
      <div className="flex justify-end">
        <WidgetEmbedButton toolSlug="warranty-tracker" toolName="Warranty Tracker" />

        <SyncStatus
          isSynced={isSynced}
          isSaving={isSaving}
          lastSaved={lastSaved}
          syncError={syncError}
          onForceSync={forceSync}
          theme={isDark ? 'dark' : 'light'}
          showLabel={true}
          size="sm"
        />
      </div>

      {/* Warranties List */}
      <div className="space-y-3">
        {warrantiesLoading ? (
          <div className={`${cardClass} p-8 text-center`}>
            <RefreshCw className={`w-8 h-8 mx-auto animate-spin ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyTracker.loadingWarranties', 'Loading warranties...')}</p>
          </div>
        ) : filteredWarranties.length === 0 ? (
          <div className={`${cardClass} p-8 text-center`}>
            <Shield className={`w-12 h-12 mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {warranties.length === 0 ? t('tools.warrantyTracker.noWarrantiesYetAddYour', 'No warranties yet. Add your first warranty!') : t('tools.warrantyTracker.noWarrantiesMatchYourFilters', 'No warranties match your filters.')}
            </p>
          </div>
        ) : (
          filteredWarranties.map((warranty) => {
            const category = getCategoryById(warranty.category);
            const CategoryIcon = getCategoryIcon(category.icon);
            const StatusIcon = getStatusIcon(warranty.status);

            return (
              <div
                key={warranty.id}
                className={`${cardClass} p-4 ${warranty.status === 'expired' ? 'border-red-500/50 bg-red-500/5' : warranty.status === 'about-to-expire' ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                      <CategoryIcon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{warranty.productName}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {category.name} {warranty.serialNumber && `• ${warranty.serialNumber}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {warranty.warrantyType.charAt(0).toUpperCase() + warranty.warrantyType.slice(1)}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {new Date(warranty.warrantyExpiry).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusColor(warranty.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span className="text-xs font-medium capitalize">{warranty.status.replace('-', ' ')}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(warranty)}
                        className={`p-2 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} rounded-lg transition-colors`}
                        title={t('tools.warrantyTracker.edit', 'Edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWarranty(warranty.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {warranty.notes && (
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} pl-16`}>{warranty.notes}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Warranty Modal */}
      {showWarrantyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-lg ${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingWarranty ? t('tools.warrantyTracker.editWarranty', 'Edit Warranty') : t('tools.warrantyTracker.addNewWarranty', 'Add New Warranty')}
              </h3>
              <button
                onClick={() => {
                  setShowWarrantyModal(false);
                  setEditingWarranty(null);
                  resetForm();
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.warrantyTracker.productName', 'Product Name *')}
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder={t('tools.warrantyTracker.eGSamsungTv65', 'e.g., Samsung TV 65-inch')}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.warrantyTracker.category2', 'Category')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClass}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.warrantyTracker.warrantyType', 'Warranty Type')}</label>
                  <select
                    value={formData.warrantyType}
                    onChange={(e) => setFormData({ ...formData, warrantyType: e.target.value as Warranty['warrantyType'] })}
                    className={inputClass}
                  >
                    {WARRANTY_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.warrantyTracker.serialNumber', 'Serial Number')}</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder={t('tools.warrantyTracker.eGAbc123xyz', 'e.g., ABC123XYZ')}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.warrantyTracker.purchaseDate', 'Purchase Date')}</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.warrantyTracker.warrantyExpiry', 'Warranty Expiry *')}
                  </label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.warrantyTracker.notes', 'Notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('tools.warrantyTracker.addAnyNotesAboutThe', 'Add any notes about the warranty...')}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowWarrantyModal(false);
                    setEditingWarranty(null);
                    resetForm();
                  }}
                  className={`flex-1 ${buttonSecondary}`}
                >
                  {t('tools.warrantyTracker.cancel', 'Cancel')}
                </button>
                <button onClick={editingWarranty ? handleUpdateWarranty : handleAddWarranty} className={`flex-1 ${buttonPrimary}`}>
                  {editingWarranty ? t('tools.warrantyTracker.updateWarranty', 'Update Warranty') : t('tools.warrantyTracker.addWarranty2', 'Add Warranty')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm ${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.warrantyTracker.addCategory', 'Add Category')}</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.warrantyTracker.categoryName', 'Category Name')}
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder={t('tools.warrantyTracker.eGSmartHome', 'e.g., Smart Home')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.warrantyTracker.color', 'Color')}</label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCategoryModal(false)} className={`flex-1 ${buttonSecondary}`}>
                  {t('tools.warrantyTracker.cancel2', 'Cancel')}
                </button>
                <button onClick={handleAddCategory} className={`flex-1 ${buttonPrimary}`}>
                  {t('tools.warrantyTracker.addCategory2', 'Add Category')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyTrackerTool;
