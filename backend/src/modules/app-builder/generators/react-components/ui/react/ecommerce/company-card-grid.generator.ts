import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCompanyCardGrid = (resolved: ResolvedComponent) => {
  const dataSource = resolved.dataSource;

  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  return `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Briefcase,
  CheckCircle,
  Search,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Company {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  logo_url?: string;
  cover_image_url?: string;
  website?: string;
  is_verified?: boolean;
  jobs_count?: number;
  founded_year?: number;
}

interface CompanyCardGridProps {
  [key: string]: any;
  className?: string;
}

const CompanyCardGrid: React.FC<CompanyCardGridProps> = ({ ${dataName}: propData, className }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  // Fetch companies if not provided as prop
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<any>('/companies').then(res => res.data),
    enabled: !propData || (Array.isArray(propData) && propData.length === 0),
  });

  // Extract companies data
  const rawData = propData || fetchedData?.data || fetchedData || [];
  const companiesList: Company[] = Array.isArray(rawData) ? rawData : [];

  // Get unique industries for filtering
  const industries = [...new Set(companiesList.map(c => c.industry).filter(Boolean))] as string[];

  // Filter companies
  const filteredCompanies = companiesList.filter(company => {
    const matchesSearch = !searchQuery ||
      company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry;

    return matchesSearch && matchesIndustry;
  });

  const getCompanySizeLabel = (size?: string) => {
    const sizes: Record<string, string> = {
      '1-10': '1-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '201-500': '201-500 employees',
      '501-1000': '501-1000 employees',
      '1001-5000': '1001-5000 employees',
      '5001+': '5000+ employees',
    };
    return sizes[size || ''] || size || 'Unknown size';
  };

  if (isLoading) {
    return (
      <div className={cn("py-12", className)}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("py-12", className)}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Companies
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover great places to work. Browse through {companiesList.length}+ companies hiring now.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search companies by name, industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedIndustry === null ? "default" : "outline"}
              onClick={() => setSelectedIndustry(null)}
              className="h-12"
            >
              All Industries
            </Button>
            {industries.slice(0, 4).map(industry => (
              <Button
                key={industry}
                variant={selectedIndustry === industry ? "default" : "outline"}
                onClick={() => setSelectedIndustry(industry)}
                className="h-12"
              >
                {industry}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Showing {filteredCompanies.length} of {companiesList.length} companies
        </p>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No companies found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedIndustry(null); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md cursor-pointer overflow-hidden"
                onClick={() => navigate(\`/companies/\${company.id}\`)}
              >
                {/* Cover Image or Gradient */}
                <div className="h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
                  {company.cover_image_url && (
                    <img
                      src={company.cover_image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Logo positioned on cover */}
                  <div className="absolute -bottom-8 left-6">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-16 h-16 rounded-xl object-contain bg-white dark:bg-gray-800 p-2 border-4 border-white dark:border-gray-800 shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                        {company.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="pt-12 pb-6 px-6">
                  {/* Company Name & Verified Badge */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {company.name}
                        </h3>
                        {company.is_verified && (
                          <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      {company.industry && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {company.industry}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {company.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {company.description}
                    </p>
                  )}

                  {/* Company Info */}
                  <div className="space-y-2 mb-4">
                    {company.location && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{company.location}</span>
                      </div>
                    )}
                    {company.company_size && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{getCompanySizeLabel(company.company_size)}</span>
                      </div>
                    )}
                    {company.jobs_count !== undefined && company.jobs_count > 0 && (
                      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                        <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{company.jobs_count} open position{company.jobs_count > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(\`/companies/\${company.id}\`);
                      }}
                    >
                      View Company
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    {company.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(company.website, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCardGrid;
`;
};
