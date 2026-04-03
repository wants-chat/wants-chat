import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Save,
  Building2,
  User,
  Calendar,
  Hash,
  Download,
  Eye,
  History,
  X,
  ChevronDown,
  Image,
  Users,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface InvoiceGeneratorToolProps {
  uiConfig?: UIConfig;
}

// Types
interface BusinessInfo {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logo: string | null;
}

interface ClientInfo {
  id: string;
  name: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  email: string;
  phone: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  currency: string;
  businessInfo: BusinessInfo;
  clientInfo: ClientInfo;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  notes: string;
  terms: string;
  template: 'basic' | 'professional' | 'modern';
  createdAt: string;
}

// Constants
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '\u20AC', name: 'Euro' },
  { code: 'GBP', symbol: '\u00A3', name: 'British Pound' },
  { code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '\u20B9', name: 'Indian Rupee' },
  { code: 'BDT', symbol: '\u09F3', name: 'Bangladeshi Taka' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '\u00A5', name: 'Chinese Yuan' },
];

const PAYMENT_TERMS = [
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
  { value: 'custom', label: 'Custom' },
];

const TEMPLATES = [
  { value: 'basic', label: 'Basic', description: 'Clean and simple' },
  { value: 'professional', label: 'Professional', description: 'Corporate style' },
  { value: 'modern', label: 'Modern', description: 'Contemporary design' },
];

// Storage keys for localStorage (config/preferences only, invoices use backend)
const STORAGE_KEYS = {
  BUSINESS_INFO: 'invoice_generator_business_info',
  SAVED_CLIENTS: 'invoice_generator_saved_clients',
  LAST_INVOICE_NUMBER: 'invoice_generator_last_number',
};

// Column configuration for exports
const INVOICE_COLUMNS: ColumnConfig[] = [
  { key: 'invoiceNumber', header: 'Invoice #', type: 'string' },
  { key: 'invoiceDate', header: 'Date', type: 'date' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'clientName', header: 'Client', type: 'string', format: (_, row: any) => row.clientInfo?.name || '' },
  { key: 'clientCompany', header: 'Company', type: 'string', format: (_, row: any) => row.clientInfo?.company || '' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'taxRate', header: 'Tax Rate %', type: 'number' },
  { key: 'taxAmount', header: 'Tax Amount', type: 'currency' },
  { key: 'grandTotal', header: 'Total', type: 'currency' },
  { key: 'paymentTerms', header: 'Terms', type: 'string' },
  { key: 'currency', header: 'Currency', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateInvoiceNumber = (lastNumber: number): string => {
  const nextNumber = lastNumber + 1;
  return `INV-${String(nextNumber).padStart(5, '0')}`;
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  return `${currency?.symbol || '$'}${amount.toFixed(2)}`;
};

const getDefaultBusinessInfo = (): BusinessInfo => ({
  companyName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  phone: '',
  email: '',
  website: '',
  taxId: '',
  logo: null,
});

const getDefaultClientInfo = (): ClientInfo => ({
  id: generateId(),
  name: '',
  company: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  email: '',
  phone: '',
});

const getDefaultLineItem = (): LineItem => ({
  id: generateId(),
  description: '',
  quantity: 1,
  unitPrice: 0,
  amount: 0,
});

export const InvoiceGeneratorTool: React.FC<InvoiceGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const printRef = useRef<HTMLDivElement>(null);

  // Use the new useToolData hook for backend persistence of invoice history
  const {
    data: invoiceHistory,
    setData: setInvoiceHistory,
    addItem: addInvoiceToHistory,
    deleteItem: deleteInvoiceFromHistory,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print: printData,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<InvoiceData>('invoice-history', [], INVOICE_COLUMNS);

  // Local state for current invoice form
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(getDefaultBusinessInfo());
  const [clientInfo, setClientInfo] = useState<ClientInfo>(getDefaultClientInfo());
  const [savedClients, setSavedClients] = useState<ClientInfo[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([getDefaultLineItem()]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('net_30');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment is due within the specified terms. Late payments may be subject to additional fees.');
  const [template, setTemplate] = useState<'basic' | 'professional' | 'modern'>('professional');
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount || params.description || params.title || params.company) {
        if (params.company) {
          setClientInfo(prev => ({ ...prev, company: params.company || prev.company }));
        }
        if (params.amount) {
          setLineItems([{
            ...getDefaultLineItem(),
            description: params.description || params.title || 'Service',
            unitPrice: params.amount,
            quantity: 1,
            amount: params.amount,
          }]);
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Load config data from localStorage (invoice history handled by useToolData hook)
  useEffect(() => {
    const savedBusinessInfo = localStorage.getItem(STORAGE_KEYS.BUSINESS_INFO);
    if (savedBusinessInfo) {
      setBusinessInfo(JSON.parse(savedBusinessInfo));
    }

    const savedClientsList = localStorage.getItem(STORAGE_KEYS.SAVED_CLIENTS);
    if (savedClientsList) {
      setSavedClients(JSON.parse(savedClientsList));
    }

    const lastNumber = localStorage.getItem(STORAGE_KEYS.LAST_INVOICE_NUMBER);
    setInvoiceNumber(generateInvoiceNumber(lastNumber ? parseInt(lastNumber) : 0));
  }, []);

  // Calculate due date based on payment terms
  useEffect(() => {
    if (invoiceDate && paymentTerms !== 'custom') {
      const date = new Date(invoiceDate);
      switch (paymentTerms) {
        case 'due_on_receipt':
          setDueDate(invoiceDate);
          break;
        case 'net_15':
          date.setDate(date.getDate() + 15);
          setDueDate(date.toISOString().split('T')[0]);
          break;
        case 'net_30':
          date.setDate(date.getDate() + 30);
          setDueDate(date.toISOString().split('T')[0]);
          break;
        case 'net_45':
          date.setDate(date.getDate() + 45);
          setDueDate(date.toISOString().split('T')[0]);
          break;
        case 'net_60':
          date.setDate(date.getDate() + 60);
          setDueDate(date.toISOString().split('T')[0]);
          break;
      }
    }
  }, [invoiceDate, paymentTerms]);

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  // Handlers
  const handleBusinessInfoChange = (field: keyof BusinessInfo, value: string) => {
    const updated = { ...businessInfo, [field]: value };
    setBusinessInfo(updated);
    localStorage.setItem(STORAGE_KEYS.BUSINESS_INFO, JSON.stringify(updated));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...businessInfo, logo: reader.result as string };
        setBusinessInfo(updated);
        localStorage.setItem(STORAGE_KEYS.BUSINESS_INFO, JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    const updated = { ...businessInfo, logo: null };
    setBusinessInfo(updated);
    localStorage.setItem(STORAGE_KEYS.BUSINESS_INFO, JSON.stringify(updated));
  };

  const handleClientInfoChange = (field: keyof ClientInfo, value: string) => {
    setClientInfo({ ...clientInfo, [field]: value });
  };

  const handleSelectClient = (client: ClientInfo) => {
    setClientInfo(client);
    setShowClientDropdown(false);
  };

  const handleSaveClient = () => {
    if (!clientInfo.name) return;

    const existingIndex = savedClients.findIndex((c) => c.id === clientInfo.id);
    let updatedClients: ClientInfo[];

    if (existingIndex >= 0) {
      updatedClients = [...savedClients];
      updatedClients[existingIndex] = clientInfo;
    } else {
      updatedClients = [...savedClients, { ...clientInfo, id: generateId() }];
    }

    setSavedClients(updatedClients);
    localStorage.setItem(STORAGE_KEYS.SAVED_CLIENTS, JSON.stringify(updatedClients));
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedClients = savedClients.filter((c) => c.id !== clientId);
    setSavedClients(updatedClients);
    localStorage.setItem(STORAGE_KEYS.SAVED_CLIENTS, JSON.stringify(updatedClients));
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.amount = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, getDefaultLineItem()]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const handleSaveInvoice = () => {
    const invoice: InvoiceData = {
      id: generateId(),
      invoiceNumber,
      invoiceDate,
      dueDate,
      paymentTerms,
      currency,
      businessInfo,
      clientInfo,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      grandTotal,
      notes,
      terms,
      template,
      createdAt: new Date().toISOString(),
    };

    // Add to history using hook (will sync to backend)
    addInvoiceToHistory(invoice);

    // Update last invoice number
    const currentNumber = parseInt(invoiceNumber.replace('INV-', ''));
    localStorage.setItem(STORAGE_KEYS.LAST_INVOICE_NUMBER, String(currentNumber));
    setInvoiceNumber(generateInvoiceNumber(currentNumber));

    // Reset form for new invoice
    setClientInfo(getDefaultClientInfo());
    setLineItems([getDefaultLineItem()]);
    setNotes('');
  };

  const handleLoadInvoice = (invoice: InvoiceData) => {
    setBusinessInfo(invoice.businessInfo);
    setClientInfo(invoice.clientInfo);
    setLineItems(invoice.lineItems);
    setInvoiceNumber(invoice.invoiceNumber);
    setInvoiceDate(invoice.invoiceDate);
    setDueDate(invoice.dueDate);
    setPaymentTerms(invoice.paymentTerms);
    setCurrency(invoice.currency);
    setTaxRate(invoice.taxRate);
    setNotes(invoice.notes);
    setTerms(invoice.terms);
    setTemplate(invoice.template);
    setShowHistory(false);
  };

  const handleDeleteInvoice = (id: string) => {
    deleteInvoiceFromHistory(id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewInvoice = () => {
    setClientInfo(getDefaultClientInfo());
    setLineItems([getDefaultLineItem()]);
    setNotes('');
    setTaxRate(0);
    const lastNumber = localStorage.getItem(STORAGE_KEYS.LAST_INVOICE_NUMBER);
    setInvoiceNumber(generateInvoiceNumber(lastNumber ? parseInt(lastNumber) : 0));
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setPaymentTerms('net_30');
  };

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  // Render invoice preview based on template
  const renderInvoicePreview = () => {
    const templateStyles = {
      basic: {
        header: 'bg-gray-100',
        headerText: 'text-gray-800',
        accent: 'text-gray-800',
        border: 'border-gray-300',
        tableBg: 'bg-gray-50',
      },
      professional: {
        header: 'bg-[#0D9488]',
        headerText: 'text-white',
        accent: 'text-[#0D9488]',
        border: 'border-[#0D9488]',
        tableBg: 'bg-teal-50',
      },
      modern: {
        header: 'bg-gradient-to-r from-purple-600 to-blue-600',
        headerText: 'text-white',
        accent: 'text-purple-600',
        border: 'border-purple-600',
        tableBg: 'bg-purple-50',
      },
    };

    const styles = templateStyles[template];

    return (
      <div
        ref={printRef}
        className="bg-white text-gray-900 p-8 max-w-4xl mx-auto shadow-lg print:shadow-none"
        id="invoice-preview"
      >
        {/* Header */}
        <div className={`${styles.header} -mx-8 -mt-8 px-8 py-6 mb-8`}>
          <div className="flex justify-between items-start">
            <div>
              {businessInfo.logo ? (
                <img src={businessInfo.logo} alt="Logo" className="h-16 mb-4 object-contain" />
              ) : null}
              <div className={`text-2xl font-bold ${styles.headerText}`}>
                {businessInfo.companyName || 'Your Company'}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${styles.headerText}`}>{t('tools.invoiceGenerator.invoice', 'INVOICE')}</div>
              <div className={`text-lg ${template === 'basic' ? 'text-gray-600' : 'opacity-90 ' + styles.headerText}`}>
                {invoiceNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Business & Client Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${styles.accent}`}>{t('tools.invoiceGenerator.from', 'From')}</h3>
            <div className="text-gray-700 space-y-0.5">
              <p className="font-semibold">{businessInfo.companyName || 'Your Company'}</p>
              {businessInfo.address && <p>{businessInfo.address}</p>}
              {(businessInfo.city || businessInfo.state || businessInfo.zipCode) && (
                <p>{[businessInfo.city, businessInfo.state, businessInfo.zipCode].filter(Boolean).join(', ')}</p>
              )}
              {businessInfo.country && <p>{businessInfo.country}</p>}
              {businessInfo.phone && <p>Tel: {businessInfo.phone}</p>}
              {businessInfo.email && <p>{businessInfo.email}</p>}
              {businessInfo.taxId && <p className="mt-2 font-medium">Tax ID: {businessInfo.taxId}</p>}
            </div>
          </div>
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${styles.accent}`}>{t('tools.invoiceGenerator.billTo', 'Bill To')}</h3>
            <div className="text-gray-700 space-y-0.5">
              <p className="font-semibold">{clientInfo.name || 'Client Name'}</p>
              {clientInfo.company && <p>{clientInfo.company}</p>}
              {clientInfo.address && <p>{clientInfo.address}</p>}
              {(clientInfo.city || clientInfo.state || clientInfo.zipCode) && (
                <p>{[clientInfo.city, clientInfo.state, clientInfo.zipCode].filter(Boolean).join(', ')}</p>
              )}
              {clientInfo.country && <p>{clientInfo.country}</p>}
              {clientInfo.email && <p>{clientInfo.email}</p>}
              {clientInfo.phone && <p>Tel: {clientInfo.phone}</p>}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className={`grid grid-cols-3 gap-4 mb-8 p-4 rounded-lg ${styles.tableBg}`}>
          <div>
            <span className="text-sm text-gray-500">{t('tools.invoiceGenerator.invoiceDate', 'Invoice Date')}</span>
            <p className="font-semibold">{new Date(invoiceDate).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">{t('tools.invoiceGenerator.dueDate', 'Due Date')}</span>
            <p className="font-semibold">{dueDate ? new Date(dueDate).toLocaleDateString() : '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">{t('tools.invoiceGenerator.paymentTerms', 'Payment Terms')}</span>
            <p className="font-semibold">{PAYMENT_TERMS.find((t) => t.value === paymentTerms)?.label || paymentTerms}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className={`border-b-2 ${styles.border}`}>
              <th className={`text-left py-3 font-semibold ${styles.accent}`}>{t('tools.invoiceGenerator.description', 'Description')}</th>
              <th className={`text-right py-3 font-semibold ${styles.accent}`}>{t('tools.invoiceGenerator.qty', 'Qty')}</th>
              <th className={`text-right py-3 font-semibold ${styles.accent}`}>{t('tools.invoiceGenerator.unitPrice', 'Unit Price')}</th>
              <th className={`text-right py-3 font-semibold ${styles.accent}`}>{t('tools.invoiceGenerator.amount', 'Amount')}</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3">{item.description || 'Item description'}</td>
                <td className="text-right py-3">{item.quantity}</td>
                <td className="text-right py-3">{formatCurrency(item.unitPrice, currency)}</td>
                <td className="text-right py-3 font-medium">{formatCurrency(item.amount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72">
            <div className="flex justify-between py-2 text-gray-600">
              <span>{t('tools.invoiceGenerator.subtotal', 'Subtotal')}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(subtotal, currency)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between py-2 text-gray-600">
                <span>Tax ({taxRate}%)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(taxAmount, currency)}</span>
              </div>
            )}
            <div className={`flex justify-between py-3 border-t-2 ${styles.border} mt-2`}>
              <span className={`text-lg font-bold ${styles.accent}`}>{t('tools.invoiceGenerator.total', 'Total')}</span>
              <span className={`text-lg font-bold ${styles.accent}`}>{formatCurrency(grandTotal, currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(notes || terms) && (
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {notes && (
              <div>
                <h4 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${styles.accent}`}>{t('tools.invoiceGenerator.notes', 'Notes')}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{notes}</p>
              </div>
            )}
            {terms && (
              <div>
                <h4 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${styles.accent}`}>
                  {t('tools.invoiceGenerator.termsConditions2', 'Terms & Conditions')}
                </h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          {t('tools.invoiceGenerator.thankYouForYourBusiness', 'Thank you for your business!')}
        </div>
      </div>
    );
  };

  // Input class helper
  const inputClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-preview, #invoice-preview * {
              visibility: visible;
            }
            #invoice-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              box-shadow: none !important;
            }
          }
        `}
      </style>

      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="max-w-7xl mx-auto">
          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.invoiceGenerator.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
            </div>
          )}

          {/* Header */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488]/10 rounded-lg">
                  <FileText className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.invoiceGenerator.invoiceGenerator', 'Invoice Generator')}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.invoiceGenerator.createProfessionalInvoicesForYour', 'Create professional invoices for your business')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <WidgetEmbedButton toolSlug="invoice-generator" toolName="Invoice Generator" />

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
                  onExportCSV={() => exportCSV({ filename: 'invoice-history' })}
                  onExportExcel={() => exportExcel({ filename: 'invoice-history' })}
                  onExportJSON={() => exportJSON({ filename: 'invoice-history' })}
                  onExportPDF={() => exportPDF({
                    filename: 'invoice-history',
                    title: 'Invoice History',
                    subtitle: `${invoiceHistory.length} invoices`
                  })}
                  onPrint={() => printData('Invoice History')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                />
                <button
                  onClick={handleNewInvoice}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.invoiceGenerator.new', 'New')}
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History ({invoiceHistory.length})
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showPreview
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {t('tools.invoiceGenerator.preview', 'Preview')}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  {t('tools.invoiceGenerator.print', 'Print')}
                </button>
              </div>
            </div>
          </div>

          {/* Invoice History Modal */}
          {showHistory && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div
                className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden`}
              >
                <div
                  className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.invoiceGenerator.invoiceHistory', 'Invoice History')}
                  </h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  {invoiceHistory.length === 0 ? (
                    <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>{t('tools.invoiceGenerator.noInvoicesSavedYet', 'No invoices saved yet')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoiceHistory.map((invoice) => (
                        <div
                          key={invoice.id}
                          className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {invoice.invoiceNumber}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {invoice.clientInfo.name || 'No client'} - {formatCurrency(invoice.grandTotal, invoice.currency)}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {new Date(invoice.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleLoadInvoice(invoice)}
                                className="p-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                                title={t('tools.invoiceGenerator.loadInvoice', 'Load Invoice')}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title={t('tools.invoiceGenerator.deleteInvoice', 'Delete Invoice')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
            {/* Form Section */}
            <div className="space-y-6">
              {/* Business Info */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-5 h-5 text-[#0D9488]" />
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.invoiceGenerator.businessInformation', 'Business Information')}
                  </h2>
                </div>

                {/* Logo Upload */}
                <div className="mb-4">
                  <label className={labelClass}>{t('tools.invoiceGenerator.companyLogo', 'Company Logo')}</label>
                  {businessInfo.logo ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={businessInfo.logo}
                        alt="Logo"
                        className={`h-16 object-contain rounded border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label
                      className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${
                        isDark ? t('tools.invoiceGenerator.borderGray600HoverBorder', 'border-gray-600 hover:border-[#0D9488]') : t('tools.invoiceGenerator.borderGray300HoverBorder', 'border-gray-300 hover:border-[#0D9488]')
                      } rounded-xl cursor-pointer transition-colors`}
                    >
                      <Image className="w-5 h-5 text-gray-400" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.invoiceGenerator.clickToUploadLogo', 'Click to upload logo')}
                      </span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.companyName', 'Company Name *')}</label>
                    <input
                      type="text"
                      value={businessInfo.companyName}
                      onChange={(e) => handleBusinessInfoChange('companyName', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.yourCompanyName', 'Your Company Name')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.taxIdRegistration', 'Tax ID / Registration')}</label>
                    <input
                      type="text"
                      value={businessInfo.taxId}
                      onChange={(e) => handleBusinessInfoChange('taxId', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.taxId', 'Tax ID')}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.invoiceGenerator.address', 'Address')}</label>
                    <input
                      type="text"
                      value={businessInfo.address}
                      onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.streetAddress', 'Street Address')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.city', 'City')}</label>
                    <input
                      type="text"
                      value={businessInfo.city}
                      onChange={(e) => handleBusinessInfoChange('city', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.city3', 'City')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.stateProvince', 'State/Province')}</label>
                    <input
                      type="text"
                      value={businessInfo.state}
                      onChange={(e) => handleBusinessInfoChange('state', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.state', 'State')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.zipPostalCode', 'ZIP/Postal Code')}</label>
                    <input
                      type="text"
                      value={businessInfo.zipCode}
                      onChange={(e) => handleBusinessInfoChange('zipCode', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.zipCode', 'ZIP Code')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.country', 'Country')}</label>
                    <input
                      type="text"
                      value={businessInfo.country}
                      onChange={(e) => handleBusinessInfoChange('country', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.country3', 'Country')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={businessInfo.phone}
                      onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.phoneNumber', 'Phone Number')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.email', 'Email')}</label>
                    <input
                      type="email"
                      value={businessInfo.email}
                      onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.emailAddress', 'Email Address')}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#0D9488]" />
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.invoiceGenerator.clientInformation', 'Client Information')}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    {savedClients.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setShowClientDropdown(!showClientDropdown)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                            isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          Clients
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {showClientDropdown && (
                          <div
                            className={`absolute right-0 top-full mt-1 w-72 ${
                              isDark ? 'bg-gray-700' : 'bg-white'
                            } rounded-lg shadow-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'} z-10 max-h-64 overflow-y-auto`}
                          >
                            {savedClients.map((client) => (
                              <div
                                key={client.id}
                                className={`flex items-center justify-between px-4 py-2 ${
                                  isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
                                } first:rounded-t-lg last:rounded-b-lg`}
                              >
                                <button
                                  onClick={() => handleSelectClient(client)}
                                  className="flex-1 text-left"
                                >
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {client.name}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {client.company || client.email}
                                  </p>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClient(client.id);
                                  }}
                                  className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={handleSaveClient}
                      disabled={!clientInfo.name}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        clientInfo.name
                          ? t('tools.invoiceGenerator.text0d9488HoverBg0d9488', 'text-[#0D9488] hover:bg-[#0D9488]/10') : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.invoiceGenerator.saveClient', 'Save Client')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.clientName', 'Client Name *')}</label>
                    <input
                      type="text"
                      value={clientInfo.name}
                      onChange={(e) => handleClientInfoChange('name', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.clientName2', 'Client Name')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.company', 'Company')}</label>
                    <input
                      type="text"
                      value={clientInfo.company}
                      onChange={(e) => handleClientInfoChange('company', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.companyName2', 'Company Name')}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.invoiceGenerator.address2', 'Address')}</label>
                    <input
                      type="text"
                      value={clientInfo.address}
                      onChange={(e) => handleClientInfoChange('address', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.streetAddress2', 'Street Address')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.city2', 'City')}</label>
                    <input
                      type="text"
                      value={clientInfo.city}
                      onChange={(e) => handleClientInfoChange('city', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.city4', 'City')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.stateProvince2', 'State/Province')}</label>
                    <input
                      type="text"
                      value={clientInfo.state}
                      onChange={(e) => handleClientInfoChange('state', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.state2', 'State')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.zipPostalCode2', 'ZIP/Postal Code')}</label>
                    <input
                      type="text"
                      value={clientInfo.zipCode}
                      onChange={(e) => handleClientInfoChange('zipCode', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.zipCode2', 'ZIP Code')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.country2', 'Country')}</label>
                    <input
                      type="text"
                      value={clientInfo.country}
                      onChange={(e) => handleClientInfoChange('country', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.country4', 'Country')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.email2', 'Email')}</label>
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => handleClientInfoChange('email', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.emailAddress2', 'Email Address')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.phone2', 'Phone')}</label>
                    <input
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => handleClientInfoChange('phone', e.target.value)}
                      placeholder={t('tools.invoiceGenerator.phoneNumber2', 'Phone Number')}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-[#0D9488]" />
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.invoiceGenerator.invoiceDetails', 'Invoice Details')}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.invoiceNumber', 'Invoice Number')}</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.invoiceDate2', 'Invoice Date')}</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.dueDate2', 'Due Date')}</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={paymentTerms !== 'custom'}
                      className={`${inputClass} ${paymentTerms !== 'custom' ? 'opacity-60' : ''}`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.paymentTerms2', 'Payment Terms')}</label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className={inputClass}
                    >
                      {PAYMENT_TERMS.map((term) => (
                        <option key={term.value} value={term.value}>
                          {term.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.currency', 'Currency')}</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name} ({curr.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.template', 'Template')}</label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value as 'basic' | 'professional' | 'modern')}
                      className={inputClass}
                    >
                      {TEMPLATES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label} - {t.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-[#0D9488]" />
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.invoiceGenerator.lineItems', 'Line Items')}</h2>
                  </div>
                  <button
                    onClick={handleAddLineItem}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.invoiceGenerator.addItem', 'Add Item')}
                  </button>
                </div>

                {/* Table Header */}
                <div
                  className={`hidden md:grid grid-cols-12 gap-4 mb-2 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <div className="col-span-5">{t('tools.invoiceGenerator.description2', 'Description')}</div>
                  <div className="col-span-2 text-center">{t('tools.invoiceGenerator.qty2', 'Qty')}</div>
                  <div className="col-span-2 text-center">{t('tools.invoiceGenerator.unitPrice2', 'Unit Price')}</div>
                  <div className="col-span-2 text-right">{t('tools.invoiceGenerator.amount2', 'Amount')}</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-12 gap-2 md:gap-4 items-center p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                    >
                      <div className="col-span-12 md:col-span-5">
                        <label className={`md:hidden text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.invoiceGenerator.description3', 'Description')}
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                          placeholder={t('tools.invoiceGenerator.itemDescription', 'Item description')}
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className={`md:hidden text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.invoiceGenerator.qty3', 'Qty')}</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="1"
                          className={`${inputClass} text-center`}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className={`md:hidden text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.invoiceGenerator.price', 'Price')}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{currencySymbol}</span>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className={`${inputClass} pl-8`}
                          />
                        </div>
                      </div>
                      <div className="col-span-3 md:col-span-2 text-right">
                        <label className={`md:hidden text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.invoiceGenerator.amount3', 'Amount')}</label>
                        <div className={`py-2.5 px-4 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(item.amount, currency)}
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleRemoveLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className={`p-2 rounded-lg transition-colors ${
                            lineItems.length === 1 ? 'opacity-30 cursor-not-allowed' : 'text-red-500 hover:bg-red-500/10'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Section */}
                <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-end">
                    <div className="w-full md:w-72 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.invoiceGenerator.subtotal2', 'Subtotal')}</span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(subtotal, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.invoiceGenerator.taxRate', 'Tax Rate (%)')}</span>
                        <input
                          type="number"
                          value={taxRate}
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                          className={`w-24 ${inputClass} text-center`}
                        />
                      </div>
                      {taxRate > 0 && (
                        <div className="flex justify-between items-center">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.invoiceGenerator.taxAmount', 'Tax Amount')}</span>
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(taxAmount, currency)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex justify-between items-center pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.invoiceGenerator.grandTotal', 'Grand Total')}</span>
                        <span className="text-lg font-bold text-[#0D9488]">{formatCurrency(grandTotal, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-[#0D9488]" />
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.invoiceGenerator.notesTerms', 'Notes & Terms')}</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.notes2', 'Notes')}</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('tools.invoiceGenerator.additionalNotesForTheClient', 'Additional notes for the client...')}
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.invoiceGenerator.termsConditions', 'Terms & Conditions')}</label>
                    <textarea
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      placeholder={t('tools.invoiceGenerator.paymentTermsAndConditions', 'Payment terms and conditions...')}
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Save Invoice Button */}
              <button
                onClick={handleSaveInvoice}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#0F766E] hover:to-[#0D9488] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
              >
                <Save className="w-5 h-5" />
                {t('tools.invoiceGenerator.saveInvoice', 'Save Invoice')}
              </button>
            </div>

            {/* Preview Section (Desktop) */}
            {showPreview && (
              <div className="hidden lg:block">
                <div className="sticky top-8">
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 mb-4`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.invoiceGenerator.invoicePreview', 'Invoice Preview')}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePrint}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          {t('tools.invoiceGenerator.print2', 'Print')}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-auto max-h-[calc(100vh-200px)] rounded-xl">{renderInvoicePreview()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Preview */}
          {showPreview && (
            <div className="lg:hidden mt-6">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 mb-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.invoiceGenerator.invoicePreview2', 'Invoice Preview')}</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-auto rounded-xl">{renderInvoicePreview()}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InvoiceGeneratorTool;
