'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Play,
  Pause,
  Square,
  Clock,
  DollarSign,
  Briefcase,
  FileText,
  Users,
  PlusCircle,
  Trash2,
  Download,
  BarChart3,
  Receipt,
  Building,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit2,
  Save,
  ChevronDown,
  ChevronUp,
  Wallet,
  TrendingUp,
  Search,
  Filter,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface LegalBillingToolProps {
  uiConfig?: UIConfig;
}

// Types
interface TimeEntry {
  id: string;
  date: string;
  caseId: string;
  caseName: string;
  taskType: TaskType;
  hours: number;
  description: string;
  billingRate: BillingRateType;
  ledesCode: string;
  utbmsCode: string;
  billable: boolean;
  billed: boolean;
  invoiceId?: string;
  createdAt: string;
}

interface Expense {
  id: string;
  date: string;
  caseId: string;
  caseName: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  reimbursable: boolean;
  billed: boolean;
  invoiceId?: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string;
  caseName: string;
  clientName: string;
  date: string;
  dueDate: string;
  timeEntryIds: string[];
  expenseIds: string[];
  subtotalTime: number;
  subtotalExpenses: number;
  total: number;
  status: InvoiceStatus;
  paidAmount: number;
  payments: Payment[];
  createdAt: string;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
}

interface TrustAccount {
  id: string;
  caseId: string;
  caseName: string;
  clientName: string;
  balance: number;
  minimumBalance: number;
  transactions: TrustTransaction[];
}

interface TrustTransaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description: string;
  reference: string;
}

interface Case {
  id: string;
  name: string;
  clientName: string;
  status: 'active' | 'closed' | 'pending';
}

type TaskType = 'research' | 'drafting' | 'court' | 'meeting' | 'travel' | 'admin' | 'review' | 'correspondence';
type BillingRateType = 'partner' | 'associate' | 'paralegal' | 'admin';
type ExpenseCategory = 'filing_fees' | 'copies' | 'travel' | 'expert_witness' | 'court_costs' | 'postage' | 'other';
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue';

type TabType = 'timer' | 'entries' | 'expenses' | 'invoices' | 'trust' | 'reports';

// Combined data structure for backend sync
interface LegalBillingData {
  id: string;
  cases: Case[];
  timeEntries: TimeEntry[];
  expenses: Expense[];
  invoices: Invoice[];
  trustAccounts: TrustAccount[];
  updatedAt: string;
}

// Column configuration for exports (combined view)
const SYNC_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'updatedAt', header: 'Last Updated', type: 'date' },
];

// Constants
const BILLING_RATES: Record<BillingRateType, { label: string; rate: number }> = {
  partner: { label: 'Partner', rate: 450 },
  associate: { label: 'Associate', rate: 275 },
  paralegal: { label: 'Paralegal', rate: 150 },
  admin: { label: 'Administrative', rate: 95 },
};

const TASK_TYPES: Record<TaskType, { label: string; ledesCode: string; utbmsCode: string }> = {
  research: { label: 'Legal Research', ledesCode: 'L110', utbmsCode: 'A106' },
  drafting: { label: 'Drafting/Revision', ledesCode: 'L120', utbmsCode: 'A107' },
  court: { label: 'Court Appearance', ledesCode: 'L130', utbmsCode: 'A101' },
  meeting: { label: 'Meeting/Conference', ledesCode: 'L140', utbmsCode: 'A102' },
  travel: { label: 'Travel Time', ledesCode: 'L150', utbmsCode: 'A103' },
  admin: { label: 'Administrative', ledesCode: 'L160', utbmsCode: 'A104' },
  review: { label: 'Document Review', ledesCode: 'L170', utbmsCode: 'A105' },
  correspondence: { label: 'Correspondence', ledesCode: 'L180', utbmsCode: 'A108' },
};

const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; ledesCode: string }> = {
  filing_fees: { label: 'Filing Fees', ledesCode: 'E101' },
  copies: { label: 'Copies/Printing', ledesCode: 'E102' },
  travel: { label: 'Travel Expenses', ledesCode: 'E103' },
  expert_witness: { label: 'Expert Witness', ledesCode: 'E104' },
  court_costs: { label: 'Court Costs', ledesCode: 'E105' },
  postage: { label: 'Postage/Delivery', ledesCode: 'E106' },
  other: { label: 'Other', ledesCode: 'E199' },
};

// Utility functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatHours = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Default cases for new users
const DEFAULT_CASES: Case[] = [
  { id: '1', name: 'Smith v. Jones', clientName: 'John Smith', status: 'active' },
  { id: '2', name: 'ABC Corp Merger', clientName: 'ABC Corporation', status: 'active' },
  { id: '3', name: 'Estate of Williams', clientName: 'Williams Family Trust', status: 'pending' },
];

// Component
export const LegalBillingTool = ({ uiConfig }: LegalBillingToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: billingData,
    setData: setBillingData,
    updateItem,
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
  } = useToolData<LegalBillingData>(
    'legal-billing',
    [{
      id: 'main',
      cases: DEFAULT_CASES,
      timeEntries: [],
      expenses: [],
      invoices: [],
      trustAccounts: [],
      updatedAt: new Date().toISOString(),
    }],
    SYNC_COLUMNS
  );

  // Extract data from the synced billing data (single record pattern)
  const mainData = billingData[0] || {
    id: 'main',
    cases: DEFAULT_CASES,
    timeEntries: [],
    expenses: [],
    invoices: [],
    trustAccounts: [],
    updatedAt: new Date().toISOString(),
  };

  const cases = mainData.cases;
  const timeEntries = mainData.timeEntries;
  const expenses = mainData.expenses;
  const invoices = mainData.invoices;
  const trustAccounts = mainData.trustAccounts;

  // Helper to update the main data record
  const updateMainData = (updates: Partial<Omit<LegalBillingData, 'id'>>) => {
    updateItem('main', {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  // Setters that update through the hook
  const setCases = (newCases: Case[] | ((prev: Case[]) => Case[])) => {
    const updated = typeof newCases === 'function' ? newCases(cases) : newCases;
    updateMainData({ cases: updated });
  };

  const setTimeEntries = (newEntries: TimeEntry[] | ((prev: TimeEntry[]) => TimeEntry[])) => {
    const updated = typeof newEntries === 'function' ? newEntries(timeEntries) : newEntries;
    updateMainData({ timeEntries: updated });
  };

  const setExpenses = (newExpenses: Expense[] | ((prev: Expense[]) => Expense[])) => {
    const updated = typeof newExpenses === 'function' ? newExpenses(expenses) : newExpenses;
    updateMainData({ expenses: updated });
  };

  const setInvoices = (newInvoices: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    const updated = typeof newInvoices === 'function' ? newInvoices(invoices) : newInvoices;
    updateMainData({ invoices: updated });
  };

  const setTrustAccounts = (newAccounts: TrustAccount[] | ((prev: TrustAccount[]) => TrustAccount[])) => {
    const updated = typeof newAccounts === 'function' ? newAccounts(trustAccounts) : newAccounts;
    updateMainData({ trustAccounts: updated });
  };

  // State
  const [activeTab, setActiveTab] = useState<TabType>('timer');

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerCaseId, setTimerCaseId] = useState('');
  const [timerTaskType, setTimerTaskType] = useState<TaskType>('research');
  const [timerBillingRate, setTimerBillingRate] = useState<BillingRateType>('associate');
  const [timerDescription, setTimerDescription] = useState('');
  const [timerBillable, setTimerBillable] = useState(true);

  // Manual entry state
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualCaseId, setManualCaseId] = useState('');
  const [manualTaskType, setManualTaskType] = useState<TaskType>('research');
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualBillingRate, setManualBillingRate] = useState<BillingRateType>('associate');
  const [manualBillable, setManualBillable] = useState(true);

  // Expense entry state
  const [showExpenseEntry, setShowExpenseEntry] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseCaseId, setExpenseCaseId] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('filing_fees');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseReimbursable, setExpenseReimbursable] = useState(true);

  // Invoice state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceCaseId, setInvoiceCaseId] = useState('');
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<string[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  // Trust account state
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [trustCaseId, setTrustCaseId] = useState('');
  const [trustTransactionType, setTrustTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [trustAmount, setTrustAmount] = useState('');
  const [trustDescription, setTrustDescription] = useState('');
  const [trustReference, setTrustReference] = useState('');

  // Filter state
  const [filterCase, setFilterCase] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.client || params.caseName || params.rate) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning && !isPaused) {
      interval = window.setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isPaused]);

  // Timer functions
  const startTimer = () => {
    if (!timerCaseId) {
      setValidationMessage('Please select a case before starting the timer');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    setIsTimerRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = async () => {
    if (timerSeconds < 60) {
      const confirmed = await confirm({
        title: 'Save Short Entry',
        message: 'Timer is less than 1 minute. Do you want to save this entry?',
        confirmText: 'Save',
        cancelText: 'Discard',
        variant: 'warning',
      });
      if (!confirmed) {
        resetTimer();
        return;
      }
    }

    const selectedCase = cases.find((c) => c.id === timerCaseId);
    const hours = timerSeconds / 3600;
    const taskInfo = TASK_TYPES[timerTaskType];

    const entry: TimeEntry = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      caseId: timerCaseId,
      caseName: selectedCase?.name || '',
      taskType: timerTaskType,
      hours: Math.round(hours * 10) / 10,
      description: timerDescription,
      billingRate: timerBillingRate,
      ledesCode: taskInfo.ledesCode,
      utbmsCode: taskInfo.utbmsCode,
      billable: timerBillable,
      billed: false,
      createdAt: new Date().toISOString(),
    };

    setTimeEntries((prev) => [entry, ...prev]);
    resetTimer();
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsPaused(false);
    setTimerSeconds(0);
    setTimerDescription('');
  };

  const formatTimerDisplay = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Manual entry functions
  const saveManualEntry = () => {
    if (!manualCaseId || (!manualHours && !manualMinutes)) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const selectedCase = cases.find((c) => c.id === manualCaseId);
    const hours = (parseFloat(manualHours) || 0) + (parseFloat(manualMinutes) || 0) / 60;
    const taskInfo = TASK_TYPES[manualTaskType];

    const entry: TimeEntry = {
      id: generateId(),
      date: manualDate,
      caseId: manualCaseId,
      caseName: selectedCase?.name || '',
      taskType: manualTaskType,
      hours: Math.round(hours * 10) / 10,
      description: manualDescription,
      billingRate: manualBillingRate,
      ledesCode: taskInfo.ledesCode,
      utbmsCode: taskInfo.utbmsCode,
      billable: manualBillable,
      billed: false,
      createdAt: new Date().toISOString(),
    };

    setTimeEntries((prev) => [entry, ...prev]);
    setShowManualEntry(false);
    setManualHours('');
    setManualMinutes('');
    setManualDescription('');
  };

  // Expense functions
  const saveExpense = () => {
    if (!expenseCaseId || !expenseAmount) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const selectedCase = cases.find((c) => c.id === expenseCaseId);

    const expense: Expense = {
      id: generateId(),
      date: expenseDate,
      caseId: expenseCaseId,
      caseName: selectedCase?.name || '',
      category: expenseCategory,
      amount: parseFloat(expenseAmount),
      description: expenseDescription,
      reimbursable: expenseReimbursable,
      billed: false,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [expense, ...prev]);
    setShowExpenseEntry(false);
    setExpenseAmount('');
    setExpenseDescription('');
  };

  // Invoice functions
  const generateInvoice = () => {
    if (!invoiceCaseId) {
      setValidationMessage('Please select a case');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const selectedCase = cases.find((c) => c.id === invoiceCaseId);
    const unbilledEntries = timeEntries.filter((e) => e.caseId === invoiceCaseId && !e.billed && e.billable);
    const unbilledExpenses = expenses.filter((e) => e.caseId === invoiceCaseId && !e.billed);

    if (unbilledEntries.length === 0 && unbilledExpenses.length === 0) {
      setValidationMessage('No unbilled entries or expenses for this case');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    setSelectedTimeEntries(unbilledEntries.map((e) => e.id));
    setSelectedExpenses(unbilledExpenses.map((e) => e.id));
    setShowInvoiceModal(true);
  };

  const createInvoice = () => {
    const selectedCase = cases.find((c) => c.id === invoiceCaseId);
    const entriesToBill = timeEntries.filter((e) => selectedTimeEntries.includes(e.id));
    const expensesToBill = expenses.filter((e) => selectedExpenses.includes(e.id));

    const subtotalTime = entriesToBill.reduce((sum, e) => {
      return sum + e.hours * BILLING_RATES[e.billingRate].rate;
    }, 0);

    const subtotalExpenses = expensesToBill.reduce((sum, e) => sum + e.amount, 0);

    const invoice: Invoice = {
      id: generateId(),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      caseId: invoiceCaseId,
      caseName: selectedCase?.name || '',
      clientName: selectedCase?.clientName || '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timeEntryIds: selectedTimeEntries,
      expenseIds: selectedExpenses,
      subtotalTime,
      subtotalExpenses,
      total: subtotalTime + subtotalExpenses,
      status: 'draft',
      paidAmount: 0,
      payments: [],
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [invoice, ...prev]);

    // Mark entries and expenses as billed
    setTimeEntries((prev) =>
      prev.map((e) => (selectedTimeEntries.includes(e.id) ? { ...e, billed: true, invoiceId: invoice.id } : e))
    );
    setExpenses((prev) =>
      prev.map((e) => (selectedExpenses.includes(e.id) ? { ...e, billed: true, invoiceId: invoice.id } : e))
    );

    setShowInvoiceModal(false);
    setInvoiceCaseId('');
    setSelectedTimeEntries([]);
    setSelectedExpenses([]);
  };

  const updateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv)));
  };

  const recordPayment = (invoiceId: string, amount: number, method: string, reference: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPayment: Payment = {
            id: generateId(),
            date: new Date().toISOString().split('T')[0],
            amount,
            method,
            reference,
          };
          const newPaidAmount = inv.paidAmount + amount;
          const newStatus: InvoiceStatus = newPaidAmount >= inv.total ? 'paid' : 'partial';
          return {
            ...inv,
            paidAmount: newPaidAmount,
            payments: [...inv.payments, newPayment],
            status: newStatus,
          };
        }
        return inv;
      })
    );
  };

  // Trust account functions
  const saveTrustTransaction = () => {
    if (!trustCaseId || !trustAmount) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const selectedCase = cases.find((c) => c.id === trustCaseId);
    const amount = parseFloat(trustAmount);

    setTrustAccounts((prev) => {
      const existingAccount = prev.find((a) => a.caseId === trustCaseId);
      const transaction: TrustTransaction = {
        id: generateId(),
        date: new Date().toISOString().split('T')[0],
        type: trustTransactionType,
        amount: trustTransactionType === 'withdrawal' ? -amount : amount,
        description: trustDescription,
        reference: trustReference,
      };

      if (existingAccount) {
        return prev.map((a) =>
          a.caseId === trustCaseId
            ? {
                ...a,
                balance: a.balance + (trustTransactionType === 'withdrawal' ? -amount : amount),
                transactions: [transaction, ...a.transactions],
              }
            : a
        );
      } else {
        const newAccount: TrustAccount = {
          id: generateId(),
          caseId: trustCaseId,
          caseName: selectedCase?.name || '',
          clientName: selectedCase?.clientName || '',
          balance: trustTransactionType === 'withdrawal' ? -amount : amount,
          minimumBalance: 0,
          transactions: [transaction],
        };
        return [newAccount, ...prev];
      }
    });

    setShowTrustModal(false);
    setTrustAmount('');
    setTrustDescription('');
    setTrustReference('');
  };

  // Delete functions
  const deleteTimeEntry = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Time Entry',
      message: 'Are you sure you want to delete this time entry?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setTimeEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }, [confirm, setTimeEntries]);

  const deleteExpense = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  }, [confirm, setExpenses]);

  // Computed values
  const filteredTimeEntries = useMemo(() => {
    return timeEntries.filter((e) => {
      if (filterCase && e.caseId !== filterCase) return false;
      if (filterDateFrom && e.date < filterDateFrom) return false;
      if (filterDateTo && e.date > filterDateTo) return false;
      return true;
    });
  }, [timeEntries, filterCase, filterDateFrom, filterDateTo]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (filterCase && e.caseId !== filterCase) return false;
      if (filterDateFrom && e.date < filterDateFrom) return false;
      if (filterDateTo && e.date > filterDateTo) return false;
      return true;
    });
  }, [expenses, filterCase, filterDateFrom, filterDateTo]);

  const reportStats = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (reportPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const periodEntries = timeEntries.filter((e) => new Date(e.date) >= startDate);

    const totalBillableHours = periodEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0);

    const totalNonBillableHours = periodEntries.filter((e) => !e.billable).reduce((sum, e) => sum + e.hours, 0);

    const totalBillableAmount = periodEntries
      .filter((e) => e.billable)
      .reduce((sum, e) => sum + e.hours * BILLING_RATES[e.billingRate].rate, 0);

    const totalBilledAmount = periodEntries
      .filter((e) => e.billed)
      .reduce((sum, e) => sum + e.hours * BILLING_RATES[e.billingRate].rate, 0);

    const utilizationRate = totalBillableHours + totalNonBillableHours > 0
      ? (totalBillableHours / (totalBillableHours + totalNonBillableHours)) * 100
      : 0;

    const totalCollected = invoices
      .filter((inv) => new Date(inv.date) >= startDate)
      .reduce((sum, inv) => sum + inv.paidAmount, 0);

    const totalOutstanding = invoices
      .filter((inv) => inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);

    const taskBreakdown = periodEntries.reduce((acc, e) => {
      acc[e.taskType] = (acc[e.taskType] || 0) + e.hours;
      return acc;
    }, {} as Record<TaskType, number>);

    return {
      totalBillableHours,
      totalNonBillableHours,
      totalBillableAmount,
      totalBilledAmount,
      utilizationRate,
      totalCollected,
      totalOutstanding,
      taskBreakdown,
    };
  }, [timeEntries, invoices, reportPeriod]);

  // Export functions
  const exportToLEDES = () => {
    const unbilledEntries = timeEntries.filter((e) => !e.billed && e.billable);
    let ledesOutput = 'LEDES1998B[]\n';
    ledesOutput += 'INVOICE_DATE|INVOICE_NUMBER|CLIENT_ID|LAW_FIRM_MATTER_ID|INVOICE_TOTAL|BILLING_START_DATE|BILLING_END_DATE|INVOICE_DESCRIPTION|LINE_ITEM_NUMBER|EXP/FEE/INV_ADJ_TYPE|LINE_ITEM_NUMBER_OF_UNITS|LINE_ITEM_ADJUSTMENT_AMOUNT|LINE_ITEM_TOTAL|LINE_ITEM_DATE|LINE_ITEM_TASK_CODE|LINE_ITEM_EXPENSE_CODE|LINE_ITEM_ACTIVITY_CODE|TIMEKEEPER_ID|LINE_ITEM_DESCRIPTION|LAW_FIRM_ID|LINE_ITEM_UNIT_COST|TIMEKEEPER_NAME|TIMEKEEPER_CLASSIFICATION|[]\n';

    unbilledEntries.forEach((entry, index) => {
      const rate = BILLING_RATES[entry.billingRate].rate;
      const total = entry.hours * rate;
      ledesOutput += `${entry.date}||${entry.caseId}|${entry.caseId}|${total}|${entry.date}|${entry.date}|${entry.description}|${index + 1}|F|${entry.hours}|0|${total}|${entry.date}|${entry.ledesCode}||${entry.utbmsCode}||${entry.description}||${rate}|${BILLING_RATES[entry.billingRate].label}|${entry.billingRate}|[]\n`;
    });

    const blob = new Blob([ledesOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledes_export_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tab content components
  const renderTimer = () => (
    <div className="space-y-6">
      {/* Active Timer */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Clock className="w-5 h-5 text-[#0D9488]" />
            {t('tools.legalBilling.activeTimer', 'Active Timer')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-6xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatTimerDisplay(timerSeconds)}
            </div>
            {isTimerRunning && (
              <div className={`text-sm mt-2 ${isPaused ? 'text-yellow-500' : 'text-green-500'}`}>
                {isPaused ? t('tools.legalBilling.paused', 'Paused') : t('tools.legalBilling.recording', 'Recording...')}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.legalBilling.case2', 'Case *')}
              </label>
              <select
                value={timerCaseId}
                onChange={(e) => setTimerCaseId(e.target.value)}
                disabled={isTimerRunning}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="">{t('tools.legalBilling.selectACase', 'Select a case...')}</option>
                {cases
                  .filter((c) => c.status === 'active')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.legalBilling.taskType', 'Task Type')}
              </label>
              <select
                value={timerTaskType}
                onChange={(e) => setTimerTaskType(e.target.value as TaskType)}
                disabled={isTimerRunning}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]`}
              >
                {Object.entries(TASK_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.legalBilling.billingRate', 'Billing Rate')}
              </label>
              <select
                value={timerBillingRate}
                onChange={(e) => setTimerBillingRate(e.target.value as BillingRateType)}
                disabled={isTimerRunning}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]`}
              >
                {Object.entries(BILLING_RATES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label} - {formatCurrency(value.rate)}/hr
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timerBillable}
                  onChange={(e) => setTimerBillable(e.target.checked)}
                  disabled={isTimerRunning}
                  className="w-4 h-4 rounded accent-[#0D9488]"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.billable', 'Billable')}</span>
              </label>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.legalBilling.description', 'Description')}
            </label>
            <textarea
              value={timerDescription}
              onChange={(e) => setTimerDescription(e.target.value)}
              placeholder={t('tools.legalBilling.describeTheWorkPerformed', 'Describe the work performed...')}
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          <div className="flex gap-3 justify-center">
            {!isTimerRunning ? (
              <button
                onClick={startTimer}
                className="flex items-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
              >
                <Play className="w-5 h-5" />
                {t('tools.legalBilling.startTimer', 'Start Timer')}
              </button>
            ) : (
              <>
                <button
                  onClick={pauseTimer}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isPaused
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? t('tools.legalBilling.resume', 'Resume') : t('tools.legalBilling.pause', 'Pause')}
                </button>
                <button
                  onClick={stopTimer}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Square className="w-5 h-5" />
                  {t('tools.legalBilling.stopSave', 'Stop & Save')}
                </button>
              </>
            )}
          </div>

          {isTimerRunning && timerCaseId && (
            <div className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Current Value:{' '}
              {formatCurrency((timerSeconds / 3600) * BILLING_RATES[timerBillingRate].rate)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="w-full flex items-center justify-between"
          >
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Edit2 className="w-5 h-5 text-[#0D9488]" />
              {t('tools.legalBilling.manualTimeEntry', 'Manual Time Entry')}
            </CardTitle>
            {showManualEntry ? (
              <ChevronUp className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            ) : (
              <ChevronDown className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            )}
          </button>
        </CardHeader>
        {showManualEntry && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.date2', 'Date')}
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.case3', 'Case *')}
                </label>
                <select
                  value={manualCaseId}
                  onChange={(e) => setManualCaseId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="">{t('tools.legalBilling.selectACase2', 'Select a case...')}</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.taskType2', 'Task Type')}
                </label>
                <select
                  value={manualTaskType}
                  onChange={(e) => setManualTaskType(e.target.value as TaskType)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {Object.entries(TASK_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.hours2', 'Hours')}
                </label>
                <input
                  type="number"
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.minutes', 'Minutes')}
                </label>
                <input
                  type="number"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="59"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.billingRate2', 'Billing Rate')}
                </label>
                <select
                  value={manualBillingRate}
                  onChange={(e) => setManualBillingRate(e.target.value as BillingRateType)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {Object.entries(BILLING_RATES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label} - {formatCurrency(value.rate)}/hr
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.legalBilling.description2', 'Description')}
              </label>
              <textarea
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder={t('tools.legalBilling.describeTheWorkPerformed2', 'Describe the work performed...')}
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualBillable}
                  onChange={(e) => setManualBillable(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0D9488]"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.billable2', 'Billable')}</span>
              </label>

              <button
                onClick={saveManualEntry}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {t('tools.legalBilling.saveEntry', 'Save Entry')}
              </button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Entries */}
      {timeEntries.length > 0 && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5 text-[#0D9488]" />
              {t('tools.legalBilling.recentTimeEntries', 'Recent Time Entries')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {entry.caseName}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {TASK_TYPES[entry.taskType].label} - {entry.description || 'No description'}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {formatDate(entry.date)} | {entry.ledesCode} | {entry.utbmsCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatHours(entry.hours)}
                    </div>
                    <div className={`text-sm ${entry.billable ? 'text-green-500' : 'text-gray-500'}`}>
                      {entry.billable
                        ? formatCurrency(entry.hours * BILLING_RATES[entry.billingRate].rate)
                        : 'Non-billable'}
                    </div>
                    {entry.billed && (
                      <span className="text-xs text-blue-500">{t('tools.legalBilling.billed', 'Billed')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderEntries = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Filter className="w-5 h-5 text-[#0D9488]" />
            {t('tools.legalBilling.filters', 'Filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.legalBilling.case4', 'Case')}
              </label>
              <select
                value={filterCase}
                onChange={(e) => setFilterCase(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="">{t('tools.legalBilling.allCases', 'All Cases')}</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.legalBilling.fromDate', 'From Date')}
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.legalBilling.toDate', 'To Date')}
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Clock className="w-5 h-5 text-[#0D9488]" />
            Time Entries ({filteredTimeEntries.length})
          </CardTitle>
          <button
            onClick={exportToLEDES}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('tools.legalBilling.exportLedes', 'Export LEDES')}
          </button>
        </CardHeader>
        <CardContent>
          {filteredTimeEntries.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.legalBilling.noTimeEntriesFound', 'No time entries found')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`py-2 px-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.date', 'Date')}</th>
                    <th className={`py-2 px-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.case', 'Case')}</th>
                    <th className={`py-2 px-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.task', 'Task')}</th>
                    <th className={`py-2 px-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.hours', 'Hours')}</th>
                    <th className={`py-2 px-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.amount', 'Amount')}</th>
                    <th className={`py-2 px-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.status', 'Status')}</th>
                    <th className={`py-2 px-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimeEntries.map((entry) => (
                    <tr key={entry.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`py-2 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatDate(entry.date)}
                      </td>
                      <td className={`py-2 px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {entry.caseName}
                      </td>
                      <td className={`py-2 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div>{TASK_TYPES[entry.taskType].label}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {entry.ledesCode}
                        </div>
                      </td>
                      <td className={`py-2 px-2 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatHours(entry.hours)}
                      </td>
                      <td className={`py-2 px-2 text-right ${entry.billable ? 'text-green-500' : (isDark ? 'text-gray-500' : 'text-gray-500')}`}>
                        {entry.billable
                          ? formatCurrency(entry.hours * BILLING_RATES[entry.billingRate].rate)
                          : '-'}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {entry.billed ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-500">
                            {t('tools.legalBilling.billed2', 'Billed')}
                          </span>
                        ) : entry.billable ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-500">
                            {t('tools.legalBilling.pending', 'Pending')}
                          </span>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                            {t('tools.legalBilling.nonBillable2', 'Non-billable')}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={() => deleteTimeEntry(entry.id)}
                          disabled={entry.billed}
                          className={`p-1 rounded transition-colors ${
                            entry.billed
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-red-500/20 text-red-500'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-6">
      {/* Add Expense */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <button
            onClick={() => setShowExpenseEntry(!showExpenseEntry)}
            className="w-full flex items-center justify-between"
          >
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Receipt className="w-5 h-5 text-[#0D9488]" />
              {t('tools.legalBilling.addExpense', 'Add Expense')}
            </CardTitle>
            {showExpenseEntry ? (
              <ChevronUp className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            ) : (
              <ChevronDown className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            )}
          </button>
        </CardHeader>
        {showExpenseEntry && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.date3', 'Date')}
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.case5', 'Case *')}
                </label>
                <select
                  value={expenseCaseId}
                  onChange={(e) => setExpenseCaseId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="">{t('tools.legalBilling.selectACase3', 'Select a case...')}</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.category', 'Category')}
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.amount2', 'Amount *')}
                </label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.description3', 'Description')}
                </label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder={t('tools.legalBilling.descriptionOfExpense', 'Description of expense...')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={expenseReimbursable}
                  onChange={(e) => setExpenseReimbursable(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0D9488]"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.reimbursableToClient', 'Reimbursable to client')}</span>
              </label>

              <button
                onClick={saveExpense}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {t('tools.legalBilling.saveExpense', 'Save Expense')}
              </button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Expenses List */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Receipt className="w-5 h-5 text-[#0D9488]" />
            Expenses ({filteredExpenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.legalBilling.noExpensesFound', 'No expenses found')}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {EXPENSE_CATEGORIES[expense.category].label}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {expense.caseName} - {expense.description || 'No description'}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {formatDate(expense.date)} | {EXPENSE_CATEGORIES[expense.category].ledesCode}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(expense.amount)}
                      </div>
                      <div className={`text-xs ${expense.billed ? 'text-blue-500' : 'text-green-500'}`}>
                        {expense.billed ? t('tools.legalBilling.billed3', 'Billed') : t('tools.legalBilling.pending2', 'Pending')}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      disabled={expense.billed}
                      className={`p-1 rounded transition-colors ${
                        expense.billed
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-red-500/20 text-red-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      {/* Generate Invoice */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FileText className="w-5 h-5 text-[#0D9488]" />
            {t('tools.legalBilling.generateInvoice', 'Generate Invoice')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.legalBilling.selectCase', 'Select Case')}
              </label>
              <select
                value={invoiceCaseId}
                onChange={(e) => setInvoiceCaseId(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="">{t('tools.legalBilling.selectACase4', 'Select a case...')}</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.clientName}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={generateInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              {t('tools.legalBilling.generateInvoice2', 'Generate Invoice')}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FileText className="w-5 h-5 text-[#0D9488]" />
            Invoices ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.legalBilling.noInvoicesCreatedYet', 'No invoices created yet')}
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className={`font-medium text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {invoice.invoiceNumber}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {invoice.clientName} - {invoice.caseName}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Issued: {formatDate(invoice.date)} | Due: {formatDate(invoice.dueDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(invoice.total)}
                      </div>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'paid'
                            ? 'bg-green-500/20 text-green-500'
                            : invoice.status === 'partial'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : invoice.status === 'overdue'
                            ? 'bg-red-500/20 text-red-500'
                            : invoice.status === 'sent'
                            ? 'bg-blue-500/20 text-blue-500'
                            : isDark
                            ? 'bg-gray-600 text-gray-400'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className={`grid grid-cols-3 gap-4 py-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.legalBilling.timeCharges', 'Time Charges')}</div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(invoice.subtotalTime)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.legalBilling.expenses', 'Expenses')}</div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(invoice.subtotalExpenses)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.legalBilling.paid', 'Paid')}</div>
                      <div className="font-medium text-green-500">
                        {formatCurrency(invoice.paidAmount)}
                      </div>
                    </div>
                  </div>

                  {invoice.status !== 'paid' && (
                    <div className={`flex gap-2 mt-3 pt-3 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                      {invoice.status === 'draft' && (
                        <button
                          onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                          className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                        >
                          {t('tools.legalBilling.markAsSent', 'Mark as Sent')}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const amount = parseFloat(prompt('Enter payment amount:') || '0');
                          if (amount > 0) {
                            const method = prompt('Payment method (check/wire/credit):') || 'check';
                            const reference = prompt('Reference number:') || '';
                            recordPayment(invoice.id, amount, method, reference);
                          }
                        }}
                        className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                      >
                        {t('tools.legalBilling.recordPayment', 'Record Payment')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.legalBilling.createInvoice', 'Create Invoice')}
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Time Entries ({selectedTimeEntries.length})
                </h4>
                <div className="space-y-1">
                  {timeEntries
                    .filter((e) => selectedTimeEntries.includes(e.id))
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        <span>
                          {formatDate(entry.date)} - {TASK_TYPES[entry.taskType].label} ({formatHours(entry.hours)})
                        </span>
                        <span>{formatCurrency(entry.hours * BILLING_RATES[entry.billingRate].rate)}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Expenses ({selectedExpenses.length})
                </h4>
                <div className="space-y-1">
                  {expenses
                    .filter((e) => selectedExpenses.includes(e.id))
                    .map((expense) => (
                      <div
                        key={expense.id}
                        className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        <span>
                          {formatDate(expense.date)} - {EXPENSE_CATEGORIES[expense.category].label}
                        </span>
                        <span>{formatCurrency(expense.amount)}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`flex justify-between font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span>{t('tools.legalBilling.total', 'Total')}</span>
                  <span>
                    {formatCurrency(
                      timeEntries
                        .filter((e) => selectedTimeEntries.includes(e.id))
                        .reduce((sum, e) => sum + e.hours * BILLING_RATES[e.billingRate].rate, 0) +
                        expenses
                          .filter((e) => selectedExpenses.includes(e.id))
                          .reduce((sum, e) => sum + e.amount, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.legalBilling.cancel', 'Cancel')}
              </button>
              <button
                onClick={createInvoice}
                className="flex-1 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
              >
                {t('tools.legalBilling.createInvoice2', 'Create Invoice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTrust = () => (
    <div className="space-y-6">
      {/* Add Transaction */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <button
            onClick={() => setShowTrustModal(!showTrustModal)}
            className="w-full flex items-center justify-between"
          >
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Wallet className="w-5 h-5 text-[#0D9488]" />
              {t('tools.legalBilling.trustAccountTransaction', 'Trust Account Transaction')}
            </CardTitle>
            {showTrustModal ? (
              <ChevronUp className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            ) : (
              <ChevronDown className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            )}
          </button>
        </CardHeader>
        {showTrustModal && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.caseClient', 'Case/Client *')}
                </label>
                <select
                  value={trustCaseId}
                  onChange={(e) => setTrustCaseId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="">{t('tools.legalBilling.selectACase5', 'Select a case...')}</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.transactionType', 'Transaction Type')}
                </label>
                <select
                  value={trustTransactionType}
                  onChange={(e) => setTrustTransactionType(e.target.value as 'deposit' | 'withdrawal')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="deposit">{t('tools.legalBilling.depositRetainer', 'Deposit (Retainer)')}</option>
                  <option value="withdrawal">{t('tools.legalBilling.withdrawalPayment', 'Withdrawal (Payment)')}</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.amount3', 'Amount *')}
                </label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="number"
                    value={trustAmount}
                    onChange={(e) => setTrustAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.legalBilling.reference', 'Reference #')}
                </label>
                <input
                  type="text"
                  value={trustReference}
                  onChange={(e) => setTrustReference(e.target.value)}
                  placeholder={t('tools.legalBilling.checkWireReference', 'Check/Wire reference')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.legalBilling.description4', 'Description')}
              </label>
              <input
                type="text"
                value={trustDescription}
                onChange={(e) => setTrustDescription(e.target.value)}
                placeholder={t('tools.legalBilling.descriptionOfTransaction', 'Description of transaction...')}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveTrustTransaction}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {t('tools.legalBilling.saveTransaction', 'Save Transaction')}
              </button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Trust Accounts */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Building className="w-5 h-5 text-[#0D9488]" />
            {t('tools.legalBilling.clientTrustAccounts', 'Client Trust Accounts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trustAccounts.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.legalBilling.noTrustAccountsYetAdd', 'No trust accounts yet. Add a retainer deposit to create one.')}
            </div>
          ) : (
            <div className="space-y-4">
              {trustAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {account.clientName}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {account.caseName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${account.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {formatCurrency(account.balance)}
                      </div>
                      {account.balance < account.minimumBalance && (
                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {t('tools.legalBilling.belowMinimum', 'Below minimum')}
                        </div>
                      )}
                    </div>
                  </div>

                  {account.transactions.length > 0 && (
                    <div className={`border-t pt-3 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {t('tools.legalBilling.recentTransactions', 'Recent Transactions')}
                      </div>
                      <div className="space-y-1">
                        {account.transactions.slice(0, 3).map((tx) => (
                          <div
                            key={tx.id}
                            className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            <span>
                              {formatDate(tx.date)} - {tx.description || tx.type}
                            </span>
                            <span className={tx.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                              {tx.amount > 0 ? '+' : ''}
                              {formatCurrency(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-5 h-5 text-[#0D9488]" />
            {t('tools.legalBilling.productivityReports', 'Productivity Reports')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setReportPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  reportPeriod === period
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.legalBilling.billableHours', 'Billable Hours')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {reportStats.totalBillableHours.toFixed(1)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.legalBilling.billableAmount', 'Billable Amount')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(reportStats.totalBillableAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.legalBilling.utilizationRate', 'Utilization Rate')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {reportStats.utilizationRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-orange-500/20">
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.legalBilling.outstanding', 'Outstanding')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(reportStats.totalOutstanding)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hours Breakdown */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Clock className="w-5 h-5 text-[#0D9488]" />
              {t('tools.legalBilling.billableVsNonBillable', 'Billable vs Non-Billable')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.legalBilling.billable3', 'Billable')}</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {reportStats.totalBillableHours.toFixed(1)} hrs
                  </span>
                </div>
                <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${reportStats.utilizationRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.legalBilling.nonBillable', 'Non-Billable')}</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {reportStats.totalNonBillableHours.toFixed(1)} hrs
                  </span>
                </div>
                <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-gray-500"
                    style={{ width: `${100 - reportStats.utilizationRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Breakdown */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Tag className="w-5 h-5 text-[#0D9488]" />
              {t('tools.legalBilling.hoursByTaskType', 'Hours by Task Type')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(reportStats.taskBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([taskType, hours]) => (
                  <div key={taskType} className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {TASK_TYPES[taskType as TaskType].label}
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {hours.toFixed(1)} hrs
                    </span>
                  </div>
                ))}
              {Object.keys(reportStats.taskBreakdown).length === 0 && (
                <div className={`text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {t('tools.legalBilling.noDataForThisPeriod', 'No data for this period')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Collections */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <DollarSign className="w-5 h-5 text-[#0D9488]" />
              {t('tools.legalBilling.collectionsSummary', 'Collections Summary')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.legalBilling.totalBilled', 'Total Billed')}</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(reportStats.totalBilledAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.legalBilling.collected', 'Collected')}</span>
                <span className="font-medium text-green-500">
                  {formatCurrency(reportStats.totalCollected)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.legalBilling.outstanding2', 'Outstanding')}</span>
                <span className="font-medium text-orange-500">
                  {formatCurrency(reportStats.totalOutstanding)}
                </span>
              </div>
              <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.legalBilling.collectionRate', 'Collection Rate')}</span>
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {reportStats.totalBilledAmount > 0
                      ? ((reportStats.totalCollected / reportStats.totalBilledAmount) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5 text-[#0D9488]" />
              {t('tools.legalBilling.invoiceStatus', 'Invoice Status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['draft', 'sent', 'partial', 'paid', 'overdue'].map((status) => {
                const count = invoices.filter((inv) => inv.status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {status === 'paid' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {status === 'partial' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                      {status === 'overdue' && <XCircle className="w-4 h-4 text-red-500" />}
                      {status === 'sent' && <FileText className="w-4 h-4 text-blue-500" />}
                      {status === 'draft' && <Edit2 className="w-4 h-4 text-gray-500" />}
                      <span className={`text-sm capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {status}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Tab configuration
  const tabs = [
    { id: 'timer' as TabType, label: 'Timer', icon: Clock },
    { id: 'entries' as TabType, label: 'Time Entries', icon: FileText },
    { id: 'expenses' as TabType, label: 'Expenses', icon: Receipt },
    { id: 'invoices' as TabType, label: 'Invoices', icon: DollarSign },
    { id: 'trust' as TabType, label: 'Trust', icon: Wallet },
    { id: 'reports' as TabType, label: 'Reports', icon: BarChart3 },
  ];

  // Column configurations for export
  const TIME_ENTRY_COLUMNS: ColumnConfig[] = [
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'caseName', header: 'Case', type: 'string' },
    { key: 'taskType', header: 'Task Type', type: 'string', format: (v) => TASK_TYPES[v as TaskType]?.label || v },
    { key: 'hours', header: 'Hours', type: 'number' },
    { key: 'billingRate', header: 'Rate Type', type: 'string', format: (v) => BILLING_RATES[v as BillingRateType]?.label || v },
    { key: 'description', header: 'Description', type: 'string' },
    { key: 'ledesCode', header: 'LEDES Code', type: 'string' },
    { key: 'utbmsCode', header: 'UTBMS Code', type: 'string' },
    { key: 'billable', header: 'Billable', type: 'boolean' },
    { key: 'billed', header: 'Billed', type: 'boolean' },
  ];

  const EXPENSE_COLUMNS: ColumnConfig[] = [
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'caseName', header: 'Case', type: 'string' },
    { key: 'category', header: 'Category', type: 'string', format: (v) => EXPENSE_CATEGORIES[v as ExpenseCategory]?.label || v },
    { key: 'amount', header: 'Amount', type: 'currency' },
    { key: 'description', header: 'Description', type: 'string' },
    { key: 'reimbursable', header: 'Reimbursable', type: 'boolean' },
    { key: 'billed', header: 'Billed', type: 'boolean' },
  ];

  const INVOICE_COLUMNS: ColumnConfig[] = [
    { key: 'invoiceNumber', header: 'Invoice #', type: 'string' },
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'dueDate', header: 'Due Date', type: 'date' },
    { key: 'caseName', header: 'Case', type: 'string' },
    { key: 'clientName', header: 'Client', type: 'string' },
    { key: 'subtotalTime', header: 'Time Charges', type: 'currency' },
    { key: 'subtotalExpenses', header: 'Expenses', type: 'currency' },
    { key: 'total', header: 'Total', type: 'currency' },
    { key: 'paidAmount', header: 'Paid', type: 'currency' },
    { key: 'status', header: 'Status', type: 'string' },
  ];

  const TRUST_COLUMNS: ColumnConfig[] = [
    { key: 'caseName', header: 'Case', type: 'string' },
    { key: 'clientName', header: 'Client', type: 'string' },
    { key: 'balance', header: 'Balance', type: 'currency' },
    { key: 'minimumBalance', header: 'Min Balance', type: 'currency' },
  ];

  // Get current export data and columns based on active tab
  const getExportData = (): { data: Record<string, any>[]; columns: ColumnConfig[]; name: string } => {
    switch (activeTab) {
      case 'entries':
        return { data: filteredTimeEntries, columns: TIME_ENTRY_COLUMNS, name: 'time_entries' };
      case 'expenses':
        return { data: filteredExpenses, columns: EXPENSE_COLUMNS, name: 'expenses' };
      case 'invoices':
        return { data: invoices, columns: INVOICE_COLUMNS, name: 'invoices' };
      case 'trust':
        return { data: trustAccounts, columns: TRUST_COLUMNS, name: 'trust_accounts' };
      default:
        return { data: timeEntries, columns: TIME_ENTRY_COLUMNS, name: 'legal_billing' };
    }
  };

  // Export handlers using the hook's export functions
  const handleExportCSV = () => {
    const { name } = getExportData();
    exportCSV({ filename: `legal_billing_${name}` });
  };

  const handleExportExcel = () => {
    const { name } = getExportData();
    exportExcel({ filename: `legal_billing_${name}` });
  };

  const handleExportJSON = () => {
    const { name } = getExportData();
    exportJSON({ filename: `legal_billing_${name}` });
  };

  const handleExportPDF = async () => {
    const { name } = getExportData();
    const tabLabel = tabs.find(t => t.id === activeTab)?.label || 'Legal Billing';
    await exportPDF({
      filename: `legal_billing_${name}`,
      title: `Legal Billing - ${tabLabel}`,
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    const tabLabel = tabs.find(t => t.id === activeTab)?.label || 'Legal Billing';
    print(`Legal Billing - ${tabLabel}`);
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.legalBilling.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.legalBilling.legalTimeBilling', 'Legal Time & Billing')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.legalBilling.trackTimeExpensesGenerateInvoices', 'Track time, expenses, generate invoices, and manage trust accounts')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="legal-billing" toolName="Legal Billing" />

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
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'timer' && renderTimer()}
        {activeTab === 'entries' && renderEntries()}
        {activeTab === 'expenses' && renderExpenses()}
        {activeTab === 'invoices' && renderInvoices()}
        {activeTab === 'trust' && renderTrust()}
        {activeTab === 'reports' && renderReports()}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg bg-red-500 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default LegalBillingTool;
