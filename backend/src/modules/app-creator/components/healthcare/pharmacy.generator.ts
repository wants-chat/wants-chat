/**
 * Pharmacy Component Generators
 */

export interface PharmacyOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePrescriptionListPending(options: PharmacyOptions = {}): string {
  const { componentName = 'PrescriptionListPending', endpoint = '/pharmacy/prescriptions/pending' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pill, Clock, User, Phone, AlertCircle, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PendingPrescription {
  id: string;
  rx_number: string;
  patient_name: string;
  patient_phone?: string;
  medication_name: string;
  dosage: string;
  quantity: number;
  refills_remaining: number;
  prescriber_name: string;
  prescribed_date: string;
  status: 'pending' | 'processing' | 'ready' | 'waiting_insurance' | 'on_hold';
  priority: 'normal' | 'urgent' | 'stat';
  insurance_status?: 'approved' | 'pending' | 'rejected' | 'prior_auth_required';
  notes?: string;
  estimated_ready?: string;
}

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['pending-prescriptions', searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<PendingPrescription[]>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(\`/pharmacy/prescriptions/\${id}/status\`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-prescriptions'] });
      toast.success('Prescription status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getStatusColor = (status: PendingPrescription['status']) => {
    const colors = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      ready: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      waiting_insurance: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      on_hold: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: PendingPrescription['priority']) => {
    const colors = {
      normal: 'text-gray-500',
      urgent: 'text-orange-600',
      stat: 'text-red-600 font-bold',
    };
    return colors[priority] || colors.normal;
  };

  const getInsuranceColor = (status?: string) => {
    if (!status) return '';
    const colors: Record<string, string> = {
      approved: 'text-green-600',
      pending: 'text-yellow-600',
      rejected: 'text-red-600',
      prior_auth_required: 'text-purple-600',
    };
    return colors[status] || '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or Rx number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="waiting_insurance">Waiting Insurance</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            Pending Prescriptions
          </h2>
          <span className="text-sm text-gray-500">{prescriptions?.length || 0} items</span>
        </div>

        {prescriptions && prescriptions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-500">Rx# {rx.rx_number}</span>
                      {rx.priority !== 'normal' && (
                        <span className={\`text-xs uppercase \${getPriorityColor(rx.priority)}\`}>
                          {rx.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{rx.medication_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {rx.dosage} - Qty: {rx.quantity} - {rx.refills_remaining} refills remaining
                    </p>
                  </div>
                  <span className={\`px-3 py-1 rounded-full text-sm \${getStatusColor(rx.status)}\`}>
                    {rx.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Patient: {rx.patient_name}
                    </p>
                    {rx.patient_phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {rx.patient_phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Prescriber: {rx.prescriber_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Prescribed: {new Date(rx.prescribed_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {rx.insurance_status && (
                  <div className={\`text-sm mb-3 flex items-center gap-1 \${getInsuranceColor(rx.insurance_status)}\`}>
                    {rx.insurance_status === 'approved' ? <CheckCircle className="w-4 h-4" /> :
                     rx.insurance_status === 'rejected' ? <XCircle className="w-4 h-4" /> :
                     <AlertCircle className="w-4 h-4" />}
                    Insurance: {rx.insurance_status.replace('_', ' ')}
                  </div>
                )}

                {rx.notes && (
                  <p className="text-sm text-gray-500 italic mb-3">{rx.notes}</p>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {rx.status === 'pending' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: rx.id, status: 'processing' })}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Processing
                    </button>
                  )}
                  {rx.status === 'processing' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: rx.id, status: 'ready' })}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark Ready
                    </button>
                  )}
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: rx.id, status: 'on_hold' })}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Put on Hold
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No pending prescriptions
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCustomerPrescriptions(options: PharmacyOptions = {}): string {
  const { componentName = 'CustomerPrescriptions', endpoint = '/pharmacy/customers' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Pill, User, Phone, Mail, Calendar, AlertCircle, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface CustomerProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  allergies?: string[];
  insurance_provider?: string;
  insurance_id?: string;
  preferred_pharmacy_location?: string;
}

interface Prescription {
  id: string;
  rx_number: string;
  medication_name: string;
  dosage: string;
  quantity: number;
  refills_remaining: number;
  refills_used: number;
  prescriber_name: string;
  prescribed_date: string;
  last_filled?: string;
  next_refill_date?: string;
  status: 'active' | 'expired' | 'discontinued' | 'pending';
  instructions?: string;
  auto_refill?: boolean;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: ['pharmacy-customer', id],
    queryFn: async () => {
      const response = await api.get<CustomerProfile>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: prescriptions, isLoading: loadingRx } = useQuery({
    queryKey: ['customer-prescriptions', id],
    queryFn: async () => {
      const response = await api.get<Prescription[]>('${endpoint}/' + id + '/prescriptions');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (loadingCustomer || loadingRx) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!customer) {
    return <div className="text-center py-12 text-gray-500">Customer not found</div>;
  }

  const getStatusColor = (status: Prescription['status']) => {
    const colors = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      expired: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
      discontinued: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    };
    return colors[status] || colors.active;
  };

  const activePrescriptions = prescriptions?.filter(rx => rx.status === 'active') || [];
  const inactivePrescriptions = prescriptions?.filter(rx => rx.status !== 'active') || [];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <User className="w-8 h-8 text-teal-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
            {customer.date_of_birth && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                DOB: {new Date(customer.date_of_birth).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {customer.email && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              {customer.email}
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              {customer.phone}
            </div>
          )}
        </div>

        {customer.allergies && customer.allergies.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
              <AlertCircle className="w-5 h-5" />
              Drug Allergies
            </div>
            <div className="flex flex-wrap gap-2">
              {customer.allergies.map((allergy, i) => (
                <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-sm">
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        )}

        {customer.insurance_provider && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Insurance Information</h3>
            <p className="text-gray-600 dark:text-gray-400">{customer.insurance_provider}</p>
            {customer.insurance_id && (
              <p className="text-sm text-gray-500">ID: {customer.insurance_id}</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            Active Prescriptions
          </h2>
        </div>
        {activePrescriptions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activePrescriptions.map((rx) => (
              <div key={rx.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{rx.medication_name}</h3>
                      {rx.auto_refill && (
                        <span className="flex items-center gap-1 text-xs text-teal-600">
                          <RefreshCw className="w-3 h-3" />
                          Auto-refill
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rx.dosage}</p>
                    <p className="text-xs text-gray-500 font-mono">Rx# {rx.rx_number}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs \${getStatusColor(rx.status)}\`}>
                    {rx.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="font-medium text-gray-900 dark:text-white">{rx.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Refills Remaining</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {rx.refills_remaining} of {rx.refills_remaining + rx.refills_used}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Prescriber</p>
                    <p className="font-medium text-gray-900 dark:text-white">{rx.prescriber_name}</p>
                  </div>
                </div>

                {rx.instructions && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                    {rx.instructions}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-sm text-gray-500">
                    {rx.last_filled && (
                      <span>Last filled: {new Date(rx.last_filled).toLocaleDateString()}</span>
                    )}
                    {rx.next_refill_date && (
                      <span className="ml-4">
                        Next refill: <span className="text-teal-600">{new Date(rx.next_refill_date).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                  {rx.refills_remaining > 0 && (
                    <Link
                      to={\`/pharmacy/refill?rx=\${rx.id}\`}
                      className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Request Refill
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">No active prescriptions</div>
        )}
      </div>

      {inactivePrescriptions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Past Prescriptions</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {inactivePrescriptions.map((rx) => (
              <div key={rx.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{rx.medication_name}</h3>
                  <p className="text-sm text-gray-500">{rx.dosage}</p>
                </div>
                <span className={\`px-2 py-1 rounded-full text-xs \${getStatusColor(rx.status)}\`}>
                  {rx.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePharmacyStats(options: PharmacyOptions = {}): string {
  const { componentName = 'PharmacyStats', endpoint = '/pharmacy/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Pill, Users, Clock, DollarSign, TrendingUp, CheckCircle, AlertCircle, RefreshCw, Package } from 'lucide-react';
import { api } from '@/lib/api';

interface PharmacyStatsData {
  prescriptions_today: number;
  prescriptions_pending: number;
  prescriptions_ready: number;
  prescriptions_filled_month: number;
  average_wait_time: number;
  customers_today: number;
  revenue_today: number;
  revenue_month: number;
  inventory_alerts: number;
  auto_refills_due: number;
  insurance_rejections_pending: number;
  top_medications: Array<{
    name: string;
    count: number;
  }>;
  fill_rate: number;
  customer_satisfaction: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['pharmacy-stats'],
    queryFn: async () => {
      const response = await api.get<PharmacyStatsData>('${endpoint}');
      return response?.data || response;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">No statistics available</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const mainStats = [
    { title: 'Prescriptions Today', value: stats.prescriptions_today, icon: Pill, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600' },
    { title: 'Pending', value: stats.prescriptions_pending, icon: Clock, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
    { title: 'Ready for Pickup', value: stats.prescriptions_ready, icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
    { title: "Today's Revenue", value: formatCurrency(stats.revenue_today), icon: DollarSign, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
  ];

  const alertStats = [
    { title: 'Inventory Alerts', value: stats.inventory_alerts, icon: Package, urgent: stats.inventory_alerts > 5 },
    { title: 'Auto-Refills Due', value: stats.auto_refills_due, icon: RefreshCw, urgent: false },
    { title: 'Insurance Rejections', value: stats.insurance_rejections_pending, icon: AlertCircle, urgent: stats.insurance_rejections_pending > 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={\`p-3 rounded-lg \${stat.color}\`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {alertStats.map((stat) => (
          <div
            key={stat.title}
            className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 flex items-center gap-4 \${
              stat.urgent ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
            }\`}
          >
            <div className={\`p-2 rounded-lg \${stat.urgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'}\`}>
              <stat.icon className={\`w-5 h-5 \${stat.urgent ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}\`} />
            </div>
            <div>
              <p className={\`text-lg font-semibold \${stat.urgent ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Avg Wait Time</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.average_wait_time} min</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={\`h-2 rounded-full \${stats.average_wait_time <= 15 ? 'bg-green-500' : stats.average_wait_time <= 30 ? 'bg-yellow-500' : 'bg-red-500'}\`}
                  style={{ width: \`\${Math.min((stats.average_wait_time / 60) * 100, 100)}%\` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Fill Rate</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.fill_rate}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full"
                  style={{ width: \`\${stats.fill_rate}%\` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Customer Satisfaction</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.customer_satisfaction}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full"
                  style={{ width: \`\${stats.customer_satisfaction}%\` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            Top Medications (This Month)
          </h3>
          {stats.top_medications && stats.top_medications.length > 0 ? (
            <div className="space-y-3">
              {stats.top_medications.map((med, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{med.name}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{med.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-500 mb-2">Customers Today</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            {stats.customers_today}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-500 mb-2">Filled This Month</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-600" />
            {stats.prescriptions_filled_month}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-500 mb-2">Monthly Revenue</p>
          <p className="text-3xl font-bold text-teal-600">{formatCurrency(stats.revenue_month)}</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMedicationScheduleToday(options: PharmacyOptions = {}): string {
  const { componentName = 'MedicationScheduleToday', endpoint = '/pharmacy/schedule/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Pill, Clock, Sun, Sunset, Moon, Coffee, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ScheduledMedication {
  id: string;
  medication_name: string;
  dosage: string;
  time: string;
  time_slot: 'morning' | 'afternoon' | 'evening' | 'night' | 'with_meals';
  instructions?: string;
  taken: boolean;
  taken_at?: string;
  skipped: boolean;
  skip_reason?: string;
  refills_remaining: number;
  next_refill_date?: string;
}

interface MedicationSchedule {
  patient_id: string;
  patient_name: string;
  date: string;
  medications: ScheduledMedication[];
}

const ${componentName}: React.FC = () => {
  const { data: schedule, isLoading, refetch } = useQuery({
    queryKey: ['medication-schedule-today'],
    queryFn: async () => {
      const response = await api.get<MedicationSchedule>('${endpoint}');
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

  if (!schedule || !schedule.medications?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No medications scheduled for today</p>
      </div>
    );
  }

  const getTimeSlotIcon = (slot: ScheduledMedication['time_slot']) => {
    const icons = {
      morning: Sun,
      afternoon: Sun,
      evening: Sunset,
      night: Moon,
      with_meals: Coffee,
    };
    return icons[slot] || Clock;
  };

  const getTimeSlotColor = (slot: ScheduledMedication['time_slot']) => {
    const colors = {
      morning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
      afternoon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
      evening: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      night: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
      with_meals: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    };
    return colors[slot] || 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  };

  const groupedMedications = schedule.medications.reduce((acc, med) => {
    if (!acc[med.time_slot]) acc[med.time_slot] = [];
    acc[med.time_slot].push(med);
    return acc;
  }, {} as Record<string, ScheduledMedication[]>);

  const timeSlotOrder: ScheduledMedication['time_slot'][] = ['morning', 'with_meals', 'afternoon', 'evening', 'night'];
  const sortedSlots = timeSlotOrder.filter(slot => groupedMedications[slot]);

  const takenCount = schedule.medications.filter(m => m.taken).length;
  const totalCount = schedule.medications.length;
  const progressPercentage = Math.round((takenCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              Today's Medications
            </h2>
            <p className="text-sm text-gray-500">
              {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-teal-600">{takenCount}/{totalCount}</p>
            <p className="text-sm text-gray-500">completed</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-teal-600 h-3 rounded-full transition-all"
            style={{ width: \`\${progressPercentage}%\` }}
          />
        </div>
      </div>

      {sortedSlots.map((slot) => {
        const SlotIcon = getTimeSlotIcon(slot);
        const medications = groupedMedications[slot];

        return (
          <div key={slot} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className={\`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 \${getTimeSlotColor(slot)} bg-opacity-50\`}>
              <SlotIcon className="w-5 h-5" />
              <h3 className="font-semibold capitalize">{slot.replace('_', ' ')}</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {medications.map((med) => (
                <div key={med.id} className={\`p-4 \${med.taken ? 'bg-green-50 dark:bg-green-900/10' : med.skipped ? 'bg-gray-50 dark:bg-gray-900/50 opacity-60' : ''}\`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${
                        med.taken ? 'bg-green-100 dark:bg-green-900/30' :
                        med.skipped ? 'bg-gray-100 dark:bg-gray-700' :
                        'bg-teal-100 dark:bg-teal-900/30'
                      }\`}>
                        {med.taken ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : med.skipped ? (
                          <AlertCircle className="w-5 h-5 text-gray-500" />
                        ) : (
                          <Pill className="w-5 h-5 text-teal-600" />
                        )}
                      </div>
                      <div>
                        <h4 className={\`font-medium \${med.taken || med.skipped ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}\`}>
                          {med.medication_name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{med.dosage}</p>
                        {med.instructions && (
                          <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{med.time}</p>
                      {med.taken && med.taken_at && (
                        <p className="text-xs text-green-600">Taken at {new Date(med.taken_at).toLocaleTimeString()}</p>
                      )}
                      {med.skipped && med.skip_reason && (
                        <p className="text-xs text-gray-500">{med.skip_reason}</p>
                      )}
                    </div>
                  </div>

                  {med.refills_remaining <= 2 && !med.taken && !med.skipped && (
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {med.refills_remaining === 0 ? 'No refills remaining' : \`Only \${med.refills_remaining} refill(s) remaining\`}
                        {med.next_refill_date && \` - Next refill: \${new Date(med.next_refill_date).toLocaleDateString()}\`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}
