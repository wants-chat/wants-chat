/**
 * Legal Case Component Generators
 *
 * Generates case management components for law firm applications.
 */

export interface CaseOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCaseFilters(options: CaseOptions = {}): string {
  const { componentName = 'CaseFilters', endpoint = '/cases' } = options;

  return `import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface CaseFiltersProps {
  onFilterChange?: (filters: CaseFilterState) => void;
  initialFilters?: Partial<CaseFilterState>;
}

interface CaseFilterState {
  search: string;
  status: string;
  caseType: string;
  priority: string;
  dateRange: { from: string; to: string };
  attorney: string;
}

const ${componentName}: React.FC<CaseFiltersProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState<CaseFilterState>({
    search: '',
    status: '',
    caseType: '',
    priority: '',
    dateRange: { from: '', to: '' },
    attorney: '',
    ...initialFilters,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof CaseFilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: CaseFilterState = {
      search: '',
      status: '',
      caseType: '',
      priority: '',
      dateRange: { from: '', to: '' },
      attorney: '',
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'dateRange') return value.from || value.to;
    return value !== '';
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search cases by number, title, or client..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="on_hold">On Hold</option>
          </select>

          <select
            value={filters.caseType}
            onChange={(e) => handleFilterChange('caseType', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="civil">Civil</option>
            <option value="criminal">Criminal</option>
            <option value="family">Family</option>
            <option value="corporate">Corporate</option>
            <option value="immigration">Immigration</option>
            <option value="real_estate">Real Estate</option>
            <option value="personal_injury">Personal Injury</option>
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <Filter className="w-4 h-4" />
            More
            <ChevronDown className={\`w-4 h-4 transition-transform \${showAdvanced ? 'rotate-180' : ''}\`} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attorney</label>
            <input
              type="text"
              value={filters.attorney}
              onChange={(e) => handleFilterChange('attorney', e.target.value)}
              placeholder="Filter by attorney"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateRange.from}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateRange.to}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, to: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCaseFiltersLawfirm(options: CaseOptions = {}): string {
  const { componentName = 'CaseFiltersLawfirm', endpoint = '/lawfirm/cases' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, X, ChevronDown, Users, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';

interface CaseFiltersLawfirmProps {
  onFilterChange?: (filters: LawfirmCaseFilterState) => void;
  initialFilters?: Partial<LawfirmCaseFilterState>;
}

interface LawfirmCaseFilterState {
  search: string;
  status: string;
  caseType: string;
  priority: string;
  assignedAttorney: string;
  practiceArea: string;
  client: string;
  dateRange: { from: string; to: string };
  billingStatus: string;
}

const ${componentName}: React.FC<CaseFiltersLawfirmProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState<LawfirmCaseFilterState>({
    search: '',
    status: '',
    caseType: '',
    priority: '',
    assignedAttorney: '',
    practiceArea: '',
    client: '',
    dateRange: { from: '', to: '' },
    billingStatus: '',
    ...initialFilters,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: attorneys } = useQuery({
    queryKey: ['attorneys-list'],
    queryFn: async () => {
      const response = await api.get<any>('/attorneys');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: practiceAreas } = useQuery({
    queryKey: ['practice-areas'],
    queryFn: async () => {
      const response = await api.get<any>('/practice-areas');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleFilterChange = (key: keyof LawfirmCaseFilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: LawfirmCaseFilterState = {
      search: '',
      status: '',
      caseType: '',
      priority: '',
      assignedAttorney: '',
      practiceArea: '',
      client: '',
      dateRange: { from: '', to: '' },
      billingStatus: '',
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'dateRange') return value.from || value.to;
    return value !== '';
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by case number, title, client, or matter..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="intake">Intake</option>
            <option value="active">Active</option>
            <option value="discovery">Discovery</option>
            <option value="litigation">Litigation</option>
            <option value="settlement">Settlement</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filters.assignedAttorney}
            onChange={(e) => handleFilterChange('assignedAttorney', e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            <option value="">All Attorneys</option>
            {attorneys?.map((attorney: any) => (
              <option key={attorney.id} value={attorney.id}>
                {attorney.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <Filter className="w-4 h-4" />
            Advanced
            <ChevronDown className={\`w-4 h-4 transition-transform \${showAdvanced ? 'rotate-180' : ''}\`} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Practice Area</label>
            <select
              value={filters.practiceArea}
              onChange={(e) => handleFilterChange('practiceArea', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="">All Practice Areas</option>
              {practiceAreas?.map((area: any) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Status</label>
            <select
              value={filters.billingStatus}
              onChange={(e) => handleFilterChange('billingStatus', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="">All Billing</option>
              <option value="current">Current</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
            <input
              type="text"
              value={filters.client}
              onChange={(e) => handleFilterChange('client', e.target.value)}
              placeholder="Search client..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filed After</label>
            <input
              type="date"
              value={filters.dateRange.from}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filed Before</label>
            <input
              type="date"
              value={filters.dateRange.to}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, to: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCaseHeader(options: CaseOptions = {}): string {
  const { componentName = 'CaseHeader', endpoint = '/cases' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Edit, FileText, Clock, User, Building, Scale, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface CaseData {
  id: string;
  case_number: string;
  title: string;
  status: string;
  priority: string;
  case_type: string;
  practice_area?: string;
  client_name: string;
  client_id?: string;
  assigned_attorney?: string;
  attorney_name?: string;
  court_name?: string;
  judge_name?: string;
  filed_date?: string;
  next_hearing?: string;
  created_at: string;
  description?: string;
}

const ${componentName}: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: async () => {
      const response = await api.get<CaseData>('${endpoint}/' + caseId);
      return response?.data || response;
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      on_hold: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      discovery: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      litigation: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
      critical: 'text-red-600',
    };
    return colors[priority?.toLowerCase()] || 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <Scale className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Case not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/cases"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cases
          </Link>
          <Link
            to={\`/cases/\${caseId}/edit\`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit Case
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-mono text-gray-500">{caseData.case_number}</span>
              <span className={\`px-3 py-1 rounded-full text-xs font-medium \${getStatusColor(caseData.status)}\`}>
                {caseData.status?.replace(/_/g, ' ').toUpperCase()}
              </span>
              {caseData.priority && (
                <span className={\`flex items-center gap-1 text-xs font-medium \${getPriorityColor(caseData.priority)}\`}>
                  <AlertTriangle className="w-3 h-3" />
                  {caseData.priority.toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{caseData.title}</h1>
            {caseData.description && (
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{caseData.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {caseData.case_type && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4" />
                <span>{caseData.case_type}</span>
              </div>
            )}
            {caseData.practice_area && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Scale className="w-4 h-4" />
                <span>{caseData.practice_area}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Client</p>
            <Link to={\`/clients/\${caseData.client_id}\`} className="font-medium text-gray-900 dark:text-white hover:text-blue-600">
              {caseData.client_name}
            </Link>
          </div>
        </div>

        {caseData.attorney_name && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Lead Attorney</p>
              <p className="font-medium text-gray-900 dark:text-white">{caseData.attorney_name}</p>
            </div>
          </div>
        )}

        {caseData.court_name && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Court</p>
              <p className="font-medium text-gray-900 dark:text-white">{caseData.court_name}</p>
            </div>
          </div>
        )}

        {caseData.next_hearing && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Next Hearing</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(caseData.next_hearing).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCaseListActive(options: CaseOptions = {}): string {
  const { componentName = 'CaseListActive', endpoint = '/cases' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Scale, Clock, User, AlertTriangle, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface ActiveCase {
  id: string;
  case_number: string;
  title: string;
  status: string;
  priority: string;
  client_name: string;
  attorney_name?: string;
  next_deadline?: string;
  next_hearing?: string;
  updated_at: string;
}

interface CaseListActiveProps {
  limit?: number;
  showViewAll?: boolean;
}

const ${componentName}: React.FC<CaseListActiveProps> = ({ limit = 10, showViewAll = true }) => {
  const { data: cases, isLoading } = useQuery({
    queryKey: ['active-cases', limit],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?status=active&limit=' + limit);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      critical: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return colors[priority?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  };

  const getUrgencyIndicator = (nextDeadline?: string, nextHearing?: string) => {
    const checkDate = nextDeadline || nextHearing;
    if (!checkDate) return null;

    const daysUntil = Math.ceil((new Date(checkDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return <span className="text-xs text-red-600 font-medium">OVERDUE</span>;
    } else if (daysUntil <= 3) {
      return <span className="text-xs text-red-500 font-medium">{daysUntil}d left</span>;
    } else if (daysUntil <= 7) {
      return <span className="text-xs text-orange-500">{daysUntil}d left</span>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Cases</h2>
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            {cases?.length || 0}
          </span>
        </div>
        {showViewAll && (
          <Link to="/cases?status=active" className="text-sm text-blue-600 hover:text-blue-700">
            View All
          </Link>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {cases && cases.length > 0 ? (
          cases.map((caseItem: ActiveCase) => (
            <Link
              key={caseItem.id}
              to={\`/cases/\${caseItem.id}\`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{caseItem.case_number}</span>
                    <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${getPriorityColor(caseItem.priority)}\`}>
                      {caseItem.priority}
                    </span>
                    {getUrgencyIndicator(caseItem.next_deadline, caseItem.next_hearing)}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{caseItem.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {caseItem.client_name}
                    </span>
                    {caseItem.attorney_name && (
                      <span className="flex items-center gap-1">
                        <Scale className="w-3 h-3" />
                        {caseItem.attorney_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(caseItem.next_deadline || caseItem.next_hearing) && (
                    <div className="text-right text-sm">
                      <p className="text-xs text-gray-400">
                        {caseItem.next_deadline ? 'Deadline' : 'Hearing'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(caseItem.next_deadline || caseItem.next_hearing || '').toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center">
            <Scale className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No active cases</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCaseStats(options: CaseOptions = {}): string {
  const { componentName = 'CaseStats', endpoint = '/cases/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Scale, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

interface CaseStatistics {
  total_cases: number;
  active_cases: number;
  pending_cases: number;
  closed_cases: number;
  won_cases?: number;
  lost_cases?: number;
  upcoming_deadlines: number;
  overdue_tasks: number;
  total_billable_hours?: number;
  total_revenue?: number;
  win_rate?: number;
  avg_case_duration?: number;
}

interface CaseStatsProps {
  showFinancials?: boolean;
  compact?: boolean;
}

const ${componentName}: React.FC<CaseStatsProps> = ({ showFinancials = false, compact = false }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['case-stats'],
    queryFn: async () => {
      const response = await api.get<CaseStatistics>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const primaryStats = [
    {
      label: 'Total Cases',
      value: stats.total_cases || 0,
      icon: Scale,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    },
    {
      label: 'Active',
      value: stats.active_cases || 0,
      icon: Clock,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30',
    },
    {
      label: 'Pending',
      value: stats.pending_cases || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
    },
    {
      label: 'Closed',
      value: stats.closed_cases || 0,
      icon: CheckCircle,
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-700',
    },
  ];

  const secondaryStats = [
    {
      label: 'Upcoming Deadlines',
      value: stats.upcoming_deadlines || 0,
      icon: Clock,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
      alert: (stats.upcoming_deadlines || 0) > 5,
    },
    {
      label: 'Overdue Tasks',
      value: stats.overdue_tasks || 0,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30',
      alert: (stats.overdue_tasks || 0) > 0,
    },
  ];

  const financialStats = showFinancials ? [
    {
      label: 'Billable Hours',
      value: stats.total_billable_hours?.toFixed(1) || '0',
      icon: Clock,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
    },
    {
      label: 'Revenue',
      value: '$' + (stats.total_revenue?.toLocaleString() || '0'),
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
    },
    {
      label: 'Win Rate',
      value: (stats.win_rate || 0).toFixed(1) + '%',
      icon: TrendingUp,
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30',
    },
  ] : [];

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {primaryStats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${stat.color}\`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={\`w-12 h-12 rounded-xl flex items-center justify-center \${stat.color}\`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className={\`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border \${
              stat.alert ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
            }\`}
          >
            <div className="flex items-center gap-3">
              <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${stat.color}\`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className={\`text-xl font-bold \${stat.alert ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
        {financialStats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${stat.color}\`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCaseTimeline(options: CaseOptions = {}): string {
  const { componentName = 'CaseTimeline', endpoint = '/cases' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, MessageSquare, Calendar, Gavel, Upload, User, Clock, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface TimelineEvent {
  id: string;
  type: 'filing' | 'hearing' | 'document' | 'note' | 'status_change' | 'deadline' | 'communication';
  title: string;
  description?: string;
  user_name?: string;
  date: string;
  metadata?: Record<string, any>;
}

interface CaseTimelineProps {
  caseId?: string;
  limit?: number;
}

const ${componentName}: React.FC<CaseTimelineProps> = ({ caseId: propCaseId, limit }) => {
  const { caseId: paramCaseId } = useParams<{ caseId: string }>();
  const caseId = propCaseId || paramCaseId;

  const { data: events, isLoading } = useQuery({
    queryKey: ['case-timeline', caseId, limit],
    queryFn: async () => {
      let url = '${endpoint}/' + caseId + '/timeline';
      if (limit) url += '?limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!caseId,
  });

  const getEventIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      filing: <FileText className="w-4 h-4" />,
      hearing: <Gavel className="w-4 h-4" />,
      document: <Upload className="w-4 h-4" />,
      note: <MessageSquare className="w-4 h-4" />,
      status_change: <CheckCircle className="w-4 h-4" />,
      deadline: <Clock className="w-4 h-4" />,
      communication: <MessageSquare className="w-4 h-4" />,
    };
    return icons[type] || <Calendar className="w-4 h-4" />;
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      filing: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
      hearing: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
      document: 'bg-green-100 text-green-600 dark:bg-green-900/30',
      note: 'bg-gray-100 text-gray-600 dark:bg-gray-700',
      status_change: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
      deadline: 'bg-red-100 text-red-600 dark:bg-red-900/30',
      communication: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30',
    };
    return colors[type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Case Timeline</h2>
      </div>

      <div className="p-4">
        {events && events.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-6">
              {events.map((event: TimelineEvent, index: number) => (
                <div key={event.id} className="relative flex gap-4">
                  <div className={\`relative z-10 w-8 h-8 rounded-full flex items-center justify-center \${getEventColor(event.type)}\`}>
                    {getEventIcon(event.type)}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                        )}
                        {event.user_name && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {event.user_name}
                          </p>
                        )}
                      </div>
                      <time className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString()}
                      </time>
                    </div>

                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs text-gray-500">
                            <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No timeline events</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCaseTimelineLawfirm(options: CaseOptions = {}): string {
  const { componentName = 'CaseTimelineLawfirm', endpoint = '/lawfirm/cases' } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, FileText, MessageSquare, Calendar, Gavel, Upload, User, Clock, CheckCircle, Plus, Filter, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface TimelineEvent {
  id: string;
  type: 'filing' | 'hearing' | 'document' | 'note' | 'status_change' | 'deadline' | 'communication' | 'billing' | 'court_order';
  title: string;
  description?: string;
  user_name?: string;
  user_role?: string;
  date: string;
  is_billable?: boolean;
  hours_logged?: number;
  attachments?: { name: string; url: string }[];
  metadata?: Record<string, any>;
}

interface CaseTimelineLawfirmProps {
  caseId?: string;
  canAddEvents?: boolean;
}

const ${componentName}: React.FC<CaseTimelineLawfirmProps> = ({ caseId: propCaseId, canAddEvents = true }) => {
  const { caseId: paramCaseId } = useParams<{ caseId: string }>();
  const caseId = propCaseId || paramCaseId;
  const queryClient = useQueryClient();

  const [filterType, setFilterType] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'note',
    title: '',
    description: '',
    is_billable: false,
    hours_logged: 0,
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ['lawfirm-case-timeline', caseId, filterType],
    queryFn: async () => {
      let url = '${endpoint}/' + caseId + '/timeline';
      if (filterType !== 'all') url += '?type=' + filterType;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!caseId,
  });

  const addEventMutation = useMutation({
    mutationFn: (data: typeof newEvent) => api.post('${endpoint}/' + caseId + '/timeline', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawfirm-case-timeline', caseId] });
      setShowAddForm(false);
      setNewEvent({ type: 'note', title: '', description: '', is_billable: false, hours_logged: 0 });
      toast.success('Event added to timeline');
    },
    onError: () => toast.error('Failed to add event'),
  });

  const getEventIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      filing: <FileText className="w-4 h-4" />,
      hearing: <Gavel className="w-4 h-4" />,
      document: <Upload className="w-4 h-4" />,
      note: <MessageSquare className="w-4 h-4" />,
      status_change: <CheckCircle className="w-4 h-4" />,
      deadline: <Clock className="w-4 h-4" />,
      communication: <MessageSquare className="w-4 h-4" />,
      billing: <Clock className="w-4 h-4" />,
      court_order: <Gavel className="w-4 h-4" />,
    };
    return icons[type] || <Calendar className="w-4 h-4" />;
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      filing: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
      hearing: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
      document: 'bg-green-100 text-green-600 dark:bg-green-900/30',
      note: 'bg-gray-100 text-gray-600 dark:bg-gray-700',
      status_change: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
      deadline: 'bg-red-100 text-red-600 dark:bg-red-900/30',
      communication: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30',
      billing: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
      court_order: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
    };
    return colors[type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title.trim()) {
      addEventMutation.mutate(newEvent);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Case Timeline</h2>
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="all">All Events</option>
              <option value="filing">Filings</option>
              <option value="hearing">Hearings</option>
              <option value="document">Documents</option>
              <option value="note">Notes</option>
              <option value="billing">Billing</option>
            </select>
            {canAddEvents && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            )}
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                >
                  <option value="note">Note</option>
                  <option value="filing">Filing</option>
                  <option value="hearing">Hearing</option>
                  <option value="document">Document</option>
                  <option value="communication">Communication</option>
                  <option value="billing">Billing Entry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                  placeholder="Event title"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
                placeholder="Event details..."
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newEvent.is_billable}
                  onChange={(e) => setNewEvent({ ...newEvent, is_billable: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Billable</span>
                {newEvent.is_billable && (
                  <input
                    type="number"
                    value={newEvent.hours_logged}
                    onChange={(e) => setNewEvent({ ...newEvent, hours_logged: parseFloat(e.target.value) || 0 })}
                    step="0.25"
                    min="0"
                    className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent"
                    placeholder="Hours"
                  />
                )}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addEventMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {addEventMutation.isPending ? 'Adding...' : 'Add Event'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="p-4">
        {events && events.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-6">
              {events.map((event: TimelineEvent) => (
                <div key={event.id} className="relative flex gap-4">
                  <div className={\`relative z-10 w-8 h-8 rounded-full flex items-center justify-center \${getEventColor(event.type)}\`}>
                    {getEventIcon(event.type)}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                          {event.is_billable && (
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs">
                              {event.hours_logged}h
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {event.user_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {event.user_name}
                              {event.user_role && \` (\${event.user_role})\`}
                            </span>
                          )}
                        </div>
                      </div>
                      <time className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(event.date).toLocaleString()}
                      </time>
                    </div>

                    {event.attachments && event.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {event.attachments.map((attachment, i) => (
                          <a
                            key={i}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Download className="w-3 h-3" />
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No timeline events</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
