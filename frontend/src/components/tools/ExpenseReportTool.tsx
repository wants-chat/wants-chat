import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  DollarSign,
  Printer,
  Save,
  Download,
  Trash2,
  Plus,
  Edit2,
  Calendar,
  User,
  Building2,
  FileText,
  Clock,
  CreditCard,
  Wallet,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptRef: string;
  paymentMethod: PaymentMethod;
}

type ExpenseCategory = 'Travel' | 'Meals' | 'Lodging' | 'Transportation' | 'Supplies' | 'Other';
type PaymentMethod = 'Cash' | 'Card' | 'Company Card';
type ReportStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

interface ExpenseReport {
  id: string;
  title: string;
  dateFrom: string;
  dateTo: string;
  employeeName: string;
  department: string;
  status: ReportStatus;
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

type SortField = 'date' | 'category' | 'amount';
type SortDirection = 'asc' | 'desc';

const CATEGORIES: ExpenseCategory[] = ['Travel', 'Meals', 'Lodging', 'Transportation', 'Supplies', 'Other'];
const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Company Card'];
const STATUSES: ReportStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Travel: '#3B82F6',
  Meals: '#10B981',
  Lodging: '#8B5CF6',
  Transportation: '#F59E0B',
  Supplies: '#EF4444',
  Other: '#6B7280',
};

const STATUS_STYLES: Record<ReportStatus, { bg: string; text: string; icon: React.ElementType }> = {
  Draft: { bg: 'bg-gray-500', text: 'text-gray-500', icon: FileText },
  Submitted: { bg: 'bg-blue-500', text: 'text-blue-500', icon: Clock },
  Approved: { bg: 'bg-green-500', text: 'text-green-500', icon: CheckCircle },
  Rejected: { bg: 'bg-red-500', text: 'text-red-500', icon: XCircle },
};

// Column configuration for export
const EXPENSE_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'paymentMethod', header: 'Payment Method', type: 'string' },
  { key: 'receiptRef', header: 'Receipt Reference', type: 'string' },
];

// Column configuration for expense reports (for backend sync)
const REPORT_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Report Title', type: 'string' },
  { key: 'dateFrom', header: 'Date From', type: 'date' },
  { key: 'dateTo', header: 'Date To', type: 'date' },
  { key: 'employeeName', header: 'Employee', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'updatedAt', header: 'Updated', type: 'date' },
];

interface ExpenseReportToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

export const ExpenseReportTool: React.FC<ExpenseReportToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use the useToolData hook for backend persistence of saved reports
  const {
    data: savedReports,
    setData: setSavedReports,
    addItem: addReport,
    updateItem: updateReport,
    deleteItem: deleteReport,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print: printReports,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ExpenseReport>('expense-report', [], REPORT_COLUMNS);

  // Report Header State
  const [reportTitle, setReportTitle] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<ReportStatus>('Draft');

  // Expense Entry State
  const [expenseDate, setExpenseDate] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Travel');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReceiptRef, setExpenseReceiptRef] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<PaymentMethod>('Card');
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Expenses List
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.title) setReportTitle(prefillData.params.title);
      if (prefillData.params.employeeName) setEmployeeName(prefillData.params.employeeName);
      if (prefillData.params.department) setDepartment(prefillData.params.department);
      if (prefillData.params.dateFrom) setDateFrom(prefillData.params.dateFrom);
      if (prefillData.params.dateTo) setDateTo(prefillData.params.dateTo);
      setIsPrefilled(true);
    }
  }, [prefillData]);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add or Update Expense
  const handleAddExpense = () => {
    if (!expenseDate || !expenseDescription.trim() || !expenseAmount) {
      setValidationMessage('Please fill in date, description, and amount');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      setValidationMessage('Please enter a valid amount greater than 0');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingExpenseId) {
      // Update existing expense
      setExpenses(prev =>
        prev.map(exp =>
          exp.id === editingExpenseId
            ? {
                ...exp,
                date: expenseDate,
                category: expenseCategory,
                description: expenseDescription.trim(),
                amount,
                receiptRef: expenseReceiptRef.trim(),
                paymentMethod: expensePaymentMethod,
              }
            : exp
        )
      );
      setEditingExpenseId(null);
    } else {
      // Add new expense
      const newExpense: Expense = {
        id: generateId(),
        date: expenseDate,
        category: expenseCategory,
        description: expenseDescription.trim(),
        amount,
        receiptRef: expenseReceiptRef.trim(),
        paymentMethod: expensePaymentMethod,
      };
      setExpenses(prev => [...prev, newExpense]);
    }

    // Reset form
    setExpenseDate('');
    setExpenseDescription('');
    setExpenseAmount('');
    setExpenseReceiptRef('');
  };

  // Edit Expense
  const handleEditExpense = (expense: Expense) => {
    setExpenseDate(expense.date);
    setExpenseCategory(expense.category);
    setExpenseDescription(expense.description);
    setExpenseAmount(expense.amount.toString());
    setExpenseReceiptRef(expense.receiptRef);
    setExpensePaymentMethod(expense.paymentMethod);
    setEditingExpenseId(expense.id);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    if (editingExpenseId === id) {
      setEditingExpenseId(null);
      setExpenseDate('');
      setExpenseDescription('');
      setExpenseAmount('');
      setExpenseReceiptRef('');
    }
  };

  // Sort expenses
  const sortExpenses = (exps: Expense[]): Expense[] => {
    return [...exps].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Calculate totals by category
  const categoryTotals = useMemo(() =>
    CATEGORIES.reduce((acc, cat) => {
      acc[cat] = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
      return acc;
    }, {} as Record<ExpenseCategory, number>),
    [expenses]
  );

  // Text-based pie chart representation
  const renderCategoryBreakdown = (total: number) => {
    if (total === 0) return null;

    const sortedCategories = CATEGORIES.filter(cat => categoryTotals[cat] > 0).sort(
      (a, b) => categoryTotals[b] - categoryTotals[a]
    );

    return (
      <div className="space-y-2">
        {sortedCategories.map(cat => {
          const percentage = (categoryTotals[cat] / total) * 100;
          const barWidth = Math.max(percentage, 2);
          return (
            <div key={cat}>
              <div className="flex justify-between text-sm mb-1">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{cat}</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${categoryTotals[cat].toFixed(2)} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{ width: `${barWidth}%`, backgroundColor: CATEGORY_COLORS[cat] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Save report
  const handleSaveReport = () => {
    if (!reportTitle.trim()) {
      setValidationMessage('Please enter a report title');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();

    if (currentReportId) {
      // Update existing report
      updateReport(currentReportId, {
        title: reportTitle.trim(),
        dateFrom,
        dateTo,
        employeeName: employeeName.trim(),
        department: department.trim(),
        status,
        expenses,
        updatedAt: now,
      });
    } else {
      // Create new report
      const newReport: ExpenseReport = {
        id: generateId(),
        title: reportTitle.trim(),
        dateFrom,
        dateTo,
        employeeName: employeeName.trim(),
        department: department.trim(),
        status,
        expenses,
        createdAt: now,
        updatedAt: now,
      };
      addReport(newReport);
      setCurrentReportId(newReport.id);
    }

    setValidationMessage('Report saved successfully!');
    setTimeout(() => setValidationMessage(null), 3000);
  };

  // Load report from history
  const handleLoadReport = (report: ExpenseReport) => {
    setReportTitle(report.title);
    setDateFrom(report.dateFrom);
    setDateTo(report.dateTo);
    setEmployeeName(report.employeeName);
    setDepartment(report.department);
    setStatus(report.status);
    setExpenses(report.expenses);
    setCurrentReportId(report.id);
    setShowHistory(false);
  };

  // Delete report from history
  const handleDeleteReport = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Report',
      message: 'Are you sure you want to delete this report?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteReport(id);
    if (currentReportId === id) {
      handleClearAll();
    }
  };

  // Export as text
  const handleExport = () => {
    const lines: string[] = [
      '='.repeat(60),
      'EXPENSE REPORT',
      '='.repeat(60),
      '',
      `Report Title: ${reportTitle || 'Untitled'}`,
      `Date Range: ${dateFrom || 'N/A'} to ${dateTo || 'N/A'}`,
      `Employee: ${employeeName || 'N/A'}`,
      `Department: ${department || 'N/A'}`,
      `Status: ${status}`,
      '',
      '-'.repeat(60),
      'EXPENSES',
      '-'.repeat(60),
      '',
    ];

    sortExpenses(expenses).forEach((exp, idx) => {
      lines.push(`${idx + 1}. ${exp.date} | ${exp.category}`);
      lines.push(`   Description: ${exp.description}`);
      lines.push(`   Amount: $${exp.amount.toFixed(2)} | Payment: ${exp.paymentMethod}`);
      if (exp.receiptRef) lines.push(`   Receipt Ref: ${exp.receiptRef}`);
      lines.push('');
    });

    lines.push('-'.repeat(60));
    lines.push('SUMMARY BY CATEGORY');
    lines.push('-'.repeat(60));
    lines.push('');

    CATEGORIES.forEach(cat => {
      if (categoryTotals[cat] > 0) {
        const pct = ((categoryTotals[cat] / grandTotal) * 100).toFixed(1);
        lines.push(`${cat.padEnd(16)} $${categoryTotals[cat].toFixed(2).padStart(10)} (${pct}%)`);
      }
    });

    lines.push('');
    lines.push('='.repeat(60));
    lines.push(`GRAND TOTAL: $${grandTotal.toFixed(2)}`);
    lines.push('='.repeat(60));

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${reportTitle || 'export'}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Clear all
  const handleClearAll = async () => {
    if (expenses.length > 0) {
      const confirmed = await confirm({
        title: 'Clear All Data',
        message: 'Are you sure you want to clear all data? This action cannot be undone.',
        confirmText: 'Clear',
        cancelText: 'Cancel',
        variant: 'danger',
      });
      if (!confirmed) return;
    }
    setReportTitle('');
    setDateFrom('');
    setDateTo('');
    setEmployeeName('');
    setDepartment('');
    setStatus('Draft');
    setExpenses([]);
    setCurrentReportId(null);
    setEditingExpenseId(null);
    setExpenseDate('');
    setExpenseDescription('');
    setExpenseAmount('');
    setExpenseReceiptRef('');
  };

  // Export handlers - use hook functions for reports, but export current expenses
  const getExportFilename = () => `expense-report-${reportTitle || 'export'}`;

  const handleExportCSV = () => {
    exportCSV({ filename: getExportFilename() });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: getExportFilename() });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: getExportFilename() });
  };

  const handleExportPDF = async () => {
    const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    await exportPDF({
      filename: getExportFilename(),
      title: reportTitle || 'Expense Report',
      subtitle: `${employeeName ? `Employee: ${employeeName}` : ''}${department ? ` | Department: ${department}` : ''}${dateFrom && dateTo ? ` | Period: ${dateFrom} to ${dateTo}` : ''} | Total: $${grandTotal.toFixed(2)}`,
      orientation: 'landscape',
    });
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  const handlePrintData = () => {
    printReports(reportTitle || 'Expense Report');
  };

  const handleImportCSV = async (file: File) => {
    await importCSV(file);
  };

  const handleImportJSON = async (file: File) => {
    await importJSON(file);
  };

  const sortedExpenses = sortExpenses(expenses);
  const StatusIcon = STATUS_STYLES[status].icon;

  // Calculate grand total using useMemo for performance
  const grandTotal = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4 print:bg-white print:p-4`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 print:shadow-none`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg print:bg-gray-200">
                <Receipt className="w-6 h-6 text-white print:text-gray-800" />
              </div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.expenseReport.expenseReportGenerator', 'Expense Report Generator')}
              </h1>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <WidgetEmbedButton toolSlug="expense-report" toolName="Expense Report" />

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
                onPrint={handlePrintData}
                onCopyToClipboard={handleCopyToClipboard}
                onImportCSV={handleImportCSV}
                onImportJSON={handleImportJSON}
                disabled={savedReports.length === 0}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>

          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className={`mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              <Sparkles className="w-4 h-4" />
              <span>{t('tools.expenseReport.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
            </div>
          )}

          {/* Report Header Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.reportTitle', 'Report Title')}
              </label>
              <div className="relative">
                <FileText className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={reportTitle}
                  onChange={e => setReportTitle(e.target.value)}
                  placeholder={t('tools.expenseReport.q42024BusinessTripExpenses', 'Q4 2024 Business Trip Expenses')}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.status', 'Status')}
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ReportStatus)}
                  className={`w-full px-4 py-3 rounded-lg border appearance-none ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-medium text-white ${STATUS_STYLES[status].bg}`}>
                  <StatusIcon className="w-4 h-4 inline-block" />
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.dateFrom', 'Date From')}
              </label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.dateTo', 'Date To')}
              </label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.employeeName', 'Employee Name')}
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={employeeName}
                  onChange={e => setEmployeeName(e.target.value)}
                  placeholder={t('tools.expenseReport.johnDoe', 'John Doe')}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.department', 'Department')}
              </label>
              <div className="relative">
                <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder={t('tools.expenseReport.engineering', 'Engineering')}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expense Entry Form */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 print:hidden`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingExpenseId ? t('tools.expenseReport.editExpense', 'Edit Expense') : t('tools.expenseReport.addExpense', 'Add Expense')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.date', 'Date *')}
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.category', 'Category')}
              </label>
              <select
                value={expenseCategory}
                onChange={e => setExpenseCategory(e.target.value as ExpenseCategory)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.amount', 'Amount ($) *')}
              </label>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.paymentMethod', 'Payment Method')}
              </label>
              <select
                value={expensePaymentMethod}
                onChange={e => setExpensePaymentMethod(e.target.value as PaymentMethod)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.description', 'Description *')}
              </label>
              <input
                type="text"
                value={expenseDescription}
                onChange={e => setExpenseDescription(e.target.value)}
                placeholder={t('tools.expenseReport.flightToNycBusinessMeeting', 'Flight to NYC - Business meeting')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.expenseReport.receiptReference', 'Receipt Reference')}
              </label>
              <input
                type="text"
                value={expenseReceiptRef}
                onChange={e => setExpenseReceiptRef(e.target.value)}
                placeholder={t('tools.expenseReport.rec2024001', 'REC-2024-001')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddExpense}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {editingExpenseId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingExpenseId ? t('tools.expenseReport.updateExpense', 'Update Expense') : t('tools.expenseReport.addExpense2', 'Add Expense')}
            </button>
            {editingExpenseId && (
              <button
                onClick={() => {
                  setEditingExpenseId(null);
                  setExpenseDate('');
                  setExpenseDescription('');
                  setExpenseAmount('');
                  setExpenseReceiptRef('');
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.expenseReport.cancel', 'Cancel')}
              </button>
            )}
          </div>
        </div>

        {/* Expense Table */}
        {expenses.length > 0 && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 print:shadow-none`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Expenses ({expenses.length})
              </h2>
              <div className={`text-lg font-bold ${isDark ? t('tools.expenseReport.text0d9488', 'text-[#0D9488]') : t('tools.expenseReport.text0d94882', 'text-[#0D9488]')}`}>
                Running Total: ${grandTotal.toFixed(2)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th
                      className={`text-left py-3 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th
                      className={`text-left py-3 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                      onClick={() => toggleSort('category')}
                    >
                      <div className="flex items-center gap-1">
                        Category
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className={`text-left py-3 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.expenseReport.description2', 'Description')}
                    </th>
                    <th className={`text-left py-3 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.expenseReport.payment', 'Payment')}
                    </th>
                    <th className={`text-left py-3 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.expenseReport.receipt', 'Receipt')}
                    </th>
                    <th
                      className={`text-right py-3 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                      onClick={() => toggleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Amount
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className={`text-center py-3 px-2 print:hidden ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.expenseReport.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExpenses.map(expense => (
                    <tr
                      key={expense.id}
                      className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                    >
                      <td className={`py-3 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className={`py-3 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {expense.description}
                      </td>
                      <td className={`py-3 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-1">
                          {expense.paymentMethod === 'Cash' ? (
                            <Wallet className="w-4 h-4" />
                          ) : (
                            <CreditCard className="w-4 h-4" />
                          )}
                          {expense.paymentMethod}
                        </div>
                      </td>
                      <td className={`py-3 px-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                        {expense.receiptRef || '-'}
                      </td>
                      <td className={`py-3 px-2 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center print:hidden">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title={t('tools.expenseReport.edit', 'Edit')}
                          >
                            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Section */}
        {expenses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 print:shadow-none`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.expenseReport.totalByCategory', 'Total by Category')}
              </h2>
              {renderCategoryBreakdown(grandTotal)}
            </div>

            {/* Grand Total */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 print:shadow-none`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.expenseReport.summary', 'Summary')}
              </h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.expenseReport.totalExpenses', 'Total Expenses')}</div>
                  <div className="text-3xl font-bold text-[#0D9488]">{expenses.length}</div>
                </div>
                <div className={`p-4 rounded-lg border-2 border-[#0D9488] ${isDark ? 'bg-gray-700' : t('tools.expenseReport.bg0d948810', 'bg-[#0D9488]/10')}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.expenseReport.grandTotal', 'Grand Total')}</div>
                  <div className="text-4xl font-bold text-[#0D9488]">${grandTotal.toFixed(2)}</div>
                </div>

                {/* Text-based pie chart representation */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.expenseReport.categoryDistribution', 'Category Distribution')}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {CATEGORIES.filter(cat => categoryTotals[cat] > 0).map(cat => {
                      const pct = (categoryTotals[cat] / grandTotal) * 100;
                      const blocks = Math.max(1, Math.round(pct / 5));
                      return (
                        <div key={cat} className="flex items-center gap-1" title={`${cat}: ${pct.toFixed(1)}%`}>
                          {Array.from({ length: blocks }).map((_, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CATEGORIES.filter(cat => categoryTotals[cat] > 0).map(cat => (
                      <div key={cat} className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Actions */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 print:hidden`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.expenseReport.reportActions', 'Report Actions')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={handleSaveReport}
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {t('tools.expenseReport.saveDraft', 'Save Draft')}
            </button>
            <button
              onClick={handleExport}
              disabled={expenses.length === 0}
              className={`font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                expenses.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Download className="w-5 h-5" />
              {t('tools.expenseReport.exportText', 'Export Text')}
            </button>
            <button
              onClick={handlePrint}
              disabled={expenses.length === 0}
              className={`font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                expenses.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isDark
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <Printer className="w-5 h-5" />
              {t('tools.expenseReport.printView', 'Print View')}
            </button>
            <button
              onClick={handleClearAll}
              className={`font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              {t('tools.expenseReport.clearAll', 'Clear All')}
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 print:hidden`}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-3">
              <History className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Saved Reports ({savedReports.length})
              </h2>
            </div>
            {showHistory ? (
              <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </button>

          {showHistory && (
            <div className="mt-4 space-y-3">
              {savedReports.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.expenseReport.noSavedReportsYetSave', 'No saved reports yet. Save your first report above!')}
                </p>
              ) : (
                savedReports.map(report => {
                  const ReportStatusIcon = STATUS_STYLES[report.status].icon;
                  const total = report.expenses.reduce((sum, e) => sum + e.amount, 0);
                  return (
                    <div
                      key={report.id}
                      className={`p-4 rounded-lg border ${
                        currentReportId === report.id
                          ? 'border-[#0D9488] bg-[#0D9488]/10'
                          : isDark
                          ? 'border-gray-700 bg-gray-700/50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {report.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium text-white ${STATUS_STYLES[report.status].bg}`}
                            >
                              <ReportStatusIcon className="w-3 h-3 inline-block mr-1" />
                              {report.status}
                            </span>
                            {currentReportId === report.id && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#0D9488] text-white">
                                {t('tools.expenseReport.current', 'Current')}
                              </span>
                            )}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {report.dateFrom && report.dateTo
                              ? `${new Date(report.dateFrom).toLocaleDateString()} - ${new Date(report.dateTo).toLocaleDateString()}`
                              : 'No date range'}
                            {' | '}
                            {report.expenses.length} expense{report.expenses.length !== 1 ? 's' : ''}
                            {' | '}
                            <span className="font-medium text-[#0D9488]">${total.toFixed(2)}</span>
                          </div>
                          <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Updated: {new Date(report.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadReport(report)}
                            className="px-3 py-1.5 rounded text-sm font-medium bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
                          >
                            {t('tools.expenseReport.load', 'Load')}
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title={t('tools.expenseReport.deleteReport', 'Delete Report')}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {expenses.length === 0 && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center print:hidden`}>
            <Receipt className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.expenseReport.noExpensesYet', 'No Expenses Yet')}
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.expenseReport.startAddingExpensesUsingThe', 'Start adding expenses using the form above to build your expense report.')}
            </p>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            validationMessage.includes('successfully')
              ? isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
              : isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
          }`}>
            {validationMessage.includes('successfully') ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ExpenseReportTool;
