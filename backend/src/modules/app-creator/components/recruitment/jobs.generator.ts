/**
 * Recruitment Jobs Component Generators
 *
 * Generates components for managing active jobs, job filters, and job timelines
 * in recruitment/HR applications.
 */

export interface JobsRecruitmentOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate ActiveJobsRecruitment component
 * Displays active job postings with status, applicants count, and actions
 */
export function generateActiveJobsRecruitment(options: JobsRecruitmentOptions = {}): string {
  const { componentName = 'ActiveJobsRecruitment', endpoint = '/recruitment/jobs' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Briefcase,
  MapPin,
  Clock,
  Users,
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  PauseCircle,
  Building2,
  DollarSign,
  Calendar
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
  onJobSelect?: (job: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, onJobSelect }) => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['recruitment-jobs', selectedStatus],
    queryFn: async () => {
      const params = selectedStatus !== 'all' ? \`?status=\${selectedStatus}\` : '';
      const response = await api.get<any>('${endpoint}' + params);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put('${endpoint}/' + id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-jobs'] });
      toast.success('Job status updated');
    },
    onError: () => toast.error('Failed to update job status'),
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-jobs'] });
      toast.success('Job deleted');
    },
    onError: () => toast.error('Failed to delete job'),
  });

  const statusConfig: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
    paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: PauseCircle },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: XCircle },
    draft: { label: 'Draft', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Edit },
  };

  const statusFilters = [
    { value: 'all', label: 'All Jobs' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'closed', label: 'Closed' },
    { value: 'draft', label: 'Drafts' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Jobs</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your job postings</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedStatus(filter.value)}
            className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${
              selectedStatus === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }\`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {jobs && jobs.length > 0 ? (
          jobs.map((job: any) => {
            const status = statusConfig[job.status] || statusConfig.active;
            const StatusIcon = status.icon;

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onJobSelect?.(job)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-1">
                        <Building2 className="w-4 h-4" />
                        <span>{job.department || 'No Department'}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        )}
                        {job.employment_type && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.employment_type}
                          </span>
                        )}
                        {job.salary_range && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary_range}
                          </span>
                        )}
                        {job.posted_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Posted {job.posted_at}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        {job.applicants_count || 0} applicants
                      </span>
                    </div>
                    <span className={\`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium \${status.color}\`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                    <div className="relative group">
                      <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Edit className="w-4 h-4" />
                          Edit Job
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteJobMutation.mutate(job.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Job
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No jobs found</p>
            <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Post Your First Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate JobFiltersRecruitment component
 * Filters for recruitment job listings
 */
export function generateJobFiltersRecruitment(options: JobsRecruitmentOptions = {}): string {
  const { componentName = 'JobFiltersRecruitment' } = options;

  return `import React, { useState } from 'react';
import { SlidersHorizontal, X, Search, MapPin, Building2, DollarSign, Clock } from 'lucide-react';

interface FilterState {
  search: string;
  department: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  status: string;
  experience: string[];
  skills: string[];
}

interface ${componentName}Props {
  filters: Partial<FilterState>;
  onChange: (filters: Partial<FilterState>) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ filters, onChange, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product'];
  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'];
  const salaryRanges = ['$0 - $50k', '$50k - $80k', '$80k - $120k', '$120k - $150k', '$150k - $200k', '$200k+'];
  const experienceLevels = ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Lead', 'Manager', 'Director', 'Executive'];
  const statuses = ['Active', 'Paused', 'Closed', 'Draft'];

  const handleClearAll = () => {
    onChange({
      search: '',
      department: '',
      location: '',
      employmentType: '',
      salaryRange: '',
      status: '',
      experience: [],
      skills: [],
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value && value !== '';
  }).length;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search jobs by title, skills, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>
      </div>

      <div className={\`p-4 space-y-4 \${isExpanded ? '' : 'hidden sm:block'}\`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" /> Department
            </label>
            <select
              value={filters.department || ''}
              onChange={(e) => onChange({ ...filters, department: e.target.value })}
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" /> Location
            </label>
            <input
              type="text"
              value={filters.location || ''}
              onChange={(e) => onChange({ ...filters, location: e.target.value })}
              placeholder="City or Remote"
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" /> Employment Type
            </label>
            <select
              value={filters.employmentType || ''}
              onChange={(e) => onChange({ ...filters, employmentType: e.target.value })}
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              {employmentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" /> Salary Range
            </label>
            <select
              value={filters.salaryRange || ''}
              onChange={(e) => onChange({ ...filters, salaryRange: e.target.value })}
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="">All Ranges</option>
              {salaryRanges.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => onChange({ ...filters, status: filters.status === status ? '' : status })}
                    className={\`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${
                      filters.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }\`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience Level</label>
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      const current = filters.experience || [];
                      const updated = current.includes(level)
                        ? current.filter((l) => l !== level)
                        : [...current, level];
                      onChange({ ...filters, experience: updated });
                    }}
                    className={\`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${
                      (filters.experience || []).includes(level)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }\`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate JobTimeline component
 * Timeline view showing job lifecycle and milestones
 */
export function generateJobTimeline(options: JobsRecruitmentOptions = {}): string {
  const { componentName = 'JobTimeline', endpoint = '/recruitment/jobs' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  FileText,
  Users,
  UserCheck,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  UserPlus,
  Award
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  jobId: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ jobId, className }) => {
  const { data: timeline, isLoading } = useQuery({
    queryKey: ['job-timeline', jobId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${jobId}/timeline\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!jobId,
  });

  const iconMap: Record<string, React.FC<any>> = {
    created: FileText,
    published: Send,
    application: UserPlus,
    screening: Users,
    interview: MessageSquare,
    assessment: UserCheck,
    offer: Award,
    hired: CheckCircle2,
    scheduled: Calendar,
    default: Clock,
  };

  const colorMap: Record<string, string> = {
    created: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    published: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    application: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    screening: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    interview: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    assessment: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    offer: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    hired: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    scheduled: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    default: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const events = timeline || [
    { id: '1', type: 'created', title: 'Job Created', description: 'Job posting was created', date: '2024-01-15', user: 'John Doe' },
    { id: '2', type: 'published', title: 'Job Published', description: 'Job is now live on career page', date: '2024-01-16', user: 'John Doe' },
    { id: '3', type: 'application', title: 'First Application', description: '15 applications received', date: '2024-01-18', user: null },
    { id: '4', type: 'screening', title: 'Screening Started', description: '8 candidates moved to screening', date: '2024-01-20', user: 'Jane Smith' },
    { id: '5', type: 'interview', title: 'Interviews Scheduled', description: '5 candidates scheduled for interviews', date: '2024-01-22', user: 'Jane Smith' },
  ];

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 \${className || ''}\`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Job Timeline</h3>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-6">
          {events.map((event: any, index: number) => {
            const Icon = iconMap[event.type] || iconMap.default;
            const colorClass = colorMap[event.type] || colorMap.default;

            return (
              <div key={event.id} className="relative flex gap-4 ml-0">
                <div className={\`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 \${colorClass}\`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {event.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {event.date}
                    </span>
                  </div>
                  {event.user && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      by {event.user}
                    </p>
                  )}
                  {event.metadata && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
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
