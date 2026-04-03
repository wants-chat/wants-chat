/**
 * Recruitment Client Component Generators
 *
 * Generates components for client/company profile management
 * in recruitment agency applications.
 */

export interface ClientRecruitmentOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate ClientProfileRecruitment component
 * Detailed client profile view with company info, contacts, and placement history
 */
export function generateClientProfileRecruitment(options: ClientRecruitmentOptions = {}): string {
  const { componentName = 'ClientProfileRecruitment', endpoint = '/recruitment/clients' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  Edit,
  MoreHorizontal,
  Star,
  StarOff,
  ExternalLink,
  FileText,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Award,
  ChevronDown,
  ChevronUp,
  Plus,
  Link2
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  clientId: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ clientId, className }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'contacts' | 'placements' | 'notes'>('overview');
  const [showAllContacts, setShowAllContacts] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}\`);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => api.put(\`${endpoint}/\${clientId}/favorite\`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success(client?.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    },
    onError: () => toast.error('Failed to update'),
  });

  const statusConfig: Record<string, { color: string; label: string }> = {
    active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Active Client' },
    prospect: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Prospect' },
    inactive: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', label: 'Inactive' },
    churned: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Churned' },
  };

  const industryIcons: Record<string, React.FC<any>> = {
    technology: Globe,
    finance: DollarSign,
    healthcare: Users,
    manufacturing: Building2,
    retail: Briefcase,
    default: Building2,
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
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Client not found
      </div>
    );
  }

  const status = statusConfig[client.status] || statusConfig.active;
  const IndustryIcon = industryIcons[client.industry?.toLowerCase()] || industryIcons.default;
  const contacts = client.contacts || [];
  const displayedContacts = showAllContacts ? contacts : contacts.slice(0, 3);

  const stats = [
    { label: 'Active Jobs', value: client.active_jobs_count || 0, icon: Briefcase, color: 'blue' },
    { label: 'Placements', value: client.placements_count || 0, icon: CheckCircle2, color: 'green' },
    { label: 'In Pipeline', value: client.pipeline_count || 0, icon: Clock, color: 'yellow' },
    { label: 'Revenue', value: '\$' + (client.total_revenue || 0).toLocaleString(), icon: DollarSign, color: 'emerald' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'jobs', label: 'Jobs', count: client.active_jobs_count },
    { id: 'contacts', label: 'Contacts', count: contacts.length },
    { id: 'placements', label: 'Placements', count: client.placements_count },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className={\`\${className || ''}\`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-xl bg-white dark:bg-gray-800 shadow-lg border-4 border-white dark:border-gray-800 flex items-center justify-center">
              {client.logo ? (
                <img src={client.logo} alt={client.name} className="w-full h-full rounded-lg object-contain" />
              ) : (
                <IndustryIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => toggleFavoriteMutation.mutate()}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              {client.is_favorite ? (
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              ) : (
                <StarOff className="w-5 h-5 text-white" />
              )}
            </button>
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
              <Edit className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="pt-16 px-6 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
                <span className={\`px-3 py-1 rounded-full text-xs font-medium \${status.color}\`}>
                  {status.label}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{client.industry}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                {client.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {client.location}
                  </span>
                )}
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {client.company_size && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {client.company_size} employees
                  </span>
                )}
                {client.founded_year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Founded {client.founded_year}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Briefcase className="w-4 h-4" />
                Add Job
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={\`w-10 h-10 rounded-lg flex items-center justify-center bg-\${stat.color}-100 dark:bg-\${stat.color}-900/30\`}>
                    <stat.icon className={\`w-5 h-5 text-\${stat.color}-600 dark:text-\${stat.color}-400\`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={\`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }\`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {client.description || 'No description available.'}
                </p>
                {client.specializations && client.specializations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {client.specializations.map((spec: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                </div>
                <div className="space-y-4">
                  {(client.recent_activity || [
                    { type: 'job_posted', title: 'New job posted: Senior Developer', date: '2 hours ago' },
                    { type: 'placement', title: 'John Doe placed as Product Manager', date: '3 days ago' },
                    { type: 'interview', title: 'Interview scheduled with Jane Smith', date: '5 days ago' },
                  ]).map((activity: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        {activity.type === 'job_posted' && <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {activity.type === 'placement' && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />}
                        {activity.type === 'interview' && <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'jobs' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Jobs</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  <Plus className="w-4 h-4" />
                  Add Job
                </button>
              </div>
              <div className="space-y-3">
                {(client.jobs || []).map((job: any) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {job.location} - {job.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.applicants_count || 0} applicants</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Posted {job.posted_at}</p>
                      </div>
                      <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                        job.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }\`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
                {(!client.jobs || client.jobs.length === 0) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No active jobs</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contacts</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  <UserPlus className="w-4 h-4" />
                  Add Contact
                </button>
              </div>
              <div className="space-y-4">
                {contacts.map((contact: any) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {contact.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{contact.name}</h4>
                          {contact.is_primary && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{contact.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {contact.email && (
                            <a href={\`mailto:\${contact.email}\`} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </a>
                          )}
                          {contact.phone && (
                            <a href={\`tel:\${contact.phone}\`} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No contacts added</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'placements' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Placement History</h3>
              <div className="space-y-4">
                {(client.placements || []).map((placement: any) => (
                  <div
                    key={placement.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{placement.candidate_name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{placement.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        \${(placement.fee || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{placement.date}</p>
                    </div>
                  </div>
                ))}
                {(!client.placements || client.placements.length === 0) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Award className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No placements yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  <Plus className="w-4 h-4" />
                  Add Note
                </button>
              </div>
              <div className="space-y-4">
                {(client.notes || []).map((note: any) => (
                  <div
                    key={note.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{note.author}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{note.date}</span>
                      </div>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{note.content}</p>
                  </div>
                ))}
                {(!client.notes || client.notes.length === 0) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No notes yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Contacts</h3>
            <div className="space-y-3">
              {displayedContacts.map((contact: any) => (
                <div key={contact.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {contact.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{contact.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.title}</p>
                  </div>
                </div>
              ))}
              {contacts.length > 3 && (
                <button
                  onClick={() => setShowAllContacts(!showAllContacts)}
                  className="w-full flex items-center justify-center gap-1 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  {showAllContacts ? (
                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show All ({contacts.length}) <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contract Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Fee Structure</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{client.fee_structure || 'Standard'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Fee Percentage</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{client.fee_percentage || 20}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Payment Terms</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{client.payment_terms || 'Net 30'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Contract Start</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{client.contract_start || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Contract End</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{client.contract_end || 'Ongoing'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Briefcase className="w-4 h-4" />
                Post New Job
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <UserPlus className="w-4 h-4" />
                Add Contact
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FileText className="w-4 h-4" />
                Add Note
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Calendar className="w-4 h-4" />
                Schedule Meeting
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Link2 className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
