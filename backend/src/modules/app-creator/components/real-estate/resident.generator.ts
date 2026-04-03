/**
 * Resident Profile Component Generator
 */

export interface ResidentOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateResidentProfile(options: ResidentOptions = {}): string {
  const { componentName = 'ResidentProfile', endpoint = '/residents' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, MapPin, Calendar, Home, Shield, CreditCard, FileText, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Resident {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  unit_number?: string;
  building?: string;
  move_in_date?: string;
  lease_end_date?: string;
  status?: 'active' | 'pending' | 'inactive';
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  pets?: Array<{
    type: string;
    name: string;
    breed?: string;
  }>;
  vehicles?: Array<{
    make: string;
    model: string;
    license_plate: string;
    color?: string;
  }>;
  payment_status?: 'current' | 'overdue' | 'pending';
  balance_due?: number;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: resident, isLoading, error } = useQuery({
    queryKey: ['resident', id],
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

  if (error || !resident) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-gray-500 dark:text-gray-400">Resident not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {resident.avatar_url ? (
              <img
                src={resident.avatar_url}
                alt={resident.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
            )}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold">{resident.name}</h1>
              {resident.unit_number && (
                <p className="opacity-90 flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <Home className="w-4 h-4" />
                  Unit {resident.unit_number}
                  {resident.building && \` - \${resident.building}\`}
                </p>
              )}
            </div>
            {resident.status && (
              <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getStatusColor(resident.status)}\`}>
                {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resident.email && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{resident.email}</p>
                </div>
              </div>
            )}
            {resident.phone && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{resident.phone}</p>
                </div>
              </div>
            )}
            {resident.move_in_date && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Move-in Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(resident.move_in_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            {resident.lease_end_date && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lease Ends</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(resident.lease_end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Status */}
        {(resident.payment_status || resident.balance_due !== undefined) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Status
            </h2>
            <div className="flex items-center justify-between">
              {resident.payment_status && (
                <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getPaymentStatusColor(resident.payment_status)}\`}>
                  {resident.payment_status.charAt(0).toUpperCase() + resident.payment_status.slice(1)}
                </span>
              )}
              {resident.balance_due !== undefined && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Balance Due</p>
                  <p className={\`text-2xl font-bold \${resident.balance_due > 0 ? 'text-red-600' : 'text-green-600'}\`}>
                    \${resident.balance_due.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {resident.emergency_contact && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Emergency Contact
            </h2>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-white font-medium">{resident.emergency_contact.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{resident.emergency_contact.relationship}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {resident.emergency_contact.phone}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pets */}
      {resident.pets && resident.pets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registered Pets</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resident.pets.map((pet, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <p className="font-medium text-gray-900 dark:text-white">{pet.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pet.type}{pet.breed ? \` - \${pet.breed}\` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicles */}
      {resident.vehicles && resident.vehicles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registered Vehicles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resident.vehicles.map((vehicle, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {vehicle.make} {vehicle.model}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {vehicle.license_plate}
                  {vehicle.color ? \` - \${vehicle.color}\` : ''}
                </p>
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

export function generateResidentGrid(options: ResidentOptions = {}): string {
  const { componentName = 'ResidentGrid', endpoint = '/residents' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, User, Home, Phone, Mail, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  buildingId?: string;
  searchQuery?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ buildingId, searchQuery }) => {
  const { data: residents, isLoading } = useQuery({
    queryKey: ['residents', buildingId, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (buildingId) params.append('building_id', buildingId);
      if (searchQuery) params.append('search', searchQuery);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {residents && residents.length > 0 ? (
        residents.map((resident: any) => (
          <Link
            key={resident.id}
            to={\`/residents/\${resident.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              {resident.avatar_url ? (
                <img
                  src={resident.avatar_url}
                  alt={resident.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{resident.name}</h3>
                {resident.unit_number && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    Unit {resident.unit_number}
                  </p>
                )}
              </div>
              {resident.status && (
                <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                  resident.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  resident.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                }\`}>
                  {resident.status}
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1">
              {resident.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 truncate">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  {resident.email}
                </p>
              )}
              {resident.phone && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  {resident.phone}
                </p>
              )}
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No residents found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateResidentSearch(options: ResidentOptions = {}): string {
  const componentName = options.componentName || 'ResidentSearch';

  return `import React, { useState } from 'react';
import { Search, Home, Filter, X } from 'lucide-react';

interface ${componentName}Props {
  onSearch?: (filters: any) => void;
  buildings?: Array<{ id: string; name: string }>;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSearch, buildings = [] }) => {
  const [filters, setFilters] = useState({
    search: '',
    building: '',
    status: '',
  });

  const handleSearch = () => {
    onSearch?.(filters);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    const cleared = { search: '', building: '', status: '' };
    setFilters(cleared);
    onSearch?.(cleared);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Search residents by name, email, or unit..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        {buildings.length > 0 && (
          <select
            value={filters.building}
            onChange={(e) => setFilters({ ...filters, building: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            <option value="">All Buildings</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>{building.name}</option>
            ))}
          </select>
        )}
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          {(filters.search || filters.building || filters.status) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
