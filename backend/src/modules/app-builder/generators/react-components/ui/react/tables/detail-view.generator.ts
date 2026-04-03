/**
 * Detail View Component Generator
 *
 * Generates a generic detail view component that displays entity data
 * in a structured format with edit/back navigation options.
 *
 * Special handling for applications entity:
 * - Status dropdown for changing application status
 * - Quick actions sidebar (shortlist, select, reject)
 * - Job title as clickable link
 * - Resume filename display
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateDetailView(resolved: ResolvedComponent, variant: 'standard' | 'card' | 'sidebar' = 'standard'): string {
  const { title = 'Details', props = {}, data = {} } = resolved;

  const entity = data?.entity || props?.entity || 'item';
  const fields = data?.fields || [];
  const editRoute = props?.editRoute || '';
  const backRoute = props?.backRoute || '';
  const showEditButton = props?.showEditButton !== false;
  const showBackButton = props?.showBackButton !== false;
  const enableStatusChange = props?.enableStatusChange === true;

  // Check if this is an applications detail view
  const isApplicationsDetail = entity === 'applications';

  // Generate field display rows
  const fieldRows = fields.map((field: any) => {
    const label = field.label || field.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

    // Determine value rendering based on field type
    let valueRenderer: string;

    // Special handling for applications entity fields
    if (isApplicationsDetail) {
      // Job title with link
      if (field.name === 'job_title') {
        return `
              <div className="flex flex-col sm:flex-row sm:items-center py-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3">${label}</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:w-2/3">
                  {data?.job_id ? (
                    <Link
                      to={\`/jobs/\${data.job_id}\`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      {data?.job_title || 'View Job'}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </dd>
              </div>`;
      }

      // Status field with dropdown
      if (field.name === 'status' && (enableStatusChange || field.type === 'select')) {
        return `
              <div className="flex flex-col sm:flex-row sm:items-center py-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3">${label}</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:w-2/3">
                  <select
                    value={data?.status || 'submitted'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusMutation.isPending}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-blue-500',
                      getStatusColor(data?.status)
                    )}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {statusMutation.isPending && (
                    <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />
                  )}
                </dd>
              </div>`;
      }

      // Resume URL - show filename with icon
      if (field.name === 'resume_url' || field.name.includes('resume')) {
        return `
              <div className="flex flex-col sm:flex-row sm:items-center py-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3">${label}</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:w-2/3">
                  {getResumeFilename(data?.resume_url) ? (
                    <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FileText className="w-4 h-4" />
                      {getResumeFilename(data?.resume_url)}
                    </span>
                  ) : (
                    <span className="text-gray-400">No resume uploaded</span>
                  )}
                </dd>
              </div>`;
      }

      // Cover letter - textarea display
      if (field.name === 'cover_letter') {
        return `
              <div className="flex flex-col sm:flex-row py-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3">${label}</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:w-2/3">
                  {data?.cover_letter ? (
                    <p className="whitespace-pre-wrap">{data.cover_letter}</p>
                  ) : (
                    <span className="text-gray-400">No cover letter provided</span>
                  )}
                </dd>
              </div>`;
      }
    }

    if (field.type === 'boolean') {
      valueRenderer = `data.${field.name} ? 'Yes' : 'No'`;
    } else if (field.type === 'date') {
      valueRenderer = `new Date(data.${field.name}).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })`;
    } else if (field.type === 'number') {
      valueRenderer = `String(data.${field.name})`;
    } else if (field.type === 'file' || field.type === 'url' || field.name.includes('_url') || field.name.includes('resume') || field.name.includes('file')) {
      // File/URL types should be clickable links
      valueRenderer = `<a href={data.${field.name}} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      View/Download
                    </a>`;
    } else {
      valueRenderer = `String(data.${field.name})`;
    }

    return `
              <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3">${label}</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:w-2/3">
                  {data?.${field.name} !== undefined && data?.${field.name} !== null ? (
                    ${valueRenderer}
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </dd>
              </div>`;
  }).join('\n');

  // Applications-specific imports
  const applicationsImports = isApplicationsDetail ? `
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileText } from 'lucide-react';` : '';

  // Applications-specific status mutation and helpers
  const applicationsMutation = isApplicationsDetail ? `
  const queryClient = useQueryClient();

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.patch<any>(\`/applications/\${id}\`, { status });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const handleStatusChange = async (newStatus: string) => {
    try {
      await statusMutation.mutateAsync(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'selected':
        return 'bg-green-100 text-green-700';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Extract filename from resume_url
  const getResumeFilename = (url: string) => {
    if (!url) return null;
    if (url.startsWith('file:')) {
      return url.replace('file:', '');
    }
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'Resume';
    } catch {
      return 'Resume';
    }
  };` : '';

  // Quick actions sidebar for applications
  const quickActionsSidebar = isApplicationsDetail ? `
        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleStatusChange('shortlisted')}
                disabled={statusMutation.isPending || data?.status === 'shortlisted'}
              >
                Shortlist Candidate
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleStatusChange('selected')}
                disabled={statusMutation.isPending || data?.status === 'selected'}
              >
                Select Candidate
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleStatusChange('rejected')}
                disabled={statusMutation.isPending || data?.status === 'rejected'}
              >
                Reject Application
              </Button>
            </CardContent>
          </Card>

          {/* Application ID Card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Application ID</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 font-mono break-all">{data?.id}</p>
            </CardContent>
          </Card>
        </div>` : '';

  // Determine layout based on whether we need sidebar
  const layoutClasses = isApplicationsDetail ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : 'space-y-6';
  const mainContentClasses = isApplicationsDetail ? 'lg:col-span-2' : '';

  return `import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';${applicationsImports}

interface DetailViewProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
  data?: any;
  editRoute?: string;
  backRoute?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  showEditButton?: boolean;
  showBackButton?: boolean;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onCategoryClick?: (category: string) => void;
  onAuthorClick?: (authorName: string) => void;
}

export default function DetailViewComponent({ className, data: propData, editRoute: editRouteProp, backRoute: backRouteProp }: DetailViewProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const configuredEditRoute = editRouteProp || '${editRoute}';
  const configuredBackRoute = backRouteProp || '${backRoute}';

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/${entity}/\${id}\`);
      return response.data || response;
    },
    enabled: !propData && !!id,
  });

  const data = propData || fetchedData;
${applicationsMutation}
  const handleBack = () => {
    if (configuredBackRoute) {
      navigate(configuredBackRoute);
    } else {
      navigate(-1);
    }
  };

  const handleEdit = () => {
    if (configuredEditRoute && id) {
      navigate(configuredEditRoute.replace(':id', id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Unable to load details</p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("${layoutClasses}", className)}>
      ${mainContentClasses ? `<div className="${mainContentClasses}">` : ''}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-4">
            {${showBackButton} && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <CardTitle>${title}</CardTitle>
          </div>
          {${showEditButton} && configuredEditRoute && (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-gray-100 dark:divide-gray-700">
${fieldRows}
          </dl>
        </CardContent>
      </Card>
      ${mainContentClasses ? `</div>` : ''}
${quickActionsSidebar}
    </div>
  );
}
`;
}
