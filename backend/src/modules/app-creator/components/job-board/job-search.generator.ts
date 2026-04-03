/**
 * Job Search Component Generator
 */

export interface JobSearchOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateJobSearch(options: JobSearchOptions = {}): string {
  const componentName = options.componentName || 'JobSearch';

  return `import React, { useState } from 'react';
import { Search, MapPin, Briefcase } from 'lucide-react';

interface ${componentName}Props {
  onSearch?: (filters: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    type: '',
  });

  const handleSearch = () => {
    onSearch?.(filters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Search className="w-4 h-4 inline mr-1" /> Keywords
          </label>
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            placeholder="Job title, skills, or company"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" /> Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder="City or Remote"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Briefcase className="w-4 h-4 inline mr-1" /> Job Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          >
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
            <option value="internship">Internship</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="mt-4 w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <Search className="w-5 h-5" />
        Search Jobs
      </button>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateJobList(options: JobSearchOptions = {}): string {
  const { componentName = 'JobList', endpoint = '/jobs' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, MapPin, Clock, DollarSign, Briefcase, Building2, Bookmark } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  filters?: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({ filters }) => {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    'full-time': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'part-time': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'contract': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'freelance': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'internship': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  };

  return (
    <div className="space-y-4">
      {jobs && jobs.length > 0 ? (
        jobs.map((job: any) => (
          <Link
            key={job.id}
            to={\`/jobs/\${job.id}\`}
            className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                {job.company_logo ? (
                  <img src={job.company_logo} alt={job.company_name} className="w-14 h-14 rounded-lg object-contain bg-gray-100" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{job.title}</h3>
                  <p className="text-gray-500">{job.company_name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
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
                        <Clock className="w-4 h-4" />
                        {job.posted_at}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {job.type && (
                  <span className={\`px-3 py-1 rounded-full text-xs font-medium \${typeColors[job.type] || typeColors['full-time']}\`}>
                    {job.type}
                  </span>
                )}
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Bookmark className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.skills.slice(0, 5).map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No jobs found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateJobFilters(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'JobFilters';

  return `import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

interface ${componentName}Props {
  filters: any;
  onChange: (filters: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ filters, onChange }) => {
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'];
  const salaryRanges = ['$0 - $50k', '$50k - $80k', '$80k - $120k', '$120k - $150k', '$150k+'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </h3>
        <button onClick={() => onChange({})} className="text-sm text-blue-600 hover:text-blue-700">
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Posted</label>
          <select
            value={filters.posted || ''}
            onChange={(e) => onChange({ ...filters, posted: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
          >
            <option value="">Any time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience Level</label>
          <div className="space-y-2">
            {experienceLevels.map((level) => (
              <label key={level} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(filters.experience || []).includes(level)}
                  onChange={(e) => {
                    const current = filters.experience || [];
                    const updated = e.target.checked
                      ? [...current, level]
                      : current.filter((l: string) => l !== level);
                    onChange({ ...filters, experience: updated });
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700 dark:text-gray-300">{level}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salary Range</label>
          <div className="space-y-2">
            {salaryRanges.map((range) => (
              <label key={range} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(filters.salary || []).includes(range)}
                  onChange={(e) => {
                    const current = filters.salary || [];
                    const updated = e.target.checked
                      ? [...current, range]
                      : current.filter((r: string) => r !== range);
                    onChange({ ...filters, salary: updated });
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700 dark:text-gray-300">{range}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.remote || false}
              onChange={(e) => onChange({ ...filters, remote: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-gray-700 dark:text-gray-300">Remote Only</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
