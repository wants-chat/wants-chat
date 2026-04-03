/**
 * Company Card Component Generator
 */

export interface CompanyCardOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCompanyCard(options: CompanyCardOptions = {}): string {
  const componentName = options.componentName || 'CompanyCard';

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, Briefcase, Star } from 'lucide-react';

interface ${componentName}Props {
  company: {
    id: string;
    name: string;
    logo_url?: string;
    location?: string;
    industry?: string;
    size?: string;
    rating?: number;
    open_jobs?: number;
  };
}

const ${componentName}: React.FC<${componentName}Props> = ({ company }) => {
  return (
    <Link
      to={\`/companies/\${company.id}\`}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow block"
    >
      <div className="flex items-center gap-4 mb-4">
        {company.logo_url ? (
          <img src={company.logo_url} alt={company.name} className="w-14 h-14 rounded-lg object-contain bg-gray-100" />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-gray-400" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{company.name}</h3>
          {company.industry && (
            <p className="text-sm text-gray-500">{company.industry}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-500 mb-4">
        {company.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {company.location}
          </div>
        )}
        {company.size && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {company.size} employees
          </div>
        )}
        {company.rating && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            {company.rating} rating
          </div>
        )}
      </div>

      {company.open_jobs !== undefined && company.open_jobs > 0 && (
        <div className="flex items-center gap-2 text-blue-600">
          <Briefcase className="w-4 h-4" />
          <span className="font-medium">{company.open_jobs} open positions</span>
        </div>
      )}
    </Link>
  );
};

export default ${componentName};
`;
}

export function generateCompanyGrid(options: CompanyCardOptions = {}): string {
  const { componentName = 'CompanyGrid', endpoint = '/companies' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Building2, MapPin, Users, Briefcase, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  industry?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ industry }) => {
  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies', industry],
    queryFn: async () => {
      const url = industry ? '${endpoint}?industry=' + encodeURIComponent(industry) : '${endpoint}';
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {companies && companies.length > 0 ? (
        companies.map((company: any) => (
          <Link
            key={company.id}
            to={\`/companies/\${company.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="w-14 h-14 rounded-lg object-contain bg-gray-100" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{company.name}</h3>
                {company.industry && (
                  <p className="text-sm text-gray-500">{company.industry}</p>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-500 mb-4">
              {company.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </div>
              )}
              {company.size && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {company.size} employees
                </div>
              )}
              {company.rating && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  {company.rating}
                </div>
              )}
            </div>
            {company.open_jobs !== undefined && company.open_jobs > 0 && (
              <div className="flex items-center gap-2 text-blue-600">
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">{company.open_jobs} open positions</span>
              </div>
            )}
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No companies found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
