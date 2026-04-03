/**
 * Auto Repair Service Component Generators
 *
 * Generates components for auto repair shop management:
 * - AutorepairStats: Dashboard statistics
 * - CustomerProfileAutorepair: Customer details with vehicle history
 * - VehicleProfile: Vehicle details and service records
 * - VehicleHistory: Vehicle service history timeline
 * - ServiceCallListToday: Today's service appointments
 * - RepairListPending: Pending repair jobs
 */

export interface AutorepairStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAutorepairStats(options: AutorepairStatsOptions = {}): string {
  const { componentName = 'AutorepairStats', endpoint = '/autorepair/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Car, Wrench, Clock, DollarSign, Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['autorepair-stats'],
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
    { key: 'todayAppointments', label: "Today's Appointments", icon: Clock, color: 'blue' },
    { key: 'activeRepairs', label: 'Active Repairs', icon: Wrench, color: 'yellow' },
    { key: 'completedToday', label: 'Completed Today', icon: CheckCircle, color: 'green' },
    { key: 'pendingEstimates', label: 'Pending Estimates', icon: AlertTriangle, color: 'orange' },
    { key: 'totalCustomers', label: 'Total Customers', icon: Users, color: 'purple' },
    { key: 'vehiclesInShop', label: 'Vehicles in Shop', icon: Car, color: 'indigo' },
    { key: 'revenueToday', label: "Today's Revenue", icon: DollarSign, color: 'emerald', type: 'currency' },
    { key: 'avgRepairTime', label: 'Avg Repair Time', icon: TrendingUp, color: 'red', suffix: ' hrs' },
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

export interface CustomerProfileAutorepairOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileAutorepair(options: CustomerProfileAutorepairOptions = {}): string {
  const { componentName = 'CustomerProfileAutorepair', endpoint = '/autorepair/customers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Car, Calendar, DollarSign, Wrench, ArrowLeft, Edit, Loader2 } from 'lucide-react';
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
    queryKey: ['autorepair-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: vehicles } = useQuery({
    queryKey: ['customer-vehicles', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/vehicles\`);
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
        <button
          onClick={() => navigate(\`/customers/\${customerId}/edit\`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            {customer.avatar_url ? (
              <img src={customer.avatar_url} alt={customer.name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
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
                <Calendar className="w-4 h-4" />
                <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.total_visits || 0}</div>
            <div className="text-sm text-gray-500">Total Visits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{vehicles?.length || 0}</div>
            <div className="text-sm text-gray-500">Vehicles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${(customer.total_spent || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : 'N/A'}</div>
            <div className="text-sm text-gray-500">Last Visit</div>
          </div>
        </div>
      </div>

      {/* Vehicles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicles</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add Vehicle</button>
        </div>
        {vehicles && vehicles.length > 0 ? (
          <div className="space-y-4">
            {vehicles.map((vehicle: any) => (
              <div
                key={vehicle.id}
                onClick={() => navigate(\`/vehicles/\${vehicle.id}\`)}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-500">
                    {vehicle.license_plate} | VIN: {vehicle.vin?.slice(-6) || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{vehicle.mileage?.toLocaleString() || 0} mi</p>
                  <p className="text-xs text-gray-400">{vehicle.service_count || 0} services</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Car className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500">No vehicles registered</p>
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

export interface VehicleProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateVehicleProfile(options: VehicleProfileOptions = {}): string {
  const { componentName = 'VehicleProfile', endpoint = '/autorepair/vehicles' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Car, Calendar, Gauge, Hash, Wrench, AlertCircle, CheckCircle, ArrowLeft, Edit, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  vehicleId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ vehicleId: propId, className }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const vehicleId = propId || paramId;

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${vehicleId}\`);
      return response?.data || response;
    },
    enabled: !!vehicleId,
  });

  const { data: serviceHistory } = useQuery({
    queryKey: ['vehicle-services', vehicleId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${vehicleId}/services\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!vehicleId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Vehicle not found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      in_service: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
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
        <button
          onClick={() => navigate(\`/vehicles/\${vehicleId}/edit\`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Vehicle Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            {vehicle.image_url ? (
              <img src={vehicle.image_url} alt="Vehicle" className="w-24 h-24 rounded-xl object-cover" />
            ) : (
              <Car className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              {vehicle.status && (
                <span className={cn('px-3 py-1 text-sm font-medium rounded-full', getStatusBadge(vehicle.status))}>
                  {vehicle.status}
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{vehicle.trim || vehicle.variant || ''}</p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Hash className="w-4 h-4" />
                <span>{vehicle.license_plate || 'No plate'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Gauge className="w-4 h-4" />
                <span>{vehicle.mileage?.toLocaleString() || 0} miles</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Added {new Date(vehicle.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{vehicle.owner_name || 'Unknown owner'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VIN & Details */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">VIN</p>
            <p className="font-mono text-gray-900 dark:text-white">{vehicle.vin || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Engine</p>
            <p className="text-gray-900 dark:text-white">{vehicle.engine || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Transmission</p>
            <p className="text-gray-900 dark:text-white">{vehicle.transmission || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Color</p>
            <p className="text-gray-900 dark:text-white">{vehicle.color || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fuel Type</p>
            <p className="text-gray-900 dark:text-white">{vehicle.fuel_type || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Service</p>
            <p className="text-gray-900 dark:text-white">
              {vehicle.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString() : 'No service yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Service Alerts */}
      {vehicle.service_alerts && vehicle.service_alerts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Service Alerts</h3>
          </div>
          <ul className="space-y-1">
            {vehicle.service_alerts.map((alert: string, i: number) => (
              <li key={i} className="text-sm text-yellow-700 dark:text-yellow-300">- {alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Services */}
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
                  service.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                )}>
                  {service.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Wrench className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{service.service_type || service.description}</p>
                  <p className="text-sm text-gray-500">{new Date(service.date || service.created_at).toLocaleDateString()}</p>
                  {service.technician && <p className="text-sm text-gray-400">Tech: {service.technician}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">\${(service.cost || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{service.mileage?.toLocaleString() || 0} mi</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
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

export interface VehicleHistoryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateVehicleHistory(options: VehicleHistoryOptions = {}): string {
  const { componentName = 'VehicleHistory', endpoint = '/autorepair/vehicles' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Wrench, CheckCircle, Clock, AlertTriangle, DollarSign, Gauge, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  vehicleId?: string;
  className?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ vehicleId: propId, className, limit }) => {
  const { id: paramId } = useParams();
  const vehicleId = propId || paramId;

  const { data: history, isLoading } = useQuery({
    queryKey: ['vehicle-history', vehicleId, limit],
    queryFn: async () => {
      let url = \`${endpoint}/\${vehicleId}/history\`;
      if (limit) url += \`?limit=\${limit}\`;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!vehicleId,
  });

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Wrench className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'issue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'in_progress':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'pending':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'issue':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
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
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Service History Timeline</h2>

      {history && history.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-6">
            {history.map((entry: any, index: number) => (
              <div key={entry.id || index} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className={cn(
                  'relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center',
                  getStatusColor(entry.status)
                )}>
                  {getStatusIcon(entry.status)}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {entry.service_type || entry.title || 'Service'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(entry.date || entry.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full capitalize',
                        entry.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        entry.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      )}>
                        {entry.status || 'Unknown'}
                      </span>
                    </div>

                    {entry.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{entry.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                      {entry.cost !== undefined && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span>\${Number(entry.cost).toLocaleString()}</span>
                        </div>
                      )}
                      {entry.mileage && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Gauge className="w-4 h-4" />
                          <span>{entry.mileage.toLocaleString()} mi</span>
                        </div>
                      )}
                      {entry.technician && (
                        <div className="text-gray-600 dark:text-gray-400">
                          Tech: {entry.technician}
                        </div>
                      )}
                    </div>

                    {entry.parts && entry.parts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Parts Used:</p>
                        <div className="flex flex-wrap gap-2">
                          {entry.parts.map((part: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                              {typeof part === 'string' ? part : part.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No service history available</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface ServiceCallListTodayOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateServiceCallListToday(options: ServiceCallListTodayOptions = {}): string {
  const { componentName = 'ServiceCallListToday', endpoint = '/autorepair/appointments/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Clock, Car, User, Phone, Wrench, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  onItemClick?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, onItemClick }) => {
  const navigate = useNavigate();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['today-appointments'],
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
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Wrench };
      case 'waiting':
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Clock };
      case 'delayed':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertCircle };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: Clock };
    }
  };

  const handleItemClick = (appointment: any) => {
    if (onItemClick) {
      onItemClick(appointment);
    } else {
      navigate(\`/appointments/\${appointment.id}\`);
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
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
            {appointments?.length || 0} appointments
          </span>
        </div>
      </div>

      {appointments && appointments.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {appointments.map((appointment: any) => {
            const statusStyle = getStatusStyle(appointment.status);
            const StatusIcon = statusStyle.icon;

            return (
              <li
                key={appointment.id}
                onClick={() => handleItemClick(appointment)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', statusStyle.bg)}>
                    <StatusIcon className={cn('w-5 h-5', statusStyle.text)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {appointment.service_type || appointment.description}
                      </p>
                      <span className="text-sm text-gray-500">
                        {appointment.scheduled_time || appointment.time}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{appointment.customer_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>
                          {appointment.vehicle_year} {appointment.vehicle_make} {appointment.vehicle_model}
                        </span>
                      </div>
                      {appointment.customer_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.customer_phone}</span>
                        </div>
                      )}
                    </div>

                    {appointment.notes && (
                      <p className="mt-2 text-sm text-gray-500 truncate">{appointment.notes}</p>
                    )}
                  </div>

                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full capitalize', statusStyle.bg, statusStyle.text)}>
                    {appointment.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface RepairListPendingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateRepairListPending(options: RepairListPendingOptions = {}): string {
  const { componentName = 'RepairListPending', endpoint = '/autorepair/repairs/pending' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Wrench, Car, User, Clock, AlertTriangle, DollarSign, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  limit?: number;
  onItemClick?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, limit, onItemClick }) => {
  const navigate = useNavigate();

  const { data: repairs, isLoading } = useQuery({
    queryKey: ['pending-repairs', limit],
    queryFn: async () => {
      let url = '${endpoint}';
      if (limit) url += \`?limit=\${limit}\`;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleClick = (repair: any) => {
    if (onItemClick) {
      onItemClick(repair);
    } else {
      navigate(\`/repairs/\${repair.id}\`);
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Repairs</h2>
          <button
            onClick={() => navigate('/repairs')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
      </div>

      {repairs && repairs.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {repairs.map((repair: any) => (
            <li
              key={repair.id}
              onClick={() => handleClick(repair)}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {repair.repair_type || repair.description}
                    </p>
                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', getPriorityStyle(repair.priority))}>
                      {repair.priority || 'Normal'}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      <span>{repair.vehicle_info || \`\${repair.vehicle_year} \${repair.vehicle_make} \${repair.vehicle_model}\`}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{repair.customer_name}</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Est. {repair.estimated_hours || '?'} hrs</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <DollarSign className="w-4 h-4" />
                      <span>\${(repair.estimated_cost || 0).toLocaleString()}</span>
                    </div>
                    {repair.waiting_for_parts && (
                      <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Waiting for parts</span>
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No pending repairs</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
