/**
 * Billing System API Client
 * Handles invoicing, clients, and payments
 */

import { api } from '@/lib/api';

// Types
export interface BillingClient {
  id: string;
  localId?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  website?: string;
  notes?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BillingInvoice {
  id: string;
  localId?: string;
  clientId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoiceDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  notes?: string;
  paymentTerms?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillingPayment {
  id: string;
  localId?: string;
  invoiceId?: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other';
  referenceNumber?: string;
  notes?: string;
  isDeleted?: boolean;
  createdAt: string;
}

export interface ReportSummary {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalDue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  thisMonthInvoices: number;
  averageInvoice: number;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  website?: string;
  notes?: string;
}

export interface CreateInvoiceData {
  clientId?: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber?: string; // Generated at save time
  items: InvoiceItem[];
  subtotal?: number; // Calculated at save time
  tax?: number;
  discount?: number;
  total?: number; // Calculated at save time
  dueDate: string;
  notes?: string;
  paymentTerms?: string;
}

export interface CreatePaymentData {
  invoiceId?: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other';
  referenceNumber?: string;
  notes?: string;
}

export const billingSystemApi = {
  // ============================================
  // CLIENTS
  // ============================================

  async getClients(): Promise<BillingClient[]> {
    const response = await api.get('/billing-system/clients');
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.clients)) return response.clients;
    return [];
  },

  async getClientById(id: string): Promise<BillingClient> {
    const response = await api.get(`/billing-system/clients/${id}`);
    return response.data;
  },

  async createClient(data: CreateClientData): Promise<BillingClient> {
    const response = await api.post('/billing-system/clients', data);
    return response.data;
  },

  async updateClient(id: string, data: Partial<CreateClientData>): Promise<BillingClient> {
    const response = await api.put(`/billing-system/clients/${id}`, data);
    return response.data;
  },

  async deleteClient(id: string): Promise<void> {
    await api.delete(`/billing-system/clients/${id}`);
  },

  // ============================================
  // INVOICES
  // ============================================

  async getInvoices(status?: string): Promise<BillingInvoice[]> {
    const queryParams = status ? `?status=${status}` : '';
    const response = await api.get(`/billing-system/invoices${queryParams}`);
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.invoices)) return response.invoices;
    return [];
  },

  async getInvoiceById(id: string): Promise<BillingInvoice> {
    const response = await api.get(`/billing-system/invoices/${id}`);
    return response.data;
  },

  async createInvoice(data: CreateInvoiceData): Promise<BillingInvoice> {
    const response = await api.post('/billing-system/invoices', data);
    return response.data;
  },

  async updateInvoice(id: string, data: Partial<CreateInvoiceData & { status: string }>): Promise<BillingInvoice> {
    const response = await api.put(`/billing-system/invoices/${id}`, data);
    return response.data;
  },

  async deleteInvoice(id: string): Promise<void> {
    await api.delete(`/billing-system/invoices/${id}`);
  },

  // ============================================
  // PAYMENTS
  // ============================================

  async getPayments(): Promise<BillingPayment[]> {
    const response = await api.get('/billing-system/payments');
    return response.payments || response.data || [];
  },

  async createPayment(data: CreatePaymentData): Promise<BillingPayment> {
    const response = await api.post('/billing-system/payments', data);
    return response.data;
  },

  async deletePayment(id: string): Promise<void> {
    await api.delete(`/billing-system/payments/${id}`);
  },

  // ============================================
  // REPORTS
  // ============================================

  async getReportSummary(): Promise<ReportSummary> {
    const response = await api.get('/billing-system/reports/summary');
    return response.data;
  },
};
