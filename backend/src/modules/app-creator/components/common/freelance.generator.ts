/**
 * Freelance Component Generators
 *
 * Generates freelance-specific components for stats, profiles, and deadlines.
 */

export interface FreelanceStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export interface FreelancerProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export interface DeadlineListOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate a FreelanceStats component showing freelancer metrics
 */
export function generateFreelanceStats(options: FreelanceStatsOptions = {}): string {
  const { componentName = 'FreelanceStats', endpoint = '/freelance/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  Briefcase,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  CheckCircle,
  Calendar,
  Target,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, period = 'month' }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['freelance-stats', period],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?period=\${period}\`);
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Earnings',
      value: stats?.total_earnings || 0,
      change: stats?.earnings_change,
      icon: DollarSign,
      color: 'green',
      format: 'currency',
    },
    {
      label: 'Active Projects',
      value: stats?.active_projects || 0,
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Hours Worked',
      value: stats?.hours_worked || 0,
      icon: Clock,
      color: 'purple',
      suffix: 'hrs',
    },
    {
      label: 'Avg. Hourly Rate',
      value: stats?.avg_hourly_rate || 0,
      icon: Target,
      color: 'orange',
      format: 'currency',
    },
    {
      label: 'Total Clients',
      value: stats?.total_clients || 0,
      icon: Users,
      color: 'cyan',
    },
    {
      label: 'Completed Projects',
      value: stats?.completed_projects || 0,
      icon: CheckCircle,
      color: 'emerald',
    },
    {
      label: 'Avg. Rating',
      value: stats?.avg_rating || 0,
      icon: Star,
      color: 'yellow',
      suffix: '/5',
    },
    {
      label: 'Pending Invoices',
      value: stats?.pending_invoices || 0,
      change: stats?.invoices_change,
      icon: Calendar,
      color: 'red',
      format: 'currency',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', icon: 'text-cyan-600 dark:text-cyan-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
  };

  const formatValue = (value: number, format?: string, suffix?: string) => {
    if (format === 'currency') return '\$' + value.toLocaleString();
    return value.toLocaleString() + (suffix || '');
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {statCards.map((stat, index) => {
        const colors = colorClasses[stat.color];
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-lg', colors.bg)}>
                <Icon className={cn('w-6 h-6', colors.icon)} />
              </div>
              {stat.change !== undefined && (
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatValue(stat.value, stat.format, stat.suffix)}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a FreelancerProfile component
 */
export function generateFreelancerProfile(options: FreelancerProfileOptions = {}): string {
  const { componentName = 'FreelancerProfile', endpoint = '/freelancers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Star,
  Briefcase,
  Clock,
  DollarSign,
  CheckCircle,
  Award,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Loader2,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  freelancerId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ freelancerId: propId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const freelancerId = propId || paramId;

  const { data: freelancer, isLoading } = useQuery({
    queryKey: ['freelancer', freelancerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${freelancerId}\`);
      return response?.data || response;
    },
    enabled: !!freelancerId,
  });

  const { data: portfolio } = useQuery({
    queryKey: ['freelancer-portfolio', freelancerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${freelancerId}/portfolio\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!freelancerId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['freelancer-reviews', freelancerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${freelancerId}/reviews\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!freelancerId,
  });

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500">Freelancer not found</p>
      </div>
    );
  }

  const socialLinks = [
    { key: 'github', icon: Github, color: 'hover:text-gray-900 dark:hover:text-white' },
    { key: 'linkedin', icon: Linkedin, color: 'hover:text-blue-700' },
    { key: 'twitter', icon: Twitter, color: 'hover:text-sky-500' },
    { key: 'website', icon: Globe, color: 'hover:text-green-600' },
  ];

  return (
    <div className={cn('max-w-5xl mx-auto space-y-6', className)}>
      {/* Back Link */}
      <Link
        to="${endpoint}"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Freelancers
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="p-6 -mt-12">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                {freelancer.avatar_url ? (
                  <img src={freelancer.avatar_url} alt={freelancer.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {(freelancer.name || freelancer.first_name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pt-4 sm:pt-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {freelancer.name || \`\${freelancer.first_name || ''} \${freelancer.last_name || ''}\`.trim()}
                  </h1>
                  <p className="text-gray-500 mt-1">{freelancer.title || freelancer.profession}</p>

                  {/* Rating */}
                  {freelancer.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={\`w-4 h-4 \${i < Math.floor(freelancer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}\`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {freelancer.rating.toFixed(1)} ({freelancer.review_count || 0} reviews)
                      </span>
                    </div>
                  )}

                  {/* Location & Availability */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    {freelancer.location && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {freelancer.location}
                      </span>
                    )}
                    {freelancer.availability && (
                      <span className={\`flex items-center gap-1 \${
                        freelancer.availability === 'available' ? 'text-green-600' :
                        freelancer.availability === 'busy' ? 'text-yellow-600' : 'text-red-600'
                      }\`}>
                        <Clock className="w-4 h-4" />
                        {freelancer.availability}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    Contact
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Briefcase className="w-4 h-4" />
                    Hire
                  </button>
                </div>
              </div>

              {/* Social Links */}
              {freelancer.social && (
                <div className="flex gap-3 mt-4">
                  {socialLinks.map(({ key, icon: Icon, color }) => {
                    const url = freelancer.social?.[key];
                    if (!url) return null;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={\`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 \${color} transition-colors\`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{freelancer.projects_completed || 0}</div>
            <div className="text-sm text-gray-500">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${freelancer.hourly_rate || 0}/hr</div>
            <div className="text-sm text-gray-500">Hourly Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{freelancer.years_experience || 0}+</div>
            <div className="text-sm text-gray-500">Years Exp.</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{freelancer.repeat_clients || 0}%</div>
            <div className="text-sm text-gray-500">Repeat Clients</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {freelancer.bio && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{freelancer.bio}</p>
            </div>
          )}

          {/* Skills */}
          {freelancer.skills?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {portfolio?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Portfolio</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {portfolio.map((item: any) => (
                  <div key={item.id} className="group relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img
                      src={item.image_url || '/api/placeholder/400/300'}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="text-sm text-gray-300 mt-1">{item.description?.slice(0, 60)}...</p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm mt-2"
                          >
                            View Project <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {(review.client_name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-white">{review.client_name}</p>
                          <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={\`w-4 h-4 \${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}\`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{review.comment}</p>
                        {review.project_name && (
                          <p className="text-sm text-gray-500 mt-2">Project: {review.project_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Info</h3>
            <div className="space-y-3">
              {freelancer.email && (
                <a href={\`mailto:\${freelancer.email}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  <Mail className="w-5 h-5" />
                  {freelancer.email}
                </a>
              )}
              {freelancer.phone && (
                <a href={\`tel:\${freelancer.phone}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  <Phone className="w-5 h-5" />
                  {freelancer.phone}
                </a>
              )}
              {freelancer.timezone && (
                <span className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5" />
                  {freelancer.timezone}
                </span>
              )}
            </div>
          </div>

          {/* Certifications */}
          {freelancer.certifications?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Certifications</h3>
              <div className="space-y-3">
                {freelancer.certifications.map((cert: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{cert.name}</p>
                      {cert.issuer && <p className="text-sm text-gray-500">{cert.issuer}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {freelancer.languages?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Languages</h3>
              <div className="space-y-2">
                {freelancer.languages.map((lang: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white">{lang.name || lang}</span>
                    {lang.level && (
                      <span className="text-sm text-gray-500">{lang.level}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a DeadlineListAccounting component for tracking deadlines
 */
export function generateDeadlineListAccounting(options: DeadlineListOptions = {}): string {
  const { componentName = 'DeadlineListAccounting', endpoint = '/deadlines' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  ChevronRight,
  Filter,
  Building2,
  FileText,
  DollarSign,
  Users,
  Loader2,
  Plus,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
  limit?: number;
}

interface Deadline {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  type: 'tax_filing' | 'payroll' | 'invoice' | 'report' | 'audit' | 'other';
  status: 'pending' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  client_id?: string;
  client_name?: string;
  assigned_to?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, limit }) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: deadlines, isLoading } = useQuery({
    queryKey: ['accounting-deadlines', filter, typeFilter],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tax_filing': return FileText;
      case 'payroll': return Users;
      case 'invoice': return DollarSign;
      case 'audit': return Building2;
      default: return Calendar;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tax_filing': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'payroll': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'invoice': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'audit': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'completed';
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (isOverdue) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getDaysUntil = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDueDate = (dueDate: string, status: string) => {
    const days = getDaysUntil(dueDate);
    if (status === 'completed') return 'Completed';
    if (days < 0) return \`\${Math.abs(days)} days overdue\`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days <= 7) return \`Due in \${days} days\`;
    return new Date(dueDate).toLocaleDateString();
  };

  const deadlineTypes = ['all', 'tax_filing', 'payroll', 'invoice', 'report', 'audit'];

  const displayedDeadlines = limit ? deadlines?.slice(0, limit) : deadlines;

  if (isLoading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Deadlines
          </h2>
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {['all', 'upcoming', 'overdue'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    filter === f
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              {deadlineTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.replace('_', ' ').replace(/\\b\\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>

            <Link
              to="/deadlines/new"
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </Link>
          </div>
        </div>
      </div>

      {/* Deadline List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayedDeadlines?.length > 0 ? (
          displayedDeadlines.map((deadline: Deadline) => {
            const TypeIcon = getTypeIcon(deadline.type);
            const days = getDaysUntil(deadline.due_date);
            const isUrgent = days <= 3 && days >= 0 && deadline.status !== 'completed';
            const isOverdue = days < 0 && deadline.status !== 'completed';

            return (
              <Link
                key={deadline.id}
                to={\`/deadlines/\${deadline.id}\`}
                className={cn(
                  'flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                  isOverdue && 'bg-red-50 dark:bg-red-900/10',
                  isUrgent && !isOverdue && 'bg-yellow-50 dark:bg-yellow-900/10'
                )}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(deadline.status, deadline.due_date)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{deadline.title}</h3>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getTypeColor(deadline.type))}>
                      {deadline.type.replace('_', ' ')}
                    </span>
                    {deadline.priority === 'high' && (
                      <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        High Priority
                      </span>
                    )}
                  </div>
                  {deadline.client_name && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {deadline.client_name}
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div className="flex-shrink-0 text-right">
                  <div className={cn(
                    'text-sm font-medium',
                    isOverdue ? 'text-red-600 dark:text-red-400' :
                    isUrgent ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-gray-600 dark:text-gray-400'
                  )}>
                    {formatDueDate(deadline.due_date, deadline.status)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Date(deadline.due_date).toLocaleDateString()}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </Link>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No deadlines found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {limit && deadlines?.length > limit && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <Link
            to="/deadlines"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
          >
            View all deadlines
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
