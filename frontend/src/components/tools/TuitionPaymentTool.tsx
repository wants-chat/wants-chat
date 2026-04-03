'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Sparkles,
  Users,
  Receipt,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Send,
  Download,
  Eye,
  Percent,
  GraduationCap,
  Building2,
  Mail,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

// ============ INTERFACES ============
interface TuitionPaymentToolProps {
  uiConfig?: UIConfig;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  studentId: string;
  programId: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
  balance: number;
  createdAt: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
  tuitionCost: number;
  duration: string;
  paymentFrequency: 'semester' | 'monthly' | 'annual' | 'one-time';
}

interface Fee {
  id: string;
  name: string;
  amount: number;
  type: 'tuition' | 'registration' | 'books' | 'technology' | 'activity' | 'other';
  description?: string;
  dueDate: string;
  isRecurring: boolean;
  frequency?: 'monthly' | 'semester' | 'annual';
  createdAt: string;
}

interface Payment {
  id: string;
  studentId: string;
  amount: number;
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'check' | 'cash' | 'financial_aid';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference: string;
  description: string;
  paymentDate: string;
  processedAt?: string;
  feeIds: string[];
  createdAt: string;
}

interface Invoice {
  id: string;
  studentId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentPlan {
  id: string;
  studentId: string;
  name: string;
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  startDate: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  status: 'active' | 'completed' | 'defaulted';
  paidInstallments: number;
  nextPaymentDate: string;
  createdAt: string;
}

type ActiveTab = 'payments' | 'invoices' | 'students' | 'fees' | 'plans' | 'reports';

// Column configurations for exports
const PAYMENT_COLUMNS: ColumnConfig[] = [
  { key: 'studentName', header: 'Student', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'method', header: 'Payment Method', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'reference', header: 'Reference', type: 'string' },
  { key: 'paymentDate', header: 'Payment Date', type: 'date' },
  { key: 'description', header: 'Description', type: 'string' },
];

const INVOICE_COLUMNS: ColumnConfig[] = [
  { key: 'invoiceNumber', header: 'Invoice #', type: 'string' },
  { key: 'studentName', header: 'Student', type: 'string' },
  { key: 'issueDate', header: 'Issue Date', type: 'date' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'total', header: 'Total', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

// ============ HELPER FUNCTIONS ============
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}-${random}`;
};

const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'debit_card', label: 'Debit Card', icon: '💳' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'check', label: 'Check', icon: '📝' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'financial_aid', label: 'Financial Aid', icon: '🎓' },
];

const FEE_TYPES = [
  { value: 'tuition', label: 'Tuition', color: 'blue' },
  { value: 'registration', label: 'Registration', color: 'green' },
  { value: 'books', label: 'Books & Materials', color: 'purple' },
  { value: 'technology', label: 'Technology Fee', color: 'orange' },
  { value: 'activity', label: 'Activity Fee', color: 'pink' },
  { value: 'other', label: 'Other', color: 'gray' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', darkBg: 'bg-yellow-900/30', darkText: 'text-yellow-400' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/30', darkText: 'text-green-400' },
  paid: { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/30', darkText: 'text-green-400' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'bg-red-900/30', darkText: 'text-red-400' },
  refunded: { bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'bg-gray-900/30', darkText: 'text-gray-400' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'bg-gray-900/30', darkText: 'text-gray-400' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'bg-blue-900/30', darkText: 'text-blue-400' },
  overdue: { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'bg-red-900/30', darkText: 'text-red-400' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'bg-gray-900/30', darkText: 'text-gray-400' },
  active: { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/30', darkText: 'text-green-400' },
  defaulted: { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'bg-red-900/30', darkText: 'text-red-400' },
};

// ============ SAMPLE DATA GENERATOR ============
const generateSampleData = () => {
  const now = new Date().toISOString();

  const programs: Program[] = [
    { id: 'prog-1', name: 'Computer Science', code: 'CS101', tuitionCost: 15000, duration: '4 years', paymentFrequency: 'semester' },
    { id: 'prog-2', name: 'Business Administration', code: 'BA101', tuitionCost: 12000, duration: '4 years', paymentFrequency: 'semester' },
    { id: 'prog-3', name: 'Nursing Program', code: 'NUR101', tuitionCost: 18000, duration: '2 years', paymentFrequency: 'semester' },
  ];

  const students: Student[] = [
    { id: 'stu-1', firstName: 'Emma', lastName: 'Johnson', email: 'emma.j@email.com', phone: '555-0101', studentId: 'STU001', programId: 'prog-1', enrollmentDate: '2024-08-15', status: 'active', balance: 7500, createdAt: now },
    { id: 'stu-2', firstName: 'Liam', lastName: 'Smith', email: 'liam.s@email.com', phone: '555-0102', studentId: 'STU002', programId: 'prog-1', enrollmentDate: '2024-08-20', status: 'active', balance: 0, createdAt: now },
    { id: 'stu-3', firstName: 'Olivia', lastName: 'Williams', email: 'olivia.w@email.com', phone: '555-0103', studentId: 'STU003', programId: 'prog-2', enrollmentDate: '2024-09-01', status: 'active', balance: 3000, createdAt: now },
  ];

  const fees: Fee[] = [
    { id: 'fee-1', name: 'Fall 2024 Tuition', amount: 7500, type: 'tuition', description: 'Fall semester tuition', dueDate: '2024-09-01', isRecurring: true, frequency: 'semester', createdAt: now },
    { id: 'fee-2', name: 'Registration Fee', amount: 250, type: 'registration', description: 'One-time registration fee', dueDate: '2024-08-15', isRecurring: false, createdAt: now },
    { id: 'fee-3', name: 'Technology Fee', amount: 150, type: 'technology', description: 'Semester technology fee', dueDate: '2024-09-01', isRecurring: true, frequency: 'semester', createdAt: now },
    { id: 'fee-4', name: 'Books & Materials', amount: 500, type: 'books', description: 'Estimated book costs', dueDate: '2024-09-01', isRecurring: true, frequency: 'semester', createdAt: now },
  ];

  const payments: Payment[] = [
    { id: 'pay-1', studentId: 'stu-2', amount: 7500, method: 'bank_transfer', status: 'completed', reference: 'TXN-2024-001', description: 'Fall 2024 Tuition Payment', paymentDate: '2024-08-25', processedAt: '2024-08-25', feeIds: ['fee-1'], createdAt: now },
    { id: 'pay-2', studentId: 'stu-3', amount: 3000, method: 'credit_card', status: 'completed', reference: 'TXN-2024-002', description: 'Partial Tuition Payment', paymentDate: '2024-08-30', processedAt: '2024-08-30', feeIds: ['fee-1'], createdAt: now },
    { id: 'pay-3', studentId: 'stu-1', amount: 250, method: 'credit_card', status: 'pending', reference: 'TXN-2024-003', description: 'Registration Fee', paymentDate: getCurrentDate(), feeIds: ['fee-2'], createdAt: now },
  ];

  const invoices: Invoice[] = [
    {
      id: 'inv-1',
      studentId: 'stu-1',
      invoiceNumber: 'INV-2024-0001',
      issueDate: '2024-08-01',
      dueDate: '2024-09-01',
      items: [
        { id: 'item-1', description: 'Fall 2024 Tuition', quantity: 1, unitPrice: 7500, total: 7500 },
        { id: 'item-2', description: 'Technology Fee', quantity: 1, unitPrice: 150, total: 150 },
      ],
      subtotal: 7650,
      discount: 0,
      tax: 0,
      total: 7650,
      status: 'sent',
      createdAt: now,
    },
  ];

  const paymentPlans: PaymentPlan[] = [
    {
      id: 'plan-1',
      studentId: 'stu-1',
      name: 'Fall Semester Payment Plan',
      totalAmount: 7500,
      installments: 5,
      installmentAmount: 1500,
      startDate: '2024-09-01',
      frequency: 'monthly',
      status: 'active',
      paidInstallments: 1,
      nextPaymentDate: '2024-10-01',
      createdAt: now,
    },
  ];

  return { programs, students, fees, payments, invoices, paymentPlans };
};

// ============ MAIN COMPONENT ============
export const TuitionPaymentTool: React.FC<TuitionPaymentToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize sample data
  const defaultData = generateSampleData();

  // Use useToolData hooks for backend sync
  const {
    data: payments,
    addItem: addPayment,
    updateItem: updatePayment,
    deleteItem: deletePayment,
    isSynced: paymentsSynced,
    isSaving: paymentsSaving,
    lastSaved: paymentsLastSaved,
    syncError: paymentsSyncError,
    forceSync: forcePaymentsSync,
    exportCSV: exportPaymentsCSV,
    exportExcel: exportPaymentsExcel,
    exportJSON: exportPaymentsJSON,
    exportPDF: exportPaymentsPDF,
    copyToClipboard: copyPaymentsToClipboard,
    print: printPayments,
  } = useToolData<Payment>('tuition-payment-payments', defaultData.payments, PAYMENT_COLUMNS);

  const {
    data: students,
    addItem: addStudent,
    updateItem: updateStudent,
    deleteItem: deleteStudent,
  } = useToolData<Student>('tuition-payment-students', defaultData.students, []);

  const {
    data: invoices,
    addItem: addInvoice,
    updateItem: updateInvoice,
    deleteItem: deleteInvoice,
  } = useToolData<Invoice>('tuition-payment-invoices', defaultData.invoices, INVOICE_COLUMNS);

  const {
    data: fees,
    addItem: addFee,
    updateItem: updateFee,
    deleteItem: deleteFee,
  } = useToolData<Fee>('tuition-payment-fees', defaultData.fees, []);

  const {
    data: paymentPlans,
    addItem: addPaymentPlan,
    updateItem: updatePaymentPlan,
    deleteItem: deletePaymentPlan,
  } = useToolData<PaymentPlan>('tuition-payment-plans', defaultData.paymentPlans, []);

  const [programs] = useState<Program[]>(defaultData.programs);

  // State
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('payments');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('');

  // Form states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [showPaymentPlanForm, setShowPaymentPlanForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    amount: 0,
    method: 'credit_card' as Payment['method'],
    description: '',
    feeIds: [] as string[],
  });

  // Fee form
  const [feeForm, setFeeForm] = useState({
    name: '',
    amount: 0,
    type: 'tuition' as Fee['type'],
    description: '',
    dueDate: getCurrentDate(),
    isRecurring: false,
    frequency: 'semester' as Fee['frequency'],
  });

  // Invoice form
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    dueDate: '',
    items: [{ id: generateId(), description: '', quantity: 1, unitPrice: 0, total: 0 }] as InvoiceItem[],
    discount: 0,
    tax: 0,
    notes: '',
  });

  // Payment plan form
  const [planForm, setPlanForm] = useState({
    studentId: '',
    name: '',
    totalAmount: 0,
    installments: 3,
    startDate: getCurrentDate(),
    frequency: 'monthly' as PaymentPlan['frequency'],
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount || params.studentId) {
        setPaymentForm(prev => ({
          ...prev,
          amount: params.amount || 0,
          studentId: params.studentId || '',
        }));
        setShowPaymentForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig, isPrefilled]);

  // ============ COMPUTED VALUES ============
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const student = students.find(s => s.id === payment.studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : '';
      const matchesSearch = !searchTerm ||
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || payment.status === filterStatus;
      const matchesMethod = !filterMethod || payment.method === filterMethod;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, students, searchTerm, filterStatus, filterMethod]);

  const stats = useMemo(() => {
    const totalReceived = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = students.reduce((sum, s) => sum + s.balance, 0);
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue' || (inv.status === 'sent' && new Date(inv.dueDate) < new Date()));

    return {
      totalReceived,
      totalPending,
      totalOutstanding,
      overdueCount: overdueInvoices.length,
      activeStudents: students.filter(s => s.status === 'active').length,
      paymentPlansActive: paymentPlans.filter(p => p.status === 'active').length,
    };
  }, [payments, students, invoices, paymentPlans]);

  // ============ HANDLERS ============
  const handleRecordPayment = () => {
    if (!paymentForm.studentId || paymentForm.amount <= 0) return;

    const now = new Date().toISOString();
    const reference = `TXN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const newPayment: Payment = {
      id: generateId(),
      studentId: paymentForm.studentId,
      amount: paymentForm.amount,
      method: paymentForm.method,
      status: 'pending',
      reference,
      description: paymentForm.description,
      paymentDate: getCurrentDate(),
      feeIds: paymentForm.feeIds,
      createdAt: now,
    };

    addPayment(newPayment);

    // Update student balance
    const student = students.find(s => s.id === paymentForm.studentId);
    if (student) {
      updateStudent(student.id, { balance: Math.max(0, student.balance - paymentForm.amount) });
    }

    resetPaymentForm();
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      studentId: '',
      amount: 0,
      method: 'credit_card',
      description: '',
      feeIds: [],
    });
    setEditingPayment(null);
    setShowPaymentForm(false);
  };

  const handleProcessPayment = (paymentId: string) => {
    updatePayment(paymentId, {
      status: 'completed',
      processedAt: new Date().toISOString(),
    });
  };

  const handleRefundPayment = (payment: Payment) => {
    updatePayment(payment.id, { status: 'refunded' });

    // Restore student balance
    const student = students.find(s => s.id === payment.studentId);
    if (student) {
      updateStudent(student.id, { balance: student.balance + payment.amount });
    }
  };

  const handleSaveFee = () => {
    if (!feeForm.name || feeForm.amount <= 0) return;

    const newFee: Fee = {
      id: generateId(),
      ...feeForm,
      createdAt: new Date().toISOString(),
    };

    addFee(newFee);
    setFeeForm({
      name: '',
      amount: 0,
      type: 'tuition',
      description: '',
      dueDate: getCurrentDate(),
      isRecurring: false,
      frequency: 'semester',
    });
    setShowFeeForm(false);
  };

  const handleCreateInvoice = () => {
    if (!invoiceForm.studentId || invoiceForm.items.length === 0) return;

    const items = invoiceForm.items.filter(item => item.description && item.unitPrice > 0);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - invoiceForm.discount + invoiceForm.tax;

    const newInvoice: Invoice = {
      id: generateId(),
      studentId: invoiceForm.studentId,
      invoiceNumber: generateInvoiceNumber(),
      issueDate: getCurrentDate(),
      dueDate: invoiceForm.dueDate,
      items,
      subtotal,
      discount: invoiceForm.discount,
      tax: invoiceForm.tax,
      total,
      status: 'draft',
      notes: invoiceForm.notes,
      createdAt: new Date().toISOString(),
    };

    addInvoice(newInvoice);
    setInvoiceForm({
      studentId: '',
      dueDate: '',
      items: [{ id: generateId(), description: '', quantity: 1, unitPrice: 0, total: 0 }],
      discount: 0,
      tax: 0,
      notes: '',
    });
    setShowInvoiceForm(false);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    updateInvoice(invoice.id, { status: 'sent' });
  };

  const handleCreatePaymentPlan = () => {
    if (!planForm.studentId || planForm.totalAmount <= 0 || planForm.installments <= 0) return;

    const installmentAmount = planForm.totalAmount / planForm.installments;
    const nextDate = new Date(planForm.startDate);
    if (planForm.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (planForm.frequency === 'bi-weekly') nextDate.setDate(nextDate.getDate() + 14);
    else nextDate.setDate(nextDate.getDate() + 7);

    const newPlan: PaymentPlan = {
      id: generateId(),
      studentId: planForm.studentId,
      name: planForm.name,
      totalAmount: planForm.totalAmount,
      installments: planForm.installments,
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      startDate: planForm.startDate,
      frequency: planForm.frequency,
      status: 'active',
      paidInstallments: 0,
      nextPaymentDate: nextDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    addPaymentPlan(newPlan);
    setPlanForm({
      studentId: '',
      name: '',
      totalAmount: 0,
      installments: 3,
      startDate: getCurrentDate(),
      frequency: 'monthly',
    });
    setShowPaymentPlanForm(false);
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...invoiceForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    setInvoiceForm({ ...invoiceForm, items: updatedItems });
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { id: generateId(), description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeInvoiceItem = (index: number) => {
    const updatedItems = invoiceForm.items.filter((_, i) => i !== index);
    setInvoiceForm({ ...invoiceForm, items: updatedItems.length > 0 ? updatedItems : [{ id: generateId(), description: '', quantity: 1, unitPrice: 0, total: 0 }] });
  };

  const getStudentById = (id: string) => students.find(s => s.id === id);
  const getProgramById = (id: string) => programs.find(p => p.id === id);

  // ============ RENDER ============
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.tuitionPayment.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.tuitionPayment.tuitionPaymentTracker', 'Tuition Payment Tracker')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.tuitionPayment.manageTuitionPaymentsInvoicesAnd', 'Manage tuition payments, invoices, and payment plans')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="tuition-payment" toolName="Tuition Payment" />

              <SyncStatus
                isSynced={paymentsSynced}
                isSaving={paymentsSaving}
                lastSaved={paymentsLastSaved}
                syncError={paymentsSyncError}
                onForceSync={forcePaymentsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportPaymentsCSV()}
                onExportExcel={() => exportPaymentsExcel()}
                onExportJSON={() => exportPaymentsJSON()}
                onExportPDF={() => exportPaymentsPDF({ title: 'Tuition Payments Report' })}
                onCopyToClipboard={() => copyPaymentsToClipboard()}
                onPrint={() => printPayments('Tuition Payments Report')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tuitionPayment.received', 'Received')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats.totalReceived)}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tuitionPayment.pending', 'Pending')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats.totalPending)}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tuitionPayment.outstanding', 'Outstanding')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats.totalOutstanding)}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tuitionPayment.activeStudents', 'Active Students')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeStudents}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {[
              { id: 'payments', label: 'Payments', icon: DollarSign },
              { id: 'invoices', label: 'Invoices', icon: Receipt },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'fees', label: 'Fees', icon: FileText },
              { id: 'plans', label: 'Payment Plans', icon: Calendar },
              { id: 'reports', label: 'Reports', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
                    : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        placeholder={t('tools.tuitionPayment.searchPayments', 'Search payments...')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.tuitionPayment.allStatuses', 'All Statuses')}</option>
                    <option value="pending">{t('tools.tuitionPayment.pending2', 'Pending')}</option>
                    <option value="completed">{t('tools.tuitionPayment.completed', 'Completed')}</option>
                    <option value="failed">{t('tools.tuitionPayment.failed', 'Failed')}</option>
                    <option value="refunded">{t('tools.tuitionPayment.refunded', 'Refunded')}</option>
                  </select>
                  <select
                    value={filterMethod}
                    onChange={e => setFilterMethod(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.tuitionPayment.allMethods', 'All Methods')}</option>
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.tuitionPayment.recordPayment2', 'Record Payment')}
                  </button>
                </div>

                {/* Payments List */}
                <div className="space-y-3">
                  {filteredPayments.map(payment => {
                    const student = getStudentById(payment.studentId);
                    const methodInfo = PAYMENT_METHODS.find(m => m.value === payment.method);
                    return (
                      <div key={payment.id} className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className="text-lg">{methodInfo?.icon}</span>
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(payment.amount)}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {student ? `${student.firstName} ${student.lastName}` : 'Unknown'} | {payment.reference}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(payment.paymentDate)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isDark
                              ? STATUS_COLORS[payment.status]?.darkBg + ' ' + STATUS_COLORS[payment.status]?.darkText
                              : STATUS_COLORS[payment.status]?.bg + ' ' + STATUS_COLORS[payment.status]?.text
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                          <div className="flex items-center gap-2">
                            {payment.status === 'pending' && (
                              <button
                                onClick={() => handleProcessPayment(payment.id)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title={t('tools.tuitionPayment.processPayment', 'Process Payment')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {payment.status === 'completed' && (
                              <button
                                onClick={() => handleRefundPayment(payment)}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                title={t('tools.tuitionPayment.refund', 'Refund')}
                              >
                                <XCircle className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                              </button>
                            )}
                            <button
                              onClick={() => deletePayment(payment.id)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredPayments.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.tuitionPayment.noPaymentsFound', 'No payments found')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.invoices', 'Invoices')}</h2>
                  <button
                    onClick={() => setShowInvoiceForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.tuitionPayment.createInvoice2', 'Create Invoice')}
                  </button>
                </div>
                <div className="space-y-3">
                  {invoices.map(invoice => {
                    const student = getStudentById(invoice.studentId);
                    return (
                      <div key={invoice.id} className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{invoice.invoiceNumber}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                isDark
                                  ? STATUS_COLORS[invoice.status]?.darkBg + ' ' + STATUS_COLORS[invoice.status]?.darkText
                                  : STATUS_COLORS[invoice.status]?.bg + ' ' + STATUS_COLORS[invoice.status]?.text
                              }`}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {student ? `${student.firstName} ${student.lastName}` : 'Unknown'} | Due: {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(invoice.total)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                title={t('tools.tuitionPayment.view', 'View')}
                              >
                                <Eye className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                              </button>
                              {invoice.status === 'draft' && (
                                <button
                                  onClick={() => handleSendInvoice(invoice)}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                  title={t('tools.tuitionPayment.sendInvoice', 'Send Invoice')}
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteInvoice(invoice.id)}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {invoices.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.tuitionPayment.noInvoicesFound', 'No invoices found')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
                <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.studentAccounts', 'Student Accounts')}</h2>
                <div className="space-y-3">
                  {students.map(student => {
                    const program = getProgramById(student.programId);
                    return (
                      <div key={student.id} className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {student.studentId} | {program?.name || 'Unknown Program'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tuitionPayment.balance', 'Balance')}</p>
                            <p className={`font-semibold ${student.balance > 0 ? 'text-red-500' : isDark ? 'text-green-400' : 'text-green-600'}`}>
                              {formatCurrency(student.balance)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isDark
                              ? STATUS_COLORS[student.status]?.darkBg + ' ' + STATUS_COLORS[student.status]?.darkText
                              : STATUS_COLORS[student.status]?.bg + ' ' + STATUS_COLORS[student.status]?.text
                          }`}>
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fees Tab */}
            {activeTab === 'fees' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.feeSchedule', 'Fee Schedule')}</h2>
                  <button
                    onClick={() => setShowFeeForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.tuitionPayment.addFee2', 'Add Fee')}
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {fees.map(fee => {
                    const typeInfo = FEE_TYPES.find(t => t.value === fee.type);
                    return (
                      <div key={fee.id} className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                              {typeInfo?.label}
                            </span>
                            {fee.isRecurring && (
                              <span className={`px-2 py-0.5 text-xs rounded ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                {fee.frequency}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteFee(fee.id)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{fee.name}</h3>
                        <p className={`text-2xl font-bold text-[#0D9488] mt-1`}>{formatCurrency(fee.amount)}</p>
                        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Due: {formatDate(fee.dueDate)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment Plans Tab */}
            {activeTab === 'plans' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.paymentPlans', 'Payment Plans')}</h2>
                  <button
                    onClick={() => setShowPaymentPlanForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.tuitionPayment.createPlan', 'Create Plan')}
                  </button>
                </div>
                <div className="space-y-4">
                  {paymentPlans.map(plan => {
                    const student = getStudentById(plan.studentId);
                    const progress = (plan.paidInstallments / plan.installments) * 100;
                    return (
                      <div key={plan.id} className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isDark
                              ? STATUS_COLORS[plan.status]?.darkBg + ' ' + STATUS_COLORS[plan.status]?.darkText
                              : STATUS_COLORS[plan.status]?.bg + ' ' + STATUS_COLORS[plan.status]?.text
                          }`}>
                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.tuitionPayment.total', 'Total')}</p>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(plan.totalAmount)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.tuitionPayment.perInstallment', 'Per Installment')}</p>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(plan.installmentAmount)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.tuitionPayment.nextPayment', 'Next Payment')}</p>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(plan.nextPaymentDate)}</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.tuitionPayment.progress', 'Progress')}</span>
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>{plan.paidInstallments}/{plan.installments}</span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className="h-full rounded-full bg-[#0D9488]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {paymentPlans.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.tuitionPayment.noPaymentPlansFound', 'No payment plans found')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.financialReports', 'Financial Reports')}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.paymentSummary', 'Payment Summary')}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.tuitionPayment.totalReceived', 'Total Received')}</span>
                        <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(stats.totalReceived)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.tuitionPayment.pendingPayments', 'Pending Payments')}</span>
                        <span className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{formatCurrency(stats.totalPending)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.tuitionPayment.outstandingBalance', 'Outstanding Balance')}</span>
                        <span className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{formatCurrency(stats.totalOutstanding)}</span>
                      </div>
                      <hr className={isDark ? 'border-gray-700' : 'border-gray-200'} />
                      <div className="flex justify-between">
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.netRevenue', 'Net Revenue')}</span>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats.totalReceived)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.paymentMethods', 'Payment Methods')}</h3>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map(method => {
                        const count = payments.filter(p => p.method === method.value && p.status === 'completed').length;
                        const total = payments.filter(p => p.method === method.value && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
                        if (count === 0) return null;
                        return (
                          <div key={method.value} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{method.icon}</span>
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{method.label}</span>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(total)}</p>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{count} transactions</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.recordPayment', 'Record Payment')}</h2>
                <button onClick={resetPaymentForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.student', 'Student *')}</label>
                  <select
                    value={paymentForm.studentId}
                    onChange={e => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">{t('tools.tuitionPayment.selectStudent', 'Select Student')}</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.amount', 'Amount *')}</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.paymentMethod', 'Payment Method')}</label>
                  <select
                    value={paymentForm.method}
                    onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value as Payment['method'] })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.description', 'Description')}</label>
                  <input
                    type="text"
                    value={paymentForm.description}
                    onChange={e => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    placeholder={t('tools.tuitionPayment.eGFall2024Tuition', 'e.g., Fall 2024 Tuition Payment')}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetPaymentForm}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('tools.tuitionPayment.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleRecordPayment}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B]"
                >
                  {t('tools.tuitionPayment.recordPayment3', 'Record Payment')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fee Form Modal */}
        {showFeeForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.addFee', 'Add Fee')}</h2>
                <button onClick={() => setShowFeeForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.feeName', 'Fee Name *')}</label>
                  <input
                    type="text"
                    value={feeForm.name}
                    onChange={e => setFeeForm({ ...feeForm, name: e.target.value })}
                    placeholder={t('tools.tuitionPayment.eGFall2024Tuition2', 'e.g., Fall 2024 Tuition')}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.amount2', 'Amount *')}</label>
                    <input
                      type="number"
                      value={feeForm.amount}
                      onChange={e => setFeeForm({ ...feeForm, amount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.type', 'Type')}</label>
                    <select
                      value={feeForm.type}
                      onChange={e => setFeeForm({ ...feeForm, type: e.target.value as Fee['type'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      {FEE_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.dueDate', 'Due Date')}</label>
                  <input
                    type="date"
                    value={feeForm.dueDate}
                    onChange={e => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={feeForm.isRecurring}
                    onChange={e => setFeeForm({ ...feeForm, isRecurring: e.target.checked })}
                    className="w-4 h-4 text-[#0D9488]"
                  />
                  <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.recurringFee', 'Recurring Fee')}</label>
                </div>
                {feeForm.isRecurring && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.frequency', 'Frequency')}</label>
                    <select
                      value={feeForm.frequency}
                      onChange={e => setFeeForm({ ...feeForm, frequency: e.target.value as Fee['frequency'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="monthly">{t('tools.tuitionPayment.monthly', 'Monthly')}</option>
                      <option value="semester">{t('tools.tuitionPayment.semester', 'Semester')}</option>
                      <option value="annual">{t('tools.tuitionPayment.annual', 'Annual')}</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowFeeForm(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('tools.tuitionPayment.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveFee}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B]"
                >
                  {t('tools.tuitionPayment.addFee3', 'Add Fee')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Form Modal */}
        {showInvoiceForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`w-full max-w-2xl rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 my-8`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.createInvoice', 'Create Invoice')}</h2>
                <button onClick={() => setShowInvoiceForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.student2', 'Student *')}</label>
                    <select
                      value={invoiceForm.studentId}
                      onChange={e => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">{t('tools.tuitionPayment.selectStudent2', 'Select Student')}</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.dueDate2', 'Due Date *')}</label>
                    <input
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.items', 'Items')}</label>
                  {invoiceForm.items.map((item, i) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 mb-2">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateInvoiceItem(i, 'description', e.target.value)}
                          placeholder={t('tools.tuitionPayment.description3', 'Description')}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateInvoiceItem(i, 'quantity', parseInt(e.target.value) || 1)}
                          placeholder={t('tools.tuitionPayment.qty2', 'Qty')}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={e => updateInvoiceItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder={t('tools.tuitionPayment.price2', 'Price')}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} text-sm`}>
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => removeInvoiceItem(i)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addInvoiceItem}
                    className="text-[#0D9488] text-sm hover:underline"
                  >
                    {t('tools.tuitionPayment.addItem', '+ Add Item')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.discount', 'Discount')}</label>
                    <input
                      type="number"
                      value={invoiceForm.discount}
                      onChange={e => setInvoiceForm({ ...invoiceForm, discount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.tax', 'Tax')}</label>
                    <input
                      type="number"
                      value={invoiceForm.tax}
                      onChange={e => setInvoiceForm({ ...invoiceForm, tax: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.notes', 'Notes')}</label>
                  <textarea
                    value={invoiceForm.notes}
                    onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowInvoiceForm(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('tools.tuitionPayment.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleCreateInvoice}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B]"
                >
                  {t('tools.tuitionPayment.createInvoice3', 'Create Invoice')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Plan Form Modal */}
        {showPaymentPlanForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.createPaymentPlan', 'Create Payment Plan')}</h2>
                <button onClick={() => setShowPaymentPlanForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.student3', 'Student *')}</label>
                  <select
                    value={planForm.studentId}
                    onChange={e => setPlanForm({ ...planForm, studentId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">{t('tools.tuitionPayment.selectStudent3', 'Select Student')}</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.planName', 'Plan Name *')}</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder={t('tools.tuitionPayment.eGFallSemesterPayment', 'e.g., Fall Semester Payment Plan')}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.totalAmount', 'Total Amount *')}</label>
                    <input
                      type="number"
                      value={planForm.totalAmount}
                      onChange={e => setPlanForm({ ...planForm, totalAmount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.installments', 'Installments *')}</label>
                    <input
                      type="number"
                      value={planForm.installments}
                      onChange={e => setPlanForm({ ...planForm, installments: parseInt(e.target.value) || 1 })}
                      min="1"
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                {planForm.totalAmount > 0 && planForm.installments > 0 && (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Each installment: <span className="font-semibold">{formatCurrency(planForm.totalAmount / planForm.installments)}</span>
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.startDate', 'Start Date')}</label>
                    <input
                      type="date"
                      value={planForm.startDate}
                      onChange={e => setPlanForm({ ...planForm, startDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.frequency2', 'Frequency')}</label>
                    <select
                      value={planForm.frequency}
                      onChange={e => setPlanForm({ ...planForm, frequency: e.target.value as PaymentPlan['frequency'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="weekly">{t('tools.tuitionPayment.weekly', 'Weekly')}</option>
                      <option value="bi-weekly">{t('tools.tuitionPayment.biWeekly', 'Bi-weekly')}</option>
                      <option value="monthly">{t('tools.tuitionPayment.monthly2', 'Monthly')}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPaymentPlanForm(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('tools.tuitionPayment.cancel4', 'Cancel')}
                </button>
                <button
                  onClick={handleCreatePaymentPlan}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B]"
                >
                  {t('tools.tuitionPayment.createPlan2', 'Create Plan')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice View Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Invoice {selectedInvoice.invoiceNumber}
                </h2>
                <button onClick={() => setSelectedInvoice(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tuitionPayment.student4', 'Student')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {(() => { const s = getStudentById(selectedInvoice.studentId); return s ? `${s.firstName} ${s.lastName}` : 'Unknown'; })()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tuitionPayment.status', 'Status')}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isDark
                        ? STATUS_COLORS[selectedInvoice.status]?.darkBg + ' ' + STATUS_COLORS[selectedInvoice.status]?.darkText
                        : STATUS_COLORS[selectedInvoice.status]?.bg + ' ' + STATUS_COLORS[selectedInvoice.status]?.text
                    }`}>
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className={`border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`p-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.description2', 'Description')}</th>
                        <th className={`p-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.qty', 'Qty')}</th>
                        <th className={`p-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.price', 'Price')}</th>
                        <th className={`p-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tuitionPayment.total2', 'Total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map(item => (
                        <tr key={item.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`p-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.description}</td>
                          <td className={`p-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.quantity}</td>
                          <td className={`p-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(item.unitPrice)}</td>
                          <td className={`p-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td colSpan={3} className={`p-3 text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tuitionPayment.subtotal', 'Subtotal')}</td>
                        <td className={`p-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(selectedInvoice.subtotal)}</td>
                      </tr>
                      {selectedInvoice.discount > 0 && (
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td colSpan={3} className={`p-3 text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tuitionPayment.discount2', 'Discount')}</td>
                          <td className={`p-3 text-right text-red-500`}>-{formatCurrency(selectedInvoice.discount)}</td>
                        </tr>
                      )}
                      {selectedInvoice.tax > 0 && (
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td colSpan={3} className={`p-3 text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tuitionPayment.tax2', 'Tax')}</td>
                          <td className={`p-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(selectedInvoice.tax)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className={`p-3 text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tuitionPayment.total3', 'Total')}</td>
                        <td className={`p-3 text-right font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(selectedInvoice.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.tuitionPayment.issued', 'Issued:')}</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatDate(selectedInvoice.issueDate)}</span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.tuitionPayment.due', 'Due:')}</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('tools.tuitionPayment.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TuitionPaymentTool;
