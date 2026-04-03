/**
 * Insurance Policy Component Generators
 */

export interface PolicyOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePolicyList(options: PolicyOptions = {}): string {
  const { componentName = 'PolicyList', endpoint = '/policies' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Shield, Calendar, DollarSign, MoreVertical, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Policy {
  id: string;
  policy_number: string;
  type: string;
  status: string;
  holder_name: string;
  coverage_amount: number;
  premium: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

const ${componentName}: React.FC = () => {
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies', status, searchTerm],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPolicyTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'health': return 'text-red-500';
      case 'auto': return 'text-blue-500';
      case 'home': return 'text-purple-500';
      case 'life': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'active', 'pending', 'expired', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${
                status === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent w-64"
            />
          </div>
          <Link
            to="/policies/new"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            New Policy
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Policy</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Holder</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Coverage</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Premium</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Expiry</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {policies && policies.length > 0 ? (
                policies.map((policy: Policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <Link to={\`/policies/\${policy.id}\`} className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                        <FileText className="w-4 h-4" />
                        {policy.policy_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Shield className={\`w-4 h-4 \${getPolicyTypeIcon(policy.type)}\`} />
                        <span className="text-gray-900 dark:text-white capitalize">{policy.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{policy.holder_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {policy.coverage_amount?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">\${policy.premium?.toLocaleString()}/mo</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(policy.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStatusColor(policy.status)}\`}>
                        {policy.status}
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
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    No policies found
                  </td>
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

export function generatePolicyDetail(options: PolicyOptions = {}): string {
  const { componentName = 'PolicyDetail', endpoint = '/policies' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Download, Edit, Shield, Calendar, DollarSign, User, Phone, Mail, MapPin, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface PolicyDetails {
  id: string;
  policy_number: string;
  type: string;
  status: string;
  holder_name: string;
  holder_email: string;
  holder_phone: string;
  holder_address: string;
  coverage_amount: number;
  deductible: number;
  premium: number;
  payment_frequency: string;
  start_date: string;
  end_date: string;
  beneficiaries: Array<{ name: string; relationship: string; percentage: number }>;
  coverage_details: Array<{ item: string; covered: boolean; limit: number }>;
  documents: Array<{ name: string; url: string; type: string }>;
  created_at: string;
  updated_at: string;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: policy, isLoading } = useQuery({
    queryKey: ['policy', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!policy) {
    return <div className="text-center py-12 text-gray-500">Policy not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/policies" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Back to Policies
        </Link>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            Download
          </button>
          <Link
            to={\`/policies/\${id}/edit\`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Edit className="w-4 h-4" />
            Edit Policy
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{policy.policy_number}</h1>
                <p className="text-gray-500 capitalize">{policy.type} Insurance</p>
              </div>
            </div>
            {getStatusBadge(policy.status)}
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Policy Holder</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="w-4 h-4 text-gray-400" />
                {policy.holder_name}
              </p>
              {policy.holder_email && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {policy.holder_email}
                </p>
              )}
              {policy.holder_phone && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {policy.holder_phone}
                </p>
              )}
              {policy.holder_address && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {policy.holder_address}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Policy Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Coverage Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">\${policy.coverage_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Deductible</span>
                <span className="font-medium text-gray-900 dark:text-white">\${policy.deductible?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Premium</span>
                <span className="font-medium text-gray-900 dark:text-white">\${policy.premium?.toLocaleString()}/{policy.payment_frequency || 'month'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Start Date</span>
                <span className="text-gray-900 dark:text-white">{new Date(policy.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">End Date</span>
                <span className="text-gray-900 dark:text-white">{new Date(policy.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {policy.coverage_details && policy.coverage_details.length > 0 && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Coverage Details</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {policy.coverage_details.map((item: any, index: number) => (
                <div
                  key={index}
                  className={\`flex items-center justify-between p-3 rounded-lg \${
                    item.covered
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'
                  }\`}
                >
                  <div className="flex items-center gap-2">
                    {item.covered ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={\`\${item.covered ? 'text-gray-900 dark:text-white' : 'text-gray-500'}\`}>{item.item}</span>
                  </div>
                  {item.limit && <span className="text-sm text-gray-500">Up to \${item.limit.toLocaleString()}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {policy.beneficiaries && policy.beneficiaries.length > 0 && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Beneficiaries</h3>
            <div className="space-y-3">
              {policy.beneficiaries.map((beneficiary: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{beneficiary.name}</p>
                    <p className="text-sm text-gray-500">{beneficiary.relationship}</p>
                  </div>
                  <span className="text-purple-600 font-medium">{beneficiary.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {policy.documents && policy.documents.length > 0 && (
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Documents</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {policy.documents.map((doc: any, index: number) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.type}</p>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePolicyFilters(options: PolicyOptions = {}): string {
  const { componentName = 'PolicyFilters', endpoint = '/policies' } = options;

  return `import React, { useState } from 'react';
import { Filter, X, ChevronDown, Calendar, DollarSign, Shield } from 'lucide-react';

interface PolicyFiltersProps {
  onFilterChange: (filters: PolicyFilterValues) => void;
  initialFilters?: PolicyFilterValues;
}

interface PolicyFilterValues {
  type?: string;
  status?: string;
  minCoverage?: number;
  maxCoverage?: number;
  minPremium?: number;
  maxPremium?: number;
  startDateFrom?: string;
  startDateTo?: string;
  expiringWithin?: number;
}

const ${componentName}: React.FC<PolicyFiltersProps> = ({ onFilterChange, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<PolicyFilterValues>(initialFilters);

  const policyTypes = ['health', 'auto', 'home', 'life', 'business', 'travel'];
  const statusOptions = ['active', 'pending', 'expired', 'cancelled'];

  const handleFilterChange = (key: keyof PolicyFilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={\`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors \${
          activeFilterCount > 0
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
        }\`}
      >
        <Filter className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={\`w-4 h-4 transition-transform \${isOpen ? 'rotate-180' : ''}\`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">Filter Policies</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-purple-600 hover:text-purple-700">
                Clear all
              </button>
            )}
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Shield className="w-4 h-4 inline mr-1" />
                Policy Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              >
                <option value="">All Types</option>
                {policyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Coverage Amount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minCoverage || ''}
                  onChange={(e) => handleFilterChange('minCoverage', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxCoverage || ''}
                  onChange={(e) => handleFilterChange('maxCoverage', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Premium</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPremium || ''}
                  onChange={(e) => handleFilterChange('minPremium', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPremium || ''}
                  onChange={(e) => handleFilterChange('maxPremium', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Expiring Within
              </label>
              <select
                value={filters.expiringWithin || ''}
                onChange={(e) => handleFilterChange('expiringWithin', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              >
                <option value="">Any time</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
              </select>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePolicyForm(options: PolicyOptions = {}): string {
  const { componentName = 'PolicyForm', endpoint = '/policies' } = options;

  return `import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2, Shield, User, DollarSign, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Beneficiary {
  name: string;
  relationship: string;
  percentage: number;
}

interface CoverageItem {
  item: string;
  covered: boolean;
  limit: number;
}

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    type: 'health',
    holder_name: '',
    holder_email: '',
    holder_phone: '',
    holder_address: '',
    coverage_amount: 0,
    deductible: 0,
    premium: 0,
    payment_frequency: 'monthly',
    start_date: '',
    end_date: '',
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [coverageItems, setCoverageItems] = useState<CoverageItem[]>([]);

  const { isLoading: isLoadingPolicy } = useQuery({
    queryKey: ['policy', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      const policy = response?.data || response;
      if (policy) {
        setFormData({
          type: policy.type || 'health',
          holder_name: policy.holder_name || '',
          holder_email: policy.holder_email || '',
          holder_phone: policy.holder_phone || '',
          holder_address: policy.holder_address || '',
          coverage_amount: policy.coverage_amount || 0,
          deductible: policy.deductible || 0,
          premium: policy.premium || 0,
          payment_frequency: policy.payment_frequency || 'monthly',
          start_date: policy.start_date?.split('T')[0] || '',
          end_date: policy.end_date?.split('T')[0] || '',
        });
        setBeneficiaries(policy.beneficiaries || []);
        setCoverageItems(policy.coverage_details || []);
      }
      return policy;
    },
    enabled: isEditing,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditing ? api.put('${endpoint}/' + id, data) : api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success(isEditing ? 'Policy updated!' : 'Policy created!');
      navigate('/policies');
    },
    onError: () => toast.error('Failed to save policy'),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { name: '', relationship: '', percentage: 0 }]);
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: string | number) => {
    const updated = [...beneficiaries];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficiaries(updated);
  };

  const removeBeneficiary = (index: number) => {
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
  };

  const addCoverageItem = () => {
    setCoverageItems([...coverageItems, { item: '', covered: true, limit: 0 }]);
  };

  const updateCoverageItem = (index: number, field: keyof CoverageItem, value: any) => {
    const updated = [...coverageItems];
    updated[index] = { ...updated[index], [field]: value };
    setCoverageItems(updated);
  };

  const removeCoverageItem = (index: number) => {
    setCoverageItems(coverageItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      beneficiaries,
      coverage_details: coverageItems,
    });
  };

  if (isEditing && isLoadingPolicy) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Policy' : 'New Insurance Policy'}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Policy Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="health">Health</option>
              <option value="auto">Auto</option>
              <option value="home">Home</option>
              <option value="life">Life</option>
              <option value="business">Business</option>
              <option value="travel">Travel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Frequency</label>
            <select
              name="payment_frequency"
              value={formData.payment_frequency}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Policy Holder</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
            <input
              type="text"
              name="holder_name"
              value={formData.holder_name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="holder_email"
              value={formData.holder_email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              name="holder_phone"
              value={formData.holder_phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
              name="holder_address"
              value={formData.holder_address}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Financial Details</h3>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coverage Amount *</label>
            <input
              type="number"
              name="coverage_amount"
              value={formData.coverage_amount}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deductible</label>
            <input
              type="number"
              name="deductible"
              value={formData.deductible}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Premium *</label>
            <input
              type="number"
              name="premium"
              value={formData.premium}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Policy Period</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Beneficiaries</h3>
          <button
            type="button"
            onClick={addBeneficiary}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Beneficiary
          </button>
        </div>

        {beneficiaries.length > 0 ? (
          <div className="space-y-3">
            {beneficiaries.map((beneficiary, index) => (
              <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <input
                  type="text"
                  placeholder="Name"
                  value={beneficiary.name}
                  onChange={(e) => updateBeneficiary(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={beneficiary.relationship}
                  onChange={(e) => updateBeneficiary(index, 'relationship', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
                <input
                  type="number"
                  placeholder="%"
                  min="0"
                  max="100"
                  value={beneficiary.percentage}
                  onChange={(e) => updateBeneficiary(index, 'percentage', Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeBeneficiary(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No beneficiaries added</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Coverage Items</h3>
          <button
            type="button"
            onClick={addCoverageItem}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Coverage Item
          </button>
        </div>

        {coverageItems.length > 0 ? (
          <div className="space-y-3">
            {coverageItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <input
                  type="text"
                  placeholder="Coverage item"
                  value={item.item}
                  onChange={(e) => updateCoverageItem(index, 'item', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.covered}
                    onChange={(e) => updateCoverageItem(index, 'covered', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Covered</span>
                </label>
                <input
                  type="number"
                  placeholder="Limit"
                  value={item.limit}
                  onChange={(e) => updateCoverageItem(index, 'limit', Number(e.target.value))}
                  className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeCoverageItem(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No coverage items added</p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/policies')}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Update Policy' : 'Create Policy'}
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}
