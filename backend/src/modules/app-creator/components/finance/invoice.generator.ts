/**
 * Invoice Component Generators
 */

export interface InvoiceOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateInvoiceList(options: InvoiceOptions = {}): string {
  const { componentName = 'InvoiceList', endpoint = '/invoices' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Download, MoreVertical, Plus, Filter } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [status, setStatus] = useState('all');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', status],
    queryFn: async () => {
      const url = '${endpoint}' + (status !== 'all' ? '?status=' + status : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {['all', 'pending', 'paid', 'overdue'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                status === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <Link
          to="/invoices/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Invoice</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Due Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <Link to={\`/invoices/\${invoice.id}\`} className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                        <FileText className="w-4 h-4" />
                        {invoice.number || \`#\${invoice.id}\`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{invoice.client_name}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">\${invoice.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStatusColor(invoice.status)}\`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No invoices found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateInvoiceDetail(options: InvoiceOptions = {}): string {
  const { componentName = 'InvoiceDetail', endpoint = '/invoices' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Download, Send, Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center py-12 text-gray-500">Invoice not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/invoices" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            Download
          </button>
          {invoice.status !== 'paid' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Send className="w-4 h-4" />
              Send
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice {invoice.number}</h1>
              <p className="text-gray-500 mt-1">Issued: {new Date(invoice.created_at).toLocaleDateString()}</p>
            </div>
            <span className={\`px-3 py-1 rounded-full text-sm font-medium \${
              invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              invoice.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }\`}>
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-500 mb-1">From</p>
            <p className="font-medium text-gray-900 dark:text-white">{invoice.from_name}</p>
            <p className="text-gray-500">{invoice.from_email}</p>
            {invoice.from_address && <p className="text-gray-500">{invoice.from_address}</p>}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">To</p>
            <p className="font-medium text-gray-900 dark:text-white">{invoice.client_name}</p>
            <p className="text-gray-500">{invoice.client_email}</p>
            {invoice.client_address && <p className="text-gray-500">{invoice.client_address}</p>}
          </div>
        </div>

        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left pb-3 text-sm font-medium text-gray-500">Description</th>
                <th className="text-right pb-3 text-sm font-medium text-gray-500">Qty</th>
                <th className="text-right pb-3 text-sm font-medium text-gray-500">Rate</th>
                <th className="text-right pb-3 text-sm font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoice.items?.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="py-3 text-gray-900 dark:text-white">{item.description}</td>
                  <td className="py-3 text-right text-gray-500">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-500">\${item.rate?.toLocaleString()}</td>
                  <td className="py-3 text-right font-medium text-gray-900 dark:text-white">\${item.amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">\${invoice.subtotal?.toLocaleString()}</span>
                </div>
                {invoice.tax && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Tax ({invoice.tax_rate}%)</span>
                    <span className="text-gray-900 dark:text-white">\${invoice.tax?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700 font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">\${invoice.amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 mb-1">Notes</p>
            <p className="text-gray-700 dark:text-gray-300">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateInvoiceForm(options: InvoiceOptions = {}): string {
  const { componentName = 'InvoiceForm', endpoint = '/invoices' } = options;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, rate: 0 }]);
  const [notes, setNotes] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: (response: any) => {
      toast.success('Invoice created!');
      navigate('/invoices/' + (response?.data?.id || response?.id));
    },
    onError: () => toast.error('Failed to create invoice'),
  });

  const addItem = () => setItems([...items, { description: '', quantity: 1, rate: 0 }]);

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      client_name: clientName,
      client_email: clientEmail,
      due_date: dueDate,
      items: items.map(item => ({ ...item, amount: item.quantity * item.rate })),
      subtotal,
      amount: subtotal,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name *</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Email *</label>
            <input
              type="email"
              required
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items</h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
              <div className="w-20">
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
              <div className="w-28">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
              <div className="w-24 text-right py-2 font-medium text-gray-900 dark:text-white">
                \${(item.quantity * item.rate).toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 font-bold text-lg">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment terms, bank details, etc."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/invoices')}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Invoice
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}
