/**
 * HVAC Service Component Generators
 *
 * Generates components for HVAC service management:
 * - HvacStats: Dashboard statistics
 * - CustomerDetailHvac: Customer profile with equipment
 * - CustomerEquipmentHvac: Customer's HVAC equipment list
 * - ServiceCallListTodayPlumbing: Today's service calls (shared with plumbing)
 */

export interface HvacStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateHvacStats(options: HvacStatsOptions = {}): string {
  const { componentName = 'HvacStats', endpoint = '/hvac/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Thermometer, Wind, Wrench, Clock, DollarSign, Users, AlertTriangle, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['hvac-stats'],
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
    { key: 'installationsScheduled', label: 'Installations Scheduled', icon: Wind, color: 'indigo' },
    { key: 'maintenanceContracts', label: 'Active Contracts', icon: Users, color: 'purple' },
    { key: 'revenueToday', label: "Today's Revenue", icon: DollarSign, color: 'emerald', type: 'currency' },
    { key: 'avgResponseTime', label: 'Avg Response Time', icon: Clock, color: 'orange', suffix: ' min' },
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

export interface CustomerDetailHvacOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerDetailHvac(options: CustomerDetailHvacOptions = {}): string {
  const { componentName = 'CustomerDetailHvac', endpoint = '/hvac/customers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Thermometer, Calendar, DollarSign, FileText, ArrowLeft, Edit, Loader2, Home, Clock } from 'lucide-react';
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
    queryKey: ['hvac-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: equipment } = useQuery({
    queryKey: ['customer-equipment', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/equipment\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const { data: serviceHistory } = useQuery({
    queryKey: ['customer-service-history', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/services\`);
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
              {customer.service_contract && (
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium rounded-full">
                  Service Contract
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
                <span>{customer.property_type || 'Residential'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{equipment?.length || 0}</div>
            <div className="text-sm text-gray-500">Equipment Units</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.total_service_calls || 0}</div>
            <div className="text-sm text-gray-500">Service Calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${(customer.total_spent || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.next_maintenance ? new Date(customer.next_maintenance).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Next Maintenance</div>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Equipment</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add Equipment</button>
        </div>
        {equipment && equipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipment.map((unit: any) => (
              <div key={unit.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{unit.type} - {unit.brand}</p>
                    <p className="text-sm text-gray-500">{unit.model}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                        Installed: {unit.install_date ? new Date(unit.install_date).getFullYear() : 'N/A'}
                      </span>
                      {unit.warranty_expires && (
                        <span className={cn(
                          'px-2 py-1 rounded',
                          new Date(unit.warranty_expires) > new Date()
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                          Warranty: {new Date(unit.warranty_expires).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Thermometer className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500">No equipment registered</p>
          </div>
        )}
      </div>

      {/* Recent Service History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Service History</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        {serviceHistory && serviceHistory.length > 0 ? (
          <div className="space-y-4">
            {serviceHistory.slice(0, 5).map((service: any) => (
              <div key={service.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{service.service_type}</p>
                  <p className="text-sm text-gray-500">{new Date(service.date).toLocaleDateString()}</p>
                  {service.technician && <p className="text-sm text-gray-400">Tech: {service.technician}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">\${(service.cost || 0).toLocaleString()}</p>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    service.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  )}>
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
    </div>
  );
};

export default ${componentName};
`;
}

export interface CustomerEquipmentHvacOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerEquipmentHvac(options: CustomerEquipmentHvacOptions = {}): string {
  const { componentName = 'CustomerEquipmentHvac', endpoint = '/hvac/equipment' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Thermometer, Wind, Snowflake, Flame, AlertTriangle, CheckCircle, Calendar, Settings, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId, className }) => {
  const navigate = useNavigate();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['customer-hvac-equipment', customerId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (customerId) url += \`?customer_id=\${customerId}\`;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getEquipmentIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'furnace':
      case 'heater':
        return Flame;
      case 'ac':
      case 'air conditioner':
        return Snowflake;
      case 'heat pump':
        return Thermometer;
      case 'ventilation':
      case 'air handler':
        return Wind;
      default:
        return Settings;
    }
  };

  const getConditionStyle = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'fair':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'poor':
      case 'needs_replacement':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const isWarrantyExpired = (date: string) => {
    if (!date) return true;
    return new Date(date) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">HVAC Equipment</h2>
          <button
            onClick={() => navigate('/equipment/new')}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </button>
        </div>
      </div>

      {equipment && equipment.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {equipment.map((unit: any) => {
            const Icon = getEquipmentIcon(unit.type);
            const warrantyExpired = isWarrantyExpired(unit.warranty_expires);

            return (
              <div
                key={unit.id}
                onClick={() => navigate(\`/equipment/\${unit.id}\`)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{unit.brand} {unit.model}</p>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', getConditionStyle(unit.condition))}>
                        {unit.condition || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{unit.type} | Serial: {unit.serial_number || 'N/A'}</p>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Installed: {unit.install_date ? new Date(unit.install_date).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                      {unit.last_service && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Settings className="w-4 h-4" />
                          <span>Last Service: {new Date(unit.last_service).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      {unit.warranty_expires && (
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 text-xs rounded',
                          warrantyExpired
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        )}>
                          {warrantyExpired ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          Warranty: {new Date(unit.warranty_expires).toLocaleDateString()}
                        </span>
                      )}
                      {unit.maintenance_due && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                          <Calendar className="w-3 h-3" />
                          Maintenance Due: {new Date(unit.maintenance_due).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {unit.efficiency_rating && (
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{unit.efficiency_rating}</div>
                    )}
                    <div className="text-xs text-gray-500">SEER Rating</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Thermometer className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No equipment registered</p>
          <button
            onClick={() => navigate('/equipment/new')}
            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Add first equipment
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface ServiceCallListTodayPlumbingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateServiceCallListTodayPlumbing(options: ServiceCallListTodayPlumbingOptions = {}): string {
  const { componentName = 'ServiceCallListTodayPlumbing', endpoint = '/hvac/service-calls/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, User, Phone, Wrench, CheckCircle, AlertCircle, Thermometer, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  onItemClick?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, onItemClick }) => {
  const navigate = useNavigate();

  const { data: serviceCalls, isLoading } = useQuery({
    queryKey: ['today-hvac-service-calls'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle };
      case 'in_progress':
      case 'on_site':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Wrench };
      case 'scheduled':
      case 'en_route':
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Clock };
      case 'emergency':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertCircle };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: Clock };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'emergency':
      case 'urgent':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'normal':
        return 'bg-blue-500 text-white';
      case 'low':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const handleClick = (call: any) => {
    if (onItemClick) {
      onItemClick(call);
    } else {
      navigate(\`/service-calls/\${call.id}\`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Service Calls</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
              {serviceCalls?.length || 0} calls
            </span>
          </div>
        </div>
      </div>

      {serviceCalls && serviceCalls.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {serviceCalls.map((call: any) => {
            const statusStyle = getStatusStyle(call.status);
            const StatusIcon = statusStyle.icon;

            return (
              <li
                key={call.id}
                onClick={() => handleClick(call)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', statusStyle.bg)}>
                    <StatusIcon className={cn('w-5 h-5', statusStyle.text)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {call.service_type || call.issue_type}
                      </p>
                      {call.priority && (
                        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', getPriorityBadge(call.priority))}>
                          {call.priority}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{call.customer_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{call.scheduled_time || call.time_slot}</span>
                      </div>
                      <div className="flex items-center gap-1 col-span-full">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{call.address}</span>
                      </div>
                      {call.customer_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{call.customer_phone}</span>
                        </div>
                      )}
                    </div>

                    {call.equipment_type && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400">
                        <Thermometer className="w-4 h-4" />
                        <span>{call.equipment_type}</span>
                      </div>
                    )}

                    {call.notes && (
                      <p className="mt-2 text-sm text-gray-500 truncate">{call.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full capitalize', statusStyle.bg, statusStyle.text)}>
                      {call.status?.replace('_', ' ')}
                    </span>
                    {call.technician && (
                      <span className="text-xs text-gray-500">
                        Tech: {call.technician}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No service calls scheduled for today</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
