import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
  Users,
  CreditCard,
  BarChart3,
  Plus,
  Search,
  FileText,
  Loader2,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  Edit,
  X,
  Building,
  Mail,
  Phone,
  Calendar,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import {
  billingSystemApi,
  BillingClient,
  BillingInvoice,
  BillingPayment,
  ReportSummary,
  CreateClientData,
  CreateInvoiceData,
  CreatePaymentData,
  InvoiceItem,
} from '@/lib/api/billing-system-api';
import { toast } from 'sonner';
import { useConfirm } from '@/contexts/ConfirmDialogContext';

const BillingSystemHome: React.FC = () => {
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState('invoices');
  const [loading, setLoading] = useState(true);

  // Data states
  const [clients, setClients] = useState<BillingClient[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [payments, setPayments] = useState<BillingPayment[]>([]);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showInvoiceDetailDialog, setShowInvoiceDetailDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [editingClient, setEditingClient] = useState<BillingClient | null>(null);

  // Form states
  const [clientForm, setClientForm] = useState<CreateClientData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    notes: '',
  });

  const [invoiceForm, setInvoiceForm] = useState<CreateInvoiceData>({
    clientName: '',
    clientEmail: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    tax: 0,
    discount: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: 'Net 30',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState<CreatePaymentData>({
    clientName: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [clientsData, invoicesData, paymentsData, summaryData] = await Promise.all([
        billingSystemApi.getClients().catch(() => []),
        billingSystemApi.getInvoices().catch(() => []),
        billingSystemApi.getPayments().catch(() => []),
        billingSystemApi.getReportSummary().catch(() => null),
      ]);
      setClients(clientsData || []);
      setInvoices(invoicesData || []);
      setPayments(paymentsData || []);
      setReportSummary(summaryData || {
        totalRevenue: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        totalDue: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
        thisMonthInvoices: 0,
        averageInvoice: 0,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter clients
  const filteredClients = clients.filter((client) =>
    (client.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Client handlers
  const handleSaveClient = async () => {
    if (!clientForm.name.trim() || !clientForm.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setSaving(true);
      if (editingClient) {
        const updated = await billingSystemApi.updateClient(editingClient.id, clientForm);
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success('Client updated');
      } else {
        const newClient = await billingSystemApi.createClient(clientForm);
        setClients((prev) => [...prev, newClient]);
        toast.success('Client created');
      }
      setShowClientDialog(false);
      resetClientForm();
    } catch (error) {
      toast.error('Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (client: BillingClient) => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: `Are you sure you want to delete client "${client.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      await billingSystemApi.deleteClient(client.id);
      setClients((prev) => prev.filter((c) => c.id !== client.id));
      toast.success('Client deleted');
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const resetClientForm = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      notes: '',
    });
    setEditingClient(null);
  };

  // Invoice handlers
  const calculateInvoiceTotals = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = subtotal * ((invoiceForm.tax || 0) / 100);
    const discount = invoiceForm.discount || 0;
    // Ensure total is never negative - discount cannot exceed subtotal + tax
    const total = Math.max(0, subtotal + taxAmount - discount);
    return { subtotal, taxAmount, total };
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoiceForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', quantity: 1, rate: 0, amount: 0 }],
    });
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceForm.items.length === 1) return;
    const newItems = invoiceForm.items.filter((_, i) => i !== index);
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  const handleSaveInvoice = async () => {
    if (!invoiceForm.clientName.trim() || !invoiceForm.clientEmail.trim()) {
      toast.error('Client name and email are required');
      return;
    }
    if (invoiceForm.items.some((item) => !item.description.trim())) {
      toast.error('All items must have a description');
      return;
    }

    try {
      setSaving(true);
      const { subtotal, taxAmount, total } = calculateInvoiceTotals();

      const invoiceData = {
        ...invoiceForm,
        invoiceNumber: generateInvoiceNumber(),
        subtotal,
        tax: taxAmount,
        total,
      };

      const newInvoice = await billingSystemApi.createInvoice(invoiceData);
      setInvoices((prev) => [...prev, newInvoice]);
      toast.success('Invoice created');
      setShowInvoiceDialog(false);
      resetInvoiceForm();
      loadAllData(); // Refresh report data
    } catch (error) {
      toast.error('Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsPaid = async (invoice: BillingInvoice) => {
    try {
      await billingSystemApi.updateInvoice(invoice.id, { status: 'paid' });
      setInvoices((prev) =>
        prev.map((i) => (i.id === invoice.id ? { ...i, status: 'paid' as const } : i))
      );
      toast.success('Invoice marked as paid');
      loadAllData();
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const handleDeleteInvoice = async (invoice: BillingInvoice) => {
    const confirmed = await confirm({
      title: 'Delete Invoice',
      message: `Are you sure you want to delete invoice #${invoice.invoiceNumber}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      await billingSystemApi.deleteInvoice(invoice.id);
      setInvoices((prev) => prev.filter((i) => i.id !== invoice.id));
      toast.success('Invoice deleted');
      loadAllData();
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      clientName: '',
      clientEmail: '',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      tax: 0,
      discount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 30',
      notes: '',
    });
  };

  // Payment handlers
  const handleSavePayment = async () => {
    if (!paymentForm.clientName.trim() || paymentForm.amount <= 0) {
      toast.error('Client name and valid amount are required');
      return;
    }

    try {
      setSaving(true);
      const newPayment = await billingSystemApi.createPayment(paymentForm);
      setPayments((prev) => [...prev, newPayment]);
      toast.success('Payment recorded');
      setShowPaymentDialog(false);
      resetPaymentForm();
      loadAllData();
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (payment: BillingPayment) => {
    const confirmed = await confirm({
      title: 'Delete Payment',
      message: 'Are you sure you want to delete this payment record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      await billingSystemApi.deletePayment(payment.id);
      setPayments((prev) => prev.filter((p) => p.id !== payment.id));
      toast.success('Payment deleted');
      loadAllData();
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      clientName: '',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      notes: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: <Clock className="w-3 h-3" /> },
      paid: { color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
      overdue: { color: 'bg-red-500/20 text-red-400', icon: <AlertCircle className="w-3 h-3" /> },
      cancelled: { color: 'bg-gray-500/20 text-gray-400', icon: <X className="w-3 h-3" /> },
    };
    const { color, icon } = config[status] || config.pending;
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | undefined | null) => {
    // Handle NaN, undefined, null
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(safeAmount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      credit_card: 'Credit Card',
      bank_transfer: 'Bank Transfer',
      check: 'Check',
      other: 'Other',
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects variant="subtle" />
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-8 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-xl shadow-teal-500/30 mb-6">
              <Receipt className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Billing System
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Manage invoices, clients, and payments in one place
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Overview */}
      {reportSummary && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(reportSummary.totalRevenue)}
                    </p>
                    <p className="text-sm text-white/60">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(reportSummary.pendingAmount)}
                    </p>
                    <p className="text-sm text-white/60">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(reportSummary.overdueAmount)}
                    </p>
                    <p className="text-sm text-white/60">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/20">
                    <FileText className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {reportSummary.totalInvoices}
                    </p>
                    <p className="text-sm text-white/60">Total Invoices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 mb-6">
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* INVOICES TAB */}
          <TabsContent value="invoices">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        placeholder="Search invoices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => setShowInvoiceDialog(true)}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">No invoices found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-teal-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              #{invoice.invoiceNumber}
                            </p>
                            <p className="text-sm text-white/60">{invoice.clientName}</p>
                          </div>
                        </div>
                        <div className="hidden md:block text-right">
                          <p className="text-sm text-white/60">Due</p>
                          <p className="text-white">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{formatCurrency(invoice.total)}</p>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoiceDetailDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4 text-white/60" />
                          </Button>
                          {invoice.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsPaid(invoice)}
                            >
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteInvoice(invoice)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLIENTS TAB */}
          <TabsContent value="clients">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      resetClientForm();
                      setShowClientDialog(true);
                    }}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredClients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">No clients found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                      <Card
                        key={client.id}
                        className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingClient(client);
                                  setClientForm({
                                    name: client.name,
                                    email: client.email,
                                    phone: client.phone || '',
                                    company: client.company || '',
                                    address: client.address || '',
                                    city: client.city || '',
                                    state: client.state || '',
                                    zip: client.zip || '',
                                    country: client.country || 'United States',
                                    notes: client.notes || '',
                                  });
                                  setShowClientDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4 text-white/60" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteClient(client)}
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-semibold text-white mb-1">{client.name}</h3>
                          {client.company && (
                            <p className="text-sm text-white/60 flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {client.company}
                            </p>
                          )}
                          <p className="text-sm text-white/60 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </p>
                          {client.phone && (
                            <p className="text-sm text-white/60 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENTS TAB */}
          <TabsContent value="payments">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Payment History</CardTitle>
                    <p className="text-sm text-white/60">
                      Total received: {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPaymentDialog(true)}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">No payments recorded</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{payment.clientName}</p>
                            <p className="text-sm text-white/60">
                              {getPaymentMethodLabel(payment.paymentMethod)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400">
                            +{formatCurrency(payment.amount)}
                          </p>
                          <p className="text-sm text-white/60">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePayment(payment)}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTS TAB */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reportSummary && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/60">Total Revenue</span>
                        <span className="font-bold text-green-400">
                          {formatCurrency(reportSummary.totalRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Pending Amount</span>
                        <span className="font-bold text-yellow-400">
                          {formatCurrency(reportSummary.pendingAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Overdue Amount</span>
                        <span className="font-bold text-red-400">
                          {formatCurrency(reportSummary.overdueAmount)}
                        </span>
                      </div>
                      <div className="border-t border-white/10 pt-4 flex justify-between">
                        <span className="text-white font-semibold">Total Outstanding</span>
                        <span className="font-bold text-white">
                          {formatCurrency(reportSummary.totalDue)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Invoice Stats Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Invoice Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reportSummary && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Total Invoices</span>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {reportSummary.totalInvoices}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Paid</span>
                        <Badge className="bg-green-500/20 text-green-400">
                          {reportSummary.paidInvoices}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Pending</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400">
                          {reportSummary.pendingInvoices}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Overdue</span>
                        <Badge className="bg-red-500/20 text-red-400">
                          {reportSummary.overdueInvoices}
                        </Badge>
                      </div>
                      <div className="border-t border-white/10 pt-4 flex justify-between">
                        <span className="text-white/60">Average Invoice</span>
                        <span className="font-bold text-white">
                          {formatCurrency(reportSummary.averageInvoice)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CLIENT DIALOG */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="max-w-lg bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Name *</Label>
                <Input
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Company</Label>
                <Input
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Email *</Label>
                <Input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Phone</Label>
                <Input
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-white">Address</Label>
              <Input
                value={clientForm.address}
                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-white">City</Label>
                <Input
                  value={clientForm.city}
                  onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">State</Label>
                <Input
                  value={clientForm.state}
                  onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">ZIP</Label>
                <Input
                  value={clientForm.zip}
                  onChange={(e) => setClientForm({ ...clientForm, zip: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-white">Notes</Label>
              <Textarea
                value={clientForm.notes}
                onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClient} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* INVOICE DIALOG */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl bg-slate-900 border-white/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Client Name *</Label>
                <Input
                  value={invoiceForm.clientName}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, clientName: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Client Email *</Label>
                <Input
                  type="email"
                  value={invoiceForm.clientEmail}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Line Items</Label>
              {invoiceForm.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mt-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                    className="col-span-5 bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)
                    }
                    className="col-span-2 bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) =>
                      updateInvoiceItem(index, 'rate', parseFloat(e.target.value) || 0)
                    }
                    className="col-span-2 bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    value={formatCurrency(item.amount)}
                    disabled
                    className="col-span-2 bg-white/5 border-white/10 text-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInvoiceItem(index)}
                    className="col-span-1"
                    disabled={invoiceForm.items.length === 1}
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addInvoiceItem}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Tax %</Label>
                <Input
                  type="number"
                  value={invoiceForm.tax}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, tax: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Discount ($)</Label>
                <Input
                  type="number"
                  value={invoiceForm.discount}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      discount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Due Date</Label>
                <Input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Payment Terms</Label>
                <Select
                  value={invoiceForm.paymentTerms}
                  onValueChange={(value) =>
                    setInvoiceForm({ ...invoiceForm, paymentTerms: value })
                  }
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Net 90">Net 90</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Total</Label>
                <div className="text-2xl font-bold text-white p-2">
                  {formatCurrency(calculateInvoiceTotals().total)}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white">Notes</Label>
              <Textarea
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInvoice} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PAYMENT DIALOG */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Client Name *</Label>
              <Input
                value={paymentForm.clientName}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, clientName: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Amount *</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })
                }
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Payment Date</Label>
              <Input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Payment Method</Label>
              <Select
                value={paymentForm.paymentMethod}
                onValueChange={(value: any) =>
                  setPaymentForm({ ...paymentForm, paymentMethod: value })
                }
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Notes</Label>
              <Textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePayment} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* INVOICE DETAIL DIALOG */}
      <Dialog open={showInvoiceDetailDialog} onOpenChange={setShowInvoiceDetailDialog}>
        <DialogContent className="max-w-lg bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              Invoice #{selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-semibold">{selectedInvoice.clientName}</p>
                  <p className="text-white/60 text-sm">{selectedInvoice.clientEmail}</p>
                </div>
                {getStatusBadge(selectedInvoice.status)}
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-white/60 mb-2">Line Items</p>
                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span className="text-white">{item.description}</span>
                    <span className="text-white">
                      {item.quantity} x {formatCurrency(item.rate)} = {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Tax</span>
                  <span className="text-white">{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Discount</span>
                  <span className="text-white">-{formatCurrency(selectedInvoice.discount)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white font-bold text-lg">
                    {formatCurrency(selectedInvoice.total)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm text-white/60">
                <span>Invoice Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</span>
                <span>Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-sm text-white/60">Notes</p>
                  <p className="text-white">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDetailDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default BillingSystemHome;
