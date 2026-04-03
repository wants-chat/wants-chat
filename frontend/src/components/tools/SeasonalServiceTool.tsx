'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  Calendar,
  Clock,
  DollarSign,
  User,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ThermometerSun,
  CloudRain,
  Wind,
  TreeDeciduous,
  Shovel,
  Droplets,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface SeasonalServiceToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type Season = 'spring' | 'summer' | 'fall' | 'winter';
type ServiceCategory = 'cleanup' | 'planting' | 'mulching' | 'pruning' | 'fertilizing' | 'pest-control' | 'winterization' | 'irrigation' | 'snow-removal' | 'leaf-removal' | 'aeration' | 'dethatching';
type ServiceStatus = 'scheduled' | 'in-progress' | 'completed' | 'skipped' | 'weather-delayed';
type RecurrencePattern = 'annual' | 'bi-annual' | 'custom';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertySize: number;
  notes: string;
  createdAt: string;
}

interface SeasonalService {
  id: string;
  customerId: string;
  serviceName: string;
  season: Season;
  category: ServiceCategory;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  status: ServiceStatus;
  assignedCrew: string;
  price: number;
  isPaid: boolean;
  recurrence: RecurrencePattern;
  weatherNotes: string;
  serviceNotes: string;
  completedAt?: string;
  createdAt: string;
}

interface SeasonalPackage {
  id: string;
  packageName: string;
  description: string;
  includedServices: ServiceCategory[];
  seasons: Season[];
  basePrice: number;
  isActive: boolean;
}

// Constants
const SEASONS: { value: Season; label: string; icon: React.ReactNode; months: string }[] = [
  { value: 'spring', label: 'Spring', icon: <Flower2 className="w-4 h-4 text-green-500" />, months: 'Mar - May' },
  { value: 'summer', label: 'Summer', icon: <Sun className="w-4 h-4 text-yellow-500" />, months: 'Jun - Aug' },
  { value: 'fall', label: 'Fall', icon: <Leaf className="w-4 h-4 text-orange-500" />, months: 'Sep - Nov' },
  { value: 'winter', label: 'Winter', icon: <Snowflake className="w-4 h-4 text-blue-500" />, months: 'Dec - Feb' },
];

const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; season: Season[]; icon: React.ReactNode }[] = [
  { value: 'cleanup', label: 'Seasonal Cleanup', season: ['spring', 'fall'], icon: <Leaf className="w-4 h-4" /> },
  { value: 'planting', label: 'Planting', season: ['spring', 'fall'], icon: <Flower2 className="w-4 h-4" /> },
  { value: 'mulching', label: 'Mulching', season: ['spring', 'fall'], icon: <TreeDeciduous className="w-4 h-4" /> },
  { value: 'pruning', label: 'Pruning', season: ['spring', 'summer', 'fall'], icon: <TreeDeciduous className="w-4 h-4" /> },
  { value: 'fertilizing', label: 'Fertilizing', season: ['spring', 'summer', 'fall'], icon: <Droplets className="w-4 h-4" /> },
  { value: 'pest-control', label: 'Pest Control', season: ['spring', 'summer'], icon: <Shovel className="w-4 h-4" /> },
  { value: 'winterization', label: 'Winterization', season: ['fall'], icon: <Snowflake className="w-4 h-4" /> },
  { value: 'irrigation', label: 'Irrigation Service', season: ['spring', 'fall'], icon: <Droplets className="w-4 h-4" /> },
  { value: 'snow-removal', label: 'Snow Removal', season: ['winter'], icon: <Snowflake className="w-4 h-4" /> },
  { value: 'leaf-removal', label: 'Leaf Removal', season: ['fall'], icon: <Leaf className="w-4 h-4" /> },
  { value: 'aeration', label: 'Lawn Aeration', season: ['spring', 'fall'], icon: <Wind className="w-4 h-4" /> },
  { value: 'dethatching', label: 'Dethatching', season: ['spring'], icon: <Leaf className="w-4 h-4" /> },
];

const STATUS_COLORS: Record<ServiceStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'weather-delayed': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const SEASON_COLORS: Record<Season, string> = {
  spring: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  summer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  fall: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  winter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

// Column configuration for exports
const SERVICE_COLUMNS: ColumnConfig[] = [
  { key: 'serviceName', header: 'Service', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'season', header: 'Season', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'assignedCrew', header: 'Crew', type: 'string' },
];

const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getCurrentSeason = (): Season => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

// Main Component
export const SeasonalServiceTool: React.FC<SeasonalServiceToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const currentSeason = getCurrentSeason();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: customers,
    addItem: addCustomerToBackend,
    updateItem: updateCustomerBackend,
    deleteItem: deleteCustomerBackend,
    isSynced: customersSynced,
    isSaving: customersSaving,
    lastSaved: customersLastSaved,
    syncError: customersSyncError,
    forceSync: forceCustomersSync,
  } = useToolData<Customer>('seasonal-service-customers', [], CUSTOMER_COLUMNS);

  const {
    data: services,
    addItem: addServiceToBackend,
    updateItem: updateServiceBackend,
    deleteItem: deleteServiceBackend,
    isSynced: servicesSynced,
    isSaving: servicesSaving,
    lastSaved: servicesLastSaved,
    syncError: servicesSyncError,
    forceSync: forceServicesSync,
  } = useToolData<SeasonalService>('seasonal-services', [], SERVICE_COLUMNS);

  const {
    data: packages,
    addItem: addPackageToBackend,
    updateItem: updatePackageBackend,
    deleteItem: deletePackageBackend,
  } = useToolData<SeasonalPackage>('seasonal-packages', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'services' | 'packages' | 'customers' | 'calendar'>('services');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeason, setFilterSeason] = useState<string>(currentSeason);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form states
  const [newService, setNewService] = useState<Partial<SeasonalService>>({
    customerId: '',
    serviceName: '',
    season: currentSeason,
    category: 'cleanup',
    scheduledDate: '',
    scheduledTime: '09:00',
    estimatedDuration: 120,
    status: 'scheduled',
    assignedCrew: '',
    price: 0,
    isPaid: false,
    recurrence: 'annual',
    weatherNotes: '',
    serviceNotes: '',
  });

  const [newPackage, setNewPackage] = useState<Partial<SeasonalPackage>>({
    packageName: '',
    description: '',
    includedServices: [],
    seasons: [],
    basePrice: 0,
    isActive: true,
  });

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertySize: 0,
    notes: '',
  });

  // Crew members
  const [crewMembers] = useState([
    { id: '1', name: 'Spring Team', available: true },
    { id: '2', name: 'Summer Team', available: true },
    { id: '3', name: 'Year-Round Crew', available: true },
  ]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const customer = customers.find(c => c.id === service.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';

      const matchesSearch = searchTerm === '' ||
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.includes(searchTerm.toLowerCase());
      const matchesSeason = filterSeason === 'all' || service.season === filterSeason;
      const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || service.category === filterCategory;

      return matchesSearch && matchesSeason && matchesStatus && matchesCategory;
    });
  }, [services, customers, searchTerm, filterSeason, filterStatus, filterCategory]);

  // Dashboard stats
  const stats = useMemo(() => {
    const currentSeasonServices = services.filter(s => s.season === currentSeason);
    const completedThisSeason = currentSeasonServices.filter(s => s.status === 'completed');
    const scheduledThisSeason = currentSeasonServices.filter(s => s.status === 'scheduled');
    const revenueThisSeason = currentSeasonServices.filter(s => s.isPaid).reduce((sum, s) => sum + s.price, 0);
    const weatherDelayed = services.filter(s => s.status === 'weather-delayed').length;

    return {
      currentSeasonTotal: currentSeasonServices.length,
      completedCount: completedThisSeason.length,
      scheduledCount: scheduledThisSeason.length,
      seasonRevenue: revenueThisSeason,
      weatherDelayedCount: weatherDelayed,
      servicesByCategory: SERVICE_CATEGORIES.map(cat => ({
        category: cat.label,
        count: services.filter(s => s.category === cat.value && s.season === currentSeason).length,
      })).filter(c => c.count > 0),
    };
  }, [services, currentSeason]);

  // Get customer name by ID
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  // Add service
  const handleAddService = () => {
    if (!newService.customerId || !newService.serviceName || !newService.scheduledDate) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const service: SeasonalService = {
      id: generateId(),
      customerId: newService.customerId || '',
      serviceName: newService.serviceName || '',
      season: newService.season || currentSeason,
      category: newService.category || 'cleanup',
      scheduledDate: newService.scheduledDate || '',
      scheduledTime: newService.scheduledTime || '09:00',
      estimatedDuration: newService.estimatedDuration || 120,
      status: 'scheduled',
      assignedCrew: newService.assignedCrew || '',
      price: newService.price || 0,
      isPaid: false,
      recurrence: newService.recurrence || 'annual',
      weatherNotes: newService.weatherNotes || '',
      serviceNotes: newService.serviceNotes || '',
      createdAt: new Date().toISOString(),
    };

    addServiceToBackend(service);
    setShowServiceForm(false);
    resetServiceForm();
  };

  // Add package
  const handleAddPackage = () => {
    if (!newPackage.packageName || newPackage.includedServices?.length === 0) {
      setValidationMessage('Please enter package name and select services');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const pkg: SeasonalPackage = {
      id: generateId(),
      packageName: newPackage.packageName || '',
      description: newPackage.description || '',
      includedServices: newPackage.includedServices || [],
      seasons: newPackage.seasons || [],
      basePrice: newPackage.basePrice || 0,
      isActive: true,
    };

    addPackageToBackend(pkg);
    setShowPackageForm(false);
    resetPackageForm();
  };

  // Add customer
  const handleAddCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const customer: Customer = {
      id: generateId(),
      firstName: newCustomer.firstName || '',
      lastName: newCustomer.lastName || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      address: newCustomer.address || '',
      city: newCustomer.city || '',
      state: newCustomer.state || '',
      zipCode: newCustomer.zipCode || '',
      propertySize: newCustomer.propertySize || 0,
      notes: newCustomer.notes || '',
      createdAt: new Date().toISOString(),
    };

    addCustomerToBackend(customer);
    setShowCustomerForm(false);
    resetCustomerForm();
  };

  // Update service status
  const updateServiceStatus = (id: string, status: ServiceStatus) => {
    const updates: Partial<SeasonalService> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    updateServiceBackend(id, updates);
  };

  // Delete handlers
  const handleDeleteService = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this service?');
    if (confirmed) {
      deleteServiceBackend(id);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    const confirmed = await confirm('Delete this customer and all their services?');
    if (confirmed) {
      deleteCustomerBackend(id);
      services.forEach(s => {
        if (s.customerId === id) deleteServiceBackend(s.id);
      });
    }
  };

  // Reset forms
  const resetServiceForm = () => {
    setNewService({
      customerId: '',
      serviceName: '',
      season: currentSeason,
      category: 'cleanup',
      scheduledDate: '',
      scheduledTime: '09:00',
      estimatedDuration: 120,
      status: 'scheduled',
      assignedCrew: '',
      price: 0,
      isPaid: false,
      recurrence: 'annual',
      weatherNotes: '',
      serviceNotes: '',
    });
  };

  const resetPackageForm = () => {
    setNewPackage({
      packageName: '',
      description: '',
      includedServices: [],
      seasons: [],
      basePrice: 0,
      isActive: true,
    });
  };

  const resetCustomerForm = () => {
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      propertySize: 0,
      notes: '',
    });
  };

  // Toggle package service
  const togglePackageService = (category: ServiceCategory) => {
    setNewPackage(prev => {
      const current = prev.includedServices || [];
      const updated = current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category];
      return { ...prev, includedServices: updated };
    });
  };

  // Toggle package season
  const togglePackageSeason = (season: Season) => {
    setNewPackage(prev => {
      const current = prev.seasons || [];
      const updated = current.includes(season)
        ? current.filter(s => s !== season)
        : [...current, season];
      return { ...prev, seasons: updated };
    });
  };

  // Export data
  const serviceExportData = filteredServices.map(s => ({
    ...s,
    customerName: getCustomerName(s.customerId),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-green-600" />
            {t('tools.seasonalService.seasonalServicePlanner', 'Seasonal Service Planner')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('tools.seasonalService.planAndTrackSeasonalLandscaping', 'Plan and track seasonal landscaping services')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${SEASON_COLORS[currentSeason]}`}>
            {SEASONS.find(s => s.value === currentSeason)?.icon}
            <span className="ml-1">Current: {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}</span>
          </div>
          <WidgetEmbedButton toolSlug="seasonal-service" toolName="Seasonal Service" />

          <SyncStatus
            isSynced={servicesSynced && customersSynced}
            isSaving={servicesSaving || customersSaving}
            lastSaved={servicesLastSaved || customersLastSaved}
            error={servicesSyncError || customersSyncError}
          />
          <ExportDropdown
            data={serviceExportData}
            columns={SERVICE_COLUMNS}
            filename="seasonal-services"
            title={t('tools.seasonalService.seasonalServices', 'Seasonal Services')}
          />
        </div>
      </div>

      {/* Season Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SEASONS.map((season) => {
          const seasonServices = services.filter(s => s.season === season.value);
          const completed = seasonServices.filter(s => s.status === 'completed').length;
          return (
            <Card
              key={season.value}
              className={`cursor-pointer transition-all ${filterSeason === season.value ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setFilterSeason(season.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${SEASON_COLORS[season.value]}`}>
                    {season.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{season.label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {completed}/{seasonServices.length}
                    </p>
                    <p className="text-xs text-gray-500">{season.months}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['services', 'packages', 'customers', 'calendar'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-green-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.seasonalService.search', 'Search...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterSeason}
                onChange={(e) => setFilterSeason(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.seasonalService.allSeasons', 'All Seasons')}</option>
                {SEASONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.seasonalService.allStatus', 'All Status')}</option>
                <option value="scheduled">{t('tools.seasonalService.scheduled', 'Scheduled')}</option>
                <option value="in-progress">{t('tools.seasonalService.inProgress', 'In Progress')}</option>
                <option value="completed">{t('tools.seasonalService.completed', 'Completed')}</option>
                <option value="weather-delayed">{t('tools.seasonalService.weatherDelayed', 'Weather Delayed')}</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.seasonalService.allCategories', 'All Categories')}</option>
                {SERVICE_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowServiceForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              {t('tools.seasonalService.scheduleService', 'Schedule Service')}
            </button>
          </div>

          {/* Services List */}
          <div className="space-y-3">
            {filteredServices.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">{t('tools.seasonalService.noServicesFound', 'No services found')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredServices.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{service.serviceName}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${SEASON_COLORS[service.season]}`}>
                            {service.season}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[service.status]}`}>
                            {service.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {getCustomerName(service.customerId)}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(service.scheduledDate)} at {service.scheduledTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.estimatedDuration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(service.price)}
                            {service.isPaid && <CheckCircle className="w-3 h-3 text-green-500 ml-1" />}
                          </span>
                        </div>
                        {service.weatherNotes && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                            <CloudRain className="w-4 h-4" />
                            {service.weatherNotes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {service.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => updateServiceStatus(service.id, 'in-progress')}
                              className="px-3 py-1 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded hover:bg-yellow-200"
                            >
                              {t('tools.seasonalService.start', 'Start')}
                            </button>
                            <button
                              onClick={() => updateServiceStatus(service.id, 'weather-delayed')}
                              className="px-3 py-1 text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded hover:bg-orange-200"
                            >
                              {t('tools.seasonalService.weatherDelay', 'Weather Delay')}
                            </button>
                          </>
                        )}
                        {service.status === 'in-progress' && (
                          <button
                            onClick={() => updateServiceStatus(service.id, 'completed')}
                            className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded hover:bg-green-200"
                          >
                            {t('tools.seasonalService.complete', 'Complete')}
                          </button>
                        )}
                        {service.status === 'weather-delayed' && (
                          <button
                            onClick={() => updateServiceStatus(service.id, 'scheduled')}
                            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded hover:bg-blue-200"
                          >
                            {t('tools.seasonalService.reschedule', 'Reschedule')}
                          </button>
                        )}
                        {!service.isPaid && service.status === 'completed' && (
                          <button
                            onClick={() => updateServiceBackend(service.id, { isPaid: true })}
                            className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded hover:bg-purple-200"
                          >
                            {t('tools.seasonalService.markPaid', 'Mark Paid')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('tools.seasonalService.seasonalPackages', 'Seasonal Packages')}</h3>
            <button
              onClick={() => setShowPackageForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              {t('tools.seasonalService.createPackage', 'Create Package')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{pkg.packageName}</h4>
                    <button
                      onClick={() => deletePackageBackend(pkg.id)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{pkg.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pkg.seasons.map(s => (
                      <span key={s} className={`px-2 py-1 text-xs rounded-full ${SEASON_COLORS[s]}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pkg.includedServices.map(s => (
                      <span key={s} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {SERVICE_CATEGORIES.find(c => c.value === s)?.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-green-600">{formatCurrency(pkg.basePrice)}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${pkg.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {pkg.isActive ? t('tools.seasonalService.active', 'Active') : t('tools.seasonalService.inactive', 'Inactive')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.seasonalService.searchCustomers', 'Search customers...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowCustomerForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              {t('tools.seasonalService.addCustomer2', 'Add Customer')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers
              .filter(c =>
                searchTerm === '' ||
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {customer.firstName} {customer.lastName}
                      </h3>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {customer.address}, {customer.city}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{services.filter(s => s.customerId === customer.id).length} services</span>
                        <span>
                          {services.filter(s => s.customerId === customer.id && s.season === currentSeason).length} this season
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('tools.seasonalService.upcomingSeasonalServices', 'Upcoming Seasonal Services')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services
                  .filter(s => s.status === 'scheduled' || s.status === 'weather-delayed')
                  .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                  .slice(0, 10)
                  .map((service) => (
                    <div key={service.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className={`p-2 rounded-lg ${SEASON_COLORS[service.season]}`}>
                        {SEASONS.find(s => s.value === service.season)?.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{service.serviceName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{getCustomerName(service.customerId)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(service.scheduledDate)}</p>
                        <p className="text-sm text-gray-500">{service.scheduledTime}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[service.status]}`}>
                        {service.status}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Service Modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.seasonalService.scheduleSeasonalService', 'Schedule Seasonal Service')}</CardTitle>
              <button onClick={() => setShowServiceForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.customer', 'Customer *')}</label>
                <select
                  value={newService.customerId}
                  onChange={(e) => setNewService(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">{t('tools.seasonalService.selectCustomer', 'Select customer')}</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.serviceName', 'Service Name *')}</label>
                  <input
                    type="text"
                    value={newService.serviceName}
                    onChange={(e) => setNewService(prev => ({ ...prev, serviceName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.seasonalService.eGSpringCleanup', 'e.g., Spring Cleanup')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.season', 'Season')}</label>
                  <select
                    value={newService.season}
                    onChange={(e) => setNewService(prev => ({ ...prev, season: e.target.value as Season }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {SEASONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.category', 'Category')}</label>
                <select
                  value={newService.category}
                  onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value as ServiceCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {SERVICE_CATEGORIES.filter(c => c.season.includes(newService.season || currentSeason)).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.date', 'Date *')}</label>
                  <input
                    type="date"
                    value={newService.scheduledDate}
                    onChange={(e) => setNewService(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.time', 'Time')}</label>
                  <input
                    type="time"
                    value={newService.scheduledTime}
                    onChange={(e) => setNewService(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.durationMin', 'Duration (min)')}</label>
                  <input
                    type="number"
                    value={newService.estimatedDuration}
                    onChange={(e) => setNewService(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.price', 'Price ($)')}</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.assignedCrew', 'Assigned Crew')}</label>
                <select
                  value={newService.assignedCrew}
                  onChange={(e) => setNewService(prev => ({ ...prev, assignedCrew: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">{t('tools.seasonalService.selectCrew', 'Select crew')}</option>
                  {crewMembers.filter(c => c.available).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.serviceNotes', 'Service Notes')}</label>
                <textarea
                  value={newService.serviceNotes}
                  onChange={(e) => setNewService(prev => ({ ...prev, serviceNotes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowServiceForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.seasonalService.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddService}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.seasonalService.scheduleService2', 'Schedule Service')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Package Modal */}
      {showPackageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.seasonalService.createSeasonalPackage', 'Create Seasonal Package')}</CardTitle>
              <button onClick={() => setShowPackageForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.packageName', 'Package Name *')}</label>
                <input
                  type="text"
                  value={newPackage.packageName}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, packageName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('tools.seasonalService.eGAnnualLawnCare', 'e.g., Annual Lawn Care Package')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.description', 'Description')}</label>
                <textarea
                  value={newPackage.description}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.seasonalService.seasons', 'Seasons')}</label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => togglePackageSeason(s.value)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors ${
                        newPackage.seasons?.includes(s.value)
                          ? SEASON_COLORS[s.value]
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {s.icon}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.seasonalService.includedServices', 'Included Services')}</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => togglePackageService(c.value)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        newPackage.includedServices?.includes(c.value)
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.basePrice', 'Base Price ($)')}</label>
                <input
                  type="number"
                  value={newPackage.basePrice}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, basePrice: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowPackageForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.seasonalService.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddPackage}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.seasonalService.createPackage2', 'Create Package')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Customer Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.seasonalService.addCustomer', 'Add Customer')}</CardTitle>
              <button onClick={() => setShowCustomerForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.phone', 'Phone *')}</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.email', 'Email')}</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.address', 'Address')}</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.city', 'City')}</label>
                  <input
                    type="text"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.state', 'State')}</label>
                  <input
                    type="text"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.seasonalService.zip', 'Zip')}</label>
                  <input
                    type="text"
                    value={newCustomer.zipCode}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCustomerForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.seasonalService.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.seasonalService.addCustomer3', 'Add Customer')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {validationMessage}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default SeasonalServiceTool;
