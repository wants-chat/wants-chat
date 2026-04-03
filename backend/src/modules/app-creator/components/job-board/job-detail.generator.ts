/**
 * Job Detail Component Generator
 */

export interface JobDetailOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateJobDetail(options: JobDetailOptions = {}): string {
  const { componentName = 'JobDetail', endpoint = '/jobs' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Clock, DollarSign, Building2, Users, Calendar, Globe, ChevronLeft, Bookmark, Share2 } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-12 text-gray-500">Job not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link to="/jobs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4">
          <ChevronLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
        <div className="flex items-start gap-4">
          {job.company_logo ? (
            <img src={job.company_logo} alt={job.company_name} className="w-16 h-16 rounded-lg object-contain bg-gray-100" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
            <p className="text-lg text-gray-500">{job.company_name}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
              )}
              {job.type && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {job.type}
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
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Bookmark className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Share2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {job.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
            <div className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{job.description}</div>
          </div>
        )}

        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requirements</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              {job.requirements.map((req: string, i: number) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              {job.responsibilities.map((resp: string, i: number) => (
                <li key={i}>{resp}</li>
              ))}
            </ul>
          </div>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Benefits</h2>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((benefit: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.skills && job.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <Link
          to={\`/jobs/\${job.id}/apply\`}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
        >
          Apply Now
        </Link>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateApplyCard(options: JobDetailOptions = {}): string {
  const componentName = options.componentName || 'ApplyCard';

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Clock, DollarSign, Send } from 'lucide-react';

interface ${componentName}Props {
  job: {
    id: string;
    title: string;
    company_name: string;
    company_logo?: string;
    location?: string;
    type?: string;
    salary_range?: string;
    deadline?: string;
  };
}

const ${componentName}: React.FC<${componentName}Props> = ({ job }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
      <div className="flex items-center gap-4 mb-4">
        {job.company_logo ? (
          <img src={job.company_logo} alt={job.company_name} className="w-12 h-12 rounded-lg object-contain bg-gray-100" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.company_name}</p>
        </div>
      </div>

      <div className="space-y-2 mb-6 text-sm">
        {job.location && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            {job.location}
          </div>
        )}
        {job.type && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            {job.type}
          </div>
        )}
        {job.salary_range && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <DollarSign className="w-4 h-4" />
            {job.salary_range}
          </div>
        )}
      </div>

      {job.deadline && (
        <p className="text-sm text-orange-600 mb-4">
          Apply by: {new Date(job.deadline).toLocaleDateString()}
        </p>
      )}

      <Link
        to={\`/jobs/\${job.id}/apply\`}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
      >
        <Send className="w-4 h-4" />
        Apply Now
      </Link>
    </div>
  );
};

export default ${componentName};
`;
}
