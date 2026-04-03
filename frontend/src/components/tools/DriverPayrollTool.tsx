'use client';
import { useTranslation } from 'react-i18next';

import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
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
import {
  DollarSign,
  User,
  Calendar,
  Clock,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  FileText,
  Sparkles,
  Filter,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Car,
  Banknote,
  Calculator,
  Download,
  Printer,
} from 'lucide-react';

// Types
interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleId: string;
  vehiclePlate: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  paymentType: 'hourly' | 'commission' | 'salary' | 'mixed';
  hourlyRate: number;
  commissionRate: number; // percentage
  baseSalary: number;
  bankAccount: string;
  taxId: string;
  notes: string;
}

interface PayrollEntry {
  id: string;
  driverId: string;
  driverName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  hoursWorked: number;
  ridesCompleted: number;
  totalFares: number;
  commissionEarned: number;
  hourlyEarnings: number;
  bonuses: number;
  tips: number;
  deductions: number;
  deductionNotes: string;
  grossPay: number;
  netPay: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  paymentDate: string | null;
  paymentMethod: 'bank-transfer' | 'check' | 'cash' | 'direct-deposit';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PayrollSummary {
  periodStart: string;
  periodEnd: string;
  totalDrivers: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  totalRides: number;
  totalHours: number;
}

type TabType = 'payroll' | 'drivers' | 'reports';

// Column configurations for export
const payrollColumns: ColumnConfig[] = [
  { key: 'driverName', header: 'Driver', type: 'string' },
  { key: 'payPeriodStart', header: 'Period Start', type: 'date' },
  { key: 'payPeriodEnd', header: 'Period End', type: 'date' },
  { key: 'hoursWorked', header: 'Hours', type: 'number' },
  { key: 'ridesCompleted', header: 'Rides', type: 'number' },
  { key: 'totalFares', header: 'Total Fares', type: 'currency' },
  { key: 'commissionEarned', header: 'Commission', type: 'currency' },
  { key: 'hourlyEarnings', header: 'Hourly', type: 'currency' },
  { key: 'bonuses', header: 'Bonuses', type: 'currency' },
  { key: 'tips', header: 'Tips', type: 'currency' },
  { key: 'deductions', header: 'Deductions', type: 'currency' },
  { key: 'grossPay', header: 'Gross Pay', type: 'currency' },
  { key: 'netPay', header: 'Net Pay', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const driverColumns: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'vehiclePlate', header: 'Vehicle', type: 'string' },
  { key: 'paymentType', header: 'Pay Type', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'commissionRate', header: 'Commission %', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

const PAYMENT_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'commission', label: 'Commission' },
  { value: 'salary', label: 'Salary' },
  { value: 'mixed', label: 'Mixed (Hourly + Commission)' },
];

const PAYROLL_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'blue' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'disputed', label: 'Disputed', color: 'red' },
];

const PAYMENT_METHODS = [
  { value: 'direct-deposit', label: 'Direct Deposit' },
  { value: 'bank-transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
];

const generateId = () => `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Sample data generator
const generateSampleData = () => {
  const sampleDrivers: Driver[] = [
    {
      id: 'd1',
      name: 'Michael Johnson',
      email: 'michael.j@taxi.com',
      phone: '+1 (555) 111-2222',
      licenseNumber: 'DL12345678',
      vehicleId: 'v1',
      vehiclePlate: 'ABC-1234',
      hireDate: '2022-03-15',
      status: 'active',
      paymentType: 'mixed',
      hourlyRate: 12.00,
      commissionRate: 20,
      baseSalary: 0,
      bankAccount: '****4567',
      taxId: '***-**-1234',
      notes: 'Senior driver',
    },
    {
      id: 'd2',
      name: 'Sarah Williams',
      email: 'sarah.w@taxi.com',
      phone: '+1 (555) 333-4444',
      licenseNumber: 'DL87654321',
      vehicleId: 'v2',
      vehiclePlate: 'XYZ-5678',
      hireDate: '2023-06-01',
      status: 'active',
      paymentType: 'commission',
      hourlyRate: 0,
      commissionRate: 35,
      baseSalary: 0,
      bankAccount: '****8901',
      taxId: '***-**-5678',
      notes: '',
    },
    {
      id: 'd3',
      name: 'Robert Chen',
      email: 'robert.c@taxi.com',
      phone: '+1 (555) 555-6666',
      licenseNumber: 'DL11223344',
      vehicleId: 'v3',
      vehiclePlate: 'DEF-9012',
      hireDate: '2021-01-10',
      status: 'active',
      paymentType: 'hourly',
      hourlyRate: 15.00,
      commissionRate: 0,
      baseSalary: 0,
      bankAccount: '****2345',
      taxId: '***-**-9012',
      notes: 'Night shift',
    },
  ];

  const currentDate = new Date();
  const periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);

  const samplePayroll: PayrollEntry[] = [
    {
      id: generateId(),
      driverId: 'd1',
      driverName: 'Michael Johnson',
      payPeriodStart: periodStart.toISOString().split('T')[0],
      payPeriodEnd: periodEnd.toISOString().split('T')[0],
      hoursWorked: 85,
      ridesCompleted: 142,
      totalFares: 3850.00,
      commissionEarned: 770.00,
      hourlyEarnings: 1020.00,
      bonuses: 100.00,
      tips: 285.00,
      deductions: 125.00,
      deductionNotes: 'Health insurance',
      grossPay: 2175.00,
      netPay: 2050.00,
      status: 'approved',
      paymentDate: null,
      paymentMethod: 'direct-deposit',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      driverId: 'd2',
      driverName: 'Sarah Williams',
      payPeriodStart: periodStart.toISOString().split('T')[0],
      payPeriodEnd: periodEnd.toISOString().split('T')[0],
      hoursWorked: 72,
      ridesCompleted: 98,
      totalFares: 2940.00,
      commissionEarned: 1029.00,
      hourlyEarnings: 0,
      bonuses: 50.00,
      tips: 195.00,
      deductions: 75.00,
      deductionNotes: '',
      grossPay: 1274.00,
      netPay: 1199.00,
      status: 'pending',
      paymentDate: null,
      paymentMethod: 'direct-deposit',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { drivers: sampleDrivers, payroll: samplePayroll };
};

interface DriverPayrollToolProps {
  uiConfig?: UIConfig;
}

export const DriverPayrollTool: React.FC<DriverPayrollToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('payroll');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddPayroll, setShowAddPayroll] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollEntry | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // UseToolData hooks
  const {
    data: payrollEntries,
    addItem: addPayrollEntry,
    updateItem: updatePayrollEntry,
    deleteItem: deletePayrollEntry,
    isLoading: payrollLoading,
    isSaving: payrollSaving,
    isSynced: payrollSynced,
    lastSaved: payrollLastSaved,
    syncError: payrollSyncError,
    forceSync: forcePayrollSync,
  } = useToolData<PayrollEntry>('driver-payroll-entries', [], payrollColumns);

  const {
    data: drivers,
    addItem: addDriver,
    updateItem: updateDriver,
    deleteItem: deleteDriver,
    isLoading: driversLoading,
  } = useToolData<Driver>('driver-payroll-drivers', [], driverColumns);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData && Object.keys(uiConfig.prefillData).length > 0) {
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  // Load sample data if empty
  useEffect(() => {
    if (!payrollLoading && !driversLoading && payrollEntries.length === 0 && drivers.length === 0) {
      const sample = generateSampleData();
      sample.drivers.forEach(d => addDriver(d));
      sample.payroll.forEach(p => addPayrollEntry(p));
    }
  }, [payrollLoading, driversLoading, payrollEntries.length, drivers.length, addDriver, addPayrollEntry]);

  // New payroll form state
  const [newPayroll, setNewPayroll] = useState<Partial<PayrollEntry>>({
    driverId: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    hoursWorked: 0,
    ridesCompleted: 0,
    totalFares: 0,
    bonuses: 0,
    tips: 0,
    deductions: 0,
    deductionNotes: '',
    paymentMethod: 'direct-deposit',
    notes: '',
  });

  // Calculate payroll based on driver settings
  const calculatePayroll = (entry: Partial<PayrollEntry>, driver: Driver | undefined) => {
    if (!driver) return { commissionEarned: 0, hourlyEarnings: 0, grossPay: 0, netPay: 0 };

    const commissionEarned = (entry.totalFares || 0) * (driver.commissionRate / 100);
    const hourlyEarnings = (entry.hoursWorked || 0) * driver.hourlyRate;
    const grossPay = commissionEarned + hourlyEarnings + (entry.bonuses || 0) + (entry.tips || 0);
    const netPay = grossPay - (entry.deductions || 0);

    return { commissionEarned, hourlyEarnings, grossPay, netPay };
  };

  // Filtered payroll entries
  const filteredPayroll = useMemo(() => {
    return payrollEntries.filter(entry => {
      const matchesSearch = entry.driverName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payrollEntries, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalPending = payrollEntries.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netPay, 0);
    const totalApproved = payrollEntries.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.netPay, 0);
    const totalPaid = payrollEntries.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.netPay, 0);
    const activeDrivers = drivers.filter(d => d.status === 'active').length;
    return { totalPending, totalApproved, totalPaid, activeDrivers };
  }, [payrollEntries, drivers]);

  // Handle add payroll
  const handleAddPayroll = () => {
    if (!newPayroll.driverId || !newPayroll.payPeriodStart || !newPayroll.payPeriodEnd) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const driver = drivers.find(d => d.id === newPayroll.driverId);
    const calculated = calculatePayroll(newPayroll, driver);

    const entry: PayrollEntry = {
      id: generateId(),
      driverId: newPayroll.driverId,
      driverName: driver?.name || '',
      payPeriodStart: newPayroll.payPeriodStart,
      payPeriodEnd: newPayroll.payPeriodEnd,
      hoursWorked: newPayroll.hoursWorked || 0,
      ridesCompleted: newPayroll.ridesCompleted || 0,
      totalFares: newPayroll.totalFares || 0,
      commissionEarned: calculated.commissionEarned,
      hourlyEarnings: calculated.hourlyEarnings,
      bonuses: newPayroll.bonuses || 0,
      tips: newPayroll.tips || 0,
      deductions: newPayroll.deductions || 0,
      deductionNotes: newPayroll.deductionNotes || '',
      grossPay: calculated.grossPay,
      netPay: calculated.netPay,
      status: 'pending',
      paymentDate: null,
      paymentMethod: newPayroll.paymentMethod as PayrollEntry['paymentMethod'] || 'direct-deposit',
      notes: newPayroll.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addPayrollEntry(entry);
    setShowAddPayroll(false);
    setNewPayroll({
      driverId: '',
      payPeriodStart: '',
      payPeriodEnd: '',
      hoursWorked: 0,
      ridesCompleted: 0,
      totalFares: 0,
      bonuses: 0,
      tips: 0,
      deductions: 0,
      deductionNotes: '',
      paymentMethod: 'direct-deposit',
      notes: '',
    });
  };

  // Handle status update
  const handleStatusUpdate = (id: string, newStatus: PayrollEntry['status']) => {
    const updates: Partial<PayrollEntry> = { status: newStatus, updatedAt: new Date().toISOString() };
    if (newStatus === 'paid') {
      updates.paymentDate = new Date().toISOString();
    }
    updatePayrollEntry(id, updates);
  };

  const getStatusColor = (status: string) => {
    const statusInfo = PAYROLL_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      blue: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      green: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      red: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    };
    return colors[statusInfo?.color || 'gray'];
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.driverPayroll.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.driverPayroll.driverPayroll', 'Driver Payroll')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.driverPayroll.manageDriverEarningsCommissionsAnd', 'Manage driver earnings, commissions, and payments')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="driver-payroll" toolName="Driver Payroll" />

              <SyncStatus
                isSynced={payrollSynced}
                isSaving={payrollSaving}
                lastSaved={payrollLastSaved}
                syncError={payrollSyncError}
                onForceSync={forcePayrollSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(payrollEntries, payrollColumns, { filename: 'driver-payroll' })}
                onExportExcel={() => exportToExcel(payrollEntries, payrollColumns, { filename: 'driver-payroll' })}
                onExportJSON={() => exportToJSON(payrollEntries, { filename: 'driver-payroll' })}
                onExportPDF={async () => await exportToPDF(payrollEntries, payrollColumns, { filename: 'driver-payroll', title: 'Driver Payroll Report' })}
                onPrint={() => printData(payrollEntries, payrollColumns, { title: 'Driver Payroll' })}
                onCopyToClipboard={async () => await copyUtil(payrollEntries, payrollColumns, 'tab')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{t('tools.driverPayroll.pending', 'Pending')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                ${stats.totalPending.toFixed(2)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-500" />
                <span className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{t('tools.driverPayroll.approved', 'Approved')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                ${stats.totalApproved.toFixed(2)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>{t('tools.driverPayroll.paidThisPeriod', 'Paid This Period')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                ${stats.totalPaid.toFixed(2)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                <span className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{t('tools.driverPayroll.activeDrivers', 'Active Drivers')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                {stats.activeDrivers}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'payroll', label: 'Payroll', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'drivers', label: 'Drivers', icon: <User className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payroll Tab */}
        {activeTab === 'payroll' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.driverPayroll.searchByDriverName', 'Search by driver name...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="all">{t('tools.driverPayroll.allStatuses', 'All Statuses')}</option>
                {PAYROLL_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddPayroll(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.driverPayroll.newPayrollEntry2', 'New Payroll Entry')}
              </button>
            </div>

            {/* Payroll Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    <th className="text-left py-3 px-4 text-sm font-medium">{t('tools.driverPayroll.driver', 'Driver')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">{t('tools.driverPayroll.period', 'Period')}</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">{t('tools.driverPayroll.hours', 'Hours')}</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">{t('tools.driverPayroll.rides', 'Rides')}</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">{t('tools.driverPayroll.fares', 'Fares')}</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">{t('tools.driverPayroll.grossPay', 'Gross Pay')}</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">{t('tools.driverPayroll.netPay', 'Net Pay')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">{t('tools.driverPayroll.status', 'Status')}</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">{t('tools.driverPayroll.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={`py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{t('tools.driverPayroll.noPayrollEntriesFound', 'No payroll entries found')}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayroll.map((entry) => (
                      <tr key={entry.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <span className="font-medium">{entry.driverName}</span>
                        </td>
                        <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {new Date(entry.payPeriodStart).toLocaleDateString()} - {new Date(entry.payPeriodEnd).toLocaleDateString()}
                        </td>
                        <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {entry.hoursWorked}
                        </td>
                        <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {entry.ridesCompleted}
                        </td>
                        <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          ${entry.totalFares.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          ${entry.grossPay.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${entry.netPay.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(entry.status)}`}>
                            {PAYROLL_STATUSES.find(s => s.value === entry.status)?.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {entry.status === 'pending' && (
                              <button
                                onClick={() => handleStatusUpdate(entry.id, 'approved')}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                {t('tools.driverPayroll.approve', 'Approve')}
                              </button>
                            )}
                            {entry.status === 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(entry.id, 'paid')}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                {t('tools.driverPayroll.markPaid', 'Mark Paid')}
                              </button>
                            )}
                            <button
                              onClick={() => deletePayrollEntry(entry.id)}
                              className="p-1 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.driverPayroll.driverManagement', 'Driver Management')}
              </h2>
              <button
                onClick={() => setShowAddDriver(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.driverPayroll.addDriver', 'Add Driver')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{driver.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{driver.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      driver.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : driver.status === 'on-leave'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status}
                    </span>
                  </div>
                  <div className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      <span>{driver.vehiclePlate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {PAYMENT_TYPES.find(p => p.value === driver.paymentType)?.label}
                        {driver.hourlyRate > 0 && ` - $${driver.hourlyRate}/hr`}
                        {driver.commissionRate > 0 && ` - ${driver.commissionRate}%`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Hired: {new Date(driver.hireDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.driverPayroll.payrollSummary', 'Payroll Summary')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.driverPayroll.totalPayrollThisPeriod', 'Total Payroll This Period')}
                </h3>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${payrollEntries.reduce((sum, p) => sum + p.netPay, 0).toFixed(2)}
                </p>
                <div className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Entries: {payrollEntries.length}</p>
                  <p>Drivers: {new Set(payrollEntries.map(p => p.driverId)).size}</p>
                </div>
              </div>
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.driverPayroll.averageEarnings', 'Average Earnings')}
                </h3>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${payrollEntries.length > 0
                    ? (payrollEntries.reduce((sum, p) => sum + p.netPay, 0) / payrollEntries.length).toFixed(2)
                    : '0.00'
                  }
                </p>
                <div className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>{t('tools.driverPayroll.perEntry', 'Per entry')}</p>
                </div>
              </div>
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.driverPayroll.totalRidesHours', 'Total Rides & Hours')}
                </h3>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {payrollEntries.reduce((sum, p) => sum + p.ridesCompleted, 0)}
                </p>
                <div className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>{t('tools.driverPayroll.ridesCompleted', 'Rides completed')}</p>
                  <p>{payrollEntries.reduce((sum, p) => sum + p.hoursWorked, 0)} hours worked</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Payroll Modal */}
        {showAddPayroll && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.driverPayroll.newPayrollEntry', 'New Payroll Entry')}</h2>
                <button onClick={() => setShowAddPayroll(false)}>
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.driverPayroll.driver2', 'Driver *')}
                  </label>
                  <select
                    value={newPayroll.driverId || ''}
                    onChange={(e) => setNewPayroll({ ...newPayroll, driverId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.driverPayroll.selectDriver', 'Select Driver')}</option>
                    {drivers.filter(d => d.status === 'active').map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.driverPayroll.periodStart', 'Period Start *')}
                    </label>
                    <input
                      type="date"
                      value={newPayroll.payPeriodStart || ''}
                      onChange={(e) => setNewPayroll({ ...newPayroll, payPeriodStart: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.driverPayroll.periodEnd', 'Period End *')}
                    </label>
                    <input
                      type="date"
                      value={newPayroll.payPeriodEnd || ''}
                      onChange={(e) => setNewPayroll({ ...newPayroll, payPeriodEnd: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.driverPayroll.hoursWorked', 'Hours Worked')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={newPayroll.hoursWorked || 0}
                      onChange={(e) => setNewPayroll({ ...newPayroll, hoursWorked: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.driverPayroll.ridesCompleted2', 'Rides Completed')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newPayroll.ridesCompleted || 0}
                      onChange={(e) => setNewPayroll({ ...newPayroll, ridesCompleted: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.driverPayroll.totalFares', 'Total Fares ($)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPayroll.totalFares || 0}
                    onChange={(e) => setNewPayroll({ ...newPayroll, totalFares: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.driverPayroll.bonuses', 'Bonuses ($)')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPayroll.bonuses || 0}
                      onChange={(e) => setNewPayroll({ ...newPayroll, bonuses: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.driverPayroll.tips', 'Tips ($)')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPayroll.tips || 0}
                      onChange={(e) => setNewPayroll({ ...newPayroll, tips: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.driverPayroll.deductions', 'Deductions ($)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPayroll.deductions || 0}
                    onChange={(e) => setNewPayroll({ ...newPayroll, deductions: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.driverPayroll.paymentMethod', 'Payment Method')}
                  </label>
                  <select
                    value={newPayroll.paymentMethod || 'direct-deposit'}
                    onChange={(e) => setNewPayroll({ ...newPayroll, paymentMethod: e.target.value as PayrollEntry['paymentMethod'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.driverPayroll.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newPayroll.notes || ''}
                    onChange={(e) => setNewPayroll({ ...newPayroll, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddPayroll(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.driverPayroll.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddPayroll}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                >
                  {t('tools.driverPayroll.addEntry', 'Add Entry')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
            {validationMessage}
          </div>
        )}
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default DriverPayrollTool;
