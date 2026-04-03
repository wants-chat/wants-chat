'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scissors,
  Sparkles,
  Heart,
  Palette,
  Droplets,
  Plus,
  Trash2,
  Edit,
  X,
  DollarSign,
  Clock,
  Tag,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  Eye,
  EyeOff,
  GripVertical,
  Image,
  MoreVertical,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceMenuToolProps {
  uiConfig?: UIConfig;
}

// Types
type ServiceCategory = 'hair' | 'nails' | 'spa' | 'makeup' | 'skincare' | 'waxing' | 'other';

interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  duration: number; // in minutes
  price: number;
  memberPrice?: number;
  isActive: boolean;
  isPopular: boolean;
  imageUrl?: string;
  requiredLevel: 'junior' | 'senior' | 'master' | 'any';
  addOns: string[];
  notes: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  services: string[]; // service IDs
  originalPrice: number;
  packagePrice: number;
  duration: number;
  isActive: boolean;
  validUntil?: string;
  createdAt: string;
}

// Constants
const CATEGORIES: { id: ServiceCategory; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'hair', name: 'Hair', icon: <Scissors className="w-4 h-4" />, color: 'purple' },
  { id: 'nails', name: 'Nails', icon: <Sparkles className="w-4 h-4" />, color: 'pink' },
  { id: 'spa', name: 'Spa', icon: <Heart className="w-4 h-4" />, color: 'green' },
  { id: 'makeup', name: 'Makeup', icon: <Palette className="w-4 h-4" />, color: 'rose' },
  { id: 'skincare', name: 'Skincare', icon: <Droplets className="w-4 h-4" />, color: 'cyan' },
  { id: 'waxing', name: 'Waxing', icon: <Star className="w-4 h-4" />, color: 'amber' },
  { id: 'other', name: 'Other', icon: <Tag className="w-4 h-4" />, color: 'gray' },
];

const SKILL_LEVELS = [
  { id: 'any', name: 'Any Level' },
  { id: 'junior', name: 'Junior Stylist' },
  { id: 'senior', name: 'Senior Stylist' },
  { id: 'master', name: 'Master Stylist' },
];

// Column configuration
const SERVICE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Service Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'memberPrice', header: 'Member Price', type: 'currency' },
  { key: 'requiredLevel', header: 'Required Level', type: 'string' },
  { key: 'isActive', header: 'Active', type: 'string' },
  { key: 'isPopular', header: 'Popular', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getCategoryInfo = (category: ServiceCategory) => {
  return CATEGORIES.find(c => c.id === category) || CATEGORIES[CATEGORIES.length - 1];
};

const getCategoryColorClasses = (category: ServiceCategory) => {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };
  const info = getCategoryInfo(category);
  return colorMap[info.color] || colorMap.gray;
};

// Sample data
const sampleServices: Service[] = [
  {
    id: generateId(),
    name: 'Haircut',
    description: 'Professional haircut and styling with consultation',
    category: 'hair',
    duration: 30,
    price: 35,
    memberPrice: 30,
    isActive: true,
    isPopular: true,
    requiredLevel: 'any',
    addOns: ['Deep Conditioning', 'Scalp Massage'],
    notes: '',
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Hair Coloring',
    description: 'Full hair coloring service with premium products',
    category: 'hair',
    duration: 90,
    price: 85,
    memberPrice: 75,
    isActive: true,
    isPopular: true,
    requiredLevel: 'senior',
    addOns: ['Gloss Treatment', 'Toner'],
    notes: 'Patch test required for new clients',
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Highlights',
    description: 'Partial or full highlights with foil technique',
    category: 'hair',
    duration: 120,
    price: 120,
    memberPrice: 100,
    isActive: true,
    isPopular: false,
    requiredLevel: 'senior',
    addOns: [],
    notes: '',
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Blowout',
    description: 'Wash and blowdry styling for any occasion',
    category: 'hair',
    duration: 45,
    price: 45,
    memberPrice: 40,
    isActive: true,
    isPopular: false,
    requiredLevel: 'any',
    addOns: ['Heat Protection Treatment'],
    notes: '',
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Manicure',
    description: 'Classic manicure with nail shaping and polish',
    category: 'nails',
    duration: 30,
    price: 25,
    memberPrice: 22,
    isActive: true,
    isPopular: true,
    requiredLevel: 'any',
    addOns: ['Nail Art', 'Paraffin Treatment'],
    notes: '',
    sortOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Pedicure',
    description: 'Relaxing pedicure with foot massage and polish',
    category: 'nails',
    duration: 45,
    price: 40,
    memberPrice: 35,
    isActive: true,
    isPopular: true,
    requiredLevel: 'any',
    addOns: ['Callus Removal', 'Mask Treatment'],
    notes: '',
    sortOrder: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Gel Nails',
    description: 'Long-lasting gel polish application',
    category: 'nails',
    duration: 60,
    price: 55,
    memberPrice: 48,
    isActive: true,
    isPopular: false,
    requiredLevel: 'any',
    addOns: ['Design', 'Gems'],
    notes: '',
    sortOrder: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Facial',
    description: 'Rejuvenating facial treatment for glowing skin',
    category: 'skincare',
    duration: 60,
    price: 75,
    memberPrice: 65,
    isActive: true,
    isPopular: true,
    requiredLevel: 'senior',
    addOns: ['LED Therapy', 'Vitamin C Booster'],
    notes: 'Customized for skin type',
    sortOrder: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Massage',
    description: 'Relaxing full body massage',
    category: 'spa',
    duration: 60,
    price: 90,
    memberPrice: 80,
    isActive: true,
    isPopular: true,
    requiredLevel: 'senior',
    addOns: ['Hot Stones', 'Aromatherapy'],
    notes: '',
    sortOrder: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Makeup Application',
    description: 'Professional makeup for any occasion',
    category: 'makeup',
    duration: 45,
    price: 65,
    memberPrice: 55,
    isActive: true,
    isPopular: false,
    requiredLevel: 'any',
    addOns: ['False Lashes', 'Setting Spray'],
    notes: '',
    sortOrder: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const samplePackages: ServicePackage[] = [
  {
    id: generateId(),
    name: 'Bridal Package',
    description: 'Complete bridal beauty experience',
    services: [],
    originalPrice: 350,
    packagePrice: 280,
    duration: 240,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Relaxation Day',
    description: 'Spa day package with massage and facial',
    services: [],
    originalPrice: 165,
    packagePrice: 140,
    duration: 120,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Main Component
export const ServiceMenuTool: React.FC<ServiceMenuToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hooks for backend sync
  const {
    data: services,
    addItem: addService,
    updateItem: updateService,
    deleteItem: deleteService,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Service>('salon-services', sampleServices, SERVICE_COLUMNS);

  const {
    data: packages,
    addItem: addPackage,
    updateItem: updatePackage,
    deleteItem: deletePackage,
  } = useToolData<ServicePackage>('salon-packages', samplePackages, []);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'services' | 'packages'>('services');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES.map(c => c.id)));

  // Service form state
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: 'hair' as ServiceCategory,
    duration: 30,
    price: 0,
    memberPrice: 0,
    requiredLevel: 'any' as Service['requiredLevel'],
    addOns: '',
    notes: '',
    isActive: true,
    isPopular: false,
  });

  // Package form state
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    services: [] as string[],
    packagePrice: 0,
    isActive: true,
    validUntil: '',
  });

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && service.isActive) ||
        (filterStatus === 'inactive' && !service.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, searchTerm, filterCategory, filterStatus]);

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {};
    CATEGORIES.forEach(cat => {
      grouped[cat.id] = filteredServices.filter(s => s.category === cat.id);
    });
    return grouped;
  }, [filteredServices]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalServices: services.length,
      activeServices: services.filter(s => s.isActive).length,
      popularServices: services.filter(s => s.isPopular).length,
      avgPrice: services.length > 0
        ? services.reduce((sum, s) => sum + s.price, 0) / services.length
        : 0,
    };
  }, [services]);

  // Handle service form submission
  const handleServiceSubmit = () => {
    const now = new Date().toISOString();
    const serviceData: Service = {
      id: editingService?.id || generateId(),
      name: serviceForm.name,
      description: serviceForm.description,
      category: serviceForm.category,
      duration: serviceForm.duration,
      price: serviceForm.price,
      memberPrice: serviceForm.memberPrice || undefined,
      isActive: serviceForm.isActive,
      isPopular: serviceForm.isPopular,
      requiredLevel: serviceForm.requiredLevel,
      addOns: serviceForm.addOns.split(',').map(s => s.trim()).filter(Boolean),
      notes: serviceForm.notes,
      sortOrder: editingService?.sortOrder || services.length + 1,
      createdAt: editingService?.createdAt || now,
      updatedAt: now,
    };

    if (editingService) {
      updateService(serviceData);
    } else {
      addService(serviceData);
    }

    resetServiceForm();
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      category: 'hair',
      duration: 30,
      price: 0,
      memberPrice: 0,
      requiredLevel: 'any',
      addOns: '',
      notes: '',
      isActive: true,
      isPopular: false,
    });
    setShowServiceForm(false);
    setEditingService(null);
  };

  const handleEditService = (service: Service) => {
    setServiceForm({
      name: service.name,
      description: service.description,
      category: service.category,
      duration: service.duration,
      price: service.price,
      memberPrice: service.memberPrice || 0,
      requiredLevel: service.requiredLevel,
      addOns: service.addOns.join(', '),
      notes: service.notes,
      isActive: service.isActive,
      isPopular: service.isPopular,
    });
    setEditingService(service);
    setShowServiceForm(true);
  };

  // Handle package form submission
  const handlePackageSubmit = () => {
    const selectedServices = services.filter(s => packageForm.services.includes(s.id));
    const originalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

    const packageData: ServicePackage = {
      id: editingPackage?.id || generateId(),
      name: packageForm.name,
      description: packageForm.description,
      services: packageForm.services,
      originalPrice,
      packagePrice: packageForm.packagePrice,
      duration: totalDuration,
      isActive: packageForm.isActive,
      validUntil: packageForm.validUntil || undefined,
      createdAt: editingPackage?.createdAt || new Date().toISOString(),
    };

    if (editingPackage) {
      updatePackage(packageData);
    } else {
      addPackage(packageData);
    }

    resetPackageForm();
  };

  const resetPackageForm = () => {
    setPackageForm({
      name: '',
      description: '',
      services: [],
      packagePrice: 0,
      isActive: true,
      validUntil: '',
    });
    setShowPackageForm(false);
    setEditingPackage(null);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = services.map(s => ({
      ...s,
      addOns: s.addOns.join(', '),
      isActive: s.isActive ? 'Yes' : 'No',
      isPopular: s.isPopular ? 'Yes' : 'No',
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, SERVICE_COLUMNS, 'service-menu');
        break;
      case 'excel':
        exportToExcel(exportData, SERVICE_COLUMNS, 'service-menu');
        break;
      case 'json':
        exportToJSON(exportData, 'service-menu');
        break;
      case 'pdf':
        exportToPDF(exportData, SERVICE_COLUMNS, 'Salon Service Menu');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Scissors className="w-6 h-6 text-purple-600" />
              {t('tools.serviceMenu.serviceMenu', 'Service Menu')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.serviceMenu.manageSalonServicesAndPackages', 'Manage salon services and packages')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="service-menu" toolName="Service Menu" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Scissors className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.serviceMenu.totalServices', 'Total Services')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.serviceMenu.active', 'Active')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.serviceMenu.popular', 'Popular')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.popularServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.serviceMenu.avgPrice', 'Avg Price')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.avgPrice)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'services'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Scissors className="w-4 h-4" />
            {t('tools.serviceMenu.services', 'Services')}
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'packages'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Tag className="w-4 h-4" />
            {t('tools.serviceMenu.packages', 'Packages')}
          </button>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.serviceMenu.searchServices', 'Search services...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">{t('tools.serviceMenu.allCategories', 'All Categories')}</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">{t('tools.serviceMenu.allStatus', 'All Status')}</option>
                    <option value="active">{t('tools.serviceMenu.active2', 'Active')}</option>
                    <option value="inactive">{t('tools.serviceMenu.inactive', 'Inactive')}</option>
                  </select>
                  <button
                    onClick={() => setShowServiceForm(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.serviceMenu.addService', 'Add Service')}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Services by Category */}
            <div className="space-y-4">
              {CATEGORIES.map(category => {
                const categoryServices = servicesByCategory[category.id];
                if (categoryServices.length === 0 && filterCategory !== 'all') return null;

                return (
                  <Card key={category.id}>
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`p-2 rounded-lg ${getCategoryColorClasses(category.id)}`}>
                            {category.icon}
                          </span>
                          <span>{category.name}</span>
                          <span className="text-sm font-normal text-gray-500">
                            ({categoryServices.length})
                          </span>
                        </div>
                        {expandedCategories.has(category.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {expandedCategories.has(category.id) && (
                      <CardContent>
                        {categoryServices.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">{t('tools.serviceMenu.noServicesInThisCategory', 'No services in this category')}</p>
                        ) : (
                          <div className="space-y-3">
                            {categoryServices.map(service => (
                              <div
                                key={service.id}
                                className={`p-4 border rounded-lg dark:border-gray-700 flex items-center justify-between ${
                                  !service.isActive ? 'opacity-60' : ''
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-gray-900 dark:text-white">
                                        {service.name}
                                      </h3>
                                      {service.isPopular && (
                                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full flex items-center gap-1">
                                          <Star className="w-3 h-3" />
                                          {t('tools.serviceMenu.popular2', 'Popular')}
                                        </span>
                                      )}
                                      {!service.isActive && (
                                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                                          {t('tools.serviceMenu.inactive3', 'Inactive')}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {service.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {service.duration} min
                                      </span>
                                      <span className="text-xs capitalize bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                        {service.requiredLevel === 'any' ? 'Any Level' : service.requiredLevel}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-white">
                                      {formatCurrency(service.price)}
                                    </p>
                                    {service.memberPrice && (
                                      <p className="text-xs text-green-600">
                                        Member: {formatCurrency(service.memberPrice)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleEditService(service)}
                                      className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => updateService({ ...service, isActive: !service.isActive })}
                                      className="p-2 text-gray-500 hover:text-yellow-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      {service.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => deleteService(service.id)}
                                      className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowPackageForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.serviceMenu.createPackage', 'Create Package')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map(pkg => (
                <Card key={pkg.id} className={!pkg.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">{pkg.name}</h3>
                      {!pkg.isActive && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">{t('tools.serviceMenu.inactive2', 'Inactive')}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 line-through">{formatCurrency(pkg.originalPrice)}</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(pkg.packagePrice)}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{Math.round((1 - pkg.packagePrice / pkg.originalPrice) * 100)}% off</p>
                        <p>{pkg.duration} min</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-3 border-t dark:border-gray-700">
                      <button
                        onClick={() => {
                          setPackageForm({
                            name: pkg.name,
                            description: pkg.description,
                            services: pkg.services,
                            packagePrice: pkg.packagePrice,
                            isActive: pkg.isActive,
                            validUntil: pkg.validUntil || '',
                          });
                          setEditingPackage(pkg);
                          setShowPackageForm(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePackage(pkg.id)}
                        className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Service Form Modal */}
        {showServiceForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingService ? t('tools.serviceMenu.editService', 'Edit Service') : t('tools.serviceMenu.addService2', 'Add Service')}</span>
                  <button onClick={resetServiceForm} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.serviceMenu.serviceName', 'Service Name *')}
                    </label>
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('tools.serviceMenu.eGHaircut', 'e.g., Haircut')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.serviceMenu.description', 'Description')}
                    </label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      placeholder={t('tools.serviceMenu.describeTheService', 'Describe the service...')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.serviceMenu.category', 'Category *')}
                    </label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value as ServiceCategory })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.serviceMenu.durationMinutes', 'Duration (minutes) *')}
                    </label>
                    <input
                      type="number"
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="5"
                      step="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.serviceMenu.price', 'Price *')}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.serviceMenu.memberPrice', 'Member Price')}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={serviceForm.memberPrice}
                        onChange={(e) => setServiceForm({ ...serviceForm, memberPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.serviceMenu.requiredSkillLevel', 'Required Skill Level')}
                    </label>
                    <select
                      value={serviceForm.requiredLevel}
                      onChange={(e) => setServiceForm({ ...serviceForm, requiredLevel: e.target.value as Service['requiredLevel'] })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {SKILL_LEVELS.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.serviceMenu.addOnsCommaSeparated', 'Add-ons (comma separated)')}
                    </label>
                    <input
                      type="text"
                      value={serviceForm.addOns}
                      onChange={(e) => setServiceForm({ ...serviceForm, addOns: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('tools.serviceMenu.eGDeepConditioningScalp', 'e.g., Deep Conditioning, Scalp Massage')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.serviceMenu.internalNotes', 'Internal Notes')}
                    </label>
                    <textarea
                      value={serviceForm.notes}
                      onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      placeholder={t('tools.serviceMenu.notesForStaff', 'Notes for staff...')}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceForm.isActive}
                        onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.serviceMenu.active3', 'Active')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceForm.isPopular}
                        onChange={(e) => setServiceForm({ ...serviceForm, isPopular: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.serviceMenu.markAsPopular', 'Mark as Popular')}</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={resetServiceForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.serviceMenu.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleServiceSubmit}
                    disabled={!serviceForm.name || serviceForm.price <= 0}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {editingService ? t('tools.serviceMenu.updateService', 'Update Service') : t('tools.serviceMenu.addService3', 'Add Service')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Package Form Modal */}
        {showPackageForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingPackage ? t('tools.serviceMenu.editPackage', 'Edit Package') : t('tools.serviceMenu.createPackage2', 'Create Package')}</span>
                  <button onClick={resetPackageForm} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.serviceMenu.packageName', 'Package Name *')}
                  </label>
                  <input
                    type="text"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('tools.serviceMenu.eGBridalPackage', 'e.g., Bridal Package')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.serviceMenu.description2', 'Description')}
                  </label>
                  <textarea
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.serviceMenu.selectServices', 'Select Services')}
                  </label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                    {services.filter(s => s.isActive).map(service => (
                      <label
                        key={service.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={packageForm.services.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPackageForm({ ...packageForm, services: [...packageForm.services, service.id] });
                            } else {
                              setPackageForm({ ...packageForm, services: packageForm.services.filter(id => id !== service.id) });
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="flex-1">{service.name}</span>
                        <span className="text-sm text-gray-500">{formatCurrency(service.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.serviceMenu.packagePrice', 'Package Price *')}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={packageForm.packagePrice}
                      onChange={(e) => setPackageForm({ ...packageForm, packagePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.serviceMenu.validUntil', 'Valid Until')}
                  </label>
                  <input
                    type="date"
                    value={packageForm.validUntil}
                    onChange={(e) => setPackageForm({ ...packageForm, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={packageForm.isActive}
                    onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.serviceMenu.active4', 'Active')}</span>
                </label>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={resetPackageForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('tools.serviceMenu.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={handlePackageSubmit}
                    disabled={!packageForm.name || packageForm.packagePrice <= 0}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {editingPackage ? t('tools.serviceMenu.updatePackage', 'Update Package') : t('tools.serviceMenu.createPackage3', 'Create Package')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceMenuTool;
