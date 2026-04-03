/**
 * Client Component Generators for Marketing
 *
 * Generates marketing client management components:
 * - ClientHeaderMarketing: Client detail header with key info
 * - ClientPerformanceMarketing: Client campaign performance metrics
 * - ProjectBoardMarketing: Marketing project kanban board
 * - TaskListMarketing: Marketing task management list
 */

export interface ClientHeaderMarketingOptions {
  componentName?: string;
  endpoint?: string;
  showActions?: boolean;
  showStats?: boolean;
}

export function generateClientHeaderMarketing(options: ClientHeaderMarketingOptions = {}): string {
  const {
    componentName = 'ClientHeaderMarketing',
    endpoint = '/clients',
    showActions = true,
    showStats = true,
  } = options;

  return `import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, Mail, Phone, Globe, MapPin, Calendar,
  DollarSign, Megaphone, FolderKanban, ArrowLeft,
  Edit, MoreHorizontal, Trash2, FileText, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  clientId?: string;
  client?: any;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  clientId: propClientId,
  client: propClient,
  className,
  onEdit,
  onDelete,
}) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const clientId = propClientId || paramId;
  const [showMenu, setShowMenu] = useState(false);

  const { data: fetchedClient, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}\`);
      return response?.data || response;
    },
    enabled: !propClient && !!clientId,
  });

  const client = propClient || fetchedClient;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12 text-gray-500">
        Client not found
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      churned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || colors.active;
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Clients</span>
        </button>

        ${showActions ? `<div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <button
                  onClick={() => { navigate(\`/clients/\${clientId}/report\`); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Generate Report
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => { onDelete?.(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Client
                </button>
              </div>
            )}
          </div>
        </div>` : ''}
      </div>

      {/* Client Info */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Left: Avatar & Basic Info */}
          <div className="flex items-start gap-4">
            {client.logo ? (
              <img
                src={client.logo}
                alt={client.name}
                className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {client.name?.charAt(0) || 'C'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {client.name}
                </h1>
                <span className={\`px-2.5 py-0.5 text-xs font-medium rounded-full \${getStatusColor(client.status)}\`}>
                  {client.status?.charAt(0).toUpperCase() + client.status?.slice(1)}
                </span>
              </div>
              {client.industry && (
                <p className="text-gray-500 dark:text-gray-400 mb-2">{client.industry}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {client.contact_email && (
                  <a href={\`mailto:\${client.contact_email}\`} className="flex items-center gap-1 hover:text-blue-600">
                    <Mail className="w-4 h-4" />
                    {client.contact_email}
                  </a>
                )}
                {client.contact_phone && (
                  <a href={\`tel:\${client.contact_phone}\`} className="flex items-center gap-1 hover:text-blue-600">
                    <Phone className="w-4 h-4" />
                    {client.contact_phone}
                  </a>
                )}
                {client.website && (
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          ${showStats ? `{/* Right: Quick Stats */}
          <div className="lg:ml-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center">
              <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                \${(client.monthly_retainer || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Retainer</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center">
              <Megaphone className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {client.active_campaigns || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Campaigns</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center">
              <FolderKanban className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {client.total_projects || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Projects</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatDate(client.created_at)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Client Since</p>
            </div>
          </div>` : ''}
        </div>

        {/* Contact Person */}
        {client.contact_name && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Contact</p>
            <p className="text-gray-900 dark:text-white font-semibold">{client.contact_name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface ClientPerformanceMarketingOptions {
  componentName?: string;
  endpoint?: string;
  showCampaigns?: boolean;
  showChart?: boolean;
}

export function generateClientPerformanceMarketing(options: ClientPerformanceMarketingOptions = {}): string {
  const {
    componentName = 'ClientPerformanceMarketing',
    endpoint = '/clients',
    showCampaigns = true,
    showChart = true,
  } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, TrendingUp, TrendingDown, Eye,
  MousePointer, Target, DollarSign, Megaphone,
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  clientId?: string;
  className?: string;
  period?: '7d' | '30d' | '90d' | 'all';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  clientId: propClientId,
  className,
  period: initialPeriod = '30d',
}) => {
  const { id: paramId } = useParams();
  const clientId = propClientId || paramId;
  const [period, setPeriod] = useState(initialPeriod);

  const { data, isLoading } = useQuery({
    queryKey: ['client-performance', clientId, period],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}/performance?period=\${period}\`);
      return response?.data || response || {
        metrics: {
          impressions: { value: 2450000, change: 18.5 },
          clicks: { value: 85400, change: 12.3 },
          conversions: { value: 3420, change: 25.8 },
          spend: { value: 45000, change: 8.2 },
          revenue: { value: 180000, change: 32.4 },
          roas: { value: 4.0, change: 22.1 },
        },
        ${showCampaigns ? `campaigns: [
          { id: 1, name: 'Summer Sale 2024', status: 'active', impressions: 850000, clicks: 32000, conversions: 1280, spend: 15000, roas: 4.2 },
          { id: 2, name: 'Brand Awareness Q1', status: 'active', impressions: 1200000, clicks: 42000, conversions: 1680, spend: 20000, roas: 3.8 },
          { id: 3, name: 'Product Launch', status: 'completed', impressions: 400000, clicks: 11400, conversions: 460, spend: 10000, roas: 4.5 },
        ],` : ''}
      };
    },
    enabled: !!clientId,
  });

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  const metricConfig: Record<string, { label: string; icon: any; format: (v: number) => string; color: string }> = {
    impressions: { label: 'Impressions', icon: Eye, format: (v) => (v / 1000000).toFixed(2) + 'M', color: 'blue' },
    clicks: { label: 'Clicks', icon: MousePointer, format: (v) => (v / 1000).toFixed(1) + 'K', color: 'green' },
    conversions: { label: 'Conversions', icon: Target, format: (v) => v.toLocaleString(), color: 'purple' },
    spend: { label: 'Spend', icon: DollarSign, format: (v) => '\$' + (v / 1000).toFixed(1) + 'K', color: 'orange' },
    revenue: { label: 'Revenue', icon: TrendingUp, format: (v) => '\$' + (v / 1000).toFixed(1) + 'K', color: 'emerald' },
    roas: { label: 'ROAS', icon: BarChart3, format: (v) => v.toFixed(1) + 'x', color: 'cyan' },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Client Performance</h2>
        </div>
        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as any)}
              className={\`px-3 py-1.5 text-sm rounded-lg transition-colors \${
                period === p.value
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }\`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(data?.metrics || {}).map(([key, metric]: [string, any]) => {
            const config = metricConfig[key];
            if (!config) return null;
            const Icon = config.icon;
            const isPositive = metric.change >= 0;

            return (
              <div key={key} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{config.label}</span>
                  <Icon className={\`w-4 h-4 text-\${config.color}-500\`} />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {config.format(metric.value)}
                </p>
                <div className={\`flex items-center gap-1 text-xs \${isPositive ? 'text-green-600' : 'text-red-600'}\`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{Math.abs(metric.change).toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        ${showChart ? `{/* Chart Placeholder */}
        <div className="h-48 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center mb-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Performance chart will render here</p>
          </div>
        </div>` : ''}

        ${showCampaigns ? `{/* Campaign Performance Table */}
        {data?.campaigns && data.campaigns.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Campaign Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Campaign</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Impressions</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Clicks</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Conversions</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Spend</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((campaign: any) => (
                    <tr key={campaign.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{campaign.name}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={\`px-2 py-1 text-xs font-medium rounded-full \${
                          campaign.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }\`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {(campaign.impressions / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {(campaign.clicks / 1000).toFixed(1)}K
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {campaign.conversions.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        \${(campaign.spend / 1000).toFixed(1)}K
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {campaign.roas.toFixed(1)}x
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}` : ''}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface ProjectBoardMarketingOptions {
  componentName?: string;
  endpoint?: string;
  columns?: Array<{ id: string; name: string; color?: string }>;
}

export function generateProjectBoardMarketing(options: ProjectBoardMarketingOptions = {}): string {
  const {
    componentName = 'ProjectBoardMarketing',
    endpoint = '/projects',
    columns = [
      { id: 'backlog', name: 'Backlog', color: 'gray' },
      { id: 'planning', name: 'Planning', color: 'blue' },
      { id: 'in_progress', name: 'In Progress', color: 'yellow' },
      { id: 'review', name: 'Review', color: 'purple' },
      { id: 'completed', name: 'Completed', color: 'green' },
    ],
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderKanban, Plus, MoreHorizontal, Calendar,
  Users, DollarSign, Clock, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  clientId?: string;
  className?: string;
}

const columns = ${JSON.stringify(columns, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({
  clientId,
  className,
}) => {
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['marketing-projects', clientId],
    queryFn: async () => {
      const endpoint = clientId ? \`${endpoint}?client_id=\${clientId}\` : '${endpoint}';
      const response = await api.get<any>(endpoint);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(\`${endpoint}/\` + id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-projects'] });
      toast.success('Project updated');
    },
    onError: () => toast.error('Failed to update project'),
  });

  const getColumnColor = (color: string) => {
    const colors: Record<string, { header: string; border: string }> = {
      gray: { header: 'bg-gray-100 dark:bg-gray-700', border: 'border-gray-300' },
      blue: { header: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500' },
      yellow: { header: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-500' },
      purple: { header: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-500' },
      green: { header: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-500' },
    };
    return colors[color] || colors.gray;
  };

  const getProjectsByStatus = (status: string) =>
    projects?.filter((p: any) => p.status === status) || [];

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedItem(projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedItem) {
      updateProjectMutation.mutate({ id: draggedItem, status: newStatus });
    }
    setDraggedItem(null);
  };

  const formatDate = (date: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Project Board</h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Board */}
      <div className="overflow-x-auto p-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => {
            const columnProjects = getProjectsByStatus(column.id);
            const colors = getColumnColor(column.color || 'gray');

            return (
              <div
                key={column.id}
                className="w-72 flex-shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className={\`rounded-t-lg p-3 border-t-4 \${colors.border} \${colors.header}\`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{column.name}</h3>
                    <span className="text-sm text-gray-500">{columnProjects.length}</span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-b-lg p-2 min-h-[400px] space-y-2">
                  {columnProjects.map((project: any) => (
                    <div
                      key={project.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, project.id)}
                      className={\`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 cursor-move hover:shadow-md transition-shadow \${
                        draggedItem === project.id ? 'opacity-50' : ''
                      }\`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                          {project.name}
                        </h4>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {project.client_name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {project.client_name}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {project.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(project.due_date)}</span>
                          </div>
                        )}
                        {project.budget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>\${project.budget.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Type Badge */}
                      {project.type && (
                        <div className="mt-2">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                            {project.type}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  <button className="w-full p-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface TaskListMarketingOptions {
  componentName?: string;
  endpoint?: string;
  showFilters?: boolean;
  showAssignee?: boolean;
}

export function generateTaskListMarketing(options: TaskListMarketingOptions = {}): string {
  const {
    componentName = 'TaskListMarketing',
    endpoint = '/tasks',
    showFilters = true,
    showAssignee = true,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare, Square, Clock, AlertCircle,
  Calendar, User, Plus, Filter, MoreHorizontal,
  Edit, Trash2, ChevronDown, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  projectId?: string;
  clientId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  projectId,
  clientId,
  className,
}) => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['marketing-tasks', projectId, clientId, statusFilter, priorityFilter],
    queryFn: async () => {
      let endpoint = '${endpoint}?';
      if (projectId) endpoint += \`project_id=\${projectId}&\`;
      if (clientId) endpoint += \`client_id=\${clientId}&\`;
      if (statusFilter) endpoint += \`status=\${statusFilter}&\`;
      if (priorityFilter) endpoint += \`priority=\${priorityFilter}&\`;
      const response = await api.get<any>(endpoint);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.put(\`${endpoint}/\` + id, { status: completed ? 'completed' : 'pending' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-tasks'] });
    },
    onError: () => toast.error('Failed to update task'),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.delete(\`${endpoint}/\` + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-tasks'] });
      toast.success('Task deleted');
    },
    onError: () => toast.error('Failed to delete task'),
  });

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: '', label: 'All' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      low: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (date: string) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (days === 0) return { text: 'Today', color: 'text-orange-600' };
    if (days === 1) return { text: 'Tomorrow', color: 'text-yellow-600' };
    return {
      text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      color: 'text-gray-500 dark:text-gray-400'
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h2>
          <span className="text-sm text-gray-500">({tasks?.length || 0})</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      ${showFilters ? `{/* Filters */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>Status: {opt.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          {priorityOptions.map(opt => (
            <option key={opt.value} value={opt.value}>Priority: {opt.label}</option>
          ))}
        </select>
      </div>` : ''}

      {/* Task List */}
      {!tasks || tasks.length === 0 ? (
        <div className="p-8 text-center">
          <CheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {tasks.map((task: any) => {
            const isCompleted = task.status === 'completed';
            const dueDate = task.due_date ? formatDate(task.due_date) : null;

            return (
              <div
                key={task.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTaskMutation.mutate({ id: task.id, completed: !isCompleted })}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={\`font-medium \${
                        isCompleted
                          ? 'text-gray-400 line-through'
                          : 'text-gray-900 dark:text-white'
                      }\`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {task.priority && (
                          <span className={\`px-2 py-0.5 text-xs font-medium rounded \${getPriorityColor(task.priority)}\`}>
                            {task.priority}
                          </span>
                        )}
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                          {openMenu === task.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                              <button className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                                <Edit className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => { deleteTaskMutation.mutate(task.id); setOpenMenu(null); }}
                                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs">
                      {dueDate && (
                        <div className={\`flex items-center gap-1 \${dueDate.color}\`}>
                          <Calendar className="w-3 h-3" />
                          <span>{dueDate.text}</span>
                        </div>
                      )}
                      ${showAssignee ? `{task.assigned_to && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <User className="w-3 h-3" />
                          <span>{task.assigned_to}</span>
                        </div>
                      )}` : ''}
                      {task.estimated_hours && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimated_hours}h</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
