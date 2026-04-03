import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Calendar,
  TrendingUp,
  Users,
  Heart,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  FileText,
  PieChart,
  CreditCard,
  Banknote,
  Gift,
  Target,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useToolData, ColumnConfig } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';

interface UIConfig {
  prefillData?: {
    donorName?: string;
    amount?: number;
    category?: string;
    paymentMethod?: string;
    fundDesignation?: string;
    date?: string;
  };
}

interface Tithe {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  date: string;
  category: 'tithe' | 'offering' | 'special_gift' | 'building_fund' | 'missions' | 'benevolence' | 'other';
  paymentMethod: 'cash' | 'check' | 'card' | 'bank_transfer' | 'online' | 'other';
  checkNumber?: string;
  fundDesignation?: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  notes?: string;
  receiptSent: boolean;
  taxDeductible: boolean;
  createdAt: string;
}

interface Donor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  memberSince: string;
  totalGiven: number;
  lastGiftDate?: string;
  preferredPaymentMethod?: string;
  isActive: boolean;
  envelopeNumber?: string;
  notes?: string;
}

interface Pledge {
  id: string;
  donorId: string;
  donorName: string;
  campaignName: string;
  pledgeAmount: number;
  amountFulfilled: number;
  startDate: string;
  endDate: string;
  frequency: 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  status: 'active' | 'fulfilled' | 'cancelled' | 'overdue';
  notes?: string;
}

interface Fund {
  id: string;
  name: string;
  description?: string;
  targetAmount?: number;
  currentAmount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  category: 'general' | 'building' | 'missions' | 'youth' | 'outreach' | 'benevolence' | 'special';
}

type TabType = 'dashboard' | 'contributions' | 'donors' | 'pledges' | 'funds';

const defaultTithes: Tithe[] = [];
const defaultDonors: Donor[] = [];
const defaultPledges: Pledge[] = [];
const defaultFunds: Fund[] = [];

const titheColumns: ColumnConfig[] = [
  { key: 'donorName', header: 'Donor', width: 20 },
  { key: 'amount', header: 'Amount', width: 12, format: (v) => `$${Number(v).toFixed(2)}` },
  { key: 'date', header: 'Date', width: 12 },
  { key: 'category', header: 'Category', width: 12 },
  { key: 'paymentMethod', header: 'Payment Method', width: 12 },
  { key: 'fundDesignation', header: 'Fund', width: 12 },
  { key: 'receiptSent', header: 'Receipt Sent', width: 10, format: (v) => v ? 'Yes' : 'No' },
  { key: 'taxDeductible', header: 'Tax Deductible', width: 10, format: (v) => v ? 'Yes' : 'No' },
];

const donorColumns: ColumnConfig[] = [
  { key: 'name', header: 'Name', width: 20 },
  { key: 'email', header: 'Email', width: 20 },
  { key: 'phone', header: 'Phone', width: 15 },
  { key: 'totalGiven', header: 'Total Given', width: 15, format: (v) => `$${Number(v).toFixed(2)}` },
  { key: 'lastGiftDate', header: 'Last Gift', width: 12 },
  { key: 'isActive', header: 'Active', width: 10, format: (v) => v ? 'Yes' : 'No' },
];

const pledgeColumns: ColumnConfig[] = [
  { key: 'donorName', header: 'Donor', width: 18 },
  { key: 'campaignName', header: 'Campaign', width: 18 },
  { key: 'pledgeAmount', header: 'Pledge Amount', width: 14, format: (v) => `$${Number(v).toFixed(2)}` },
  { key: 'amountFulfilled', header: 'Fulfilled', width: 14, format: (v) => `$${Number(v).toFixed(2)}` },
  { key: 'startDate', header: 'Start', width: 10 },
  { key: 'endDate', header: 'End', width: 10 },
  { key: 'status', header: 'Status', width: 10 },
];

const fundColumns: ColumnConfig[] = [
  { key: 'name', header: 'Fund Name', width: 20 },
  { key: 'category', header: 'Category', width: 15 },
  { key: 'targetAmount', header: 'Target', width: 15, format: (v) => v ? `$${Number(v).toFixed(2)}` : 'N/A' },
  { key: 'currentAmount', header: 'Current', width: 15, format: (v) => `$${Number(v).toFixed(2)}` },
  { key: 'isActive', header: 'Active', width: 10, format: (v) => v ? 'Yes' : 'No' },
];

export const TithingTrackerTool: React.FC<{ uiConfig?: UIConfig }> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTitheModal, setShowTitheModal] = useState(false);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [editingTithe, setEditingTithe] = useState<Tithe | null>(null);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [editingPledge, setEditingPledge] = useState<Pledge | null>(null);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // useToolData hooks for backend sync
  const tithesToolData = useToolData<Tithe>('tithing-tracker-tithes', defaultTithes, titheColumns);
  const donorsToolData = useToolData<Donor>('tithing-tracker-donors', defaultDonors, donorColumns);
  const pledgesToolData = useToolData<Pledge>('tithing-tracker-pledges', defaultPledges, pledgeColumns);
  const fundsToolData = useToolData<Fund>('tithing-tracker-funds', defaultFunds, fundColumns);

  const {
    data: tithes,
    setData: setTithes,
    addItem: addTithe,
    updateItem: updateTithe,
    deleteItem: deleteTithe,
    isSynced: tithesSynced,
    isSaving: tithesSaving,
    lastSaved: tithesLastSaved,
    syncError: tithesSyncError,
    forceSync: forceTithesSync,
    exportToCSV: exportTithesCSV,
    exportToExcel: exportTithesExcel,
    exportToJSON: exportTithesJSON,
    exportToPDF: exportTithesPDF,
    printData: printTithes,
    copyToClipboard: copyTithesToClipboard,
  } = tithesToolData;

  const {
    data: donors,
    setData: setDonors,
    addItem: addDonor,
    updateItem: updateDonor,
    deleteItem: deleteDonor,
    isSynced: donorsSynced,
    isSaving: donorsSaving,
    lastSaved: donorsLastSaved,
    syncError: donorsSyncError,
    forceSync: forceDonorsSync,
    exportToCSV: exportDonorsCSV,
    exportToExcel: exportDonorsExcel,
    exportToJSON: exportDonorsJSON,
    exportToPDF: exportDonorsPDF,
    printData: printDonors,
    copyToClipboard: copyDonorsToClipboard,
  } = donorsToolData;

  const {
    data: pledges,
    setData: setPledges,
    addItem: addPledge,
    updateItem: updatePledge,
    deleteItem: deletePledge,
    isSynced: pledgesSynced,
    isSaving: pledgesSaving,
    lastSaved: pledgesLastSaved,
    syncError: pledgesSyncError,
    forceSync: forcePledgesSync,
    exportToCSV: exportPledgesCSV,
    exportToExcel: exportPledgesExcel,
    exportToJSON: exportPledgesJSON,
    exportToPDF: exportPledgesPDF,
    printData: printPledges,
    copyToClipboard: copyPledgesToClipboard,
  } = pledgesToolData;

  const {
    data: funds,
    setData: setFunds,
    addItem: addFund,
    updateItem: updateFund,
    deleteItem: deleteFund,
    isSynced: fundsSynced,
    isSaving: fundsSaving,
    lastSaved: fundsLastSaved,
    syncError: fundsSyncError,
    forceSync: forceFundsSync,
    exportToCSV: exportFundsCSV,
    exportToExcel: exportFundsExcel,
    exportToJSON: exportFundsJSON,
    exportToPDF: exportFundsPDF,
    printData: printFunds,
    copyToClipboard: copyFundsToClipboard,
  } = fundsToolData;

  // Form states
  const [titheForm, setTitheForm] = useState<Partial<Tithe>>({
    donorName: uiConfig?.prefillData?.donorName || '',
    amount: uiConfig?.prefillData?.amount || 0,
    category: (uiConfig?.prefillData?.category as Tithe['category']) || 'tithe',
    paymentMethod: (uiConfig?.prefillData?.paymentMethod as Tithe['paymentMethod']) || 'cash',
    fundDesignation: uiConfig?.prefillData?.fundDesignation || '',
    date: uiConfig?.prefillData?.date || new Date().toISOString().split('T')[0],
    isRecurring: false,
    receiptSent: false,
    taxDeductible: true,
  });

  const [donorForm, setDonorForm] = useState<Partial<Donor>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    memberSince: new Date().toISOString().split('T')[0],
    totalGiven: 0,
    isActive: true,
  });

  const [pledgeForm, setPledgeForm] = useState<Partial<Pledge>>({
    donorName: '',
    campaignName: '',
    pledgeAmount: 0,
    amountFulfilled: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    frequency: 'monthly',
    status: 'active',
  });

  const [fundForm, setFundForm] = useState<Partial<Fund>>({
    name: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    isActive: true,
    category: 'general',
  });

  // Statistics calculations
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthTithes = tithes.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const lastMonthTithes = tithes.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const thisYearTithes = tithes.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === thisYear;
    });

    const thisMonthTotal = thisMonthTithes.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthTotal = lastMonthTithes.reduce((sum, t) => sum + t.amount, 0);
    const thisYearTotal = thisYearTithes.reduce((sum, t) => sum + t.amount, 0);
    const allTimeTotal = tithes.reduce((sum, t) => sum + t.amount, 0);

    const monthlyGrowth = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
      : '0';

    const categoryBreakdown = tithes.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const activePledges = pledges.filter(p => p.status === 'active');
    const totalPledged = activePledges.reduce((sum, p) => sum + p.pledgeAmount, 0);
    const totalFulfilled = activePledges.reduce((sum, p) => sum + p.amountFulfilled, 0);

    const activeFunds = funds.filter(f => f.isActive);
    const totalFundGoal = activeFunds.reduce((sum, f) => sum + (f.targetAmount || 0), 0);
    const totalFundCurrent = activeFunds.reduce((sum, f) => sum + f.currentAmount, 0);

    return {
      thisMonthTotal,
      lastMonthTotal,
      thisYearTotal,
      allTimeTotal,
      monthlyGrowth,
      categoryBreakdown,
      totalDonors: donors.length,
      activeDonors: donors.filter(d => d.isActive).length,
      totalPledged,
      totalFulfilled,
      pledgeFulfillmentRate: totalPledged > 0 ? ((totalFulfilled / totalPledged) * 100).toFixed(1) : '0',
      activePledgesCount: activePledges.length,
      totalFundGoal,
      totalFundCurrent,
      fundProgress: totalFundGoal > 0 ? ((totalFundCurrent / totalFundGoal) * 100).toFixed(1) : '0',
      averageGift: tithes.length > 0 ? allTimeTotal / tithes.length : 0,
      thisMonthCount: thisMonthTithes.length,
    };
  }, [tithes, donors, pledges, funds]);

  // Filtered and sorted tithes
  const filteredTithes = useMemo(() => {
    let filtered = [...tithes];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.donorName.toLowerCase().includes(term) ||
        t.fundDesignation?.toLowerCase().includes(term) ||
        t.notes?.toLowerCase().includes(term)
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    if (filterDateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      switch (filterDateRange) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      filtered = filtered.filter(t => new Date(t.date) >= startDate);
    }

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'donorName':
          aVal = a.donorName.toLowerCase();
          bVal = b.donorName.toLowerCase();
          break;
        default:
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
      }
      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    return filtered;
  }, [tithes, searchTerm, filterCategory, filterDateRange, sortField, sortDirection]);

  // Handlers
  const handleSaveTithe = () => {
    if (!titheForm.donorName || !titheForm.amount) return;

    if (editingTithe) {
      updateTithe(editingTithe.id, { ...editingTithe, ...titheForm } as Tithe);
    } else {
      const newTithe: Tithe = {
        id: `tithe-${Date.now()}`,
        donorId: `donor-${Date.now()}`,
        donorName: titheForm.donorName!,
        amount: titheForm.amount!,
        date: titheForm.date || new Date().toISOString().split('T')[0],
        category: titheForm.category || 'tithe',
        paymentMethod: titheForm.paymentMethod || 'cash',
        checkNumber: titheForm.checkNumber,
        fundDesignation: titheForm.fundDesignation,
        isRecurring: titheForm.isRecurring || false,
        recurringFrequency: titheForm.recurringFrequency,
        notes: titheForm.notes,
        receiptSent: titheForm.receiptSent || false,
        taxDeductible: titheForm.taxDeductible ?? true,
        createdAt: new Date().toISOString(),
      };
      addTithe(newTithe);

      // Update fund current amount if designated
      if (titheForm.fundDesignation) {
        const fund = funds.find(f => f.name === titheForm.fundDesignation);
        if (fund) {
          updateFund(fund.id, { ...fund, currentAmount: fund.currentAmount + titheForm.amount! });
        }
      }
    }

    setShowTitheModal(false);
    setEditingTithe(null);
    resetTitheForm();
  };

  const handleSaveDonor = () => {
    if (!donorForm.name || !donorForm.email) return;

    if (editingDonor) {
      updateDonor(editingDonor.id, { ...editingDonor, ...donorForm } as Donor);
    } else {
      const newDonor: Donor = {
        id: `donor-${Date.now()}`,
        name: donorForm.name!,
        email: donorForm.email!,
        phone: donorForm.phone,
        address: donorForm.address,
        memberSince: donorForm.memberSince || new Date().toISOString().split('T')[0],
        totalGiven: donorForm.totalGiven || 0,
        preferredPaymentMethod: donorForm.preferredPaymentMethod,
        isActive: donorForm.isActive ?? true,
        envelopeNumber: donorForm.envelopeNumber,
        notes: donorForm.notes,
      };
      addDonor(newDonor);
    }

    setShowDonorModal(false);
    setEditingDonor(null);
    resetDonorForm();
  };

  const handleSavePledge = () => {
    if (!pledgeForm.donorName || !pledgeForm.campaignName || !pledgeForm.pledgeAmount) return;

    if (editingPledge) {
      updatePledge(editingPledge.id, { ...editingPledge, ...pledgeForm } as Pledge);
    } else {
      const newPledge: Pledge = {
        id: `pledge-${Date.now()}`,
        donorId: `donor-${Date.now()}`,
        donorName: pledgeForm.donorName!,
        campaignName: pledgeForm.campaignName!,
        pledgeAmount: pledgeForm.pledgeAmount!,
        amountFulfilled: pledgeForm.amountFulfilled || 0,
        startDate: pledgeForm.startDate || new Date().toISOString().split('T')[0],
        endDate: pledgeForm.endDate || '',
        frequency: pledgeForm.frequency || 'monthly',
        status: pledgeForm.status || 'active',
        notes: pledgeForm.notes,
      };
      addPledge(newPledge);
    }

    setShowPledgeModal(false);
    setEditingPledge(null);
    resetPledgeForm();
  };

  const handleSaveFund = () => {
    if (!fundForm.name) return;

    if (editingFund) {
      updateFund(editingFund.id, { ...editingFund, ...fundForm } as Fund);
    } else {
      const newFund: Fund = {
        id: `fund-${Date.now()}`,
        name: fundForm.name!,
        description: fundForm.description,
        targetAmount: fundForm.targetAmount,
        currentAmount: fundForm.currentAmount || 0,
        startDate: fundForm.startDate,
        endDate: fundForm.endDate,
        isActive: fundForm.isActive ?? true,
        category: fundForm.category || 'general',
      };
      addFund(newFund);
    }

    setShowFundModal(false);
    setEditingFund(null);
    resetFundForm();
  };

  const resetTitheForm = () => {
    setTitheForm({
      donorName: '',
      amount: 0,
      category: 'tithe',
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      receiptSent: false,
      taxDeductible: true,
    });
  };

  const resetDonorForm = () => {
    setDonorForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      memberSince: new Date().toISOString().split('T')[0],
      totalGiven: 0,
      isActive: true,
    });
  };

  const resetPledgeForm = () => {
    setPledgeForm({
      donorName: '',
      campaignName: '',
      pledgeAmount: 0,
      amountFulfilled: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      frequency: 'monthly',
      status: 'active',
    });
  };

  const resetFundForm = () => {
    setFundForm({
      name: '',
      description: '',
      targetAmount: 0,
      currentAmount: 0,
      isActive: true,
      category: 'general',
    });
  };

  const getCategoryColor = (category: Tithe['category']) => {
    const colors: Record<Tithe['category'], string> = {
      tithe: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      offering: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      special_gift: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      building_fund: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      missions: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      benevolence: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[category] || colors.other;
  };

  const getPaymentIcon = (method: Tithe['paymentMethod']) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'check': return <FileText className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Pledge['status']) => {
    const colors: Record<Pledge['status'], string> = {
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      fulfilled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      overdue: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[status] || colors.active;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Current sync status based on active tab
  const getCurrentSyncStatus = () => {
    switch (activeTab) {
      case 'contributions':
        return { isSynced: tithesSynced, isSaving: tithesSaving, lastSaved: tithesLastSaved, syncError: tithesSyncError, forceSync: forceTithesSync };
      case 'donors':
        return { isSynced: donorsSynced, isSaving: donorsSaving, lastSaved: donorsLastSaved, syncError: donorsSyncError, forceSync: forceDonorsSync };
      case 'pledges':
        return { isSynced: pledgesSynced, isSaving: pledgesSaving, lastSaved: pledgesLastSaved, syncError: pledgesSyncError, forceSync: forcePledgesSync };
      case 'funds':
        return { isSynced: fundsSynced, isSaving: fundsSaving, lastSaved: fundsLastSaved, syncError: fundsSyncError, forceSync: forceFundsSync };
      default:
        return { isSynced: tithesSynced, isSaving: tithesSaving, lastSaved: tithesLastSaved, syncError: tithesSyncError, forceSync: forceTithesSync };
    }
  };

  const getCurrentExportFunctions = () => {
    switch (activeTab) {
      case 'contributions':
        return { exportCSV: exportTithesCSV, exportExcel: exportTithesExcel, exportJSON: exportTithesJSON, exportPDF: exportTithesPDF, print: printTithes, copy: copyTithesToClipboard };
      case 'donors':
        return { exportCSV: exportDonorsCSV, exportExcel: exportDonorsExcel, exportJSON: exportDonorsJSON, exportPDF: exportDonorsPDF, print: printDonors, copy: copyDonorsToClipboard };
      case 'pledges':
        return { exportCSV: exportPledgesCSV, exportExcel: exportPledgesExcel, exportJSON: exportPledgesJSON, exportPDF: exportPledgesPDF, print: printPledges, copy: copyPledgesToClipboard };
      case 'funds':
        return { exportCSV: exportFundsCSV, exportExcel: exportFundsExcel, exportJSON: exportFundsJSON, exportPDF: exportFundsPDF, print: printFunds, copy: copyFundsToClipboard };
      default:
        return { exportCSV: exportTithesCSV, exportExcel: exportTithesExcel, exportJSON: exportTithesJSON, exportPDF: exportTithesPDF, print: printTithes, copy: copyTithesToClipboard };
    }
  };

  const syncStatus = getCurrentSyncStatus();
  const exportFns = getCurrentExportFunctions();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.tithingTracker.tithingDonationTracker', 'Tithing & Donation Tracker')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.manageTithesOfferingsAndDonations', 'Manage tithes, offerings, and donations')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="tithing-tracker" toolName="Tithing Tracker" />

              <SyncStatus
                isSynced={syncStatus.isSynced}
                isSaving={syncStatus.isSaving}
                lastSaved={syncStatus.lastSaved}
                syncError={syncStatus.syncError}
                onForceSync={syncStatus.forceSync}
              />
              <ExportDropdown
                onExportCSV={exportFns.exportCSV}
                onExportExcel={exportFns.exportExcel}
                onExportJSON={exportFns.exportJSON}
                onExportPDF={exportFns.exportPDF}
                onPrint={exportFns.print}
                onCopyToClipboard={exportFns.copy}
              />
              <button
                onClick={() => {
                  if (activeTab === 'contributions') {
                    resetTitheForm();
                    setShowTitheModal(true);
                  } else if (activeTab === 'donors') {
                    resetDonorForm();
                    setShowDonorModal(true);
                  } else if (activeTab === 'pledges') {
                    resetPledgeForm();
                    setShowPledgeModal(true);
                  } else if (activeTab === 'funds') {
                    resetFundForm();
                    setShowFundModal(true);
                  } else {
                    resetTitheForm();
                    setShowTitheModal(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {activeTab === 'donors' ? 'Add Donor' :
                   activeTab === 'pledges' ? 'Add Pledge' :
                   activeTab === 'funds' ? t('tools.tithingTracker.addFund', 'Add Fund') : t('tools.tithingTracker.recordContribution', 'Record Contribution')}
                </span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {(['dashboard', 'contributions', 'donors', 'pledges', 'funds'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.thisMonth', 'This Month')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.thisMonthTotal)}</p>
                    <p className={`text-sm ${Number(stats.monthlyGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(stats.monthlyGrowth) >= 0 ? '+' : ''}{stats.monthlyGrowth}% vs last month
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.yearToDate', 'Year to Date')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.thisYearTotal)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.thisMonthCount} contributions this month</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.activeDonors', 'Active Donors')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDonors}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalDonors} total registered</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.averageGift', 'Average Gift')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.averageGift)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.allTimeAverage', 'All time average')}</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Gift className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pledges & Funds Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pledge Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.tithingTracker.pledgeProgress', 'Pledge Progress')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.activePledges', 'Active Pledges')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.activePledgesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.totalPledged', 'Total Pledged')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(stats.totalPledged)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.amountFulfilled', 'Amount Fulfilled')}</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(stats.totalFulfilled)}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.fulfillmentRate', 'Fulfillment Rate')}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.pledgeFulfillmentRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(Number(stats.pledgeFulfillmentRate), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fund Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.tithingTracker.fundGoals', 'Fund Goals')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.activeFunds', 'Active Funds')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{funds.filter(f => f.isActive).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.totalGoal', 'Total Goal')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(stats.totalFundGoal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.currentTotal', 'Current Total')}</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(stats.totalFundCurrent)}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.overallProgress', 'Overall Progress')}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.fundProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(Number(stats.fundProgress), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tools.tithingTracker.givingByCategory', 'Giving by Category')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Object.entries(stats.categoryBreakdown).map(([category, amount]) => (
                  <div key={category} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{category.replace('_', ' ')}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Contributions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('tools.tithingTracker.recentContributions', 'Recent Contributions')}</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {tithes.slice(0, 5).map((tithe) => (
                  <div key={tithe.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {getPaymentIcon(tithe.paymentMethod)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{tithe.donorName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(tithe.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(tithe.amount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(tithe.category)}`}>
                        {tithe.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                {tithes.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    {t('tools.tithingTracker.noContributionsRecordedYet', 'No contributions recorded yet')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contributions Tab */}
        {activeTab === 'contributions' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tools.tithingTracker.searchContributions', 'Search contributions...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">{t('tools.tithingTracker.allCategories', 'All Categories')}</option>
                  <option value="tithe">{t('tools.tithingTracker.tithe', 'Tithe')}</option>
                  <option value="offering">{t('tools.tithingTracker.offering', 'Offering')}</option>
                  <option value="special_gift">{t('tools.tithingTracker.specialGift', 'Special Gift')}</option>
                  <option value="building_fund">{t('tools.tithingTracker.buildingFund', 'Building Fund')}</option>
                  <option value="missions">{t('tools.tithingTracker.missions', 'Missions')}</option>
                  <option value="benevolence">{t('tools.tithingTracker.benevolence', 'Benevolence')}</option>
                  <option value="other">{t('tools.tithingTracker.other', 'Other')}</option>
                </select>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">{t('tools.tithingTracker.allTime', 'All Time')}</option>
                  <option value="week">{t('tools.tithingTracker.lastWeek', 'Last Week')}</option>
                  <option value="month">{t('tools.tithingTracker.lastMonth', 'Last Month')}</option>
                  <option value="quarter">{t('tools.tithingTracker.lastQuarter', 'Last Quarter')}</option>
                  <option value="year">{t('tools.tithingTracker.lastYear', 'Last Year')}</option>
                </select>
              </div>
            </div>

            {/* Contributions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => {
                          if (sortField === 'donorName') setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                          else { setSortField('donorName'); setSortDirection('asc'); }
                        }}
                      >
                        Donor {sortField === 'donorName' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => {
                          if (sortField === 'amount') setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                          else { setSortField('amount'); setSortDirection('desc'); }
                        }}
                      >
                        Amount {sortField === 'amount' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => {
                          if (sortField === 'date') setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                          else { setSortField('date'); setSortDirection('desc'); }
                        }}
                      >
                        Date {sortField === 'date' && (sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.tithingTracker.category', 'Category')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.tithingTracker.payment', 'Payment')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.tithingTracker.fund', 'Fund')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.tithingTracker.status', 'Status')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.tithingTracker.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTithes.map((tithe) => (
                      <tr key={tithe.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">{tithe.donorName}</div>
                          {tithe.isRecurring && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">Recurring ({tithe.recurringFrequency})</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{formatCurrency(tithe.amount)}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(tithe.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(tithe.category)}`}>
                            {tithe.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            {getPaymentIcon(tithe.paymentMethod)}
                            <span className="capitalize">{tithe.paymentMethod.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{tithe.fundDesignation || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {tithe.receiptSent && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {t('tools.tithingTracker.receiptSent2', 'Receipt Sent')}
                              </span>
                            )}
                            {tithe.taxDeductible && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {t('tools.tithingTracker.taxDeductible2', 'Tax Deductible')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingTithe(tithe);
                                setTitheForm(tithe);
                                setShowTitheModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteTithe(tithe.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTithes.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {t('tools.tithingTracker.noContributionsFound', 'No contributions found')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Donors Tab */}
        {activeTab === 'donors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors.map((donor) => (
              <div key={donor.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {donor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{donor.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{donor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingDonor(donor);
                        setDonorForm(donor);
                        setShowDonorModal(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDonor(donor.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {donor.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.phone', 'Phone')}</span>
                      <span className="text-gray-900 dark:text-white">{donor.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.totalGiven', 'Total Given')}</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(donor.totalGiven)}</span>
                  </div>
                  {donor.lastGiftDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.lastGift', 'Last Gift')}</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(donor.lastGiftDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.memberSince', 'Member Since')}</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(donor.memberSince)}</span>
                  </div>
                  {donor.envelopeNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.envelope', 'Envelope #')}</span>
                      <span className="text-gray-900 dark:text-white">{donor.envelopeNumber}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-xs px-2 py-1 rounded-full ${donor.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
                    {donor.isActive ? t('tools.tithingTracker.active2', 'Active') : t('tools.tithingTracker.inactive', 'Inactive')}
                  </span>
                </div>
              </div>
            ))}
            {donors.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl">
                {t('tools.tithingTracker.noDonorsRegisteredYetClick', 'No donors registered yet. Click "Add Donor" to add one.')}
              </div>
            )}
          </div>
        )}

        {/* Pledges Tab */}
        {activeTab === 'pledges' && (
          <div className="space-y-4">
            {pledges.map((pledge) => {
              const progress = pledge.pledgeAmount > 0 ? (pledge.amountFulfilled / pledge.pledgeAmount) * 100 : 0;
              return (
                <div key={pledge.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{pledge.donorName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{pledge.campaignName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(pledge.status)}`}>
                        {pledge.status}
                      </span>
                      <button
                        onClick={() => {
                          setEditingPledge(pledge);
                          setPledgeForm(pledge);
                          setShowPledgeModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePledge(pledge.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.pledgeAmount', 'Pledge Amount')}</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(pledge.pledgeAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.fulfilled', 'Fulfilled')}</p>
                      <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(pledge.amountFulfilled)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.remaining', 'Remaining')}</p>
                      <p className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(pledge.pledgeAmount - pledge.amountFulfilled)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.frequency', 'Frequency')}</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{pledge.frequency.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.progress', 'Progress')}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Start: {formatDate(pledge.startDate)}</span>
                    {pledge.endDate && <span>End: {formatDate(pledge.endDate)}</span>}
                  </div>
                </div>
              );
            })}
            {pledges.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl">
                {t('tools.tithingTracker.noPledgesRecordedYetClick', 'No pledges recorded yet. Click "Add Pledge" to create one.')}
              </div>
            )}
          </div>
        )}

        {/* Funds Tab */}
        {activeTab === 'funds' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {funds.map((fund) => {
              const progress = fund.targetAmount ? (fund.currentAmount / fund.targetAmount) * 100 : 0;
              return (
                <div key={fund.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{fund.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{fund.category} Fund</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${fund.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {fund.isActive ? t('tools.tithingTracker.active3', 'Active') : t('tools.tithingTracker.inactive2', 'Inactive')}
                      </span>
                      <button
                        onClick={() => {
                          setEditingFund(fund);
                          setFundForm(fund);
                          setShowFundModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFund(fund.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {fund.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{fund.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.current', 'Current')}</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(fund.currentAmount)}</p>
                    </div>
                    {fund.targetAmount && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.goal', 'Goal')}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(fund.targetAmount)}</p>
                      </div>
                    )}
                  </div>
                  {fund.targetAmount && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.tithingTracker.progress2', 'Progress')}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${progress >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {funds.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl">
                {t('tools.tithingTracker.noFundsCreatedYetClick', 'No funds created yet. Click "Add Fund" to create one.')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tithe Modal */}
      {showTitheModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTithe ? t('tools.tithingTracker.editContribution', 'Edit Contribution') : t('tools.tithingTracker.recordContribution2', 'Record Contribution')}
              </h2>
              <button onClick={() => { setShowTitheModal(false); setEditingTithe(null); resetTitheForm(); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.donorName', 'Donor Name *')}</label>
                <input
                  type="text"
                  value={titheForm.donorName || ''}
                  onChange={(e) => setTitheForm({ ...titheForm, donorName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.enterDonorName', 'Enter donor name')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.amount', 'Amount *')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={titheForm.amount || ''}
                    onChange={(e) => setTitheForm({ ...titheForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.date', 'Date *')}</label>
                  <input
                    type="date"
                    value={titheForm.date || ''}
                    onChange={(e) => setTitheForm({ ...titheForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.category2', 'Category')}</label>
                  <select
                    value={titheForm.category || 'tithe'}
                    onChange={(e) => setTitheForm({ ...titheForm, category: e.target.value as Tithe['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="tithe">{t('tools.tithingTracker.tithe2', 'Tithe')}</option>
                    <option value="offering">{t('tools.tithingTracker.offering2', 'Offering')}</option>
                    <option value="special_gift">{t('tools.tithingTracker.specialGift2', 'Special Gift')}</option>
                    <option value="building_fund">{t('tools.tithingTracker.buildingFund2', 'Building Fund')}</option>
                    <option value="missions">{t('tools.tithingTracker.missions2', 'Missions')}</option>
                    <option value="benevolence">{t('tools.tithingTracker.benevolence2', 'Benevolence')}</option>
                    <option value="other">{t('tools.tithingTracker.other2', 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.paymentMethod', 'Payment Method')}</label>
                  <select
                    value={titheForm.paymentMethod || 'cash'}
                    onChange={(e) => setTitheForm({ ...titheForm, paymentMethod: e.target.value as Tithe['paymentMethod'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="cash">{t('tools.tithingTracker.cash', 'Cash')}</option>
                    <option value="check">{t('tools.tithingTracker.check', 'Check')}</option>
                    <option value="card">{t('tools.tithingTracker.card', 'Card')}</option>
                    <option value="bank_transfer">{t('tools.tithingTracker.bankTransfer', 'Bank Transfer')}</option>
                    <option value="online">{t('tools.tithingTracker.online', 'Online')}</option>
                    <option value="other">{t('tools.tithingTracker.other3', 'Other')}</option>
                  </select>
                </div>
              </div>
              {titheForm.paymentMethod === 'check' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.checkNumber', 'Check Number')}</label>
                  <input
                    type="text"
                    value={titheForm.checkNumber || ''}
                    onChange={(e) => setTitheForm({ ...titheForm, checkNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('tools.tithingTracker.enterCheckNumber', 'Enter check number')}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.fundDesignation', 'Fund Designation')}</label>
                <select
                  value={titheForm.fundDesignation || ''}
                  onChange={(e) => setTitheForm({ ...titheForm, fundDesignation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('tools.tithingTracker.generalFund', 'General Fund')}</option>
                  {funds.filter(f => f.isActive).map(fund => (
                    <option key={fund.id} value={fund.name}>{fund.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={titheForm.isRecurring || false}
                    onChange={(e) => setTitheForm({ ...titheForm, isRecurring: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.tithingTracker.recurring', 'Recurring')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={titheForm.receiptSent || false}
                    onChange={(e) => setTitheForm({ ...titheForm, receiptSent: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.tithingTracker.receiptSent', 'Receipt Sent')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={titheForm.taxDeductible ?? true}
                    onChange={(e) => setTitheForm({ ...titheForm, taxDeductible: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.tithingTracker.taxDeductible', 'Tax Deductible')}</span>
                </label>
              </div>
              {titheForm.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.recurringFrequency', 'Recurring Frequency')}</label>
                  <select
                    value={titheForm.recurringFrequency || 'monthly'}
                    onChange={(e) => setTitheForm({ ...titheForm, recurringFrequency: e.target.value as Tithe['recurringFrequency'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="weekly">{t('tools.tithingTracker.weekly', 'Weekly')}</option>
                    <option value="biweekly">{t('tools.tithingTracker.biWeekly', 'Bi-weekly')}</option>
                    <option value="monthly">{t('tools.tithingTracker.monthly', 'Monthly')}</option>
                    <option value="quarterly">{t('tools.tithingTracker.quarterly', 'Quarterly')}</option>
                    <option value="annually">{t('tools.tithingTracker.annually', 'Annually')}</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.notes', 'Notes')}</label>
                <textarea
                  value={titheForm.notes || ''}
                  onChange={(e) => setTitheForm({ ...titheForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.additionalNotes', 'Additional notes...')}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowTitheModal(false); setEditingTithe(null); resetTitheForm(); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('tools.tithingTracker.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveTithe}
                disabled={!titheForm.donorName || !titheForm.amount}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTithe ? t('tools.tithingTracker.update', 'Update') : t('tools.tithingTracker.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donor Modal */}
      {showDonorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingDonor ? t('tools.tithingTracker.editDonor', 'Edit Donor') : t('tools.tithingTracker.addDonor', 'Add Donor')}
              </h2>
              <button onClick={() => { setShowDonorModal(false); setEditingDonor(null); resetDonorForm(); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.name', 'Name *')}</label>
                <input
                  type="text"
                  value={donorForm.name || ''}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.enterDonorName2', 'Enter donor name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.email', 'Email *')}</label>
                <input
                  type="email"
                  value={donorForm.email || ''}
                  onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.enterEmailAddress', 'Enter email address')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.phone2', 'Phone')}</label>
                  <input
                    type="tel"
                    value={donorForm.phone || ''}
                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('tools.tithingTracker.phoneNumber', 'Phone number')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.envelopeNumber', 'Envelope Number')}</label>
                  <input
                    type="text"
                    value={donorForm.envelopeNumber || ''}
                    onChange={(e) => setDonorForm({ ...donorForm, envelopeNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('tools.tithingTracker.envelope2', 'Envelope #')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.address', 'Address')}</label>
                <textarea
                  value={donorForm.address || ''}
                  onChange={(e) => setDonorForm({ ...donorForm, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.fullAddress', 'Full address')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.memberSince2', 'Member Since')}</label>
                <input
                  type="date"
                  value={donorForm.memberSince || ''}
                  onChange={(e) => setDonorForm({ ...donorForm, memberSince: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.notes2', 'Notes')}</label>
                <textarea
                  value={donorForm.notes || ''}
                  onChange={(e) => setDonorForm({ ...donorForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.additionalNotes2', 'Additional notes...')}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={donorForm.isActive ?? true}
                  onChange={(e) => setDonorForm({ ...donorForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.tithingTracker.activeDonor', 'Active Donor')}</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowDonorModal(false); setEditingDonor(null); resetDonorForm(); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('tools.tithingTracker.cancel2', 'Cancel')}
              </button>
              <button
                onClick={handleSaveDonor}
                disabled={!donorForm.name || !donorForm.email}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingDonor ? t('tools.tithingTracker.update2', 'Update') : t('tools.tithingTracker.save2', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pledge Modal */}
      {showPledgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPledge ? t('tools.tithingTracker.editPledge', 'Edit Pledge') : t('tools.tithingTracker.addPledge', 'Add Pledge')}
              </h2>
              <button onClick={() => { setShowPledgeModal(false); setEditingPledge(null); resetPledgeForm(); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.donorName2', 'Donor Name *')}</label>
                <input
                  type="text"
                  value={pledgeForm.donorName || ''}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, donorName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.enterDonorName3', 'Enter donor name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.campaignName', 'Campaign Name *')}</label>
                <input
                  type="text"
                  value={pledgeForm.campaignName || ''}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, campaignName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.enterCampaignName', 'Enter campaign name')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.pledgeAmount2', 'Pledge Amount *')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pledgeForm.pledgeAmount || ''}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, pledgeAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.amountFulfilled2', 'Amount Fulfilled')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pledgeForm.amountFulfilled || ''}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, amountFulfilled: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.startDate', 'Start Date *')}</label>
                  <input
                    type="date"
                    value={pledgeForm.startDate || ''}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.endDate', 'End Date')}</label>
                  <input
                    type="date"
                    value={pledgeForm.endDate || ''}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.frequency2', 'Frequency')}</label>
                  <select
                    value={pledgeForm.frequency || 'monthly'}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, frequency: e.target.value as Pledge['frequency'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="one_time">{t('tools.tithingTracker.oneTime', 'One Time')}</option>
                    <option value="weekly">{t('tools.tithingTracker.weekly2', 'Weekly')}</option>
                    <option value="monthly">{t('tools.tithingTracker.monthly2', 'Monthly')}</option>
                    <option value="quarterly">{t('tools.tithingTracker.quarterly2', 'Quarterly')}</option>
                    <option value="annually">{t('tools.tithingTracker.annually2', 'Annually')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.status2', 'Status')}</label>
                  <select
                    value={pledgeForm.status || 'active'}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, status: e.target.value as Pledge['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">{t('tools.tithingTracker.active', 'Active')}</option>
                    <option value="fulfilled">{t('tools.tithingTracker.fulfilled2', 'Fulfilled')}</option>
                    <option value="cancelled">{t('tools.tithingTracker.cancelled', 'Cancelled')}</option>
                    <option value="overdue">{t('tools.tithingTracker.overdue', 'Overdue')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.notes3', 'Notes')}</label>
                <textarea
                  value={pledgeForm.notes || ''}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.additionalNotes3', 'Additional notes...')}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowPledgeModal(false); setEditingPledge(null); resetPledgeForm(); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('tools.tithingTracker.cancel3', 'Cancel')}
              </button>
              <button
                onClick={handleSavePledge}
                disabled={!pledgeForm.donorName || !pledgeForm.campaignName || !pledgeForm.pledgeAmount}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingPledge ? t('tools.tithingTracker.update3', 'Update') : t('tools.tithingTracker.save3', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingFund ? t('tools.tithingTracker.editFund', 'Edit Fund') : t('tools.tithingTracker.addFund2', 'Add Fund')}
              </h2>
              <button onClick={() => { setShowFundModal(false); setEditingFund(null); resetFundForm(); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.fundName', 'Fund Name *')}</label>
                <input
                  type="text"
                  value={fundForm.name || ''}
                  onChange={(e) => setFundForm({ ...fundForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.enterFundName', 'Enter fund name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.category3', 'Category')}</label>
                <select
                  value={fundForm.category || 'general'}
                  onChange={(e) => setFundForm({ ...fundForm, category: e.target.value as Fund['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="general">{t('tools.tithingTracker.general', 'General')}</option>
                  <option value="building">{t('tools.tithingTracker.building', 'Building')}</option>
                  <option value="missions">{t('tools.tithingTracker.missions3', 'Missions')}</option>
                  <option value="youth">{t('tools.tithingTracker.youth', 'Youth')}</option>
                  <option value="outreach">{t('tools.tithingTracker.outreach', 'Outreach')}</option>
                  <option value="benevolence">{t('tools.tithingTracker.benevolence3', 'Benevolence')}</option>
                  <option value="special">{t('tools.tithingTracker.special', 'Special')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.description', 'Description')}</label>
                <textarea
                  value={fundForm.description || ''}
                  onChange={(e) => setFundForm({ ...fundForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('tools.tithingTracker.fundDescription', 'Fund description...')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.targetAmount', 'Target Amount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={fundForm.targetAmount || ''}
                    onChange={(e) => setFundForm({ ...fundForm, targetAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.currentAmount', 'Current Amount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={fundForm.currentAmount || ''}
                    onChange={(e) => setFundForm({ ...fundForm, currentAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.startDate2', 'Start Date')}</label>
                  <input
                    type="date"
                    value={fundForm.startDate || ''}
                    onChange={(e) => setFundForm({ ...fundForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.tithingTracker.endDate2', 'End Date')}</label>
                  <input
                    type="date"
                    value={fundForm.endDate || ''}
                    onChange={(e) => setFundForm({ ...fundForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fundForm.isActive ?? true}
                  onChange={(e) => setFundForm({ ...fundForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.tithingTracker.activeFund', 'Active Fund')}</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowFundModal(false); setEditingFund(null); resetFundForm(); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('tools.tithingTracker.cancel4', 'Cancel')}
              </button>
              <button
                onClick={handleSaveFund}
                disabled={!fundForm.name}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingFund ? t('tools.tithingTracker.update4', 'Update') : t('tools.tithingTracker.save4', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TithingTrackerTool;
