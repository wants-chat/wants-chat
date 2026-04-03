/**
 * Design Component Generators for Creative/Design Apps
 *
 * Generates design-related components including:
 * - DesignStats - Statistics dashboard for design businesses
 * - ClientProfileDesign - Client profile for design agencies
 */

export interface DesignGeneratorOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate DesignStats component - statistics for design business
 */
export function generateDesignStats(options: DesignGeneratorOptions = {}): string {
  const {
    componentName = 'DesignStats',
    endpoint = '/design/stats',
    queryKey = 'design-stats',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Palette,
  Layers,
  Users,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  CheckCircle,
  AlertCircle,
  FileText,
  Target,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  designerId?: string;
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

const ${componentName}: React.FC<${componentName}Props> = ({ className, designerId }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', designerId, timeRange],
    queryFn: async () => {
      let url = '${endpoint}?period=' + timeRange;
      if (designerId) url += '&designer_id=' + designerId;
      const response = await api.get<any>(url);
      return response?.data || response || {};
    },
  });

  const timeRangeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  if (isLoading) {
    return (
      <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 \${className || ''}\`}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={\`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center \${className || ''}\`}>
        <p className="text-red-600 dark:text-red-400">Failed to load statistics</p>
      </div>
    );
  }

  const mainStats = [
    {
      label: 'Active Projects',
      value: stats?.activeProjects || 0,
      change: stats?.projectsChange,
      icon: Briefcase,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Total Clients',
      value: stats?.totalClients || 0,
      change: stats?.clientsChange,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Designs Delivered',
      value: stats?.designsDelivered || 0,
      change: stats?.designsChange,
      icon: Layers,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Revenue',
      value: '$' + (stats?.revenue || 0).toLocaleString(),
      change: stats?.revenueChange,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
  ];

  const projectStatusStats = [
    {
      label: 'In Progress',
      value: stats?.inProgressProjects || 0,
      icon: Zap,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'In Review',
      value: stats?.inReviewProjects || 0,
      icon: AlertCircle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      label: 'Completed',
      value: stats?.completedProjects || 0,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Proposals Sent',
      value: stats?.proposalsSent || 0,
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
  ];

  const performanceMetrics = [
    { label: 'Avg. Project Duration', value: stats?.avgProjectDuration ? stats.avgProjectDuration + ' days' : '-' },
    { label: 'Client Satisfaction', value: stats?.clientSatisfaction ? stats.clientSatisfaction.toFixed(1) + '/5' : '-' },
    { label: 'On-Time Delivery', value: stats?.onTimeDelivery ? stats.onTimeDelivery + '%' : '-' },
    { label: 'Revision Rate', value: stats?.revisionRate ? stats.revisionRate.toFixed(1) + ' avg' : '-' },
  ];

  const designTypes = stats?.designTypeBreakdown || [
    { type: 'Logo Design', count: 0, revenue: 0 },
    { type: 'Brand Identity', count: 0, revenue: 0 },
    { type: 'Web Design', count: 0, revenue: 0 },
    { type: 'UI/UX Design', count: 0, revenue: 0 },
    { type: 'Print Design', count: 0, revenue: 0 },
  ];

  const totalTypeCount = designTypes.reduce((sum: number, t: any) => sum + t.count, 0) || 1;

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="w-6 h-6 text-purple-500" />
              Design Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your design business performance</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={\`p-3 rounded-lg \${stat.bgColor}\`}>
                    <Icon className={\`w-6 h-6 \${stat.color}\`} />
                  </div>
                  {stat.change !== undefined && (
                    <div className={\`flex items-center gap-1 text-sm font-medium \${
                      stat.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }\`}>
                      {stat.change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Status & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Project Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {projectStatusStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={\`p-4 rounded-lg \${stat.bgColor}\`}>
                  <div className="flex items-center gap-3">
                    <Icon className={\`w-5 h-5 \${stat.color}\`} />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Design Type Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          Design Type Breakdown
        </h3>
        <div className="space-y-4">
          {designTypes.map((type: any, index: number) => {
            const percentage = Math.round((type.count / totalTypeCount) * 100);
            const colors = [
              'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-green-500',
            ];
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{type.type}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{type.count} projects</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      \${type.revenue?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={\`h-full rounded-full \${colors[index % colors.length]}\`}
                    style={{ width: \`\${percentage}%\` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Projects */}
      {stats?.recentProjects && stats.recentProjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Projects</h3>
          <div className="space-y-3">
            {stats.recentProjects.slice(0, 5).map((project: any, index: number) => (
              <div
                key={project.id || index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{project.name || 'Untitled Project'}</p>
                    <p className="text-sm text-gray-500">{project.client_name || 'Client'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{project.type || 'Design'}</span>
                  <span className={\`px-2 py-1 text-xs rounded-full \${
                    project.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : project.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : project.status === 'in_review'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }\`}>
                    {project.status?.replace('_', ' ') || 'pending'}
                  </span>
                </div>
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

/**
 * Generate ClientProfileDesign component - client profile for design agencies
 */
export function generateClientProfileDesign(options: DesignGeneratorOptions = {}): string {
  const {
    componentName = 'ClientProfileDesign',
    endpoint = '/design/clients',
    queryKey = 'design-client',
  } = options;

  return `import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  Layers,
  DollarSign,
  Clock,
  Star,
  MessageCircle,
  Edit,
  FileText,
  Download,
  ChevronRight,
  Building,
  User,
  Palette,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  start_date?: string;
  end_date?: string;
  deliverables?: number;
  budget?: number;
  thumbnail_url?: string;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  date: string;
  due_date?: string;
}

interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  avatar_url?: string;
  address?: string;
  industry?: string;
  notes?: string;
  created_at?: string;
  stats?: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalSpent: number;
    avgProjectValue: number;
    lastProject?: string;
  };
  projects?: Project[];
  invoices?: Invoice[];
  brandGuidelines?: {
    primaryColor?: string;
    secondaryColor?: string;
    fonts?: string[];
    logoUrl?: string;
    styleNotes?: string;
  };
  contacts?: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
  }[];
}

interface ${componentName}Props {
  clientId?: string;
  className?: string;
}

type TabType = 'overview' | 'projects' | 'invoices' | 'brand' | 'contacts';

const ${componentName}: React.FC<${componentName}Props> = ({ clientId: propClientId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = propClientId || paramId;

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', clientId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className={\`flex justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className={\`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center \${className || ''}\`}>
        <p className="text-red-600 dark:text-red-400">Client not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects', count: client.projects?.length },
    { id: 'invoices', label: 'Invoices', count: client.invoices?.length },
    { id: 'brand', label: 'Brand Guidelines' },
    { id: 'contacts', label: 'Contacts', count: client.contacts?.length },
  ];

  const projectStatusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    on_hold: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const invoiceStatusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className={className}>
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {client.avatar_url ? (
                <img src={client.avatar_url} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
                  <span className="text-2xl font-bold text-white">
                    {(client.company || client.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.company || client.name}</h1>
              {client.company && client.name && (
                <p className="text-gray-500 dark:text-gray-400">{client.name}</p>
              )}
              {client.industry && (
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm">
                  {client.industry}
                </span>
              )}
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
                {client.email && (
                  <a href={\`mailto:\${client.email}\`} className="flex items-center gap-1 hover:text-purple-600">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </a>
                )}
                {client.phone && (
                  <a href={\`tel:\${client.phone}\`} className="flex items-center gap-1 hover:text-purple-600">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </a>
                )}
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-purple-600"
                  >
                    <Globe className="w-4 h-4" />
                    {client.website.replace(/^https?:\\/\\//, '').replace(/\\/$/, '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {client.address && (
                <p className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {client.address}
                </p>
              )}
              {client.created_at && (
                <p className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  Client since {new Date(client.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              New Project
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats */}
        {client.stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Briefcase className="w-5 h-5 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.stats.totalProjects || 0}</p>
              <p className="text-xs text-gray-500">Total Projects</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Zap className="w-5 h-5 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.stats.activeProjects || 0}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <CheckCircle className="w-5 h-5 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.stats.completedProjects || 0}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <DollarSign className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">\${(client.stats.totalSpent || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Star className="w-5 h-5 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">\${(client.stats.avgProjectValue || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Avg. Project</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={\`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors \${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {client.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
                  <p className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {client.notes}
                  </p>
                </div>
              )}
              {client.projects && client.projects.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Recent Projects</h3>
                  <div className="space-y-2">
                    {client.projects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        onClick={() => navigate('/projects/' + project.id)}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                            <p className="text-sm text-gray-500">{project.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={\`px-2 py-1 text-xs rounded-full capitalize \${projectStatusColors[project.status]}\`}>
                            {project.status?.replace('_', ' ')}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              {client.projects && client.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => navigate('/projects/' + project.id)}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video bg-gray-200 dark:bg-gray-600">
                        {project.thumbnail_url ? (
                          <img src={project.thumbnail_url} alt={project.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                            <Layers className="w-12 h-12 text-white/50" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                            <p className="text-sm text-gray-500">{project.type}</p>
                          </div>
                          <span className={\`px-2 py-1 text-xs rounded-full capitalize \${projectStatusColors[project.status]}\`}>
                            {project.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                          {project.budget !== undefined && (
                            <span>\${project.budget.toLocaleString()}</span>
                          )}
                          {project.deliverables !== undefined && (
                            <span>{project.deliverables} deliverables</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No projects yet</p>
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div>
              {client.invoices && client.invoices.length > 0 ? (
                <div className="space-y-3">
                  {client.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{invoice.number}</p>
                          <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900 dark:text-white">\${invoice.amount.toLocaleString()}</span>
                        <span className={\`px-2 py-1 text-xs rounded-full capitalize \${invoiceStatusColors[invoice.status]}\`}>
                          {invoice.status}
                        </span>
                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No invoices yet</p>
                </div>
              )}
            </div>
          )}

          {/* Brand Guidelines Tab */}
          {activeTab === 'brand' && (
            <div>
              {client.brandGuidelines ? (
                <div className="space-y-6">
                  {/* Logo */}
                  {client.brandGuidelines.logoUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Logo</h4>
                      <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg inline-block">
                        <img
                          src={client.brandGuidelines.logoUrl}
                          alt="Brand Logo"
                          className="max-h-24 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {client.brandGuidelines.primaryColor && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Primary Color</h4>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: client.brandGuidelines.primaryColor }}
                          />
                          <span className="font-mono text-gray-900 dark:text-white">{client.brandGuidelines.primaryColor}</span>
                        </div>
                      </div>
                    )}
                    {client.brandGuidelines.secondaryColor && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Secondary Color</h4>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: client.brandGuidelines.secondaryColor }}
                          />
                          <span className="font-mono text-gray-900 dark:text-white">{client.brandGuidelines.secondaryColor}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fonts */}
                  {client.brandGuidelines.fonts && client.brandGuidelines.fonts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Typography</h4>
                      <div className="flex flex-wrap gap-2">
                        {client.brandGuidelines.fonts.map((font, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                            style={{ fontFamily: font }}
                          >
                            {font}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Style Notes */}
                  {client.brandGuidelines.styleNotes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Style Notes</h4>
                      <p className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        {client.brandGuidelines.styleNotes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Palette className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No brand guidelines recorded</p>
                </div>
              )}
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div>
              {client.contacts && client.contacts.length > 0 ? (
                <div className="space-y-3">
                  {client.contacts.map((contact, index) => (
                    <div
                      key={index}
                      className={\`flex items-center justify-between p-4 rounded-lg \${
                        contact.isPrimary
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }\`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={\`w-12 h-12 rounded-full flex items-center justify-center \${
                          contact.isPrimary
                            ? 'bg-purple-100 dark:bg-purple-900/30'
                            : 'bg-gray-200 dark:bg-gray-600'
                        }\`}>
                          <User className={\`w-6 h-6 \${
                            contact.isPrimary
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-gray-500'
                          }\`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                            {contact.isPrimary && (
                              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{contact.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {contact.email && (
                          <a href={\`mailto:\${contact.email}\`} className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
                            <Mail className="w-4 h-4" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a href={\`tel:\${contact.phone}\`} className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No contacts recorded</p>
                </div>
              )}
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
