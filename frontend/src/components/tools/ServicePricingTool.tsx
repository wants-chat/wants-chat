'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  Scissors,
  Sparkles,
  Heart,
  Palette,
  Hand,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Package,
  Tag,
  TrendingUp,
  DollarSign,
  Clock,
  Printer,
  Calendar,
  BarChart3,
  Users,
  Percent,
  ChevronDown,
  ChevronUp,
  Copy,
  Search,
  Filter,
  Gift,
  History,
  Eye,
  Building2,
  Loader2
} from 'lucide-react';

// Types
interface PriceTier {
  id: string;
  name: string;
  multiplier: number;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  basePrice: number;
  categoryId: string;
  isActive: boolean;
  productCost: number;
  createdAt: string;
}

interface AddOnService {
  id: string;
  name: string;
  price: number;
  duration: number;
  categoryId: string;
}

interface PackageDeal {
  id: string;
  name: string;
  description: string;
  serviceIds: string[];
  originalPrice: number;
  discountedPrice: number;
  validUntil: string;
  isActive: boolean;
}

interface SeasonalPromotion {
  id: string;
  name: string;
  discountPercent: number;
  categoryIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Competitor {
  id: string;
  name: string;
  services: { serviceId: string; price: number }[];
}

interface PriceHistory {
  id: string;
  serviceId: string;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
  reason: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Initial Data
const defaultCategories: ServiceCategory[] = [
  { id: 'hair', name: 'Hair', icon: 'scissors', color: '#8B5CF6' },
  { id: 'nails', name: 'Nails', icon: 'hand', color: '#EC4899' },
  { id: 'skin', name: 'Skin', icon: 'sparkles', color: '#10B981' },
  { id: 'massage', name: 'Massage', icon: 'heart', color: '#F59E0B' },
  { id: 'makeup', name: 'Makeup', icon: 'palette', color: '#EF4444' },
];

const defaultPriceTiers: PriceTier[] = [
  { id: 'junior', name: 'Junior Stylist', multiplier: 0.8 },
  { id: 'senior', name: 'Senior Stylist', multiplier: 1.0 },
  { id: 'master', name: 'Master Stylist', multiplier: 1.3 },
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Service Name', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'categoryId', header: 'Category', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'basePrice', header: 'Base Price', type: 'currency' },
  { key: 'productCost', header: 'Product Cost', type: 'currency' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

type TabType = 'services' | 'addons' | 'packages' | 'promotions' | 'competitors' | 'analytics' | 'menu';

interface ServicePricingToolProps {
  uiConfig?: UIConfig;
}

export const ServicePricingTool: React.FC<ServicePricingToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence of services
  const {
    data: services,
    setData: setServices,
    addItem: addServiceItem,
    updateItem: updateServiceItem,
    deleteItem: deleteServiceItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ServiceItem>('service-pricing', [], COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [categories] = useState<ServiceCategory[]>(defaultCategories);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(defaultPriceTiers);
  const [addOns, setAddOns] = useState<AddOnService[]>([]);
  const [packages, setPackages] = useState<PackageDeal[]>([]);
  const [promotions, setPromotions] = useState<SeasonalPromotion[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Form State
  const [newService, setNewService] = useState<Partial<ServiceItem>>({
    name: '',
    description: '',
    duration: 30,
    basePrice: 0,
    categoryId: 'hair',
    productCost: 0,
    isActive: true,
  });

  // Load supplementary data from localStorage (services handled by useToolData)
  useEffect(() => {
    const saved = localStorage.getItem('service-pricing-supplementary');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.addOns) setAddOns(data.addOns);
        if (data.packages) setPackages(data.packages);
        if (data.promotions) setPromotions(data.promotions);
        if (data.competitors) setCompetitors(data.competitors);
        if (data.priceHistory) setPriceHistory(data.priceHistory);
        if (data.priceTiers) setPriceTiers(data.priceTiers);
      } catch (e) {
        console.error('Failed to load saved supplementary data:', e);
      }
    }
  }, []);

  // Save supplementary data to localStorage (services handled by useToolData)
  useEffect(() => {
    const data = { addOns, packages, promotions, competitors, priceHistory, priceTiers };
    localStorage.setItem('service-pricing-supplementary', JSON.stringify(data));
  }, [addOns, packages, promotions, competitors, priceHistory, priceTiers]);

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.serviceName) {
        setNewService(prev => ({ ...prev, name: params.serviceName as string }));
        hasChanges = true;
      }
      if (params.price || params.basePrice) {
        setNewService(prev => ({ ...prev, basePrice: Number(params.price || params.basePrice) }));
        hasChanges = true;
      }
      if (params.duration) {
        setNewService(prev => ({ ...prev, duration: Number(params.duration) }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCategory = selectedCategory === 'all' || service.categoryId === selectedCategory;
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalServices = services.length;
    const activeServices = services.filter(s => s.isActive).length;
    const avgPrice = services.length > 0
      ? services.reduce((sum, s) => sum + s.basePrice, 0) / services.length
      : 0;
    const avgDuration = services.length > 0
      ? services.reduce((sum, s) => sum + s.duration, 0) / services.length
      : 0;
    const totalRevenuePotential = services.reduce((sum, s) => sum + s.basePrice, 0);
    const avgProfitMargin = services.length > 0
      ? services.reduce((sum, s) => {
          const margin = s.basePrice > 0 ? ((s.basePrice - s.productCost) / s.basePrice) * 100 : 0;
          return sum + margin;
        }, 0) / services.length
      : 0;

    return { totalServices, activeServices, avgPrice, avgDuration, totalRevenuePotential, avgProfitMargin };
  }, [services]);

  // Helper functions
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'scissors': return <Scissors className="w-5 h-5" />;
      case 'hand': return <Hand className="w-5 h-5" />;
      case 'sparkles': return <Sparkles className="w-5 h-5" />;
      case 'heart': return <Heart className="w-5 h-5" />;
      case 'palette': return <Palette className="w-5 h-5" />;
      default: return <Scissors className="w-5 h-5" />;
    }
  };

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Service CRUD
  const addService = () => {
    if (!newService.name || !newService.basePrice) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const service: ServiceItem = {
      id: generateId(),
      name: newService.name || '',
      description: newService.description || '',
      duration: newService.duration || 30,
      basePrice: newService.basePrice || 0,
      categoryId: newService.categoryId || 'hair',
      productCost: newService.productCost || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    addServiceItem(service);
    setNewService({
      name: '',
      description: '',
      duration: 30,
      basePrice: 0,
      categoryId: 'hair',
      productCost: 0,
      isActive: true,
    });
    setShowAddModal(false);
  };

  const updateService = (updatedService: ServiceItem) => {
    const oldService = services.find(s => s.id === updatedService.id);
    if (oldService && oldService.basePrice !== updatedService.basePrice) {
      // Record price history
      const historyEntry: PriceHistory = {
        id: generateId(),
        serviceId: updatedService.id,
        oldPrice: oldService.basePrice,
        newPrice: updatedService.basePrice,
        changedAt: new Date().toISOString(),
        reason: 'Manual update',
      };
      setPriceHistory([...priceHistory, historyEntry]);
    }

    updateServiceItem(updatedService.id, updatedService);
    setEditingItem(null);
  };

  const deleteService = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this service?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteServiceItem(id);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Add-on CRUD
  const addAddOn = (addOn: Omit<AddOnService, 'id'>) => {
    setAddOns([...addOns, { ...addOn, id: generateId() }]);
  };

  const deleteAddOn = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this add-on?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setAddOns(addOns.filter(a => a.id !== id));
  };

  // Package CRUD
  const addPackage = (pkg: Omit<PackageDeal, 'id'>) => {
    setPackages([...packages, { ...pkg, id: generateId() }]);
  };

  const deletePackage = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this package?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setPackages(packages.filter(p => p.id !== id));
  };

  // Promotion CRUD
  const addPromotion = (promo: Omit<SeasonalPromotion, 'id'>) => {
    setPromotions([...promotions, { ...promo, id: generateId() }]);
  };

  const deletePromotion = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this promotion?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setPromotions(promotions.filter(p => p.id !== id));
  };

  // Competitor CRUD
  const addCompetitor = (competitor: Omit<Competitor, 'id'>) => {
    setCompetitors([...competitors, { ...competitor, id: generateId() }]);
  };

  const deleteCompetitor = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this competitor?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  // Print menu
  const printMenu = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const menuHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Service Menu</title>
        <style>
          body { font-family: 'Georgia', serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .category { margin-top: 30px; }
          .category-title { font-size: 24px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
          .service { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px dotted #ddd; }
          .service-name { font-weight: bold; }
          .service-desc { color: #666; font-size: 14px; margin-top: 5px; }
          .service-price { font-weight: bold; text-align: right; }
          .service-duration { color: #888; font-size: 12px; }
          .tier-prices { font-size: 12px; color: #666; margin-top: 5px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Service Menu</h1>
        ${categories.map(cat => {
          const catServices = services.filter(s => s.categoryId === cat.id && s.isActive);
          if (catServices.length === 0) return '';
          return `
            <div class="category">
              <h2 class="category-title">${cat.name}</h2>
              ${catServices.map(s => `
                <div class="service">
                  <div>
                    <div class="service-name">${s.name}</div>
                    <div class="service-desc">${s.description}</div>
                    <div class="tier-prices">
                      ${priceTiers.map(t => `${t.name}: $${(s.basePrice * t.multiplier).toFixed(2)}`).join(' | ')}
                    </div>
                  </div>
                  <div class="service-price">
                    <div>$${s.basePrice.toFixed(2)}</div>
                    <div class="service-duration">${formatDuration(s.duration)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(menuHtml);
    printWindow.document.close();
  };

  // Tab navigation
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'services', label: 'Services', icon: <Scissors className="w-4 h-4" /> },
    { id: 'addons', label: 'Add-ons', icon: <Plus className="w-4 h-4" /> },
    { id: 'packages', label: 'Packages', icon: <Package className="w-4 h-4" /> },
    { id: 'promotions', label: 'Promotions', icon: <Tag className="w-4 h-4" /> },
    { id: 'competitors', label: 'Competitors', icon: <Building2 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'menu', label: 'Menu Preview', icon: <Eye className="w-4 h-4" /> },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.servicePricing.loadingServices', 'Loading services...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.servicePricing.servicePricingTool', 'Service Pricing Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.servicePricing.manageYourSalonSpaService', 'Manage your salon/spa service menu and pricing')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="service-pricing" toolName="Service Pricing" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'service-pricing' })}
                onExportExcel={() => exportExcel({ filename: 'service-pricing' })}
                onExportJSON={() => exportJSON({ filename: 'service-pricing' })}
                onExportPDF={() => exportPDF({ filename: 'service-pricing', title: 'Service Pricing List' })}
                onPrint={() => print('Service Pricing List')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                theme={theme}
              />
              <button
                onClick={printMenu}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Printer className="w-4 h-4" />
                {t('tools.servicePricing.printMenu', 'Print Menu')}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      placeholder={t('tools.servicePricing.searchServices', 'Search services...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="all">{t('tools.servicePricing.allCategories', 'All Categories')}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.servicePricing.addService', 'Add Service')}
                </button>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map(service => {
                const category = getCategoryById(service.categoryId);
                const profitMargin = service.basePrice > 0
                  ? ((service.basePrice - service.productCost) / service.basePrice) * 100
                  : 0;

                return (
                  <Card key={service.id} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${category?.color}20` }}
                          >
                            <span style={{ color: category?.color }}>
                              {getCategoryIcon(category?.icon || 'scissors')}
                            </span>
                          </div>
                          <div>
                            <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {service.name}
                            </CardTitle>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {category?.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingItem(service)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                          >
                            <Edit3 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button
                            onClick={() => deleteService(service.id)}
                            className={`p-1.5 rounded-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/30`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {service.description || 'No description'}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDuration(service.duration)}
                          </span>
                        </div>
                        <div className="text-xl font-bold text-[#0D9488]">
                          ${service.basePrice.toFixed(2)}
                        </div>
                      </div>

                      {/* Price Tiers */}
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.servicePricing.priceByTier', 'Price by Tier')}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {priceTiers.map(tier => (
                            <div key={tier.id} className="text-center">
                              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {tier.name.split(' ')[0]}
                              </div>
                              <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                ${(service.basePrice * tier.multiplier).toFixed(0)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Profit Margin */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.servicePricing.profitMargin', 'Profit Margin')}
                        </span>
                        <span className={`text-sm font-medium ${
                          profitMargin >= 70 ? 'text-green-500' : profitMargin >= 50 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredServices.length === 0 && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.servicePricing.noServicesFoundAddYour', 'No services found. Add your first service to get started!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Add-ons Tab */}
        {activeTab === 'addons' && (
          <div className="space-y-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.servicePricing.addOnServices', 'Add-on Services')}
                </h2>
                <button
                  onClick={() => {
                    const name = prompt('Add-on name:');
                    const price = prompt('Price:');
                    const duration = prompt('Duration (minutes):');
                    const category = prompt('Category (hair/nails/skin/massage/makeup):');
                    if (name && price && duration && category) {
                      addAddOn({
                        name,
                        price: parseFloat(price),
                        duration: parseInt(duration),
                        categoryId: category,
                      });
                    }
                  }}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.servicePricing.addAddOn', 'Add Add-on')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addOns.map(addon => {
                  const category = getCategoryById(addon.categoryId);
                  return (
                    <div
                      key={addon.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1.5 rounded"
                            style={{ backgroundColor: `${category?.color}20` }}
                          >
                            <span style={{ color: category?.color }}>
                              {getCategoryIcon(category?.icon || 'scissors')}
                            </span>
                          </div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {addon.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => deleteAddOn(addon.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDuration(addon.duration)}
                        </span>
                        <span className="text-lg font-bold text-[#0D9488]">
                          +${addon.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {addOns.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.servicePricing.noAddOnsYetAdd', 'No add-ons yet. Add optional services that can be combined with main services.')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.servicePricing.packageDealsBundles', 'Package Deals & Bundles')}
                </h2>
                <button
                  onClick={() => {
                    const name = prompt('Package name:');
                    const description = prompt('Description:');
                    const originalPrice = prompt('Original price:');
                    const discountedPrice = prompt('Discounted price:');
                    const validUntil = prompt('Valid until (YYYY-MM-DD):');
                    if (name && originalPrice && discountedPrice) {
                      addPackage({
                        name,
                        description: description || '',
                        serviceIds: [],
                        originalPrice: parseFloat(originalPrice),
                        discountedPrice: parseFloat(discountedPrice),
                        validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        isActive: true,
                      });
                    }
                  }}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.servicePricing.addPackage', 'Add Package')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map(pkg => {
                  const savings = pkg.originalPrice - pkg.discountedPrice;
                  const savingsPercent = (savings / pkg.originalPrice) * 100;

                  return (
                    <div
                      key={pkg.id}
                      className={`p-6 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-5 h-5 text-[#0D9488]" />
                            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {pkg.name}
                            </h3>
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {pkg.description}
                          </p>
                        </div>
                        <button
                          onClick={() => deletePackage(pkg.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className={`text-sm line-through ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            ${pkg.originalPrice.toFixed(2)}
                          </div>
                          <div className="text-2xl font-bold text-[#0D9488]">
                            ${pkg.discountedPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-green-500 text-white text-sm font-medium px-2 py-1 rounded">
                            Save {savingsPercent.toFixed(0)}%
                          </div>
                          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Valid until {new Date(pkg.validUntil).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {packages.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.servicePricing.noPackagesYetCreateBundled', 'No packages yet. Create bundled services at discounted prices.')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.servicePricing.seasonalPromotions', 'Seasonal Promotions')}
                </h2>
                <button
                  onClick={() => {
                    const name = prompt('Promotion name:');
                    const discountPercent = prompt('Discount percentage:');
                    const startDate = prompt('Start date (YYYY-MM-DD):');
                    const endDate = prompt('End date (YYYY-MM-DD):');
                    if (name && discountPercent && startDate && endDate) {
                      addPromotion({
                        name,
                        discountPercent: parseFloat(discountPercent),
                        categoryIds: [],
                        startDate,
                        endDate,
                        isActive: true,
                      });
                    }
                  }}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.servicePricing.addPromotion', 'Add Promotion')}
                </button>
              </div>

              <div className="space-y-4">
                {promotions.map(promo => {
                  const isActive = new Date(promo.startDate) <= new Date() && new Date(promo.endDate) >= new Date();

                  return (
                    <div
                      key={promo.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                            <Gift className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {promo.name}
                            </h3>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-[#0D9488]">
                            {promo.discountPercent}% OFF
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-400'
                          }`}>
                            {isActive ? t('tools.servicePricing.active', 'Active') : t('tools.servicePricing.inactive', 'Inactive')}
                          </span>
                          <button
                            onClick={() => deletePromotion(promo.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {promotions.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.servicePricing.noPromotionsYetCreateSeasonal', 'No promotions yet. Create seasonal discounts to attract more customers.')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Competitors Tab */}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.servicePricing.competitorPriceComparison', 'Competitor Price Comparison')}
                </h2>
                <button
                  onClick={() => {
                    const name = prompt('Competitor name:');
                    if (name) {
                      addCompetitor({ name, services: [] });
                    }
                  }}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.servicePricing.addCompetitor', 'Add Competitor')}
                </button>
              </div>

              {services.length > 0 && competitors.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                        <th className={`text-left p-3 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.servicePricing.service', 'Service')}
                        </th>
                        <th className={`text-center p-3 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.servicePricing.yourPrice', 'Your Price')}
                        </th>
                        {competitors.map(comp => (
                          <th key={comp.id} className={`text-center p-3 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {comp.name}
                            <button
                              onClick={() => deleteCompetitor(comp.id)}
                              className="ml-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {services.slice(0, 10).map(service => (
                        <tr key={service.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`p-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {service.name}
                          </td>
                          <td className="p-3 text-center font-bold text-[#0D9488]">
                            ${service.basePrice.toFixed(2)}
                          </td>
                          {competitors.map(comp => {
                            const compService = comp.services.find(s => s.serviceId === service.id);
                            const compPrice = compService?.price;
                            const diff = compPrice ? service.basePrice - compPrice : null;

                            return (
                              <td key={comp.id} className="p-3 text-center">
                                {compPrice ? (
                                  <div>
                                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                      ${compPrice.toFixed(2)}
                                    </div>
                                    {diff !== null && (
                                      <div className={`text-xs ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                        {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const price = prompt(`Enter ${comp.name}'s price for ${service.name}:`);
                                      if (price) {
                                        setCompetitors(competitors.map(c =>
                                          c.id === comp.id
                                            ? { ...c, services: [...c.services, { serviceId: service.id, price: parseFloat(price) }] }
                                            : c
                                        ));
                                      }
                                    }}
                                    className={`text-sm ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    {t('tools.servicePricing.addPrice', '+ Add price')}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(services.length === 0 || competitors.length === 0) && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {services.length === 0
                      ? t('tools.servicePricing.addServicesFirstToCompare', 'Add services first to compare prices with competitors.') : t('tools.servicePricing.addCompetitorsToCompareYour', 'Add competitors to compare your prices.')
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Scissors className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.servicePricing.totalServices', 'Total Services')}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalServices}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {analytics.activeServices} active
                </div>
              </div>

              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.servicePricing.avgPrice', 'Avg Price')}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.avgPrice.toFixed(2)}
                </div>
              </div>

              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.servicePricing.avgDuration', 'Avg Duration')}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatDuration(Math.round(analytics.avgDuration))}
                </div>
              </div>

              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.servicePricing.avgProfitMargin', 'Avg Profit Margin')}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${
                  analytics.avgProfitMargin >= 70 ? 'text-green-500' : analytics.avgProfitMargin >= 50 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {analytics.avgProfitMargin.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.servicePricing.costAnalysisByService', 'Cost Analysis by Service')}
              </h2>

              <div className="space-y-4">
                {services.map(service => {
                  const profit = service.basePrice - service.productCost;
                  const margin = service.basePrice > 0 ? (profit / service.basePrice) * 100 : 0;
                  const hourlyRate = service.duration > 0 ? (profit / service.duration) * 60 : 0;

                  return (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {service.name}
                        </h3>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {getCategoryById(service.categoryId)?.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-4 text-center">
                        <div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.servicePricing.price', 'Price')}</div>
                          <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${service.basePrice.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.servicePricing.productCost', 'Product Cost')}</div>
                          <div className="font-semibold text-red-500">
                            ${service.productCost.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.servicePricing.profit', 'Profit')}</div>
                          <div className="font-semibold text-green-500">
                            ${profit.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.servicePricing.margin', 'Margin')}</div>
                          <div className={`font-semibold ${
                            margin >= 70 ? 'text-green-500' : margin >= 50 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {margin.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>$/Hour</div>
                          <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${hourlyRate.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {services.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.servicePricing.addServicesToSeeCost', 'Add services to see cost analysis.')}</p>
                </div>
              )}
            </div>

            {/* Price History */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.servicePricing.priceIncreaseHistory', 'Price Increase History')}
              </h2>

              {priceHistory.length > 0 ? (
                <div className="space-y-3">
                  {priceHistory.slice(-10).reverse().map(history => {
                    const service = services.find(s => s.id === history.serviceId);
                    const change = history.newPrice - history.oldPrice;
                    const changePercent = (change / history.oldPrice) * 100;

                    return (
                      <div
                        key={history.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <History className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div>
                            <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {service?.name || 'Unknown Service'}
                            </div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(history.changedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              ${history.oldPrice.toFixed(2)}
                            </span>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>→</span>
                            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              ${history.newPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className={`text-xs ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.servicePricing.noPriceChangesRecordedYet', 'No price changes recorded yet.')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu Preview Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.servicePricing.serviceMenuPreview', 'Service Menu Preview')}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={printMenu}
                    className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    {t('tools.servicePricing.printMenu2', 'Print Menu')}
                  </button>
                  <button
                    onClick={() => {
                      const menuText = categories.map(cat => {
                        const catServices = services.filter(s => s.categoryId === cat.id && s.isActive);
                        if (catServices.length === 0) return '';
                        return `${cat.name.toUpperCase()}\n${catServices.map(s =>
                          `  ${s.name} - $${s.basePrice.toFixed(2)} (${formatDuration(s.duration)})`
                        ).join('\n')}`;
                      }).filter(Boolean).join('\n\n');
                      navigator.clipboard.writeText(menuText);
                      setValidationMessage('Menu copied to clipboard!');
                      setTimeout(() => setValidationMessage(null), 3000);
                    }}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {t('tools.servicePricing.copy', 'Copy')}
                  </button>
                </div>
              </div>

              {/* Online Booking Display Format */}
              <div className={`p-6 rounded-lg border-2 border-dashed ${
                theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className={`text-center mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <h1 className="text-3xl font-serif font-bold mb-2">{t('tools.servicePricing.serviceMenu', 'Service Menu')}</h1>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.servicePricing.bookYourAppointmentOnline', 'Book your appointment online')}
                  </p>
                </div>

                {categories.map(category => {
                  const catServices = services.filter(s => s.categoryId === category.id && s.isActive);
                  if (catServices.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-8">
                      <div
                        className="flex items-center gap-3 mb-4 pb-2 border-b"
                        style={{ borderColor: category.color }}
                      >
                        <span style={{ color: category.color }}>
                          {getCategoryIcon(category.icon)}
                        </span>
                        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {category.name}
                        </h2>
                      </div>

                      <div className="space-y-3">
                        {catServices.map(service => (
                          <div
                            key={service.id}
                            className={`flex justify-between items-start p-3 rounded-lg ${
                              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            } transition-colors`}
                          >
                            <div className="flex-1">
                              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {service.name}
                              </h3>
                              {service.description && (
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {service.description}
                                </p>
                              )}
                              <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                {priceTiers.map(tier => (
                                  <span key={tier.id} className="mr-3">
                                    {tier.name}: ${(service.basePrice * tier.multiplier).toFixed(0)}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-[#0D9488]">
                                ${service.basePrice.toFixed(2)}
                              </div>
                              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDuration(service.duration)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {services.filter(s => s.isActive).length === 0 && (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.servicePricing.addServicesToPreviewYour', 'Add services to preview your menu.')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.servicePricing.addNewService', 'Add New Service')}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.servicePricing.serviceName', 'Service Name *')}
                  </label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.servicePricing.eGHaircutStyle', 'e.g., Haircut & Style')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.servicePricing.description', 'Description')}
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    rows={2}
                    placeholder={t('tools.servicePricing.briefDescriptionOfTheService', 'Brief description of the service')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.servicePricing.category', 'Category')}
                  </label>
                  <select
                    value={newService.categoryId}
                    onChange={(e) => setNewService({ ...newService, categoryId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.servicePricing.durationMin', 'Duration (min) *')}
                    </label>
                    <input
                      type="number"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      min="5"
                      step="5"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.servicePricing.basePrice', 'Base Price ($) *')}
                    </label>
                    <input
                      type="number"
                      value={newService.basePrice || ''}
                      onChange={(e) => setNewService({ ...newService, basePrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.servicePricing.productCost2', 'Product Cost ($)')}
                  </label>
                  <input
                    type="number"
                    value={newService.productCost || ''}
                    onChange={(e) => setNewService({ ...newService, productCost: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    min="0"
                    step="0.01"
                    placeholder={t('tools.servicePricing.costOfProductsUsed', 'Cost of products used')}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addService}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.servicePricing.addService2', 'Add Service')}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.servicePricing.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Service Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.servicePricing.editService', 'Edit Service')}
                </h2>
                <button
                  onClick={() => setEditingItem(null)}
                  className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.servicePricing.serviceName2', 'Service Name')}
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.servicePricing.description2', 'Description')}
                  </label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    rows={2}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.servicePricing.category2', 'Category')}
                  </label>
                  <select
                    value={editingItem.categoryId}
                    onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.servicePricing.durationMin2', 'Duration (min)')}
                    </label>
                    <input
                      type="number"
                      value={editingItem.duration}
                      onChange={(e) => setEditingItem({ ...editingItem, duration: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      min="5"
                      step="5"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.servicePricing.basePrice2', 'Base Price ($)')}
                    </label>
                    <input
                      type="number"
                      value={editingItem.basePrice}
                      onChange={(e) => setEditingItem({ ...editingItem, basePrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.servicePricing.productCost3', 'Product Cost ($)')}
                  </label>
                  <input
                    type="number"
                    value={editingItem.productCost}
                    onChange={(e) => setEditingItem({ ...editingItem, productCost: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingItem.isActive}
                    onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                  />
                  <label htmlFor="isActive" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.servicePricing.activeVisibleOnMenu', 'Active (visible on menu)')}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => updateService(editingItem)}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.servicePricing.saveChanges', 'Save Changes')}
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.servicePricing.cancel2', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicePricingTool;
