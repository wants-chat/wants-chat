'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RentalTrackerToolProps {
  uiConfig?: UIConfig;
}

// Types
type RentalStatus = 'available' | 'rented' | 'blocked';
type RentalPeriodStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

interface RentalProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bedroomCount: number;
  bathroomCount: number;
  sqft: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  status: RentalStatus;
  description?: string;
  imageUrl?: string;
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

interface RentalPeriod {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: RentalPeriodStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceLog {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  type: 'repair' | 'cleaning' | 'inspection' | 'upgrade';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  cost?: number;
  completedDate?: string;
  createdAt: string;
}

type TabType = 'properties' | 'reservations' | 'maintenance' | 'analytics';

// Column configurations for exports
const propertyColumns: ColumnConfig[] = [
  { key: 'name', header: 'Property Name', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'bedroomCount', header: 'Bedrooms', type: 'number' },
  { key: 'bathroomCount', header: 'Bathrooms', type: 'number' },
  { key: 'sqft', header: 'Square Feet', type: 'number' },
  { key: 'dailyRate', header: 'Daily Rate', type: 'currency' },
  { key: 'weeklyRate', header: 'Weekly Rate', type: 'currency' },
  { key: 'monthlyRate', header: 'Monthly Rate', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const reservationColumns: ColumnConfig[] = [
  { key: 'guestName', header: 'Guest Name', type: 'string' },
  { key: 'guestEmail', header: 'Email', type: 'string' },
  { key: 'guestPhone', header: 'Phone', type: 'string' },
  { key: 'checkInDate', header: 'Check-In', type: 'date' },
  { key: 'checkOutDate', header: 'Check-Out', type: 'date' },
  { key: 'numberOfGuests', header: 'Guests', type: 'number' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'paymentStatus', header: 'Payment Status', type: 'string' },
  { key: 'status', header: 'Reservation Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const maintenanceColumns: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'completedDate', header: 'Completed', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const AMENITIES = [
  'WiFi',
  'Kitchen',
  'TV',
  'Parking',
  'Pool',
  'Washer',
  'Dryer',
  'AC',
  'Heating',
  'Gym',
  'Fireplace',
  'Dishwasher',
  'Microwave',
  'Coffee Maker',
];

const RENTAL_STATUSES: { value: RentalStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'text-green-500 bg-green-500/10' },
  { value: 'rented', label: 'Rented', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'blocked', label: 'Blocked', color: 'text-red-500 bg-red-500/10' },
];

export const RentalTrackerTool: React.FC<RentalTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const propertiesToolData = useToolData<RentalProperty>('rental-tracker-properties', [], propertyColumns);
  const reservationsToolData = useToolData<RentalPeriod>('rental-tracker-reservations', [], reservationColumns);
  const maintenanceToolData = useToolData<MaintenanceLog>('rental-tracker-maintenance', [], maintenanceColumns);

  // Extract convenient aliases
  const properties = propertiesToolData.data;
  const setProperties = propertiesToolData.setData;
  const { addItem: addProperty, updateItem: updateProperty, deleteItem: deleteProperty } = propertiesToolData;

  const reservations = reservationsToolData.data;
  const setReservations = reservationsToolData.setData;
  const { addItem: addReservation, updateItem: updateReservation, deleteItem: deleteReservation } = reservationsToolData;

  const maintenance = maintenanceToolData.data;
  const { addItem: addMaintenance, updateItem: updateMaintenance, deleteItem: deleteMaintenance } = maintenanceToolData;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('properties');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Filter states
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<RentalStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Edit states
  const [editingProperty, setEditingProperty] = useState<RentalProperty | null>(null);
  const [editingReservation, setEditingReservation] = useState<RentalPeriod | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceLog | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Form states
  const [propertyForm, setPropertyForm] = useState<Partial<RentalProperty>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bedroomCount: 1,
    bathroomCount: 1,
    sqft: 0,
    dailyRate: 0,
    weeklyRate: 0,
    monthlyRate: 0,
    status: 'available',
    description: '',
    amenities: [],
  });

  const [reservationForm, setReservationForm] = useState<Partial<RentalPeriod>>({
    propertyId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    numberOfGuests: 1,
    totalPrice: 0,
    paymentStatus: 'pending',
    status: 'upcoming',
  });

  const [maintenanceForm, setMaintenanceForm] = useState<Partial<MaintenanceLog>>({
    propertyId: '',
    title: '',
    description: '',
    type: 'cleaning',
    priority: 'medium',
    status: 'pending',
  });

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.address || params.propertyName || params.rent) {
        setPropertyForm(prev => ({
          ...prev,
          name: params.propertyName || prev.name,
          address: params.address || prev.address,
          dailyRate: params.rent ? Math.ceil(params.rent / 30) : prev.dailyRate,
          description: params.description || prev.description,
        }));
        setShowPropertyModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Computed stats
  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const availableProperties = properties.filter(p => p.status === 'available').length;
    const rentedProperties = properties.filter(p => p.status === 'rented').length;
    const activeReservations = reservations.filter(r => r.status === 'active').length;
    const upcomingReservations = reservations.filter(r => r.status === 'upcoming').length;
    const totalRevenue = reservations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    const totalMaintenanceCost = maintenance
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + (m.cost || 0), 0);
    const pendingMaintenance = maintenance.filter(m => m.status !== 'completed').length;

    return {
      totalProperties,
      availableProperties,
      rentedProperties,
      activeReservations,
      upcomingReservations,
      totalRevenue,
      totalMaintenanceCost,
      pendingMaintenance,
      occupancyRate: totalProperties > 0 ? (rentedProperties / totalProperties) * 100 : 0,
    };
  }, [properties, reservations, maintenance]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesStatus = propertyStatusFilter === 'all' || p.status === propertyStatusFilter;
      const matchesSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [properties, propertyStatusFilter, searchQuery]);

  // Helper functions
  const getPropertyById = (id: string) => properties.find(p => p.id === id);
  const getPropertyReservations = (propertyId: string) => reservations.filter(r => r.propertyId === propertyId);
  const getPropertyMaintenance = (propertyId: string) => maintenance.filter(m => m.propertyId === propertyId);

  // CRUD operations
  const handleAddProperty = async () => {
    if (!propertyForm.name || !propertyForm.address) return;

    const newProperty: RentalProperty = {
      id: `rental-${Date.now()}`,
      name: propertyForm.name || '',
      address: propertyForm.address || '',
      city: propertyForm.city || '',
      state: propertyForm.state || '',
      zipCode: propertyForm.zipCode || '',
      bedroomCount: propertyForm.bedroomCount || 1,
      bathroomCount: propertyForm.bathroomCount || 1,
      sqft: propertyForm.sqft || 0,
      dailyRate: propertyForm.dailyRate || 0,
      weeklyRate: propertyForm.weeklyRate || 0,
      monthlyRate: propertyForm.monthlyRate || 0,
      status: propertyForm.status || 'available',
      description: propertyForm.description,
      imageUrl: propertyForm.imageUrl,
      amenities: propertyForm.amenities || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const result = await api.post('/tools/rental-properties', newProperty);
      if (result?.id) {
        addProperty(result);
      } else {
        addProperty(newProperty);
      }
    } catch {
      addProperty(newProperty);
    }

    resetPropertyForm();
    setShowPropertyModal(false);
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty) return;

    const updatedProperty = {
      ...editingProperty,
      ...propertyForm,
      updatedAt: new Date().toISOString(),
    };

    try {
      await api.put(`/tools/rental-properties/${editingProperty.id}`, updatedProperty);
    } catch {
      // Continue with local update
    }

    updateProperty(editingProperty.id, updatedProperty);
    resetPropertyForm();
    setEditingProperty(null);
    setShowPropertyModal(false);
  };

  const handleDeleteProperty = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Property',
      message: 'Are you sure you want to delete this property?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/tools/rental-properties/${id}`);
    } catch {
      // Continue with local delete
    }

    deleteProperty(id);
    setReservations(reservations.filter(r => r.propertyId !== id));
  };

  const handleAddReservation = async () => {
    if (!reservationForm.propertyId || !reservationForm.guestName) return;

    const newReservation: RentalPeriod = {
      id: `res-${Date.now()}`,
      propertyId: reservationForm.propertyId || '',
      guestName: reservationForm.guestName || '',
      guestEmail: reservationForm.guestEmail || '',
      guestPhone: reservationForm.guestPhone || '',
      checkInDate: reservationForm.checkInDate || '',
      checkOutDate: reservationForm.checkOutDate || '',
      numberOfGuests: reservationForm.numberOfGuests || 1,
      totalPrice: reservationForm.totalPrice || 0,
      paymentStatus: reservationForm.paymentStatus || 'pending',
      status: reservationForm.status || 'upcoming',
      notes: reservationForm.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const result = await api.post('/tools/rental-periods', newReservation);
      if (result?.id) {
        addReservation(result);
      } else {
        addReservation(newReservation);
      }
    } catch {
      addReservation(newReservation);
    }

    resetReservationForm();
    setShowReservationModal(false);
  };

  const handleUpdateReservation = async () => {
    if (!editingReservation) return;

    const updatedReservation = {
      ...editingReservation,
      ...reservationForm,
      updatedAt: new Date().toISOString(),
    };

    try {
      await api.put(`/tools/rental-periods/${editingReservation.id}`, updatedReservation);
    } catch {
      // Continue with local update
    }

    updateReservation(editingReservation.id, updatedReservation);
    resetReservationForm();
    setEditingReservation(null);
    setShowReservationModal(false);
  };

  const handleDeleteReservation = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Reservation',
      message: 'Are you sure you want to delete this reservation?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/tools/rental-periods/${id}`);
    } catch {
      // Continue with local delete
    }

    deleteReservation(id);
  };

  const handleAddMaintenance = async () => {
    if (!maintenanceForm.propertyId || !maintenanceForm.title) return;

    const newMaintenance: MaintenanceLog = {
      id: `maint-${Date.now()}`,
      propertyId: maintenanceForm.propertyId || '',
      title: maintenanceForm.title || '',
      description: maintenanceForm.description || '',
      type: maintenanceForm.type || 'cleaning',
      priority: maintenanceForm.priority || 'medium',
      status: maintenanceForm.status || 'pending',
      cost: maintenanceForm.cost,
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await api.post('/tools/rental-maintenance', newMaintenance);
      if (result?.id) {
        addMaintenance(result);
      } else {
        addMaintenance(newMaintenance);
      }
    } catch {
      addMaintenance(newMaintenance);
    }

    resetMaintenanceForm();
    setShowMaintenanceModal(false);
  };

  const handleDeleteMaintenance = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Maintenance Record',
      message: 'Are you sure you want to delete this maintenance record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/tools/rental-maintenance/${id}`);
    } catch {
      // Continue with local delete
    }

    deleteMaintenance(id);
  };

  const resetPropertyForm = () => {
    setPropertyForm({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      bedroomCount: 1,
      bathroomCount: 1,
      sqft: 0,
      dailyRate: 0,
      weeklyRate: 0,
      monthlyRate: 0,
      status: 'available',
      description: '',
      amenities: [],
    });
  };

  const resetReservationForm = () => {
    setReservationForm({
      propertyId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      numberOfGuests: 1,
      totalPrice: 0,
      paymentStatus: 'pending',
      status: 'upcoming',
    });
  };

  const resetMaintenanceForm = () => {
    setMaintenanceForm({
      propertyId: '',
      title: '',
      description: '',
      type: 'cleaning',
      priority: 'medium',
      status: 'pending',
    });
  };

  // Style classes
  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20';
  const buttonSecondary = `px-4 py-2.5 rounded-lg font-medium transition-colors ${
    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;

  // Render stats cards
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-lg">
            <Home className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Properties</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalProperties}</p>
          </div>
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Rented</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.rentedProperties}</p>
          </div>
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-lg">
            <Calendar className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Bookings</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeReservations}</p>
          </div>
        </div>
      </div>
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</p>
            <p className={`text-2xl font-bold text-blue-500`}>${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render properties tab
  const renderPropertiesTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-10 w-64`}
            />
          </div>
          <select
            value={propertyStatusFilter}
            onChange={(e) => setPropertyStatusFilter(e.target.value as RentalStatus | 'all')}
            className={inputClass}
          >
            <option value="all">All Status</option>
            {RENTAL_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <ExportDropdown
            onExportCSV={() => exportToCSV(filteredProperties, propertyColumns, { filename: 'rental-properties' })}
            onExportExcel={() => exportToExcel(filteredProperties, propertyColumns, { filename: 'rental-properties' })}
            onExportJSON={() => exportToJSON(filteredProperties, { filename: 'rental-properties' })}
            onExportPDF={async () => { await exportToPDF(filteredProperties, propertyColumns, { filename: 'rental-properties', title: 'Rental Properties Report' }); }}
            onPrint={() => printData(filteredProperties, propertyColumns, { title: 'Rental Properties Report' })}
            onCopyToClipboard={() => copyUtil(filteredProperties, propertyColumns)}
            disabled={filteredProperties.length === 0}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
          <button onClick={() => setShowPropertyModal(true)} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.map(property => {
          const statusInfo = RENTAL_STATUSES.find(s => s.value === property.status);
          const propertyReservations = getPropertyReservations(property.id);

          return (
            <div key={property.id} className={`${cardClass} p-4 hover:shadow-lg transition-shadow`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {property.name}
                  </h3>
                  <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MapPin className="w-3 h-3" />
                    {property.city}, {property.state}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                  {statusInfo?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">{property.bedroomCount} bed</span>
                  <span className="text-xs"> • {property.bathroomCount} bath</span>
                </div>
                <div className={`text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {property.sqft} sqft
                </div>
              </div>

              <div className={`flex items-center justify-between py-2 border-t border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.dailyRate', 'Daily Rate')}</p>
                  <p className="text-lg font-bold text-blue-500">${property.dailyRate.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.bookings', 'Bookings')}</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{propertyReservations.length}</p>
                </div>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="mt-2 mb-2">
                  <div className="flex gap-1 flex-wrap">
                    {property.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        +{property.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className={`flex gap-2 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <button
                  onClick={() => {
                    setEditingProperty(property);
                    setPropertyForm(property);
                    setShowPropertyModal(true);
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                  {t('tools.rentalTracker.edit', 'Edit')}
                </button>
                <button
                  onClick={() => {
                    setSelectedPropertyId(property.id);
                    setReservationForm({ ...reservationForm, propertyId: property.id });
                    setShowReservationModal(true);
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm transition-colors ${
                    isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {t('tools.rentalTracker.book', 'Book')}
                </button>
                <button
                  onClick={() => handleDeleteProperty(property.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProperties.length === 0 && (
        <div className={`text-center py-12 ${cardClass}`}>
          <Home className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.noPropertiesFound', 'No properties found')}</p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.rentalTracker.addYourFirstRentalProperty', 'Add your first rental property to get started')}</p>
        </div>
      )}
    </div>
  );

  // Render reservations tab
  const renderReservationsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <ExportDropdown
          onExportCSV={() => exportToCSV(reservations, reservationColumns, { filename: 'reservations' })}
          onExportExcel={() => exportToExcel(reservations, reservationColumns, { filename: 'reservations' })}
          onExportJSON={() => exportToJSON(reservations, { filename: 'reservations' })}
          onExportPDF={async () => { await exportToPDF(reservations, reservationColumns, { filename: 'reservations', title: 'Reservations Report' }); }}
          onPrint={() => printData(reservations, reservationColumns, { title: 'Reservations Report' })}
          onCopyToClipboard={() => copyUtil(reservations, reservationColumns)}
          disabled={reservations.length === 0}
          showImport={false}
          theme={isDark ? 'dark' : 'light'}
        />
        <button onClick={() => setShowReservationModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" />
          {t('tools.rentalTracker.addReservation', 'Add Reservation')}
        </button>
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.guest', 'Guest')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.property', 'Property')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.checkIn', 'Check-In')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.checkOut', 'Check-Out')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.total', 'Total')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.status', 'Status')}</th>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => {
                const property = getPropertyById(reservation.propertyId);
                return (
                  <tr key={reservation.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {reservation.guestName}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {property?.name || 'Unknown'}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(reservation.checkInDate).toLocaleDateString()}
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(reservation.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-500">
                      ${reservation.totalPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        reservation.status === 'active' ? 'text-green-500 bg-green-500/10' :
                        reservation.status === 'upcoming' ? 'text-blue-500 bg-blue-500/10' :
                        'text-gray-500 bg-gray-500/10'
                      }`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {reservations.length === 0 && (
          <div className="text-center py-12">
            <Calendar className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.noReservationsYet', 'No reservations yet')}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render maintenance tab
  const renderMaintenanceTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <ExportDropdown
          onExportCSV={() => exportToCSV(maintenance, maintenanceColumns, { filename: 'maintenance-logs' })}
          onExportExcel={() => exportToExcel(maintenance, maintenanceColumns, { filename: 'maintenance-logs' })}
          onExportJSON={() => exportToJSON(maintenance, { filename: 'maintenance-logs' })}
          onExportPDF={async () => { await exportToPDF(maintenance, maintenanceColumns, { filename: 'maintenance-logs', title: 'Maintenance Logs Report' }); }}
          onPrint={() => printData(maintenance, maintenanceColumns, { title: 'Maintenance Logs Report' })}
          onCopyToClipboard={() => copyUtil(maintenance, maintenanceColumns)}
          disabled={maintenance.length === 0}
          showImport={false}
          theme={isDark ? 'dark' : 'light'}
        />
        <button onClick={() => setShowMaintenanceModal(true)} className={buttonPrimary}>
          <Plus className="w-4 h-4" />
          {t('tools.rentalTracker.addMaintenance', 'Add Maintenance')}
        </button>
      </div>

      <div className="grid gap-4">
        {maintenance.map(log => {
          const property = getPropertyById(log.propertyId);
          const priorityColors = {
            low: 'text-blue-500 bg-blue-500/10',
            medium: 'text-yellow-500 bg-yellow-500/10',
            high: 'text-orange-500 bg-orange-500/10',
            urgent: 'text-red-500 bg-red-500/10',
          };
          const statusColors = {
            pending: 'text-gray-500 bg-gray-500/10',
            in_progress: 'text-amber-500 bg-amber-500/10',
            completed: 'text-green-500 bg-green-500/10',
          };

          return (
            <div key={log.id} className={`${cardClass} p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {property?.name || 'Unknown property'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${priorityColors[log.priority]}`}>
                    {log.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[log.status]}`}>
                    {log.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{log.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {log.cost && (
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Cost: ${log.cost}
                    </span>
                  )}
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Created: {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteMaintenance(log.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {maintenance.length === 0 && (
        <div className={`text-center py-12 ${cardClass}`}>
          <Wrench className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.noMaintenanceLogs', 'No maintenance logs')}</p>
        </div>
      )}
    </div>
  );

  // Render analytics tab
  const renderAnalyticsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Revenue Analytics */}
      <div className={cardClass}>
        <div className="p-4 border-b border-gray-700">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentalTracker.revenueAnalytics', 'Revenue Analytics')}</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.totalRevenue', 'Total Revenue')}</p>
            <p className="text-3xl font-bold text-blue-500">${stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.pendingPayments', 'Pending Payments')}</p>
            <p className="text-2xl font-semibold text-yellow-500">
              ${reservations
                .filter(r => r.paymentStatus === 'pending')
                .reduce((sum, r) => sum + r.totalPrice, 0)
                .toLocaleString()}
            </p>
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.averageBookingValue', 'Average Booking Value')}</p>
            <p className="text-2xl font-semibold text-green-500">
              ${reservations.length > 0 ? Math.round(stats.totalRevenue / reservations.length).toLocaleString() : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Occupancy Analytics */}
      <div className={cardClass}>
        <div className="p-4 border-b border-gray-700">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentalTracker.occupancyRate', 'Occupancy Rate')}</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.overallRate', 'Overall Rate')}</p>
            <p className="text-3xl font-bold text-cyan-500">{stats.occupancyRate.toFixed(1)}%</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.rentedProperties', 'Rented Properties')}</p>
              <p className="text-xl font-bold text-green-500">{stats.rentedProperties}</p>
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.available', 'Available')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.availableProperties}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Analytics */}
      <div className={cardClass}>
        <div className="p-4 border-b border-gray-700">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentalTracker.maintenanceCosts', 'Maintenance Costs')}</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.totalSpent', 'Total Spent')}</p>
            <p className="text-3xl font-bold text-red-500">${stats.totalMaintenanceCost.toLocaleString()}</p>
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.pendingTasks', 'Pending Tasks')}</p>
            <p className="text-2xl font-semibold text-orange-500">{stats.pendingMaintenance}</p>
          </div>
        </div>
      </div>

      {/* Booking Analytics */}
      <div className={cardClass}>
        <div className="p-4 border-b border-gray-700">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentalTracker.bookingStatus', 'Booking Status')}</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.activeBookings', 'Active Bookings')}</p>
            <p className="text-3xl font-bold text-green-500">{stats.activeReservations}</p>
          </div>
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalTracker.upcoming', 'Upcoming')}</p>
            <p className="text-2xl font-semibold text-blue-500">{stats.upcomingReservations}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Property Modal
  const renderPropertyModal = () => (
    showPropertyModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingProperty ? t('tools.rentalTracker.editProperty', 'Edit Property') : t('tools.rentalTracker.addNewProperty', 'Add New Property')}
            </h2>
            <button
              onClick={() => {
                setShowPropertyModal(false);
                setEditingProperty(null);
                resetPropertyForm();
              }}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.propertyName', 'Property Name *')}</label>
                <input
                  type="text"
                  value={propertyForm.name || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                  placeholder={t('tools.rentalTracker.eGBeachfrontVilla', 'e.g., Beachfront Villa')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.status2', 'Status')}</label>
                <select
                  value={propertyForm.status || 'available'}
                  onChange={(e) => setPropertyForm({ ...propertyForm, status: e.target.value as RentalStatus })}
                  className={inputClass}
                >
                  {RENTAL_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.rentalTracker.address', 'Address *')}</label>
              <input
                type="text"
                value={propertyForm.address || ''}
                onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                placeholder={t('tools.rentalTracker.123MainStreet', '123 Main Street')}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.city', 'City')}</label>
                <input
                  type="text"
                  value={propertyForm.city || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.state', 'State')}</label>
                <input
                  type="text"
                  value={propertyForm.state || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, state: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.zipCode', 'Zip Code')}</label>
                <input
                  type="text"
                  value={propertyForm.zipCode || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, zipCode: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.bedrooms', 'Bedrooms')}</label>
                <input
                  type="number"
                  value={propertyForm.bedroomCount || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, bedroomCount: parseInt(e.target.value) || 0 })}
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.bathrooms', 'Bathrooms')}</label>
                <input
                  type="number"
                  value={propertyForm.bathroomCount || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, bathroomCount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.5"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.squareFeet', 'Square Feet')}</label>
                <input
                  type="number"
                  value={propertyForm.sqft || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, sqft: parseInt(e.target.value) || 0 })}
                  min="0"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.dailyRate2', 'Daily Rate ($)')}</label>
                <input
                  type="number"
                  value={propertyForm.dailyRate || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, dailyRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.weeklyRate', 'Weekly Rate ($)')}</label>
                <input
                  type="number"
                  value={propertyForm.weeklyRate || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, weeklyRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.monthlyRate', 'Monthly Rate ($)')}</label>
                <input
                  type="number"
                  value={propertyForm.monthlyRate || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, monthlyRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.rentalTracker.amenities', 'Amenities')}</label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES.map(amenity => (
                  <label key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(propertyForm.amenities || []).includes(amenity)}
                      onChange={(e) => {
                        const newAmenities = e.target.checked
                          ? [...(propertyForm.amenities || []), amenity]
                          : (propertyForm.amenities || []).filter(a => a !== amenity);
                        setPropertyForm({ ...propertyForm, amenities: newAmenities });
                      }}
                      className="rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.rentalTracker.description', 'Description')}</label>
              <textarea
                value={propertyForm.description || ''}
                onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                placeholder={t('tools.rentalTracker.propertyDescription', 'Property description...')}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => { setShowPropertyModal(false); setEditingProperty(null); resetPropertyForm(); }} className={buttonSecondary}>
              {t('tools.rentalTracker.cancel3', 'Cancel')}
            </button>
            <button
              onClick={editingProperty ? handleUpdateProperty : handleAddProperty}
              disabled={!propertyForm.name || !propertyForm.address}
              className={`${buttonPrimary} disabled:opacity-50`}
            >
              <Save className="w-4 h-4" />
              {editingProperty ? t('tools.rentalTracker.updateProperty', 'Update Property') : t('tools.rentalTracker.addProperty', 'Add Property')}
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Reservation Modal
  const renderReservationModal = () => (
    showReservationModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingReservation ? t('tools.rentalTracker.editReservation', 'Edit Reservation') : t('tools.rentalTracker.newReservation', 'New Reservation')}
            </h2>
            <button onClick={() => { setShowReservationModal(false); setEditingReservation(null); resetReservationForm(); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={labelClass}>{t('tools.rentalTracker.property2', 'Property *')}</label>
              <select value={reservationForm.propertyId || ''} onChange={(e) => setReservationForm({ ...reservationForm, propertyId: e.target.value })} className={inputClass}>
                <option value="">{t('tools.rentalTracker.selectProperty', 'Select property...')}</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.guestName', 'Guest Name *')}</label>
                <input type="text" value={reservationForm.guestName || ''} onChange={(e) => setReservationForm({ ...reservationForm, guestName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.email', 'Email')}</label>
                <input type="email" value={reservationForm.guestEmail || ''} onChange={(e) => setReservationForm({ ...reservationForm, guestEmail: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.rentalTracker.phone', 'Phone')}</label>
              <input type="tel" value={reservationForm.guestPhone || ''} onChange={(e) => setReservationForm({ ...reservationForm, guestPhone: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.checkInDate', 'Check-In Date')}</label>
                <input type="date" value={reservationForm.checkInDate || ''} onChange={(e) => setReservationForm({ ...reservationForm, checkInDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.checkOutDate', 'Check-Out Date')}</label>
                <input type="date" value={reservationForm.checkOutDate || ''} onChange={(e) => setReservationForm({ ...reservationForm, checkOutDate: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.numberOfGuests', 'Number of Guests')}</label>
                <input type="number" value={reservationForm.numberOfGuests || 1} onChange={(e) => setReservationForm({ ...reservationForm, numberOfGuests: parseInt(e.target.value) || 1 })} min="1" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.totalPrice', 'Total Price ($) *')}</label>
                <input type="number" value={reservationForm.totalPrice || ''} onChange={(e) => setReservationForm({ ...reservationForm, totalPrice: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.paymentStatus', 'Payment Status')}</label>
                <select value={reservationForm.paymentStatus || 'pending'} onChange={(e) => setReservationForm({ ...reservationForm, paymentStatus: e.target.value as 'pending' | 'paid' | 'refunded' })} className={inputClass}>
                  <option value="pending">{t('tools.rentalTracker.pending', 'Pending')}</option>
                  <option value="paid">{t('tools.rentalTracker.paid', 'Paid')}</option>
                  <option value="refunded">{t('tools.rentalTracker.refunded', 'Refunded')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.reservationStatus', 'Reservation Status')}</label>
                <select value={reservationForm.status || 'upcoming'} onChange={(e) => setReservationForm({ ...reservationForm, status: e.target.value as RentalPeriodStatus })} className={inputClass}>
                  <option value="upcoming">{t('tools.rentalTracker.upcoming2', 'Upcoming')}</option>
                  <option value="active">{t('tools.rentalTracker.active', 'Active')}</option>
                  <option value="completed">{t('tools.rentalTracker.completed', 'Completed')}</option>
                  <option value="cancelled">{t('tools.rentalTracker.cancelled', 'Cancelled')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.rentalTracker.notes', 'Notes')}</label>
              <textarea value={reservationForm.notes || ''} onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })} rows={2} className={inputClass} />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => { setShowReservationModal(false); setEditingReservation(null); resetReservationForm(); }} className={buttonSecondary}>{t('tools.rentalTracker.cancel', 'Cancel')}</button>
            <button onClick={editingReservation ? handleUpdateReservation : handleAddReservation} disabled={!reservationForm.propertyId || !reservationForm.guestName} className={`${buttonPrimary} disabled:opacity-50`}>
              <Save className="w-4 h-4" />{editingReservation ? t('tools.rentalTracker.update', 'Update') : t('tools.rentalTracker.create', 'Create')}
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Maintenance Modal
  const renderMaintenanceModal = () => (
    showMaintenanceModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingMaintenance ? t('tools.rentalTracker.editMaintenance', 'Edit Maintenance') : t('tools.rentalTracker.addMaintenance2', 'Add Maintenance')}
            </h2>
            <button onClick={() => setShowMaintenanceModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={labelClass}>{t('tools.rentalTracker.property3', 'Property *')}</label>
              <select value={maintenanceForm.propertyId || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, propertyId: e.target.value })} className={inputClass}>
                <option value="">{t('tools.rentalTracker.selectProperty2', 'Select property...')}</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('tools.rentalTracker.title', 'Title *')}</label>
              <input type="text" value={maintenanceForm.title || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('tools.rentalTracker.description2', 'Description')}</label>
              <textarea value={maintenanceForm.description || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} rows={3} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.type', 'Type')}</label>
                <select value={maintenanceForm.type || 'cleaning'} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value as MaintenanceLog['type'] })} className={inputClass}>
                  <option value="repair">{t('tools.rentalTracker.repair', 'Repair')}</option>
                  <option value="cleaning">{t('tools.rentalTracker.cleaning', 'Cleaning')}</option>
                  <option value="inspection">{t('tools.rentalTracker.inspection', 'Inspection')}</option>
                  <option value="upgrade">{t('tools.rentalTracker.upgrade', 'Upgrade')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('tools.rentalTracker.priority', 'Priority')}</label>
                <select value={maintenanceForm.priority || 'medium'} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value as MaintenanceLog['priority'] })} className={inputClass}>
                  <option value="low">{t('tools.rentalTracker.low', 'Low')}</option>
                  <option value="medium">{t('tools.rentalTracker.medium', 'Medium')}</option>
                  <option value="high">{t('tools.rentalTracker.high', 'High')}</option>
                  <option value="urgent">{t('tools.rentalTracker.urgent', 'Urgent')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('tools.rentalTracker.cost', 'Cost ($)')}</label>
              <input type="number" value={maintenanceForm.cost || ''} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: parseFloat(e.target.value) || 0 })} min="0" className={inputClass} />
            </div>
          </div>
          <div className={`flex justify-end gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => setShowMaintenanceModal(false)} className={buttonSecondary}>{t('tools.rentalTracker.cancel2', 'Cancel')}</button>
            <button onClick={handleAddMaintenance} disabled={!maintenanceForm.propertyId || !maintenanceForm.title} className={`${buttonPrimary} disabled:opacity-50`}>
              <Save className="w-4 h-4" />Add
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div>
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500 font-medium">{t('tools.rentalTracker.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
              </div>
            )}
          </div>
          <WidgetEmbedButton toolSlug="rental-tracker" toolName="Rental Tracker" />

          <SyncStatus
            isSynced={propertiesToolData.isSynced && reservationsToolData.isSynced && maintenanceToolData.isSynced}
            isSaving={propertiesToolData.isSaving || reservationsToolData.isSaving || maintenanceToolData.isSaving}
            lastSaved={
              propertiesToolData.lastSaved ||
              reservationsToolData.lastSaved ||
              maintenanceToolData.lastSaved ||
              null
            }
            theme={isDark ? 'dark' : 'light'}
          />
        </div>

        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.rentalTracker.rentalTracker', 'Rental Tracker')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.rentalTracker.manageYourRentalPropertiesAnd', 'Manage your rental properties and reservations')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {renderStats()}

        {/* Tabs */}
        <div className={cardClass}>
          <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
            {[
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'reservations', label: 'Reservations', icon: Calendar },
              { id: 'maintenance', label: 'Maintenance', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'properties' && renderPropertiesTab()}
            {activeTab === 'reservations' && renderReservationsTab()}
            {activeTab === 'maintenance' && renderMaintenanceTab()}
            {activeTab === 'analytics' && renderAnalyticsTab()}
          </div>
        </div>
      </div>

      {/* Modals */}
      {renderPropertyModal()}
      {renderReservationModal()}
      {renderMaintenanceModal()}
      <ConfirmDialog />
    </div>
  );
};

export default RentalTrackerTool;
