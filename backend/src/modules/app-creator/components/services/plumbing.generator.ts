/**
 * Plumbing Service Component Generators
 *
 * Generates components for plumbing service management:
 * - PlumbingStats: Dashboard statistics
 * - CustomerDetailPlumbing: Customer profile with service history
 */

export interface PlumbingStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePlumbingStats(options: PlumbingStatsOptions = {}): string {
  const { componentName = 'PlumbingStats', endpoint = '/plumbing/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Droplet, Wrench, Clock, DollarSign, Users, AlertTriangle, CheckCircle, Calendar, TrendingUp, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['plumbing-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  const statCards = [
    { key: 'todayCalls', label: "Today's Service Calls", icon: Calendar, color: 'blue' },
    { key: 'activeJobs', label: 'Active Jobs', icon: Wrench, color: 'yellow' },
    { key: 'completedToday', label: 'Completed Today', icon: CheckCircle, color: 'green' },
    { key: 'emergencyCalls', label: 'Emergency Calls', icon: AlertTriangle, color: 'red' },
    { key: 'residentialJobs', label: 'Residential Jobs', icon: Home, color: 'indigo' },
    { key: 'activeCustomers', label: 'Active Customers', icon: Users, color: 'purple' },
    { key: 'revenueToday', label: "Today's Revenue", icon: DollarSign, color: 'emerald', type: 'currency' },
    { key: 'avgJobDuration', label: 'Avg Job Duration', icon: Clock, color: 'orange', suffix: ' hrs' },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
  };

  const formatValue = (value: any, type?: string, suffix?: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    return Number(value).toLocaleString() + (suffix || '');
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        const value = stats?.[stat.key];

        return (
          <div
            key={stat.key}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-lg', colors.bg)}>
                <Icon className={cn('w-6 h-6', colors.icon)} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatValue(value, stat.type, stat.suffix)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

export interface CustomerDetailPlumbingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerDetailPlumbing(options: CustomerDetailPlumbingOptions = {}): string {
  const { componentName = 'CustomerDetailPlumbing', endpoint = '/plumbing/customers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Droplet, Calendar, DollarSign, FileText, ArrowLeft, Edit, Loader2, Home, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId, className }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const customerId = propId || paramId;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['plumbing-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: serviceHistory } = useQuery({
    queryKey: ['plumbing-customer-services', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/services\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const { data: activeIssues } = useQuery({
    queryKey: ['plumbing-customer-issues', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/issues\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Customer not found</p>
      </div>
    );
  }

  const getServiceStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(\`/service-calls/new?customer=\${customerId}\`)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Calendar className="w-4 h-4" />
            Schedule Service
          </button>
          <button
            onClick={() => navigate(\`/customers/\${customerId}/edit\`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
              {customer.priority_customer && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-sm font-medium rounded-full">
                  Priority Customer
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{customer.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{customer.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{customer.address || 'No address'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Home className="w-4 h-4" />
                <span>{customer.property_type || 'Residential'} | {customer.property_age || 'Unknown'} yrs old</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.total_service_calls || 0}</div>
            <div className="text-sm text-gray-500">Service Calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeIssues?.length || 0}</div>
            <div className="text-sm text-gray-500">Active Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${(customer.total_spent || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.last_service ? new Date(customer.last_service).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Last Service</div>
          </div>
        </div>
      </div>

      {/* Active Issues */}
      {activeIssues && activeIssues.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Active Issues</h2>
          </div>
          <div className="space-y-3">
            {activeIssues.map((issue: any) => (
              <div key={issue.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{issue.issue_type || issue.description}</p>
                  <p className="text-sm text-gray-500">Reported: {new Date(issue.reported_at).toLocaleDateString()}</p>
                </div>
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getServiceStatusStyle(issue.status))}>
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Details */}
      {customer.property_details && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {customer.property_details.bathrooms && (
              <div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.property_details.bathrooms}</p>
              </div>
            )}
            {customer.property_details.water_heater_type && (
              <div>
                <p className="text-sm text-gray-500">Water Heater</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.property_details.water_heater_type}</p>
              </div>
            )}
            {customer.property_details.pipe_material && (
              <div>
                <p className="text-sm text-gray-500">Pipe Material</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.property_details.pipe_material}</p>
              </div>
            )}
            {customer.property_details.sewer_type && (
              <div>
                <p className="text-sm text-gray-500">Sewer Type</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.property_details.sewer_type}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service History</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        {serviceHistory && serviceHistory.length > 0 ? (
          <div className="space-y-4">
            {serviceHistory.slice(0, 5).map((service: any) => (
              <div key={service.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  service.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                )}>
                  {service.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{service.service_type}</p>
                  <p className="text-sm text-gray-500">{new Date(service.date).toLocaleDateString()}</p>
                  {service.technician && <p className="text-sm text-gray-400">Tech: {service.technician}</p>}
                  {service.notes && <p className="text-sm text-gray-500 mt-1">{service.notes}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">\${(service.cost || 0).toLocaleString()}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', getServiceStatusStyle(service.status))}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500">No service history</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
