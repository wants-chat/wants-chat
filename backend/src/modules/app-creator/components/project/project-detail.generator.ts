/**
 * Project Detail Component Generators
 *
 * Generates project-related filter and timeline components including:
 * - ProjectFilters: Generic project filters
 * - ProjectFiltersConsulting: Consulting-specific project filters
 * - ProjectFiltersDesign: Design agency project filters
 * - ProjectTimelineConsulting: Consulting project timeline
 */

export interface ProjectFilterOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateProjectFilters(options: ProjectFilterOptions = {}): string {
  const { componentName = 'ProjectFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import { Search, X, Filter, Calendar, FolderKanban } from 'lucide-react';

interface FilterValues {
  search: string;
  status: string;
  priority: string;
  team: string;
  dateRange: { start: string; end: string };
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  priority: '',
  team: '',
  dateRange: { start: '', end: '' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: any) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.search || currentFilters.status ||
    currentFilters.priority || currentFilters.team ||
    currentFilters.dateRange.start || currentFilters.dateRange.end;

  const baseInputClasses = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500';

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 \${className || ''}\`}>
      <div className="flex items-center gap-2 mb-4">
        <FolderKanban className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-900 dark:text-white">Filter Projects</span>
        {hasActiveFilters && (
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={currentFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search projects..."
              className={\`\${baseInputClasses} pl-10\`}
            />
            {currentFilters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            value={currentFilters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
          <select
            value={currentFilters.priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date Range</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentFilters.dateRange.start}
                onChange={(e) => updateFilter('dateRange', { ...currentFilters.dateRange, start: e.target.value })}
                className={\`\${baseInputClasses} pl-10\`}
              />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentFilters.dateRange.end}
                onChange={(e) => updateFilter('dateRange', { ...currentFilters.dateRange, end: e.target.value })}
                className={\`\${baseInputClasses} pl-10\`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={clearAll}
          disabled={!hasActiveFilters}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
        >
          Clear all filters
        </button>
        {onSearch && (
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateProjectFiltersConsulting(options: ProjectFilterOptions = {}): string {
  const { componentName = 'ProjectFiltersConsulting' } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Filter, Calendar, Briefcase, DollarSign, Building } from 'lucide-react';
import { api } from '@/lib/api';

interface FilterValues {
  search: string;
  status: string;
  type: string;
  client: string;
  industry: string;
  budgetRange: { min: string; max: string };
  dateRange: { start: string; end: string };
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  type: '',
  client: '',
  industry: '',
  budgetRange: { min: '', max: '' },
  dateRange: { start: '', end: '' },
};

const consultingTypes = [
  { value: 'strategy', label: 'Strategy Consulting' },
  { value: 'management', label: 'Management Consulting' },
  { value: 'technology', label: 'Technology Consulting' },
  { value: 'operations', label: 'Operations Consulting' },
  { value: 'hr', label: 'HR Consulting' },
  { value: 'financial', label: 'Financial Advisory' },
];

const industries = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'technology', label: 'Technology' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'energy', label: 'Energy' },
  { value: 'government', label: 'Government' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/clients');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
  });

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: any) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.search || currentFilters.status ||
    currentFilters.type || currentFilters.client || currentFilters.industry ||
    currentFilters.budgetRange.min || currentFilters.budgetRange.max ||
    currentFilters.dateRange.start || currentFilters.dateRange.end;

  const baseInputClasses = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500';

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 \${className || ''}\`}>
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-900 dark:text-white">Filter Consulting Projects</span>
        {hasActiveFilters && (
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={currentFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search projects by name or description..."
              className={\`\${baseInputClasses} pl-10\`}
            />
            {currentFilters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            value={currentFilters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Statuses</option>
            <option value="proposal">Proposal</option>
            <option value="discovery">Discovery</option>
            <option value="active">Active</option>
            <option value="review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Type</label>
          <select
            value={currentFilters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Types</option>
            {consultingTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client</label>
          <select
            value={currentFilters.client}
            onChange={(e) => updateFilter('client', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Clients</option>
            {clients.map((client: any) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry</label>
          <select
            value={currentFilters.industry}
            onChange={(e) => updateFilter('industry', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Industries</option>
            {industries.map((ind) => (
              <option key={ind.value} value={ind.value}>{ind.label}</option>
            ))}
          </select>
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget Range</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={currentFilters.budgetRange.min}
                onChange={(e) => updateFilter('budgetRange', { ...currentFilters.budgetRange, min: e.target.value })}
                placeholder="Min"
                className={\`\${baseInputClasses} pl-8\`}
              />
            </div>
            <span className="text-gray-500">-</span>
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={currentFilters.budgetRange.max}
                onChange={(e) => updateFilter('budgetRange', { ...currentFilters.budgetRange, max: e.target.value })}
                placeholder="Max"
                className={\`\${baseInputClasses} pl-8\`}
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Period</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentFilters.dateRange.start}
                onChange={(e) => updateFilter('dateRange', { ...currentFilters.dateRange, start: e.target.value })}
                className={\`\${baseInputClasses} pl-10\`}
              />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentFilters.dateRange.end}
                onChange={(e) => updateFilter('dateRange', { ...currentFilters.dateRange, end: e.target.value })}
                className={\`\${baseInputClasses} pl-10\`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={clearAll}
          disabled={!hasActiveFilters}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
        >
          Clear all filters
        </button>
        {onSearch && (
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateProjectFiltersDesign(options: ProjectFilterOptions = {}): string {
  const { componentName = 'ProjectFiltersDesign' } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Filter, Calendar, Palette, Tag, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface FilterValues {
  search: string;
  status: string;
  type: string;
  client: string;
  designer: string;
  tags: string[];
  dateRange: { start: string; end: string };
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  type: '',
  client: '',
  designer: '',
  tags: [],
  dateRange: { start: '', end: '' },
};

const designTypes = [
  { value: 'branding', label: 'Branding & Identity' },
  { value: 'web', label: 'Web Design' },
  { value: 'mobile', label: 'Mobile App Design' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'print', label: 'Print Design' },
  { value: 'packaging', label: 'Packaging Design' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'motion', label: 'Motion Graphics' },
];

const designTags = [
  'minimalist', 'modern', 'vintage', 'bold', 'playful',
  'corporate', 'elegant', 'colorful', 'monochrome', 'tech'
];

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/clients');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
  });

  const { data: designers = [] } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/team-members?role=designer');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
  });

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: any) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const toggleTag = useCallback((tag: string) => {
    const currentTags = currentFilters.tags || [];
    const updated = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    updateFilter('tags', updated);
  }, [currentFilters.tags, updateFilter]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.search || currentFilters.status ||
    currentFilters.type || currentFilters.client || currentFilters.designer ||
    currentFilters.tags.length > 0 ||
    currentFilters.dateRange.start || currentFilters.dateRange.end;

  const baseInputClasses = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500';

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 \${className || ''}\`}>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-purple-500" />
        <span className="font-medium text-gray-900 dark:text-white">Filter Design Projects</span>
        {hasActiveFilters && (
          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={currentFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search projects..."
              className={\`\${baseInputClasses} pl-10\`}
            />
            {currentFilters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            value={currentFilters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Statuses</option>
            <option value="brief">Brief Received</option>
            <option value="research">Research</option>
            <option value="concept">Concept</option>
            <option value="design">In Design</option>
            <option value="revision">Revisions</option>
            <option value="approved">Approved</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Type</label>
          <select
            value={currentFilters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Types</option>
            {designTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client</label>
          <select
            value={currentFilters.client}
            onChange={(e) => updateFilter('client', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Clients</option>
            {clients.map((client: any) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        {/* Designer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Designer</label>
          <select
            value={currentFilters.designer}
            onChange={(e) => updateFilter('designer', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Designers</option>
            {designers.map((designer: any) => (
              <option key={designer.id} value={designer.id}>{designer.name}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentFilters.dateRange.start}
                onChange={(e) => updateFilter('dateRange', { ...currentFilters.dateRange, start: e.target.value })}
                className={\`\${baseInputClasses} pl-10\`}
              />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentFilters.dateRange.end}
                onChange={(e) => updateFilter('dateRange', { ...currentFilters.dateRange, end: e.target.value })}
                className={\`\${baseInputClasses} pl-10\`}
              />
            </div>
          </div>
        </div>

        {/* Style Tags */}
        <div className="lg:col-span-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Style Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {designTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={\`px-3 py-1.5 text-sm rounded-full border transition-colors \${
                  currentFilters.tags.includes(tag)
                    ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:border-purple-500 dark:text-purple-400'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                }\`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={clearAll}
          disabled={!hasActiveFilters}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
        >
          Clear all filters
        </button>
        {onSearch && (
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateProjectTimelineConsulting(options: ProjectFilterOptions = {}): string {
  const { componentName = 'ProjectTimelineConsulting', endpoint = '/projects' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Clock, FileText, Users, Presentation, CheckCircle, AlertCircle, MessageSquare, Calendar, Target, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  projectId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ projectId: propId, className }) => {
  const { id: routeId } = useParams<{ id: string }>();
  const projectId = propId || routeId;

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + projectId);
      return response?.data || response;
    },
    enabled: !!projectId,
  });

  const { data: milestones, isLoading: loadingMilestones } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + projectId + '/milestones');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!projectId,
  });

  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + projectId + '/activities');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!projectId,
  });

  const isLoading = loadingProject || loadingMilestones || loadingActivities;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'kickoff': return <Users className="w-4 h-4 text-blue-500" />;
      case 'discovery': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'analysis': return <Target className="w-4 h-4 text-orange-500" />;
      case 'presentation': return <Presentation className="w-4 h-4 text-indigo-500" />;
      case 'delivery': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'review': return <MessageSquare className="w-4 h-4 text-yellow-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 border-green-500';
      case 'in-progress': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500';
      case 'delayed': return 'bg-red-100 dark:bg-red-900/30 border-red-500';
      case 'upcoming': return 'bg-gray-100 dark:bg-gray-700 border-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 border-gray-300';
    }
  };

  const getPhaseProgress = () => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter((m: any) => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  return (
    <div className={\`\${className || ''}\`}>
      {/* Project Header Summary */}
      {project && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{project.name || project.title}</h2>
              <p className="text-gray-500">{project.client_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Project Progress</p>
              <p className="text-2xl font-bold text-blue-600">{getPhaseProgress()}%</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: \`\${getPhaseProgress()}%\` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Project Milestones
          </h3>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            <div className="space-y-6">
              {milestones && milestones.length > 0 ? (
                milestones.map((milestone: any, index: number) => (
                  <div key={milestone.id || index} className="relative flex items-start gap-4 pl-14">
                    <div className={\`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center border-2 \${getMilestoneColor(milestone.status)}\`}>
                      {getMilestoneIcon(milestone.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {milestone.name || milestone.title}
                          </p>
                          {milestone.description && (
                            <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-500">
                            {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'TBD'}
                          </p>
                          {milestone.status === 'completed' && milestone.completed_at && (
                            <p className="text-xs text-green-600">
                              Completed {new Date(milestone.completed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Deliverables */}
                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {milestone.deliverables.map((d: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 pl-14">
                  No milestones defined yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Recent Activity
          </h3>

          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.slice(0, 10).map((activity: any, index: number) => (
                <div key={activity.id || index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {activity.type === 'meeting' ? (
                      <Users className="w-4 h-4 text-blue-500" />
                    ) : activity.type === 'document' ? (
                      <FileText className="w-4 h-4 text-purple-500" />
                    ) : activity.type === 'milestone' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description || activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user_name && <span>{activity.user_name} - </span>}
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
