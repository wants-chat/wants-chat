/**
 * Contact/Company Profile Component Generators
 *
 * Generates profile cards and detail views for contacts and companies.
 */

export interface ContactProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateContactProfile(options: ContactProfileOptions = {}): string {
  const { componentName = 'ContactProfile', endpoint = '/contacts' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Mail, Phone, MapPin, Building, Calendar, ArrowLeft, Edit } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', id],
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

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Contact not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="${endpoint}" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {contact.avatar_url ? (
                  <img src={contact.avatar_url} alt={contact.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {(contact.name || contact.first_name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {contact.name || \`\${contact.first_name || ''} \${contact.last_name || ''}\`.trim()}
                </h1>
                {contact.title && (
                  <p className="text-gray-500">{contact.title}</p>
                )}
                {contact.company_name && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Building className="w-4 h-4" />
                    {contact.company_name}
                  </p>
                )}
              </div>
            </div>
            <Link
              to={\`${endpoint}/\${id}/edit\`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            {contact.email && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={\`mailto:\${contact.email}\`} className="hover:text-blue-600">{contact.email}</a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={\`tel:\${contact.phone}\`} className="hover:text-blue-600">{contact.phone}</a>
              </div>
            )}
            {(contact.address || contact.city) && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{[contact.address, contact.city, contact.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Details</h3>
            {contact.status && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Status:</span>
                <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                  contact.status === 'active' ? 'bg-green-100 text-green-700' :
                  contact.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                  'bg-yellow-100 text-yellow-700'
                }\`}>
                  {contact.status}
                </span>
              </div>
            )}
            {contact.created_at && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Added {new Date(contact.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCompanyProfile(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'CompanyProfile', endpoint = '/companies' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Globe, Phone, MapPin, Users, DollarSign, ArrowLeft, Edit } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', id],
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

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Company not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="${endpoint}" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {company.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">
                    {(company.name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
                {company.industry && (
                  <p className="text-gray-500">{company.industry}</p>
                )}
              </div>
            </div>
            <Link
              to={\`${endpoint}/\${id}/edit\`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Company Information</h3>
            {company.website && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Globe className="w-5 h-5 text-gray-400" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                  {company.website}
                </a>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{company.phone}</span>
              </div>
            )}
            {(company.address || company.city) && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{[company.address, company.city, company.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Business Details</h3>
            {company.employees && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Users className="w-5 h-5 text-gray-400" />
                <span>{company.employees} employees</span>
              </div>
            )}
            {company.revenue && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span>\${company.revenue.toLocaleString()} annual revenue</span>
              </div>
            )}
          </div>
        </div>

        {company.description && (
          <div className="px-6 pb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">{company.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDealCard(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'DealCard';

  return `import React from 'react';
import { DollarSign, Calendar, User, Building } from 'lucide-react';

interface DealCardProps {
  deal: {
    id: string;
    name?: string;
    title?: string;
    value?: number;
    stage?: string;
    status?: string;
    contact_name?: string;
    company_name?: string;
    expected_close_date?: string;
    created_at?: string;
  };
  onClick?: () => void;
}

const ${componentName}: React.FC<DealCardProps> = ({ deal, onClick }) => {
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-gray-100 text-gray-700',
      qualified: 'bg-blue-100 text-blue-700',
      proposal: 'bg-yellow-100 text-yellow-700',
      negotiation: 'bg-orange-100 text-orange-700',
      closed: 'bg-green-100 text-green-700',
      won: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700',
    };
    return colors[stage?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">{deal.name || deal.title}</h3>
        {(deal.stage || deal.status) && (
          <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStageColor(deal.stage || deal.status || '')}\`}>
            {deal.stage || deal.status}
          </span>
        )}
      </div>

      {deal.value !== undefined && (
        <div className="flex items-center gap-1 text-lg font-bold text-green-600 mb-3">
          <DollarSign className="w-4 h-4" />
          {deal.value.toLocaleString()}
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-500">
        {deal.contact_name && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {deal.contact_name}
          </div>
        )}
        {deal.company_name && (
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            {deal.company_name}
          </div>
        )}
        {deal.expected_close_date && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Expected: {new Date(deal.expected_close_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
