import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCompanyDetailPage = (resolved: ResolvedComponent) => {
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
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Briefcase,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Award,
  TrendingUp
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
  email?: string;
  phone?: string;
  is_verified?: boolean;
  founded_year?: number;
  jobs_count?: number;
  employees_count?: number;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  benefits?: string[];
  culture?: string;
  mission?: string;
  created_at?: string;
}

interface CompanyDetailPageProps {
  [key: string]: any;
  className?: string;
}

const CompanyDetailPage: React.FC<CompanyDetailPageProps> = ({ ${dataName}: propData, className }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Check if we have valid company data passed as prop
  const hasValidPropData = propData && !Array.isArray(propData) && propData?.id;

  // Fetch company data
  const { data: companyData, isLoading, error } = useQuery({
    queryKey: ['company', id],
    queryFn: () => api.get<any>(\`/companies/\${id}\`).then(res => res.data),
    enabled: !!id && !hasValidPropData,
  });

  // Extract company data
  const extractedPropData = Array.isArray(propData) ? null : propData;
  const company: Company = companyData?.data || companyData || extractedPropData || {};

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
    return sizes[size || ''] || size || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !company?.id) {
    return (
      <div className={cn("py-12", className)}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Company not found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">The company you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/companies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        {company.cover_image_url && (
          <img
            src={company.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 pb-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/companies')}
          className="mb-4 text-white hover:text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header Card */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Logo */}
                  <div className="flex-shrink-0 -mt-16">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-28 h-28 rounded-2xl object-contain bg-white p-2 border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                        {company.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {company.name}
                      </h1>
                      {company.is_verified && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {company.industry && (
                      <Badge variant="secondary" className="mb-3">
                        {company.industry}
                      </Badge>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {company.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {company.location}
                        </div>
                      )}
                      {company.company_size && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {getCompanySizeLabel(company.company_size)}
                        </div>
                      )}
                      {company.founded_year && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Founded {company.founded_year}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  {company.website && (
                    <Button
                      onClick={() => window.open(company.website, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* About */}
            {company.description && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">About {company.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {company.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mission */}
            {company.mission && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-600" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {company.mission}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Culture */}
            {company.culture && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Company Culture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {company.culture}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {company.benefits && company.benefits.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {company.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="border-0 shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.email && (
                  <a
                    href={\`mailto:\${company.email}\`}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{company.email}</span>
                  </a>
                )}
                {company.phone && (
                  <a
                    href={\`tel:\${company.phone}\`}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Phone className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>{company.phone}</span>
                  </a>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Globe className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{company.website.replace(/^https?:\\/\\//, '')}</span>
                  </a>
                )}
                {company.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>{company.location}</span>
                  </div>
                )}

                <Separator />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {company.company_size && (
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getCompanySizeLabel(company.company_size)}
                      </div>
                      <div className="text-xs text-gray-500">Team Size</div>
                    </div>
                  )}
                  {company.founded_year && (
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Calendar className="h-5 w-5 mx-auto mb-1 text-green-600" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {company.founded_year}
                      </div>
                      <div className="text-xs text-gray-500">Founded</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
`;
};
