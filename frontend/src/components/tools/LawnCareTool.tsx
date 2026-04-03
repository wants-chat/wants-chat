'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Leaf,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Scissors,
  Droplets,
  Sun,
  Wind,
  Bug,
  Flower2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface LawnCareToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ServiceType = 'mowing' | 'edging' | 'trimming' | 'fertilizing' | 'weed-control' | 'aeration' | 'seeding' | 'leaf-removal' | 'irrigation' | 'pest-control';
type ServiceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial';
type RecurrenceType = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'seasonal';

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
  propertySize: number; // in sq ft
  notes: string;
  createdAt: string;
}

interface ServiceAppointment {
  id: string;
  customerId: string;
  serviceTypes: ServiceType[];
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number; // in minutes
  status: ServiceStatus;
  assignedCrew: string;
  price: number;
  paymentStatus: PaymentStatus;
  recurrence: RecurrenceType;
  notes: string;
  completedAt?: string;
  createdAt: string;
}

interface CrewMember {
  id: string;
  name: string;
  phone: string;
  role: 'lead' | 'technician' | 'helper';
  available: boolean;
}

// Constants
const SERVICE_TYPES: { type: ServiceType; label: string; icon: React.ReactNode; basePrice: number }[] = [
  { type: 'mowing', label: 'Lawn Mowing', icon: <Scissors className="w-4 h-4" />, basePrice: 35 },
  { type: 'edging', label: 'Edging', icon: <Leaf className="w-4 h-4" />, basePrice: 15 },
  { type: 'trimming', label: 'Trimming', icon: <Scissors className="w-4 h-4" />, basePrice: 20 },
  { type: 'fertilizing', label: 'Fertilizing', icon: <Flower2 className="w-4 h-4" />, basePrice: 50 },
  { type: 'weed-control', label: 'Weed Control', icon: <Bug className="w-4 h-4" />, basePrice: 40 },
  { type: 'aeration', label: 'Aeration', icon: <Wind className="w-4 h-4" />, basePrice: 75 },
  { type: 'seeding', label: 'Overseeding', icon: <Flower2 className="w-4 h-4" />, basePrice: 60 },
  { type: 'leaf-removal', label: 'Leaf Removal', icon: <Leaf className="w-4 h-4" />, basePrice: 45 },
  { type: 'irrigation', label: 'Irrigation Check', icon: <Droplets className="w-4 h-4" />, basePrice: 30 },
  { type: 'pest-control', label: 'Pest Control', icon: <Bug className="w-4 h-4" />, basePrice: 55 },
];

const STATUS_COLORS: Record<ServiceStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  rescheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

// Column configuration for exports
const APPOINTMENT_COLUMNS: ColumnConfig[] = [
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'serviceTypes', header: 'Services', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'scheduledTime', header: 'Time', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'assignedCrew', header: 'Crew', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'paymentStatus', header: 'Payment', type: 'string' },
  { key: 'recurrence', header: 'Recurrence', type: 'string' },
];

const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'zipCode', header: 'Zip Code', type: 'string' },
  { key: 'propertySize', header: 'Property Size (sq ft)', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const LawnCareTool: React.FC<LawnCareToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

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
  } = useToolData<Customer>('lawn-care-customers', [], CUSTOMER_COLUMNS);

  const {
    data: appointments,
    addItem: addAppointmentToBackend,
    updateItem: updateAppointmentBackend,
    deleteItem: deleteAppointmentBackend,
    isSynced: appointmentsSynced,
    isSaving: appointmentsSaving,
    lastSaved: appointmentsLastSaved,
    syncError: appointmentsSyncError,
    forceSync: forceAppointmentsSync,
  } = useToolData<ServiceAppointment>('lawn-care-appointments', [], APPOINTMENT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'schedule' | 'customers' | 'dashboard'>('schedule');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<ServiceAppointment | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Form states
  const [newAppointment, setNewAppointment] = useState<Partial<ServiceAppointment>>({
    customerId: '',
    serviceTypes: [],
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    estimatedDuration: 60,
    status: 'scheduled',
    assignedCrew: '',
    price: 0,
    paymentStatus: 'pending',
    recurrence: 'one-time',
    notes: '',
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

  // Crew members (could be synced separately)
  const [crewMembers] = useState<CrewMember[]>([
    { id: '1', name: 'Team Alpha', phone: '555-0101', role: 'lead', available: true },
    { id: '2', name: 'Team Beta', phone: '555-0102', role: 'lead', available: true },
    { id: '3', name: 'Team Gamma', phone: '555-0103', role: 'lead', available: false },
  ]);

  // Calculate price based on selected services and property size
  useEffect(() => {
    const selectedCustomer = customers.find(c => c.id === newAppointment.customerId);
    const basePrice = newAppointment.serviceTypes?.reduce((total, type) => {
      const service = SERVICE_TYPES.find(s => s.type === type);
      return total + (service?.basePrice || 0);
    }, 0) || 0;

    // Adjust price based on property size
    let sizeMultiplier = 1;
    if (selectedCustomer) {
      if (selectedCustomer.propertySize > 10000) sizeMultiplier = 1.5;
      else if (selectedCustomer.propertySize > 5000) sizeMultiplier = 1.25;
    }

    setNewAppointment(prev => ({
      ...prev,
      price: Math.round(basePrice * sizeMultiplier * 100) / 100,
    }));
  }, [newAppointment.serviceTypes, newAppointment.customerId, customers]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const customer = customers.find(c => c.id === apt.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';

      const matchesSearch = searchTerm === '' ||
        customerName.includes(searchTerm.toLowerCase()) ||
        apt.assignedCrew.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
      const matchesDate = !filterDate || apt.scheduledDate === filterDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, customers, searchTerm, filterStatus, filterDate]);

  // Dashboard stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(a => a.scheduledDate === today);
    const completedToday = todaysAppointments.filter(a => a.status === 'completed');
    const totalRevenue = appointments
      .filter(a => a.paymentStatus === 'paid')
      .reduce((sum, a) => sum + a.price, 0);
    const pendingPayments = appointments
      .filter(a => a.paymentStatus === 'pending' || a.paymentStatus === 'overdue')
      .reduce((sum, a) => sum + a.price, 0);

    return {
      todaysCount: todaysAppointments.length,
      completedToday: completedToday.length,
      totalCustomers: customers.length,
      totalRevenue,
      pendingPayments,
    };
  }, [appointments, customers]);

  // Add new appointment
  const handleAddAppointment = () => {
    if (!newAppointment.customerId || newAppointment.serviceTypes?.length === 0) {
      setValidationMessage('Please select a customer and at least one service');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const appointment: ServiceAppointment = {
      id: generateId(),
      customerId: newAppointment.customerId || '',
      serviceTypes: newAppointment.serviceTypes || [],
      scheduledDate: newAppointment.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: newAppointment.scheduledTime || '09:00',
      estimatedDuration: newAppointment.estimatedDuration || 60,
      status: 'scheduled',
      assignedCrew: newAppointment.assignedCrew || '',
      price: newAppointment.price || 0,
      paymentStatus: 'pending',
      recurrence: newAppointment.recurrence || 'one-time',
      notes: newAppointment.notes || '',
      createdAt: new Date().toISOString(),
    };

    addAppointmentToBackend(appointment);
    setShowAppointmentForm(false);
    resetAppointmentForm();
  };

  // Add new customer
  const handleAddCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone) {
      setValidationMessage('Please fill in required fields (First Name, Last Name, Phone)');
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

  // Update appointment status
  const updateAppointmentStatus = (id: string, status: ServiceStatus) => {
    const updates: Partial<ServiceAppointment> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    updateAppointmentBackend(id, updates);
  };

  // Update payment status
  const updatePaymentStatus = (id: string, paymentStatus: PaymentStatus) => {
    updateAppointmentBackend(id, { paymentStatus });
  };

  // Delete appointment
  const handleDeleteAppointment = async (id: string) => {
    const result = await confirm('Are you sure you want to delete this appointment?');
    if (result) {
      deleteAppointmentBackend(id);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (id: string) => {
    const result = await confirm('Are you sure you want to delete this customer? This will also remove their appointments.');
    if (result) {
      deleteCustomerBackend(id);
      appointments.forEach(apt => {
        if (apt.customerId === id) deleteAppointmentBackend(apt.id);
      });
    }
  };

  // Reset forms
  const resetAppointmentForm = () => {
    setNewAppointment({
      customerId: '',
      serviceTypes: [],
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      estimatedDuration: 60,
      status: 'scheduled',
      assignedCrew: '',
      price: 0,
      paymentStatus: 'pending',
      recurrence: 'one-time',
      notes: '',
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

  // Toggle service type selection
  const toggleServiceType = (type: ServiceType) => {
    setNewAppointment(prev => {
      const current = prev.serviceTypes || [];
      const updated = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type];
      return { ...prev, serviceTypes: updated };
    });
  };

  // Get customer name by ID
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  // Export data for dropdown
  const appointmentExportData = filteredAppointments.map(apt => ({
    ...apt,
    customerName: getCustomerName(apt.customerId),
    serviceTypes: apt.serviceTypes.join(', '),
  }));

  // Export handlers
  const handleExportCSV = () => {
    if (appointmentExportData.length === 0) return;
    exportToCSV(appointmentExportData, APPOINTMENT_COLUMNS, 'lawn-care-appointments');
  };

  const handleExportExcel = () => {
    if (appointmentExportData.length === 0) return;
    exportToExcel(appointmentExportData, APPOINTMENT_COLUMNS, 'lawn-care-appointments');
  };

  const handleExportJSON = () => {
    if (appointmentExportData.length === 0) return;
    exportToJSON(appointmentExportData, 'lawn-care-appointments');
  };

  const handleExportPDF = async () => {
    if (appointmentExportData.length === 0) return;
    await exportToPDF(appointmentExportData, APPOINTMENT_COLUMNS, 'lawn-care-appointments', 'Lawn Care Appointments');
  };

  const handlePrint = () => {
    if (appointmentExportData.length === 0) return;
    printData(appointmentExportData, APPOINTMENT_COLUMNS, 'Lawn Care Appointments');
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    if (appointmentExportData.length === 0) return false;
    return await copyUtil(appointmentExportData, APPOINTMENT_COLUMNS);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Leaf className="w-7 h-7 text-green-600" />
            {t('tools.lawnCare.lawnCareServiceScheduler', 'Lawn Care Service Scheduler')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('tools.lawnCare.manageLawnCareAppointmentsAnd', 'Manage lawn care appointments and customers')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="lawn-care" toolName="Lawn Care" />

          <SyncStatus
            isSynced={appointmentsSynced && customersSynced}
            isSaving={appointmentsSaving || customersSaving}
            lastSaved={appointmentsLastSaved || customersLastSaved}
            error={appointmentsSyncError || customersSyncError}
          />
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={theme === 'dark' ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['schedule', 'customers', 'dashboard'].map((tab) => (
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.lawnCare.todaySJobs', 'Today\'s Jobs')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todaysCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.lawnCare.completedToday', 'Completed Today')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.lawnCare.totalCustomers', 'Total Customers')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.lawnCare.totalRevenue', 'Total Revenue')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.lawnCare.search', 'Search...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.lawnCare.allStatus', 'All Status')}</option>
                <option value="scheduled">{t('tools.lawnCare.scheduled', 'Scheduled')}</option>
                <option value="in-progress">{t('tools.lawnCare.inProgress', 'In Progress')}</option>
                <option value="completed">{t('tools.lawnCare.completed', 'Completed')}</option>
                <option value="cancelled">{t('tools.lawnCare.cancelled', 'Cancelled')}</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowAppointmentForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.lawnCare.newAppointment2', 'New Appointment')}
            </button>
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">{t('tools.lawnCare.noAppointmentsFound', 'No appointments found')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {getCustomerName(apt.customerId)}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[apt.status]}`}>
                            {apt.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${PAYMENT_STATUS_COLORS[apt.paymentStatus]}`}>
                            {apt.paymentStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(apt.scheduledDate)} at {apt.scheduledTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {apt.estimatedDuration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(apt.price)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {apt.serviceTypes.map((type) => {
                            const service = SERVICE_TYPES.find(s => s.type === type);
                            return (
                              <span
                                key={type}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded"
                              >
                                {service?.icon}
                                {service?.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.status === 'scheduled' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'in-progress')}
                            className="px-3 py-1 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                          >
                            {t('tools.lawnCare.start', 'Start')}
                          </button>
                        )}
                        {apt.status === 'in-progress' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                          >
                            {t('tools.lawnCare.complete', 'Complete')}
                          </button>
                        )}
                        {apt.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => updatePaymentStatus(apt.id, 'paid')}
                            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          >
                            {t('tools.lawnCare.markPaid', 'Mark Paid')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
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

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.lawnCare.searchCustomers', 'Search customers...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowCustomerForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.lawnCare.addCustomer2', 'Add Customer')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers
              .filter(c =>
                searchTerm === '' ||
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.address.toLowerCase().includes(searchTerm.toLowerCase())
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
                      {customer.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {customer.address}, {customer.city}, {customer.state}
                      </p>
                      <p className="flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        {customer.propertySize.toLocaleString()} sq ft
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {appointments.filter(a => a.customerId === customer.id).length} appointments
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* New Appointment Form Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.lawnCare.newAppointment', 'New Appointment')}</CardTitle>
              <button onClick={() => setShowAppointmentForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.customer', 'Customer *')}</label>
                <select
                  value={newAppointment.customerId}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">{t('tools.lawnCare.selectACustomer', 'Select a customer')}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} - {c.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.lawnCare.services', 'Services *')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICE_TYPES.map((service) => (
                    <button
                      key={service.type}
                      type="button"
                      onClick={() => toggleServiceType(service.type)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        newAppointment.serviceTypes?.includes(service.type)
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-400'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {service.icon}
                      <span className="text-sm">{service.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.date', 'Date *')}</label>
                  <input
                    type="date"
                    value={newAppointment.scheduledDate}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.time', 'Time *')}</label>
                  <input
                    type="time"
                    value={newAppointment.scheduledTime}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Duration and Crew */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.durationMin', 'Duration (min)')}</label>
                  <input
                    type="number"
                    value={newAppointment.estimatedDuration}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.assignedCrew', 'Assigned Crew')}</label>
                  <select
                    value={newAppointment.assignedCrew}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, assignedCrew: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">{t('tools.lawnCare.selectCrew', 'Select crew')}</option>
                    {crewMembers.filter(c => c.available).map((crew) => (
                      <option key={crew.id} value={crew.name}>{crew.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recurrence and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.recurrence', 'Recurrence')}</label>
                  <select
                    value={newAppointment.recurrence}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, recurrence: e.target.value as RecurrenceType }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="one-time">{t('tools.lawnCare.oneTime', 'One-time')}</option>
                    <option value="weekly">{t('tools.lawnCare.weekly', 'Weekly')}</option>
                    <option value="bi-weekly">{t('tools.lawnCare.biWeekly', 'Bi-weekly')}</option>
                    <option value="monthly">{t('tools.lawnCare.monthly', 'Monthly')}</option>
                    <option value="seasonal">{t('tools.lawnCare.seasonal', 'Seasonal')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.price', 'Price')}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={newAppointment.price}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.notes', 'Notes')}</label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAppointmentForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.lawnCare.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddAppointment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.lawnCare.createAppointment', 'Create Appointment')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('tools.lawnCare.addCustomer', 'Add Customer')}</CardTitle>
              <button onClick={() => setShowCustomerForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.phone', 'Phone *')}</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.email', 'Email')}</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.address', 'Address')}</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.city', 'City')}</label>
                  <input
                    type="text"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.state', 'State')}</label>
                  <input
                    type="text"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.zip', 'Zip')}</label>
                  <input
                    type="text"
                    value={newCustomer.zipCode}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.propertySizeSqFt', 'Property Size (sq ft)')}</label>
                <input
                  type="number"
                  value={newCustomer.propertySize}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, propertySize: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.lawnCare.notes2', 'Notes')}</label>
                <textarea
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCustomerForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.lawnCare.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('tools.lawnCare.addCustomer3', 'Add Customer')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertCircle className="w-4 h-4" />
          {validationMessage}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default LawnCareTool;
