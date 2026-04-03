/**
 * Client Component Generators
 *
 * Generates client-related components for consulting, freelance, and accounting domains.
 */

export interface ClientHeaderOptions {
  componentName?: string;
  endpoint?: string;
}

export interface ClientProfileOptions {
  componentName?: string;
  endpoint?: string;
  showProjects?: boolean;
  showInvoices?: boolean;
  showNotes?: boolean;
}

/**
 * Generate a ClientHeaderConsulting component
 */
export function generateClientHeaderConsulting(options: ClientHeaderOptions = {}): string {
  const { componentName = 'ClientHeaderConsulting', endpoint = '/clients' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  Edit,
  MoreVertical,
  Star,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  clientId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ clientId: propClientId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const clientId = propClientId || paramId;

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}\`);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
        <p className="text-center text-gray-500">Client not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      case 'prospect':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'churned':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      {/* Header Actions */}
      <div className="px-6 pt-4 flex items-center justify-between">
        <Link
          to="${endpoint}"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Clients</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to={\`${endpoint}/\${clientId}/edit\`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Client Info */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            {client.logo_url ? (
              <img src={client.logo_url} alt={client.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Building2 className="w-10 h-10 text-white" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {client.name || client.company_name}
              </h1>
              <span className={\`px-2.5 py-0.5 rounded-full text-xs font-medium \${getStatusColor(client.status)}\`}>
                {client.status || 'Active'}
              </span>
              {client.priority && (
                <div className={\`flex items-center gap-1 \${getPriorityColor(client.priority)}\`}>
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-medium">{client.priority} Priority</span>
                </div>
              )}
            </div>

            {client.industry && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                <Briefcase className="w-4 h-4" />
                <span>{client.industry}</span>
              </div>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {client.email && (
                <a
                  href={\`mailto:\${client.email}\`}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Mail className="w-4 h-4" />
                  {client.email}
                </a>
              )}
              {client.phone && (
                <a
                  href={\`tel:\${client.phone}\`}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </a>
              )}
              {client.website && (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Globe className="w-4 h-4" />
                  {client.website.replace(/^https?:\\/\\//, '')}
                </a>
              )}
              {(client.address || client.city) && (
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {[client.address, client.city, client.country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {client.total_projects || 0}
            </div>
            <div className="text-sm text-gray-500">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              \${(client.total_revenue || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {client.active_contracts || 0}
            </div>
            <div className="text-sm text-gray-500">Active Contracts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {client.created_at ? new Date(client.created_at).getFullYear() : '-'}
            </div>
            <div className="text-sm text-gray-500">Client Since</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a ClientProfileConsulting component
 */
export function generateClientProfileConsulting(options: ClientProfileOptions = {}): string {
  const {
    componentName = 'ClientProfileConsulting',
    endpoint = '/clients',
    showProjects = true,
    showInvoices = true,
    showNotes = true,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Folder,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  clientId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ clientId: propClientId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const clientId = propClientId || paramId;
  const [activeTab, setActiveTab] = useState('overview');

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}\`);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  ${showProjects ? `const { data: projects } = useQuery({
    queryKey: ['client-projects', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}/projects\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!clientId && activeTab === 'projects',
  });` : ''}

  ${showInvoices ? `const { data: invoices } = useQuery({
    queryKey: ['client-invoices', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}/invoices\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!clientId && activeTab === 'invoices',
  });` : ''}

  ${showNotes ? `const { data: notes } = useQuery({
    queryKey: ['client-notes', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}/notes\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!clientId && activeTab === 'notes',
  });` : ''}

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    ${showProjects ? `{ id: 'projects', label: 'Projects', icon: Folder },` : ''}
    ${showInvoices ? `{ id: 'invoices', label: 'Invoices', icon: FileText },` : ''}
    ${showNotes ? `{ id: 'notes', label: 'Notes', icon: MessageSquare },` : ''}
    { id: 'contacts', label: 'Contacts', icon: Users },
  ];

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500">Client not found</p>
      </div>
    );
  }

  const getProjectStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': case 'active': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {client.industry && (
                  <div>
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="font-medium text-gray-900 dark:text-white">{client.industry}</p>
                  </div>
                )}
                {client.company_size && (
                  <div>
                    <p className="text-sm text-gray-500">Company Size</p>
                    <p className="font-medium text-gray-900 dark:text-white">{client.company_size}</p>
                  </div>
                )}
                {client.annual_revenue && (
                  <div>
                    <p className="text-sm text-gray-500">Annual Revenue</p>
                    <p className="font-medium text-gray-900 dark:text-white">\${client.annual_revenue.toLocaleString()}</p>
                  </div>
                )}
                {client.founded && (
                  <div>
                    <p className="text-sm text-gray-500">Founded</p>
                    <p className="font-medium text-gray-900 dark:text-white">{client.founded}</p>
                  </div>
                )}
              </div>
              {client.description && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-2">About</p>
                  <p className="text-gray-700 dark:text-gray-300">{client.description}</p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {client.recent_activities?.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white">{activity.description}</p>
                      <p className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Lifetime Value</span>
                  <span className="font-semibold text-green-600">\${(client.lifetime_value || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Open Invoices</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{client.open_invoices || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Active Projects</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{client.active_projects || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Satisfaction Score</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{client.satisfaction_score || '-'}/10</span>
                </div>
              </div>
            </div>

            {/* Key Contacts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Key Contacts</h3>
              <div className="space-y-3">
                {client.contacts?.slice(0, 3).map((contact: any) => (
                  <div key={contact.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {(contact.name || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.role}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500">No contacts added</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      ${showProjects ? `{activeTab === 'projects' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Projects</h3>
            <Link
              to={\`/projects/new?client=\${clientId}\`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {projects?.map((project: any) => (
              <Link
                key={project.id}
                to={\`/projects/\${project.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.type || 'Project'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getProjectStatusColor(project.status)}\`}>
                    {project.status}
                  </span>
                  <span className="text-sm text-gray-500">\${(project.budget || 0).toLocaleString()}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            )) || (
              <div className="p-8 text-center text-gray-500">No projects found</div>
            )}
          </div>
        </div>
      )}` : ''}

      ${showInvoices ? `{activeTab === 'invoices' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Invoices</h3>
            <Link
              to={\`/invoices/new?client=\${clientId}\`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Invoice</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Due Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices?.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <Link to={\`/invoices/\${invoice.id}\`} className="text-blue-600 hover:text-blue-700 font-medium">
                        {invoice.number || \`#\${invoice.id}\`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      \${(invoice.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getInvoiceStatusColor(invoice.status)}\`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No invoices found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}` : ''}

      ${showNotes ? `{activeTab === 'notes' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notes</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          </div>
          <div className="space-y-4">
            {notes?.map((note: any) => (
              <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-gray-900 dark:text-white">{note.title || 'Note'}</p>
                  <span className="text-sm text-gray-500">{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{note.content}</p>
                {note.author && (
                  <p className="text-sm text-gray-500 mt-2">By {note.author}</p>
                )}
              </div>
            )) || (
              <p className="text-gray-500">No notes added</p>
            )}
          </div>
        </div>
      )}` : ''}

      {activeTab === 'contacts' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Contacts</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.contacts?.map((contact: any) => (
              <div key={contact.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {(contact.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.role}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {contact.email && (
                    <a href={\`mailto:\${contact.email}\`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a href={\`tel:\${contact.phone}\`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600">
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center text-gray-500 py-8">No contacts found</div>
            )}
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
 * Generate a ClientProfileFreelance component
 */
export function generateClientProfileFreelance(options: ClientProfileOptions = {}): string {
  const { componentName = 'ClientProfileFreelance', endpoint = '/clients' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Edit,
  Star,
  MessageSquare,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  clientId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ clientId: propClientId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const clientId = propClientId || paramId;

  const { data: client, isLoading } = useQuery({
    queryKey: ['freelance-client', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}\`);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  const { data: projects } = useQuery({
    queryKey: ['freelance-client-projects', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}/projects\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500">Client not found</p>
      </div>
    );
  }

  const totalEarnings = projects?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
  const completedProjects = projects?.filter((p: any) => p.status === 'completed')?.length || 0;
  const activeProjects = projects?.filter((p: any) => ['active', 'in_progress'].includes(p.status?.toLowerCase()))?.length || 0;

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      {/* Back Link */}
      <Link
        to="${endpoint}"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                {client.avatar_url ? (
                  <img src={client.avatar_url} alt={client.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {(client.name || client.first_name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {client.name || \`\${client.first_name || ''} \${client.last_name || ''}\`.trim()}
                  </h1>
                  {client.company_name && (
                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4" />
                      {client.company_name}
                    </p>
                  )}
                  {client.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={\`w-4 h-4 \${i < Math.floor(client.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}\`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">{client.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  <Link
                    to={\`${endpoint}/\${clientId}/edit\`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                </div>
              </div>

              {/* Contact Details */}
              <div className="flex flex-wrap gap-4 text-sm">
                {client.email && (
                  <a href={\`mailto:\${client.email}\`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </a>
                )}
                {client.phone && (
                  <a href={\`tel:\${client.phone}\`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </a>
                )}
                {(client.city || client.country) && (
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {[client.city, client.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {client.created_at && (
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Client since {new Date(client.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{projects?.length || 0}</div>
            <div className="text-sm text-gray-500">Total Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activeProjects}</div>
            <div className="text-sm text-gray-500">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedProjects}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
      </div>

      {/* Project History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Project History</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {projects?.map((project: any) => (
            <div key={project.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{project.name || project.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.description?.slice(0, 100)}...</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    {project.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {project.duration}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">\${(project.amount || 0).toLocaleString()}</div>
                  <span className={\`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 \${
                    project.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    project.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                  }\`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          )) || (
            <div className="p-8 text-center text-gray-500">No projects found</div>
          )}
        </div>
      </div>

      {/* Notes */}
      {client.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
          <p className="text-gray-600 dark:text-gray-400">{client.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a ClientProfileAccountingComponent
 */
export function generateClientProfileAccounting(options: ClientProfileOptions = {}): string {
  const { componentName = 'ClientProfileAccounting', endpoint = '/clients' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  clientId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ clientId: propClientId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const clientId = propClientId || paramId;
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: client, isLoading } = useQuery({
    queryKey: ['accounting-client', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}\`);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  const { data: financials } = useQuery({
    queryKey: ['client-financials', clientId, selectedYear],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}/financials?year=\${selectedYear}\`);
      return response?.data || response || {};
    },
    enabled: !!clientId,
  });

  const { data: transactions } = useQuery({
    queryKey: ['client-transactions', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}/transactions\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500">Client not found</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="${endpoint}"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Client Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name || client.company_name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              {client.tax_id && <span>Tax ID: {client.tax_id}</span>}
              {client.fiscal_year_end && <span>Fiscal Year End: {client.fiscal_year_end}</span>}
              {client.accounting_method && <span>Method: {client.accounting_method}</span>}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {client.email && (
                <a href={\`mailto:\${client.email}\`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  <Mail className="w-4 h-4" /> {client.email}
                </a>
              )}
              {client.phone && (
                <a href={\`tel:\${client.phone}\`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  <Phone className="w-4 h-4" /> {client.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            \${(financials?.total_revenue || 0).toLocaleString()}
          </div>
          {financials?.revenue_change !== undefined && (
            <div className={\`text-sm mt-1 \${financials.revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
              {financials.revenue_change >= 0 ? '+' : ''}{financials.revenue_change}% vs last year
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            \${(financials?.total_expenses || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className={\`text-2xl font-bold \${(financials?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
            \${(financials?.net_profit || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Outstanding</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            \${(financials?.outstanding_amount || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
          <Link
            to={\`/transactions/new?client=\${clientId}\`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Description</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Category</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions?.slice(0, 10).map((transaction: any) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(transaction.date || transaction.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{transaction.description}</td>
                  <td className="px-4 py-3">
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                      transaction.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }\`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{transaction.category}</td>
                  <td className={\`px-4 py-3 text-right font-medium \${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }\`}>
                    {transaction.type === 'income' ? '+' : '-'}\${Math.abs(transaction.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }\`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tax Documents</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {client.tax_documents?.map((doc: any) => (
            <div key={doc.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                <p className="text-sm text-gray-500">{doc.year} - {doc.type}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )) || (
            <div className="col-span-full text-center text-gray-500 py-4">No tax documents uploaded</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
