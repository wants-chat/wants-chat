/**
 * Client Profile Component Generators
 *
 * Generates client profile components for legal and law firm applications.
 */

export interface ClientOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateClientProfileLawfirm(options: ClientOptions = {}): string {
  const { componentName = 'ClientProfileLawfirm', endpoint = '/lawfirm/clients' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Building, Calendar, Scale, FileText, DollarSign, Clock, User, Edit, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface LawfirmClient {
  id: string;
  name: string;
  client_type: 'individual' | 'business';
  email: string;
  phone?: string;
  avatar_url?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  date_of_birth?: string;
  ssn_last_four?: string;
  ein?: string;
  primary_contact?: {
    name: string;
    title?: string;
    email: string;
    phone?: string;
  };
  responsible_attorney?: string;
  attorney_name?: string;
  client_since?: string;
  status: 'active' | 'inactive' | 'prospect';
  billing_status?: 'current' | 'overdue' | 'hold';
  trust_balance?: number;
  outstanding_balance?: number;
  total_billed?: number;
  total_paid?: number;
  active_cases: number;
  total_cases: number;
  notes?: string;
  tags?: string[];
  conflict_check_status?: 'cleared' | 'pending' | 'conflict';
  created_at: string;
  updated_at: string;
}

interface ClientProfileLawfirmProps {
  clientId?: string;
  showEdit?: boolean;
}

const ${componentName}: React.FC<ClientProfileLawfirmProps> = ({ clientId: propClientId, showEdit = true }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const clientId = propClientId || paramId;

  const { data: client, isLoading } = useQuery({
    queryKey: ['lawfirm-client', clientId],
    queryFn: async () => {
      const response = await api.get<LawfirmClient>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      prospect: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getBillingStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      current: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[status || ''] || 'bg-gray-100 text-gray-700';
  };

  const getConflictStatusIcon = (status?: string) => {
    switch (status) {
      case 'cleared':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'conflict':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
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

  if (!client) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Client not found</p>
      </div>
    );
  }

  const fullAddress = [client.address, client.city, client.state, client.zip_code, client.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        {showEdit && (
          <Link
            to={\`/clients/\${clientId}/edit\`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit Client
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              {client.avatar_url ? (
                <img
                  src={client.avatar_url}
                  alt={client.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  {client.client_type === 'business' ? (
                    <Building className="w-10 h-10 text-white" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {client.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStatusColor(client.status)}\`}>
                      {client.status.toUpperCase()}
                    </span>
                    {client.billing_status && (
                      <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getBillingStatusColor(client.billing_status)}\`}>
                        Billing: {client.billing_status}
                      </span>
                    )}
                  </div>
                  {client.company_name && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                      <Building className="w-4 h-4" />
                      {client.company_name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1 capitalize">{client.client_type} Client</p>
                </div>

                {client.conflict_check_status && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    {getConflictStatusIcon(client.conflict_check_status)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Conflict: {client.conflict_check_status}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <a href={\`mailto:\${client.email}\`} className="flex items-center gap-1 hover:text-blue-600">
                  <Mail className="w-4 h-4" />
                  {client.email}
                </a>
                {client.phone && (
                  <a href={\`tel:\${client.phone}\`} className="flex items-center gap-1 hover:text-blue-600">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </a>
                )}
                {client.client_since && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Client since {new Date(client.client_since).toLocaleDateString()}
                  </span>
                )}
              </div>

              {fullAddress && (
                <p className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {fullAddress}
                </p>
              )}

              {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {client.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.active_cases}</p>
            <p className="text-xs text-gray-500">Active Cases</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.total_cases}</p>
            <p className="text-xs text-gray-500">Total Cases</p>
          </div>
          {client.trust_balance !== undefined && (
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">\${client.trust_balance.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Trust Balance</p>
            </div>
          )}
          {client.outstanding_balance !== undefined && (
            <div className="text-center">
              <p className={\`text-2xl font-bold \${client.outstanding_balance > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
                \${client.outstanding_balance.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Outstanding</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {client.primary_contact && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Primary Contact</h2>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">{client.primary_contact.name}</p>
              {client.primary_contact.title && (
                <p className="text-sm text-gray-500">{client.primary_contact.title}</p>
              )}
              <a href={\`mailto:\${client.primary_contact.email}\`} className="block text-sm text-blue-600 hover:underline">
                {client.primary_contact.email}
              </a>
              {client.primary_contact.phone && (
                <a href={\`tel:\${client.primary_contact.phone}\`} className="block text-sm text-blue-600 hover:underline">
                  {client.primary_contact.phone}
                </a>
              )}
            </div>
          </div>
        )}

        {client.attorney_name && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Responsible Attorney</h2>
            </div>
            <Link
              to={\`/attorneys/\${client.responsible_attorney}\`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{client.attorney_name}</span>
            </Link>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Summary</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Billed</span>
              <span className="font-medium text-gray-900 dark:text-white">
                \${(client.total_billed || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Paid</span>
              <span className="font-medium text-green-600">
                \${(client.total_paid || 0).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Outstanding</span>
              <span className={\`font-bold \${(client.outstanding_balance || 0) > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
                \${(client.outstanding_balance || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={\`/cases/new?client=\${clientId}\`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Scale className="w-4 h-4" />
              New Case
            </Link>
            <Link
              to={\`/invoices/new?client=\${clientId}\`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <DollarSign className="w-4 h-4" />
              New Invoice
            </Link>
            <Link
              to={\`/clients/\${clientId}/documents\`}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              <FileText className="w-4 h-4" />
              Documents
            </Link>
            <Link
              to={\`/clients/\${clientId}/cases\`}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              <Scale className="w-4 h-4" />
              View Cases
            </Link>
          </div>
        </div>
      </div>

      {client.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{client.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateClientProfileLegal(options: ClientOptions = {}): string {
  const { componentName = 'ClientProfileLegal', endpoint = '/clients' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Building, Calendar, Scale, FileText, User, Edit } from 'lucide-react';
import { api } from '@/lib/api';

interface LegalClient {
  id: string;
  name: string;
  client_type: 'individual' | 'business';
  email: string;
  phone?: string;
  avatar_url?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferred_language?: string;
  communication_preference?: 'email' | 'phone' | 'mail';
  active_cases: number;
  total_cases: number;
  notes?: string;
  created_at: string;
}

interface ClientProfileLegalProps {
  clientId?: string;
  showEdit?: boolean;
}

const ${componentName}: React.FC<ClientProfileLegalProps> = ({ clientId: propClientId, showEdit = true }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const clientId = propClientId || paramId;

  const { data: client, isLoading } = useQuery({
    queryKey: ['legal-client', clientId],
    queryFn: async () => {
      const response = await api.get<LegalClient>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Client not found</p>
      </div>
    );
  }

  const fullAddress = [client.address, client.city, client.state, client.zip_code]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        {showEdit && (
          <Link
            to={\`/clients/\${clientId}/edit\`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              {client.avatar_url ? (
                <img
                  src={client.avatar_url}
                  alt={client.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {client.client_type === 'business' ? (
                    <Building className="w-8 h-8 text-white" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {client.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
              {client.company_name && (
                <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4" />
                  {client.company_name}
                </p>
              )}
              <p className="text-sm text-gray-500 capitalize">{client.client_type} Client</p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <a href={\`mailto:\${client.email}\`} className="flex items-center gap-1 hover:text-blue-600">
                  <Mail className="w-4 h-4" />
                  {client.email}
                </a>
                {client.phone && (
                  <a href={\`tel:\${client.phone}\`} className="flex items-center gap-1 hover:text-blue-600">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </a>
                )}
              </div>

              {fullAddress && (
                <p className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {fullAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.active_cases}</p>
            <p className="text-xs text-gray-500">Active Cases</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.total_cases}</p>
            <p className="text-xs text-gray-500">Total Cases</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
          <div className="space-y-3">
            {client.date_of_birth && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-gray-900 dark:text-white">{new Date(client.date_of_birth).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {client.preferred_language && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Preferred Language</p>
                  <p className="text-gray-900 dark:text-white">{client.preferred_language}</p>
                </div>
              </div>
            )}
            {client.communication_preference && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Communication Preference</p>
                  <p className="text-gray-900 dark:text-white capitalize">{client.communication_preference}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {client.emergency_contact && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h2>
            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">{client.emergency_contact.name}</p>
              <p className="text-sm text-gray-500">{client.emergency_contact.relationship}</p>
              <a href={\`tel:\${client.emergency_contact.phone}\`} className="block text-sm text-blue-600 hover:underline">
                {client.emergency_contact.phone}
              </a>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              to={\`/cases/new?client=\${clientId}\`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Scale className="w-4 h-4" />
              Open New Case
            </Link>
            <Link
              to={\`/clients/\${clientId}/cases\`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText className="w-4 h-4" />
              View Cases
            </Link>
            <Link
              to={\`/clients/\${clientId}/documents\`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileText className="w-4 h-4" />
              Documents
            </Link>
          </div>
        </div>
      </div>

      {client.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{client.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
